.ready(function() {
    window.addEventListener('message', function(event) {
        if (event.data.action === "open") {
            container.removeClass('hidden');
            setupInventory(event.data.inventory);
        } else if (event.data.action === "close") {
            container.addClass('hidden');
        } else if (event.data.action === "openSecondary") {
            openSecondary(event.data.type, event.data.id, event.data.inventory);
        }
    });
});

const container = ;

// Función principal para dibujar los slots (actualizada)
function setupInventory(data) {
    .text(data.weight);
    .text(data.maxWeight);

    const mainSlots = ;
    mainSlots.empty();

    for (let i = 1; i <= data.slots; i++) {
        const item = data.items[i];
        let slotHTML = `<div class="slot" data-slot="${i}">`;
        
        if (item) {
            slotHTML += `<img src="img/${item.name}.png">
                          <div class="slot-count">${item.count}</div>`;
            
            if (item.durability) {
                slotHTML += `<div class="durability-bar"><div class="durability-fill" style="width:${item.durability}%"></div></div>`;
            }
        }
        
        slotHTML += `</div>`;
        mainSlots.append(slotHTML);
    }
}

// Abrir secundario (Maletero, Crafteo, etc.)
function openSecondary(type, id, inventory) {
    const leftPanel = ;
    const header = leftPanel.find('.panel-header');
    
    header.text(type === "trunk" ? "MALETERO: " + id : "GUANTERA");
    
    const secondarySlots = ;
    secondarySlots.empty();
    
    // Misma lógica de setupInventory pero para el panel izquierdo
    // ...
}

// Lógica de Tooltips (simplificada)
.on('mouseover', '.slot', function() {
    const slot = ;
    const itemData = slot.data('item'); // Asumiendo que guardas data aquí
    if (!itemData) return;

    .removeClass('hidden').html(`
        <b>${itemData.label}</b><br>
        ${itemData.description}<br>
        Durabilidad: ${itemData.durability}%
    `);
});

.on('mouseout', '.slot', function() {
    .addClass('hidden');
});

.on('mousemove', function(e) {
    .css({
        left: e.pageX + 15 + 'px',
        top: e.pageY + 15 + 'px'
    });
});
