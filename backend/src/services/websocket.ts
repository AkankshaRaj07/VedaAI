import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const initWebSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Allow connections from Next.js development server
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);
    
    // Clients join a room scoped by the Assignment ID to receive status updates
    socket.on('join-room', (assignmentId: string) => {
      socket.join(assignmentId);
      console.log(`Client ${socket.id} joined room: ${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Broadcasts job updates to all client sockets subscribed to the assignment room
 */
export const emitJobStatus = (assignmentId: string, status: 'pending' | 'processing' | 'completed' | 'failed', progress: number, data?: any) => {
  if (io) {
    io.to(assignmentId).emit('job-status-update', {
      assignmentId,
      status,
      progress, // percentage 0 - 100
      data
    });
    console.log(`[WS Broadcast] Room ${assignmentId} -> Status: ${status}, Progress: ${progress}%`);
  } else {
    console.warn(`[WS Warning] Socket.io not initialized. Update for assignment ${assignmentId} dropped.`);
  }
};
export const getIOInstance = () => io;
