// Set environment variable for port
process.env.SOCKET_PORT = 3003;
process.env.CLIENT_URL = 'http://localhost:3000';

// Start the socket server
require('./socket.js');