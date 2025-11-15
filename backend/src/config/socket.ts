import { Server as SocketIOServer } from 'socket.io';

/**
 * Socket.IO Configuration
 *
 * Sets up WebSocket connections for real-time features.
 * Handles chat, notifications, and order tracking events.
 */

/**
 * Setup Socket.IO server with event handlers
 */
export const setupSocketIO = (io: SocketIOServer): void => {
  // Handle new connections
  io.on('connection', socket => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Handle user joining specific rooms
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`👥 User ${socket.id} joined room: ${roomId}`);
    });

    // Handle leaving rooms
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`👋 User ${socket.id} left room: ${roomId}`);
    });

    // Handle chat messages
    socket.on('chat-message', (data: any) => {
      console.log(`💬 Chat message from ${socket.id}:`, data);

      // Broadcast to room
      if (data.roomId) {
        socket.to(data.roomId).emit('chat-message', {
          ...data,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle order updates
    socket.on('order-update', (data: any) => {
      console.log(`📦 Order update from ${socket.id}:`, data);

      // Broadcast to specific user or room
      if (data.userId) {
        socket.to(`user-${data.userId}`).emit('order-update', data);
      }
    });

    // Handle location updates (for delivery tracking)
    socket.on('location-update', (data: any) => {
      console.log(`📍 Location update from ${socket.id}:`, data);

      // Broadcast to order room
      if (data.orderId) {
        socket.to(`order-${data.orderId}`).emit('location-update', data);
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data: any) => {
      socket.to(data.roomId).emit('typing-start', {
        userId: data.userId,
        username: data.username,
      });
    });

    socket.on('typing-stop', (data: any) => {
      socket.to(data.roomId).emit('typing-stop', {
        userId: data.userId,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', error => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  // Handle server-level events
  io.engine.on('connection_error', err => {
    console.error('❌ Socket.IO connection error:', err);
  });
};

/**
 * Utility functions for Socket.IO operations
 */
export const socketUtils = {
  /**
   * Send notification to specific user
   */
  sendNotificationToUser: (
    io: SocketIOServer,
    userId: string,
    notification: any
  ) => {
    io.to(`user-${userId}`).emit('notification', notification);
  },

  /**
   * Send order update to user
   */
  sendOrderUpdate: (io: SocketIOServer, userId: string, orderData: any) => {
    io.to(`user-${userId}`).emit('order-update', orderData);
  },

  /**
   * Send chat message to room
   */
  sendChatMessage: (io: SocketIOServer, roomId: string, message: any) => {
    io.to(roomId).emit('chat-message', message);
  },

  /**
   * Broadcast to all connected clients
   */
  broadcastToAll: (io: SocketIOServer, event: string, data: any) => {
    io.emit(event, data);
  },

  /**
   * Get connected clients count
   */
  getConnectedClientsCount: (io: SocketIOServer): number => {
    return io.engine.clientsCount;
  },
};
