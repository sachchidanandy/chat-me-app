import { Server } from "socket.io";
import Message, { iUploadFileMetaData, MessageStatus } from "../models/message.model";
import Redis from "ioredis";
import User from "@models/user.model";

type MessageData = {
  cipherText: string;
  nonce: string;
  attachment?: iUploadFileMetaData;
};

type SenderRecipient = {
  senderId: string;
  recipientId: string;
};

type SenderRecipientMessage = SenderRecipient & MessageData;

export const activeUsers = new Map<string, string>();

export const handleSocketConnection = (io: Server, redisPub: Redis, redisStore: Redis) => {
  io.on('connection', (socket) => {
    // Register a new user
    socket.on('user_online', (userId: string) => {
      activeUsers.set(userId, socket.id);
      redisStore.hset('active_users', userId, socket.id);
      // Notify all services via Redis Pub/Sub
      redisPub.publish("user_status_channel", JSON.stringify({ userId, status: "online" }));
    });

    // Indicate typing
    socket.on('typing', ({ senderId, recipientId }: SenderRecipient) => {
      if (activeUsers.has(recipientId)) {
        io.to(activeUsers.get(recipientId)!).emit('user_typing', { senderId });
      } else {
        redisPub.publish('typing_channel', JSON.stringify({ senderId, recipientId }));
      }
    });

    // Indicate stop typing
    socket.on('stop_typing', ({ senderId, recipientId }: SenderRecipient) => {
      if (activeUsers.has(recipientId)) {
        io.to(activeUsers.get(recipientId)!).emit('user_stop_typing', { senderId });
      } else {
        redisPub.publish('stop_typing_channel', JSON.stringify({ senderId, recipientId }));
      }
    });

    // Send a message
    socket.on('send_message', async ({ senderId, recipientId, cipherText, nonce, attachment }: SenderRecipientMessage) => {
      const newMessage = new Message(
        {
          sender_id: senderId,
          recipient_id: recipientId,
          cipher_text: cipherText || '',
          nonce: nonce || '',
          status: 'sent',
          attachment: attachment
        }
      );
      if (activeUsers.has(recipientId)) {
        newMessage.status = 'delivered';
        io.to(activeUsers.get(recipientId)!).emit('new_message', {
          id: newMessage._id,
          recipientId,
          senderId,
          cipherText,
          nonce,
          timestamp: newMessage.timestamp,
          status: newMessage.status as MessageStatus,
          attachment,
        });
      } else {
        redisPub.publish('chat_channel', JSON.stringify({ senderId, recipientId, cipherText, nonce, attachment }));
      }
      await newMessage.save();
    });

    // Mark a message as read
    socket.on('mark_as_read', async ({ senderId, recipientId }: SenderRecipient) => {
      await Message.updateMany(
        { sender_id: recipientId, recipient_id: senderId, status: 'delivered' },
        { $set: { status: 'seen' } }
      );
      io.to(activeUsers.get(recipientId)!).emit('message_seen', { senderId });
    });

    // Handle user requesting socket ID of another user
    socket.on("fetch_user_socket_id", async ({ targetUserId }, callback) => {
      let targetSocketId = activeUsers.get(targetUserId) || null;
      // try to find it in redis store
      if (!targetSocketId) {
        targetSocketId = await redisStore.hget("active_users", targetUserId);
      }
      callback(targetSocketId);
    });

    socket.on("call_user", ({ targetSocketId, offer, callerDetails, cType }) => {
      if (io.of("/").sockets.has(targetSocketId)) {
        io.to(targetSocketId).emit("incoming_call", { from: socket.id, offer, callerDetails, cType });
      } else {
        redisPub.publish(
          'voice_call_channel',
          JSON.stringify({ event: 'incoming_call', targetSocketId, offer, callerDetails, from: socket.id, cType })
        );
      }
      io.to(socket.id).emit("call_ringing");
    });

    socket.on("answer_call", ({ targetSocketId, answer }) => {
      if (io.of("/").sockets.has(targetSocketId)) {
        io.to(targetSocketId).emit("call_answered", { from: socket.id, answer });
      } else {
        redisPub.publish(
          'voice_call_channel',
          JSON.stringify({ event: 'call_answered', targetSocketId, from: socket.id, answer })
        );
      }
    });

    socket.on("ice_candidate", ({ targetSocketId, candidate }) => {
      if (io.of("/").sockets.has(targetSocketId)) {
        io.to(targetSocketId).emit("ice_candidate", { from: socket.id, candidate });
      } else {
        redisPub.publish(
          'voice_call_channel',
          JSON.stringify({ event: 'ice_candidate', targetSocketId, from: socket.id, candidate })
        );
      }
    });

    socket.on("end_call", ({ targetSocketId }) => {
      if (io.of("/").sockets.has(targetSocketId)) {
        io.to(targetSocketId).emit("call_ended", { from: socket.id });
      } else {
        redisPub.publish(
          'voice_call_channel',
          JSON.stringify({ event: 'call_ended', targetSocketId, from: socket.id })
        );
      }
    });

    socket.on("reject_call", ({ targetSocketId }) => {
      if (io.of("/").sockets.has(targetSocketId)) {
        io.to(targetSocketId).emit("call_rejected");
      } else {
        redisPub.publish(
          'voice_call_channel',
          JSON.stringify({ event: 'call_rejected', targetSocketId })
        );
      }
    });

    // Unregister a user
    socket.on('user_offline', async (userId: string) => {
      activeUsers.delete(userId);
      redisStore.hdel('active_users', userId);
      await User.updateOne({ _id: userId }, { $set: { last_seen: new Date() } });
      // Notify all services via Redis Pub/Sub
      redisPub.publish("user_status_channel", JSON.stringify({ userId, status: "offline" }));
    });
  });
};

export const handleRedisSubscription = (io: Server, redisSub: Redis) => {
  redisSub.subscribe('chat_channel');
  redisSub.subscribe('typing_channel');
  redisSub.subscribe('stop_typing_channel');
  redisSub.subscribe('user_status_channel');
  redisSub.subscribe('voice_call_channel');

  redisSub.on('message', async (channel, message) => {
    const messageData = JSON.parse(message);

    switch (channel) {
      case 'chat_channel': {
        const { senderId, recipientId, ...msg } = messageData;
        if (activeUsers.has(recipientId)) {
          const newMessage = await Message.findOneAndUpdate(
            { sender_id: senderId, recipient_id: recipientId, status: "sent" },
            { $set: { status: "delivered" } },
            { new: true }
          );
          io.to(activeUsers.get(recipientId)!).emit('new_message', {
            ...msg,
            id: newMessage?._id,
            status: newMessage?.status,
            senderId,
            recipientId,
            timestamp: newMessage?.timestamp,
          });
        }
      }
        break;
      case 'typing_channel': {
        const { userId, recipientId } = messageData;
        if (activeUsers.has(recipientId)) {
          io.to(activeUsers.get(recipientId)!).emit('user_typing', { senderId: userId });
        }
      }
        break;
      case 'stop_typing_channel': {
        const { userId, recipientId } = messageData;
        if (activeUsers.has(recipientId)) {
          io.to(activeUsers.get(recipientId)!).emit('user_stop_typing', { senderId: userId });
        }
      }
        break;
      case 'user_status_channel': {
        const { userId, status } = JSON.parse(message) ?? {};
        if (userId && status) {
          console.log(`User ${userId} is now ${status}`);

          // You can now broadcast this to connected clients
          io.emit("user_status_update", { userId, status });
          if (status === 'offline') {
            io.emit("user_status_update_for_call", { userId, status });
          }
        }
      }
        break;
      case 'voice_call_channel': {
        const { targetSocketId, event, ...rest } = messageData;
        if (io.of("/").sockets.has(targetSocketId)) {
          io.to(targetSocketId).emit(event, { ...rest });
        }
      }
        break;
    }
  });
};
