const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Lógica de conexión del chat
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('chat message', (data) => {
        // Reenviar el mensaje a todos los usuarios conectados
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});