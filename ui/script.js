window.addEventListener('message', function(event) {
    let item = event.data;
    if (item.type === "ui") {
        if (item.status) {
            display(true);
        } else {
            display(false);
        }
    }
});

function display(bool) {
    if (bool) {
        document.body.style.display = "block";
    } else {
        document.body.style.display = "none";
    }
}

// Generar los slots de los bolsillos (10x10 = 100 slots)
const grid = document.getElementById('pockets-grid');
for (let i = 1; i <= 100; i++) {
    const slot = document.createElement('div');
    slot.classList.add('slot');
    slot.setAttribute('data-slot-id', i);
    grid.appendChild(slot);
}

// Cerrar con la tecla ESC
document.onkeyup = function (data) {
    if (data.which == 27) { // 27 es la tecla ESC
        fetch('https://LifeOS-Inventory-V3/exit', {
            method: 'POST',
            body: JSON.stringify({})
        });
        display(false);
    }
};

display(false); // Empezar oculto
