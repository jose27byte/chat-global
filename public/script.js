const socket = io();

// Referencias a los elementos del HTML
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const fileInput = document.getElementById('image-input');

// 1. CARGAR HISTORIAL: Se ejecuta cuando entras o refrescas la página
socket.on('load history', (history) => {
    messages.innerHTML = ''; // Limpiar mensajes previos
    history.forEach((data) => {
        renderMessage(data);
    });
    scrollToBottom();
});

// 2. RECIBIR MENSAJES EN TIEMPO REAL
socket.on('chat message', (data) => {
    renderMessage(data);
    scrollToBottom();
});

// 3. ENVIAR MENSAJES (Texto e Imagen)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageText = input.value.trim();
    let imageUrl = null;

    // Si hay una imagen seleccionada, la subimos primero al servidor
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            imageUrl = result.imageUrl;
        } catch (error) {
            console.error('Error al subir la imagen:', error);
        }
    }

    // Enviamos al servidor si hay texto o hay imagen
    if (messageText || imageUrl) {
        socket.emit('chat message', {
            text: messageText,
            image: imageUrl
        });
        
        // Limpiar campos después de enviar
        input.value = '';
        fileInput.value = '';
    }
});

// 4. FUNCIÓN PARA DIBUJAR MENSAJES EN PANTALLA
function renderMessage(data) {
    const item = document.createElement('li');
    item.classList.add('message-item'); // Clase para tus estilos dark
    
    // Contenedor de texto
    if (data.text) {
        const textElement = document.createElement('p');
        textElement.textContent = data.text;
        item.appendChild(textElement);
    }

    // Contenedor de imagen
    if (data.image) {
        const img = document.createElement('img');
        img.src = data.image;
        img.alt = "Imagen enviada";
        img.style.display = "block";
        img.style.maxWidth = '100%';
        img.style.borderRadius = '8px';
        img.style.marginTop = '8px';
        item.appendChild(img);
    }

    messages.appendChild(item);
}

// Función auxiliar para el scroll automático
function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}