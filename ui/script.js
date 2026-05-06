// Lógica V3 - Arrastrar y Soltar (Drag & Drop)
let draggedItem = null;

function createSlots() {
    const grid = document.getElementById('pockets-grid');
    grid.innerHTML = ''; // Limpiar antes de generar
    
    for (let i = 1; i <= 100; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.setAttribute('data-slot-id', i);
        
        // Eventos para arrastrar
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('drop', handleDrop);
        
        grid.appendChild(slot);
    }
}

function handleDrop(e) {
    e.preventDefault();
    const slot = e.target.closest('.slot');
    if (slot && draggedItem) {
        // Aquí moveremos el ítem visualmente
        slot.appendChild(draggedItem);
    }
}

// Escuchar mensajes del juego (Lua)
window.addEventListener('message', function(event) {
    if (event.data.type === "ui") {
        document.body.style.display = event.data.status ? "block" : "none";
        if (event.data.status) createSlots();
    }
});

// Cerrar con ESC
document.onkeyup = function (data) {
    if (data.which == 27) {
        fetch('https://LifeOS-Inventory-V3/exit', { method: 'POST' });
    }
};
