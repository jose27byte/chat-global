const socket = io();

// Referencias a los elementos del HTML
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const fileInput = document.getElementById('image-input');

// 1. CARGAR HISTORIAL
socket.on('load history', (history) => {
    messages.innerHTML = ''; 
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

// 3. ENVIAR MENSAJES
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageText = input.value.trim();
    let imageUrl = null;

    // Intentar subir imagen solo si el input existe y tiene un archivo
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                imageUrl = result.imageUrl;
            } else {
                console.warn('La subida falló (posiblemente falta la ruta /upload en el servidor)');
            }
        } catch (error) {
            console.error('Error de red al subir imagen:', error);
        }
    }

    // Enviar si hay texto o si logramos obtener una URL de imagen
    if (messageText || imageUrl) {
        socket.emit('chat message', {
            text: messageText,
            image: imageUrl
        });
        
        // Limpiar campos
        input.value = '';
        if (fileInput) fileInput.value = '';
    }
});

// 4. DIBUJAR MENSAJES
function renderMessage(data) {
    const item = document.createElement('li');
    item.classList.add('message-item'); 
    
    if (data.text) {
        const textElement = document.createElement('p');
        textElement.textContent = data.text;
        item.appendChild(textElement);
    }

    if (data.image) {
        const img = document.createElement('img');
        img.src = data.image;
        img.style.display = "block";
        img.style.maxWidth = '250px';
        img.style.borderRadius = '8px';
        img.style.marginTop = '5px';
        item.appendChild(img);
    }

    messages.appendChild(item);
}

function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}