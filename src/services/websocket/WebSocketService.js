class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Set();
    }

    connect(url, userId) {
        if (this.socket) {
            console.warn('WebSocket already connected.');
            return;
        }

        // Append user_id as a query parameter to the WebSocket URL
        const websocketUrl = `${url}?user_id=${userId}`;

        this.socket = new WebSocket(websocketUrl);

        this.socket.onopen = () => {
            // console.log('WebSocket connected.');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // console.log("Received notification:", data);
            this.listeners.forEach((listener) => listener(data)); // Notify all listeners
        };

        this.socket.onclose = (event) => {
            console.warn(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
            // console.log('event', event);
            // setTimeout(() => this.connect(url, userId), 5000); // Attempt to reconnect after 5 seconds
            // console.log('Reconnecting in 5 seconds...');
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected.');
        }
    }

    addListener(callback) {
        this.listeners.add(callback);
    }

    removeListener(callback) {
        this.listeners.delete(callback);
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
