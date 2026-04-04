import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const socketUrl = import.meta.env.VITE_SOCKET_URL || new URL(apiUrl, window.location.origin).origin;
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });
      setSocket(newSocket);
      
      // Register user with socket
      newSocket.emit('register', user.id);
      if (isDev) {
        console.log('Socket connected and registered:', user.id);
      }
      
      // Listen for status updates
      newSocket.on('status_update', (data) => {
        toast.success(data.message);
      });
      
      // Listen for new reviews
      newSocket.on('new_review', (data) => {
        toast.success(`⭐ ${data.message}`);
      });
      
      // Listen for new providers
      newSocket.on('new_provider', (data) => {
        toast.success(`🏪 ${data.message}`);
      });
      
      // Listen for new reports
      newSocket.on('new_report', (data) => {
        toast.error(`🚨 ${data.message}`);
      });
      
      // Listen for report resolved
      newSocket.on('report_resolved', (data) => {
        if (data.valid) {
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      });
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, isDev, socketUrl, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
