import { Server } from "socket.io";
import Message, { IMessage, MessageStatus } from "../models/message.model";
import Redis from "ioredis";

type MessageData = {
  cipherText: string;
  nonce: string;
};

type SenderRecipient = {
  userId: string;
  receiverId: string;
};

type SenderRecipientMessage = SenderRecipient & { message: MessageData };

const activeUsers = new Map<string, string>();

export const handleSocketConnection = (io: Server, redisPub: Redis, redisStore: Redis) => {
  io.on('connection', (socket) => {
    console.log(" ====== USER REGISTERED ======= ", socket);
    // Register a new user
    socket.on('user_online', (userId: string) => {
      activeUsers.set(userId, socket.id);
      redisStore.hset('active_users', userId, socket.id);
    });

    // Indicate typing
    socket.on('typing', ({ userId, receiverId }: SenderRecipient) => {
      if (activeUsers.has(receiverId)) {
        io.to(activeUsers.get(receiverId)!).emit('user_typing', { senderId: userId });
      } else {
        redisPub.publish('typing_channel', JSON.stringify({ userId, receiverId }));
      }
    });

    // Indicate stop typing
    socket.on('stop_typing', ({ userId, receiverId }: SenderRecipient) => {
      if (activeUsers.has(receiverId)) {
        io.to(activeUsers.get(receiverId)!).emit('user_stop_typing', { senderId: userId });
      } else {
        redisPub.publish('stop_typing_channel', JSON.stringify({ userId, receiverId }));
      }
    });

    // Send a message
    socket.on('send_message', async ({ userId, receiverId, message }: SenderRecipientMessage) => {
      const newMessage = new Message(
        {
          sender_id: userId,
          recipient_id: receiverId,
          cipher_text: message.cipherText,
          nonce: message.nonce,
          status: 'sent'
        }
      );
      if (activeUsers.has(receiverId)) {
        newMessage.status = 'delivered';
        io.to(activeUsers.get(receiverId)!).emit('new_message', {
          message: { ...message, id: newMessage._id, status: newMessage.status },
          senderId: userId
        });
      } else {
        redisPub.publish('chat_channel', JSON.stringify({ userId, receiverId, message }));
      }
      await newMessage.save();
    });

    // Mark a message as read
    socket.on('mark_as_read', async ({ userId, receiverId }: SenderRecipient) => {
      await Message.updateMany(
        { sender_id: receiverId, recipient_id: userId, status: 'delivered' },
        { status: 'seen' }
      );
      io.to(activeUsers.get(receiverId)!).emit('message_seen', { senderId: userId });
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
      const { userId, receiverId, message: msg } = messageData;
      if (activeUsers.has(receiverId)) {
        const newMessage = await Message.findOneAndUpdate(
          { sender_id: userId, recipient_id: receiverId, status: "sent" },
          { status: "delivered" },
          { new: true }
        );
        io.to(activeUsers.get(receiverId)!).emit('new_message', {
          message: { ...msg, id: newMessage?._id, status: newMessage?.status },
          senderId: userId
        });
      }
    } else if (channel === 'typing_channel') {
      const { userId, receiverId } = messageData;
      if (activeUsers.has(receiverId)) {
        io.to(activeUsers.get(receiverId)!).emit('user_typing', { senderId: userId });
      }
    } else if (channel === 'stop_typing_channel') {
      const { userId, receiverId } = messageData;
      if (activeUsers.has(receiverId)) {
        io.to(activeUsers.get(receiverId)!).emit('user_stop_typing', { senderId: userId });
      }
    }
  });
};
