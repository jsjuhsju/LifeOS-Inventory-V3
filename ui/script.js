// Lógica V3 - Gestión de Peso y Colores
let totalSlots = 100;
let occupiedSlots = 0;

function updateWeightUI() {
    // Supongamos que tenemos un elemento para la barra de peso
    const weightBar = document.getElementById('weight-indicator');
    const weightPercent = (occupiedSlots / totalSlots) * 100;
    
    if (weightBar) {
        weightBar.style.width = weightPercent + "%";
        
        // Cambio de color según el llenado (Tu idea de los colores)
        if (weightPercent < 50) {
            weightBar.style.backgroundColor = "#4bff4b"; // Verde
        } else if (weightPercent < 85) {
            weightBar.style.backgroundColor = "#ffce4b"; // Amarillo
        } else {
            weightBar.style.backgroundColor = "#ff4b4b"; // Rojo
        }
    }
}

// Generar slots con capacidad de conteo
function createSlots() {
    const grid = document.getElementById('pockets-grid');
    grid.innerHTML = '';
    occupiedSlots = 0; // Reset para el ejemplo
    
    for (let i = 1; i <= totalSlots; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        grid.appendChild(slot);
    }
    updateWeightUI();
}

window.addEventListener('message', function(event) {
    if (event.data.type === "ui") {
        document.body.style.display = event.data.status ? "block" : "none";
        if (event.data.status) createSlots();
    }
});

document.onkeyup = function (data) {
    if (data.which == 27) {
        fetch('https://LifeOS-Inventory-V3/exit', { method: 'POST' });
    }
};
// Detectar arrastre hacia la Hotbar
document.querySelectorAll('.hotbar-slot').forEach(slot => {
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text");
        // Aquí simulamos que el ítem se mueve a la barra rápida
        slot.innerHTML = '<img src="https://cfx-nui-inventory/html/images/assault_rifle.png" style="width:40px;">';
        console.log("Item movido a slot rápido: " + slot.getAttribute('data-hotkey'));
    });
});
// Crear el elemento del tooltip al cargar
const tooltip = document.createElement('div');
tooltip.id = 'item-tooltip';
tooltip.innerHTML = '<div class="tooltip-title">Nombre Item</div><div class="tooltip-desc">Descripción del objeto aquí...</div>';
document.body.appendChild(tooltip);

document.addEventListener('mousemove', (e) => {
    if (tooltip.style.display === "block") {
        tooltip.style.left = (e.pageX + 15) + 'px';
        tooltip.style.top = (e.pageY + 15) + 'px';
    }
});

// Función para mostrar/ocultar (La usaremos al pasar sobre los slots)
function showTooltip(title, desc) {
    tooltip.querySelector('.tooltip-title').innerText = title;
    tooltip.querySelector('.tooltip-desc').innerText = desc;
    tooltip.style.display = "block";
}

function hideTooltip() {
    tooltip.style.display = "none";
}
// Crear el menú al vuelo
const contextMenu = document.createElement('div');
contextMenu.id = 'context-menu';
contextMenu.innerHTML = `
    <div class="menu-option" onclick="action('use')">USAR</div>
    <div class="menu-option" onclick="action('give')">DAR</div>
    <div class="menu-option" onclick="action('drop')">TIRAR</div>
`;
document.body.appendChild(contextMenu);

// Evitar que salga el menú normal de Windows/Android
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const slot = e.target.closest('.slot');
    if (slot) {
        contextMenu.style.display = "block";
        contextMenu.style.left = e.pageX + "px";
        contextMenu.style.top = e.pageY + "px";
    } else {
        contextMenu.style.display = "none";
    }
});

// Cerrar menú si haces click fuera
document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('#context-menu')) {
        contextMenu.style.display = "none";
    }
});

function action(type) {
    console.log("Acción ejecutada: " + type);
    contextMenu.style.display = "none";
    // Aquí mandaremos la orden al servidor (Lua) después
}
// Sistema de Audio
const audioPlayer = new Audio();

function playSound(file, volume = 0.4) {
    audioPlayer.src = 'https://www.soundjay.com/buttons/sounds/' + file; // Usaremos sonidos base para probar
    audioPlayer.volume = volume;
    audioPlayer.play();
}

// Sonido al abrir/cerrar (Mensaje desde Lua)
window.addEventListener('message', function(event) {
    if (event.data.type === "ui") {
        if (event.data.status) {
            playSound('button-20.mp3', 0.5); // Sonido de apertura
        }
    }
});

// Sonido al interactuar con el menú
document.querySelectorAll('.menu-option').forEach(option => {
    option.addEventListener('mouseenter', () => playSound('button-50.mp3', 0.1));
});
// Contenedor de notificaciones
const notifyContainer = document.createElement('div');
notifyContainer.className = 'notification-container';
document.body.appendChild(notifyContainer);

function SendNotification(text, type = 'info') {
    const el = document.createElement('div');
    el.className = 'notify ' + type;
    el.innerText = text;
    
    notifyContainer.appendChild(el);
    
    // Sonido corto de aviso
    playSound('button-37.mp3', 0.2);

    // Borrar después de 4 segundos
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
    }, 4000);
}

// Escuchar desde el juego
window.addEventListener('message', function(event) {
    if (event.data.type === "notification") {
        SendNotification(event.data.text, event.data.nType);
    }
});
function openExternalStation(label, slots) {
    const externalPanel = document.getElementById('external-panel');
    const stationLabel = document.getElementById('station-label');
    const stationGrid = document.getElementById('station-grid');
    
    stationLabel.innerText = label;
    stationGrid.innerHTML = '';
    
    // Generar slots de la estación (ej: un baúl tiene 50 slots)
    for (let i = 1; i <= slots; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        stationGrid.appendChild(slot);
    }
    
    externalPanel.style.display = "block";
}

// Escuchar si el juego nos dice que abrimos una estación
window.addEventListener('message', function(event) {
    if (event.data.type === "open_station") {
        openExternalStation(event.data.label, event.data.slots);
    }
});
// Lógica de transferencia entre inventarios
function handleDrop(e) {
    e.preventDefault();
    const targetSlot = e.target.closest('.slot');
    const originInventory = draggedItem.parentElement.id; // De dónde viene
    const targetInventory = targetSlot.parentElement.id;   // A dónde va

    if (targetSlot && draggedItem) {
        // Mover visualmente
        targetSlot.appendChild(draggedItem);

        // Si el origen y el destino son diferentes, es una transferencia
        if (originInventory !== targetInventory) {
            const itemName = draggedItem.getAttribute('data-item');
            
            if (targetInventory === "station-grid") {
                SendNotification("Guardaste " + itemName + " en el baúl", "info");
                // Aquí avisaremos a Lua para que lo guarde en la DB del maletero
            } else {
                SendNotification("Sacaste " + itemName + " del baúl", "success");
                // Aquí avisaremos a Lua para que lo guarde en tu mochila
            }
        }
    }
}
// Crear el modal de split
const splitModal = document.createElement('div');
splitModal.id = 'split-modal';
splitModal.innerHTML = `
    <div style="margin-bottom:10px; font-size:12px;">¿CANTIDAD?</div>
    <input type="number" id="split-amount" value="1" min="1">
    <br>
    <button onclick="confirmSplit()">CONFIRMAR</button>
`;
document.body.appendChild(splitModal);

let pendingDrop = null;

function confirmSplit() {
    const amount = document.getElementById('split-amount').value;
    console.log("Moviendo cantidad: " + amount);
    splitModal.style.display = "none";
    
    // Aquí es donde realmente se movería el ítem en la lógica final
    if (pendingDrop) {
        pendingDrop.target.appendChild(draggedItem);
        SendNotification("Moviste " + amount + " unidades", "info");
    }
}

// Modificamos el handleDrop para que use el modal
function handleDrop(e) {
    e.preventDefault();
    pendingDrop = { target: e.target.closest('.slot') };
    
    // Si el ítem es apilable (ejemplo), mostramos el modal
    splitModal.style.display = "block";
    document.getElementById('split-amount').focus();
}
// Diccionario de items (Ejemplo)
const ItemDatabase = {
    "water": { label: "Agua Mineral", img: "water.png", desc: "Sacia la sed rápidamente." },
    "bread": { label: "Pan Casero", img: "bread.png", desc: "Quita el hambre de forma efectiva." },
    "pistol": { label: "Pistola 9mm", img: "pistol.png", desc: "Arma de fuego compacta." }
};

function addItemToSlot(slotId, itemName) {
    const item = ItemDatabase[itemName];
    const slot = document.querySelectorAll('.slot')[slotId];
    
    if (item && slot) {
        slot.innerHTML = `<img src="images/${item.img}" alt="${item.label}">`;
        slot.setAttribute('data-item', itemName);
        
        // Eventos para el Tooltip que hicimos antes
        slot.onmouseenter = () => showTooltip(item.label, item.desc);
        slot.onmouseleave = () => hideTooltip();
    }
}
