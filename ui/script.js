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
// Función para actualizar los niveles visuales
function updateStatus(data) {
    if (data.health) document.getElementById('health-bar').style.width = data.health + "%";
    if (data.armor) document.getElementById('armor-bar').style.width = data.armor + "%";
    if (data.hunger) document.getElementById('hunger-bar').style.width = data.hunger + "%";
    if (data.thirst) document.getElementById('thirst-bar').style.width = data.thirst + "%";
}

// Escuchar los datos reales del servidor
window.addEventListener('message', function(event) {
    if (event.data.type === "update_status") {
        updateStatus(event.data);
    }
});
// Función para verificar si tienes las llaves o la radio
function updatePropertyPanel(inventoryItems) {
    let hasCarKeys = false;
    let hasHouseKeys = false;
    let hasRadio = false;

    // Escaneamos los objetos que hay en los slots
    inventoryItems.forEach(item => {
        if (item.name === "llaves_coche") hasCarKeys = true;
        if (item.name === "llaves_casa") hasHouseKeys = true;
        if (item.name === "radio") hasRadio = true;
    });

    // Actualizamos la vista según si los encontró o no
    document.getElementById('val-car').innerText = hasCarKeys ? "MATRÍCULA: [34ABC]" : "SIN LLAVES";
    document.getElementById('val-car').parentElement.parentElement.style.opacity = hasCarKeys ? "1" : "0.3";

    document.getElementById('val-house').innerText = hasHouseKeys ? "CALLE 123, APTO 4" : "SIN LLAVES";
    document.getElementById('val-house').parentElement.parentElement.style.opacity = hasHouseKeys ? "1" : "0.3";

    document.getElementById('val-radio').innerText = hasRadio ? "104.5 MHz" : "APAGADA";
    document.getElementById('val-radio').parentElement.parentElement.style.opacity = hasRadio ? "1" : "0.3";
}
// Cada vez que renderizamos los items, chequeamos las propiedades
const oldRefresh = refreshInventory || function() {}; 
function refreshInventory(items) {
    oldRefresh(items);
    updatePropertyPanel(items);
}
// Crear el HTML del teclado dinámicamente
const radioHTML = `
    <div id="radio-numpad">
        <div id="radio-display">0.0</div>
        <button class="num-btn" onclick="addNum('1')">1</button>
        <button class="num-btn" onclick="addNum('2')">2</button>
        <button class="num-btn" onclick="addNum('3')">3</button>
        <button class="num-btn" onclick="addNum('4')">4</button>
        <button class="num-btn" onclick="addNum('5')">5</button>
        <button class="num-btn" onclick="addNum('6')">6</button>
        <button class="num-btn" onclick="addNum('7')">7</button>
        <button class="num-btn" onclick="addNum('8')">8</button>
        <button class="num-btn" onclick="addNum('9')">9</button>
        <button class="num-btn" style="background:#8b0000" onclick="closeRadio()">X</button>
        <button class="num-btn" onclick="addNum('0')">0</button>
        <button class="num-btn" style="background:#006400" onclick="setFrequency()">OK</button>
    </div>`;
document.body.insertAdjacentHTML('beforeend', radioHTML);

let currentFreq = "";

function addNum(num) {
    if (currentFreq.length < 5) {
        currentFreq += num;
        document.getElementById('radio-display').innerText = currentFreq + " MHz";
    }
}

function setFrequency() {
    SendNotification("Frecuencia establecida: " + currentFreq + " MHz", "success");
    document.getElementById('val-radio').innerText = currentFreq + " MHz";
    // Aquí avisamos a Lua/Mumble
    closeRadio();
}

function closeRadio() {
    document.getElementById('radio-numpad').style.display = 'none';
    currentFreq = "";
}

// Abrir si el panel de radio tiene opacidad 1 (posee el ítem)
document.getElementById('val-radio').parentElement.parentElement.onclick = function() {
    if (this.style.opacity === "1") {
        document.getElementById('radio-numpad').style.display = 'grid';
    }
};
function updateInventoryWeight(items) {
    let totalWeight = 0;
    const maxWeight = 25.0; // Límite de la mochila

    items.forEach(item => {
        // Buscamos el peso en nuestra base de datos de items
        const itemInfo = ItemDatabase[item.name];
        if (itemInfo && itemInfo.weight) {
            totalWeight += (itemInfo.weight * item.amount);
        }
    });

    // Actualizar visualmente
    const percentage = (totalWeight / maxWeight) * 100;
    document.getElementById('weight-fill').style.width = Math.min(percentage, 100) + "%";
    document.getElementById('weight-label').innerText = totalWeight.toFixed(1) + " / " + maxWeight.toFixed(1) + " kg";

    // Cambiar color si está muy lleno
    if (percentage >= 90) {
        document.getElementById('weight-fill').style.background = "#ff4b4b";
    } else {
        document.getElementById('weight-fill').style.background = "#ffce4b";
    }
}
// Crear el contenedor del menú
const contextMenu = document.createElement('div');
contextMenu.id = 'context-menu';
contextMenu.innerHTML = `
    <div class="context-option" onclick="actionItem('use')">Usar</div>
    <div class="context-option" onclick="actionItem('give')">Entregar</div>
    <div class="context-option" onclick="actionItem('drop')">Tirar</div>
`;
document.body.appendChild(contextMenu);

let selectedItem = null;

// Bloquear el menú original del navegador y mostrar el nuestro
window.oncontextmenu = function(e) {
    const slot = e.target.closest('.slot');
    if (slot && slot.getAttribute('data-item')) {
        e.preventDefault();
        selectedItem = slot.getAttribute('data-item');
        
        contextMenu.style.display = 'block';
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top = e.pageY + 'px';
    } else {
        contextMenu.style.display = 'none';
    }
};

// Cerrar si hacemos click normal en otro lado
window.onclick = function() {
    contextMenu.style.display = 'none';
};

function actionItem(type) {
    if (!selectedItem) return;
    
    if (type === 'use') {
        SendNotification("Usando: " + selectedItem, "success");
        // Aquí llamaríamos a la barra de progreso que hicimos antes
        startProgressBar(3000, "Usando " + selectedItem);
    }
    
    contextMenu.style.display = 'none';
}
// Controlador de sonidos
function playSound(file, volume = 0.5) {
    let audio = new Audio('sounds/' + file + '.ogg');
    audio.volume = volume;
    audio.play().catch(e => console.log("Esperando interacción para sonar"));
}

// Sonido al pasar el ratón por los slots
document.addEventListener('mouseover', function(e) {
    if (e.target.closest('.slot')) {
        playSound('hover', 0.1);
    }
});

// Sonido al abrir el menú de contexto
window.addEventListener('contextmenu', function(e) {
    if (e.target.closest('.slot')) {
        playSound('click_box', 0.3);
    }
});
window.addEventListener('message', function(event) {
    if (event.data.type === "ui") {
        if (event.data.status) {
            playSound('open_bag', 0.4);
        } else {
            playSound('close_bag', 0.3);
        }
    }
});
function SendNotification(msg, type = "info") {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    const notif = document.createElement('div');
    notif.className = `notif ${type}`;
    
    const title = type === "error" ? "SISTEMA - ERROR" : "SISTEMA - INFO";
    
    notif.innerHTML = `
        <span class="notif-title">${title}</span>
        <div class="notif-msg">${msg}</div>
    `;

    container.appendChild(notif);

    // Sonido de aviso (si ya subiste sonidos)
    if (typeof playSound === "function") playSound('notify', 0.2);

    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, 5000);
}
let draggedItem = null;
let fromSlot = null;

// Configurar los eventos de arrastre
document.addEventListener('dragstart', function(e) {
    if (e.target.classList.contains('item-icon')) {
        draggedItem = e.target;
        fromSlot = e.target.parentElement.getAttribute('data-slot');
        e.target.classList.add('dragging');
        
        // Efecto de sonido al levantar
        if (typeof playSound === "function") playSound('click_box', 0.2);
    }
});

document.addEventListener('dragend', function(e) {
    if (e.target.classList.contains('item-icon')) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('drag-over'));
    }
});

document.addEventListener('dragover', function(e) {
    e.preventDefault(); // Necesario para permitir soltar
    const slot = e.target.closest('.slot');
    if (slot) {
        slot.classList.add('drag-over');
    }
});

document.addEventListener('dragleave', function(e) {
    const slot = e.target.closest('.slot');
    if (slot) {
        slot.classList.remove('drag-over');
    }
});

document.addEventListener('drop', function(e) {
    e.preventDefault();
    const toSlot = e.target.closest('.slot');
    
    if (toSlot && draggedItem) {
        const toSlotId = toSlot.getAttribute('data-slot');
        
        // Lógica de intercambio visual
        if (fromSlot !== toSlotId) {
            moveItem(fromSlot, toSlotId);
            if (typeof playSound === "function") playSound('pickup_object', 0.3);
        }
    }
});

function moveItem(from, to) {
    // Aquí es donde el Inventario avisa a Lua que movimos algo
    // Para que el servidor guarde el cambio en la base de datos
    console.log("Movido de slot " + from + " al slot " + to);
    SendNotification("Objeto movido", "success");
    
    // Aquí dispararíamos el callback hacia el servidor
    /*
    $.post('https://LifeOS_Inventory/MoveItem', JSON.stringify({
        from: from,
        to: to
    }));
    */
}
// Crear la zona de drop dinámicamente
const dropZoneHTML = '<div id="drop-zone"><div class="drop-indicator">Soltar para tirar al suelo</div></div>';
document.body.insertAdjacentHTML('afterbegin', dropZoneHTML);

const dz = document.getElementById('drop-zone');

// Al empezar a arrastrar, mostramos la zona de drop
document.addEventListener('dragstart', function() {
    dz.style.display = 'block';
});

// Al terminar, la ocultamos
document.addEventListener('dragend', function() {
    dz.style.display = 'none';
});

// Si soltamos en la zona de drop (fuera de un slot)
dz.addEventListener('drop', function(e) {
    if (draggedItem && !e.target.closest('.slot')) {
        const itemName = draggedItem.parentElement.getAttribute('data-item');
        
        SendNotification("Has tirado " + itemName, "error");
        if (typeof playSound === "function") playSound('drop_item', 0.4);
        
        // Aquí avisamos a Lua para que cree el objeto en el suelo
        /*
        $.post('https://LifeOS_Inventory/DropItem', JSON.stringify({
            item: itemName,
            coords: GetEntityCoords(PlayerPedId())
        }));
        */
        
        // Limpiamos el slot visualmente
        draggedItem.parentElement.innerHTML = "";
    }
});
// Insertar el HTML del diálogo
const splitHTML = `
    <div id="split-dialog">
        <div style="color:#aaa; font-size:12px;">CANTIDAD A MOVER</div>
        <input type="number" id="split-input" value="1" min="1">
        <br>
        <button class="split-btn" onclick="confirmSplit()">Confirmar</button>
    </div>`;
document.body.insertAdjacentHTML('beforeend', splitHTML);

let pendingMove = null;

function openSplitDialog(from, to) {
    pendingMove = { from, to };
    document.getElementById('split-dialog').style.display = 'block';
    document.getElementById('split-input').focus();
}

function confirmSplit() {
    const amount = document.getElementById('split-input').value;
    if (amount > 0 && pendingMove) {
        SendNotification("Movido: " + amount + " unidades", "success");
        // Aquí enviarías la cantidad exacta al servidor Lua
        console.log("Moviendo " + amount + " desde " + pendingMove.from + " a " + pendingMove.to);
        
        document.getElementById('split-dialog').style.display = 'none';
        pendingMove = null;
    }
}
// Función para equipar ropa/accesorios
function equipItem(slotType, itemName) {
    SendNotification("Equipando: " + itemName, "success");
    
    // Enviamos al cliente Lua qué slot y qué ítem es
    $.post('https://LifeOS_Inventory/EquipItem', JSON.stringify({
        slot: slotType,
        item: itemName
    }));
}

// Modificamos el evento 'drop' para detectar los slots de equipo
document.addEventListener('drop', function(e) {
    const equipSlot = e.target.closest('.equip-slot');
    if (equipSlot && draggedItem) {
        const slotType = equipSlot.getAttribute('data-slot');
        const itemName = draggedItem.parentElement.getAttribute('data-item');
        
        equipItem(slotType, itemName);
    }
});
