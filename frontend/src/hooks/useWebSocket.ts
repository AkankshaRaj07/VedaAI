import { useEffect } from 'react';
import io from 'socket.io-client';
import { useAssignmentStore, IAssignment } from '../store/useAssignmentStore';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:5000';

export const useWebSocket = (assignmentId?: string) => {
  const { 
    setJobProgress, 
    setJobStatus, 
    setActiveAssignment,
    setErrorMessage 
  } = useAssignmentStore();

  useEffect(() => {
    if (!assignmentId) return;

    console.log(`Connecting to WebSocket server at: ${WEBSOCKET_URL}`);
    
    // Connect to Socket.io server
    const socket = io(WEBSOCKET_URL);

    socket.on('connect', () => {
      console.log(`Connected to WS server: ${socket.id}. Joining room: ${assignmentId}`);
      // Join room scoped to this assignment
      socket.emit('join-room', assignmentId);
    });

    // Listen for progress updates
    socket.on('job-status-update', (payload: {
      assignmentId: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      data?: Record<string, unknown> | null;
    }) => {
      console.log('[WS Event] job-status-update received:', payload);
      
      if (payload.assignmentId === assignmentId) {
        setJobProgress(payload.progress);
        setJobStatus(payload.status);

        if (payload.status === 'completed' && payload.data) {
          // Type casting since we know the shape matches IAssignment
          setActiveAssignment(payload.data as unknown as IAssignment);
        } else if (payload.status === 'failed') {
          const errMsg = typeof payload.data?.error === 'string' 
            ? payload.data.error 
            : 'AI generation failed during background process.';
          setErrorMessage(errMsg);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WS server');
    });

    // Cleanup on unmount or id change
    return () => {
      if (socket) {
        socket.disconnect();
        console.log(`Disconnected WS connection for room: ${assignmentId}`);
      }
    };
  }, [assignmentId, setJobProgress, setJobStatus, setActiveAssignment, setErrorMessage]);
};
