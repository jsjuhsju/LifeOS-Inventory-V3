local display = false

-- Comando para abrir/cerrar (puedes probarlo con /openinv en el chat)
RegisterCommand("openinv", function()
    toggleInventory(not display)
end)

-- Tecla rápida (TAB por defecto)
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if IsControlJustReleased(0, 37) then -- 37 es la tecla TAB
            toggleInventory(not display)
        end
    end
end)

function toggleInventory(bool)
    display = bool
    SetNuiFocus(bool, bool) -- Bloquea el mouse y teclado para el juego
    SendNUIMessage({
        type = "ui",
        status = bool,
    })
end

-- Callback para cerrar desde el JS (tecla ESC)
RegisterNUICallback("exit", function(data)
    toggleInventory(false)
end)
