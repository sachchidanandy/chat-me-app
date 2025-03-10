import { Server } from "socket.io";
import Message, { IMessage, iUploadFileMetaData, MessageStatus } from "../models/message.model";
import Redis from "ioredis";

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

const activeUsers = new Map<string, string>();

export const handleSocketConnection = (io: Server, redisPub: Redis, redisStore: Redis) => {
  io.on('connection', (socket) => {
    // Register a new user
    socket.on('user_online', (userId: string) => {
      activeUsers.set(userId, socket.id);
      redisStore.hset('active_users', userId, socket.id);
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
          cipher_text: cipherText,
          nonce: nonce,
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
        { status: 'seen' }
      );
      io.to(activeUsers.get(recipientId)!).emit('message_seen', { senderId });
    });

    // Unregister a user
    socket.on('user_offline', (userId: string) => {
      activeUsers.delete(userId);
      redisStore.hdel('active_users', userId);
    });
  });
};

export const handleRedisSubscription = (io: Server, redisSub: Redis) => {
  redisSub.subscribe("chat_channel");
  redisSub.subscribe("typing_channel");
  redisSub.subscribe("stop_typing_channel");

  redisSub.on("message", async (channel, message) => {
    const messageData = JSON.parse(message);
    if (channel === 'chat_channel') {
      const { senderId, recipientId, ...msg } = messageData;
      if (activeUsers.has(recipientId)) {
        const newMessage = await Message.findOneAndUpdate(
          { sender_id: senderId, recipient_id: recipientId, status: "sent" },
          { status: "delivered" },
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
    } else if (channel === 'typing_channel') {
      const { userId, recipientId } = messageData;
      if (activeUsers.has(recipientId)) {
        io.to(activeUsers.get(recipientId)!).emit('user_typing', { senderId: userId });
      }
    } else if (channel === 'stop_typing_channel') {
      const { userId, recipientId } = messageData;
      if (activeUsers.has(recipientId)) {
        io.to(activeUsers.get(recipientId)!).emit('user_stop_typing', { senderId: userId });
      }
    }
  });
};
