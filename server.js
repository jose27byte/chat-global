const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- CONEXIÓN A BASE DE DATOS ---
const uri = "mongodb+srv://joalgonvilla_db_user:dAMJXkvGhR9JX8cn@cluster0.htsknng.mongodb.net/?appName=Cluster0";
mongoose.connect(uri)
    .then(() => console.log("✅ Conexión exitosa a MongoDB Atlas"))
    .catch(err => console.log("❌ Error al conectar a Mongo:", err));

const MessageSchema = new mongoose.Schema({
    text: String,
    image: String,
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// --- CONFIGURACIÓN DE ARCHIVOS (CORREGIDA PARA TU ESTRUCTURA) ---
app.use(express.static(__dirname)); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- LÓGICA DEL CHAT ---
io.on('connection', async (socket) => {
    console.log('Un usuario se ha unido al chat global');

    try {
        const history = await Message.find().sort({ timestamp: 1 }).limit(50);
        socket.emit('load history', history);
    } catch (err) {
        console.log("Error al cargar historial:", err);
    }

    socket.on('chat message', async (data) => {
        try {
            const newMessage = new Message(data);
            await newMessage.save();
            io.emit('chat message', data);
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