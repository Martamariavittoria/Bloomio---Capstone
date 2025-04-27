/* // src/components/SocketClient.js
import { useEffect, useContext } from 'react';
import io from 'socket.io-client';
import AuthContext from '../context/AuthContext';

const socket = io('http://localhost:3317'); // usa la tua porta backend

const SocketClient = ({ onNotification }) => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?._id) {
      socket.emit('register', user._id);
    }

    socket.on('new_notification', (notification) => {
      console.log('🔔 Notifica in tempo reale:', notification);
      if (onNotification) onNotification(notification);
    });

    return () => {
      socket.off('new_notification');
    };
  }, [user]);

  return null; // non renderizza nulla
};

export default SocketClient;
 */