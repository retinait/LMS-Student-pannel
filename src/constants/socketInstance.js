import io from 'socket.io-client';
import { socket_url, socket_path } from './constString';

const sessionId = localStorage.getItem('sessionId');

console.log('sessionId', sessionId);
let socket;
export const initSocket = () => {
	socket = io(socket_url, {
		path: socket_path,
		transports: ['websocket'],
		query: {
			sessionId: sessionId
		}
	});
	
};

export const getSocket = () => {
	if (!socket) {
		throw new Error('Socket not initialized');
	}

	return socket;
};

// module.exports = { initSocket, getSocket };
