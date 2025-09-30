import { useEffect, useState } from 'react';
import useCurrentUser from '../hooks/useCurrentUser'

const useWebSocket = () => {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const { role } = useCurrentUser
    const roleMessage = { msg: 5173 }


    useEffect(() => {
        // Create WebSocket connection
        const ws = new WebSocket('ws://127.0.0.1:8000/ws/notifications/');

        console.log('WebSocket initialized:', ws);

        // Event listener for when the connection is opened
        ws.onopen = () => {
            console.log('WebSocket connected');
            const message = JSON.stringify(roleMessage)
            ws.send(message);
            console.log('Sent useCurrent info:', roleMessage);
        };

        // Event listener for receiving messages
        ws.onmessage = (event) => {
            const parsedMessage = JSON.parse(event.data);
            console.log('Received message:', parsedMessage);
            setMessages((prev) => [...prev, parsedMessage]);
        };

        // Event listener for WebSocket errors
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Event listener for when the connection is closed
        ws.onclose = (event) => {
            console.log('WebSocket closed:', event);
        };

        setSocket(ws);

        // Clean up on unmount
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [role]);

    const sendMessage = (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const messageString = JSON.stringify(message);
            socket.send(messageString);
            console.log('Message sent:', messageString);
        } else {
            console.error('WebSocket is not connected.');
        }
    };

    return { socket, messages, sendMessage };
};

export default useWebSocket;
