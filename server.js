const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- CONEXIÓN A BASE DE DATOS ---
// REEMPLAZA <db_username> por adminVilla (o el que creaste)
// REEMPLAZA <db_password> por tu contraseña real
const uri = "mongodb+srv://adminVilla:TU_CONTRASEÑA_AQUÍ@cluster0.htsknng.mongodb.net/?appName=Cluster0";

mongoose.connect(uri)
    .then(() => console.log("✅ Conexión exitosa a MongoDB Atlas"))
    .catch(err => console.log("❌ Error al conectar a Mongo:", err));

// Esquema de los mensajes
const MessageSchema = new mongoose.Schema({
    text: String,
    image: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// --- CONFIGURACIÓN DE ARCHIVOS ---
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- LÓGICA DEL CHAT ---
io.on('connection', async (socket) => {
    console.log('Un usuario se ha unido al chat global');

    // 1. Enviar el historial de mensajes al entrar
    try {
        const history = await Message.find().sort({ timestamp: 1 }).limit(50);
        socket.emit('load history', history);
    } catch (err) {
        console.log("Error al cargar historial:", err);
    }

    // 2. Escuchar y guardar mensajes nuevos
    socket.on('chat message', async (data) => {
        try {
            const newMessage = new Message(data);
            await newMessage.save(); // Guarda en MongoDB
            io.emit('chat message', data); // Lo envía a todos en tiempo real
        } catch (err) {
            console.log("Error al guardar mensaje:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});