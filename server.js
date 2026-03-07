const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const multer = require('multer'); // Para manejar la subida de fotos

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. Configuración para guardar las imágenes que suban los usuarios
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Se guardarán en la carpeta 'uploads'
    },
    filename: (req, file, cb) => {
        // Nombre único usando la fecha actual + nombre original
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 2. Servir archivos estáticos (CSS, JS, Imágenes)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. SOLUCIÓN AL ERROR "Cannot GET /": Ruta para cargar el chat
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 4. Ruta para procesar la subida de imágenes desde el cliente
app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({ imageUrl: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).send('No se subió ninguna imagen');
    }
});

// 5. Lógica de Socket.io para el chat en tiempo real
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('chat message', (data) => {
        // Reenviar el mensaje (texto e imagen) a todos los conectados
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// 6. Puerto dinámico requerido por Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});