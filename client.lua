local display = false
local tabletObj = nil

-- Función para cargar animaciones
function loadAnimDict(dict)
    while (not HasAnimDictLoaded(dict)) do
        RequestAnimDict(dict)
        Citizen.Wait(5)
    end
end

-- Función para abrir/cerrar con animación
function toggleInventory(bool)
    display = bool
    SetNuiFocus(bool, bool)
    
    local playerPed = PlayerPedId()

    if bool then
        -- Iniciar Animación de Tablet
        loadAnimDict("amb@code_human_in_car_mp_tablet@base")
        TaskPlayAnim(playerPed, "amb@code_human_in_car_mp_tablet@base", "base", 8.0, 1.0, -1, 49, 1.0, 0, 0, 0)
        
        -- Crear el objeto de la Tablet en la mano
        local mHash = GetHashKey("prop_cs_tablet")
        RequestModel(mHash)
        while not HasModelLoaded(mHash) do Citizen.Wait(1) end
        
        tabletObj = CreateObject(mHash, 0.0, 0.0, 0.0, true, true, false)
        AttachEntityToEntity(tabletObj, playerPed, GetEntityBoneIndexByName(playerPed, "PH_L_Hand"), 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, true, true, false, true, 1, true)
    else
        -- Detener Animación y borrar Tablet
        ClearPedTasks(playerPed)
        if tabletObj ~= nil then
            DeleteEntity(tabletObj)
            tabletObj = nil
        end
    end

    SendNUIMessage({
        type = "ui",
        status = bool,
    })
end

-- Tecla TAB para abrir
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if IsControlJustReleased(0, 37) then -- TAB
            toggleInventory(not display)
        end
    end
end)

-- Cerrar desde el NUI (Esc)
RegisterNUICallback("exit", function(data)
    toggleInventory(false)
end)
-- Función mejorada para cerrar todo
RegisterNUICallback("exit", function(data)
    toggleInventory(false)
    
    -- Si había un vehículo abierto, cerrar maletero
    local vehicle = GetVehicleInFront()
    if vehicle ~= 0 then
        SetVehicleDoorShut(vehicle, 5, false)
    end
end)
-- Actualizar vitales al abrir el inventario
function SendStatusToUI()
    local playerPed = PlayerPedId()
    local health = GetEntityHealth(playerPed) - 100 -- En FiveM la vida base es 100-200
    local armor = GetPedArmour(playerPed)
    
    -- Aquí podrías integrar tus variables de hambre/sed si usas ESX o QB
    local hunger = 75 -- Ejemplo
    local thirst = 50 -- Ejemplo

    SendNUIMessage({
        type = "update_status",
        health = health,
        armor = armor,
        hunger = hunger,
        thirst = thirst
    })
end

-- Modificamos la función que ya teníamos para que llame a los vitales
local oldToggleInventory = toggleInventory
function toggleInventory(bool)
    if bool then SendStatusToUI() end
    oldToggleInventory(bool)
end
-- Asegurar que el juego se pause visualmente al abrir
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if display then
            -- Desactivar controles de cámara y ataques mientras el inv está abierto
            DisableControlAction(0, 1, true) -- LookLeftRight
            DisableControlAction(0, 2, true) -- LookUpDown
            DisableControlAction(0, 24, true) -- Attack
            DisableControlAction(0, 25, true) -- Aim
        end
    end
end)
-- Función para manejar la animación de la mochila/bolsillos
function PlayInventoryAnim(status)
    local playerPed = PlayerPedId()
    local animDict = "pickup_object" -- Diccionario de animación
    local animName = "putdown_low"   -- Nombre de la animación (puedes cambiarla por 'idle')

    if status then
        -- Cargar el diccionario
        RequestAnimDict(animDict)
        while not HasAnimDictLoaded(animDict) do
            Citizen.Wait(10)
        end
        -- Ejecutar animación en bucle mientras esté abierto
        TaskPlayAnim(playerPed, animDict, animName, 8.0, -8.0, -1, 49, 0, false, false, false)
    else
        -- Detener animación al cerrar
        StopAnimTask(playerPed, animDict, animName, 1.0)
    end
end

-- Actualizamos el trigger principal
local oldToggle = toggleInventory
function toggleInventory(bool)
    PlayInventoryAnim(bool) -- Llamamos a la animación aquí
    if oldToggle then oldToggle(bool) end
end
RegisterNUICallback('EquipItem', function(data, cb)
    local playerPed = PlayerPedId()
    
    if data.slot == "vest" then
        -- Ejemplo: Poner chaleco antibalas (Componente 9)
        SetPedComponentVariation(playerPed, 9, 1, 0, 0) 
        SetArmour(playerPed, 100) -- Te da la protección real
    elseif data.slot == "mask" then
        -- Ejemplo: Poner máscara (Componente 1)
        SetPedComponentVariation(playerPed, 1, 12, 0, 0)
    elseif data.slot == "head" then
        -- Ejemplo: Poner casco/gorra (Prop 0)
        SetPedPropIndex(playerPed, 0, 10, 0, true)
    end
    
    cb('ok')
end)
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        -- Si el inventario NO está abierto, revisamos las teclas 1 al 4
        if not inventoryOpen then
            for i = 1, 4 do
                if IsControlJustReleased(0, 156 + i) or IsDisabledControlJustReleased(0, 156 + i) then
                    -- Enviamos al servidor la orden de usar el slot i
                    TriggerServerEvent('LifeOS_Inventory:UseItemFromSlot', i)
                    
                    -- Efecto visual: Notificación rápida
                    SendNotification("Usando objeto del slot " .. i, "info")
                end
            end
        end
    end
end)
