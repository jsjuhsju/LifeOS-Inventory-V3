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
function SetInventoryBlur(status)
    if status then
        TriggerScreenblurFadeIn(1000) -- Desenfoque en 1 segundo
    else
        TriggerScreenblurFadeOut(1000) -- Quitar desenfoque
    end
end

-- Lo conectamos al toggle principal
local baseToggle = toggleInventory
function toggleInventory(bool)
    SetInventoryBlur(bool)
    if baseToggle then baseToggle(bool) end
end
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(2000) -- Revisar cada 2 segundos para no laggear
        if currentWeight > maxWeight then
            local playerPed = PlayerPedId()
            -- Si el peso supera el máximo, el jugador no puede correr
            DisableControlAction(0, 21, true) -- Desactivar Sprint (Shift)
            SetPedMoveRateOverride(playerPed, 0.8) -- Caminar más lento
            
            if not isOverweightNotified then
                SendNotification("Estás demasiado pesado para correr", "error")
                isOverweightNotified = true
            end
        else
            isOverweightNotified = false
        end
    end
end)
-- Lista de modelos de mesas de trabajo (props de GTA)
local craftingProps = {
    "prop_toolchest_01",
    "prop_toolchest_02",
    "prop_tool_bench02",
    "prop_tool_bench02_ld"
}

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1000) -- Revisa cada segundo
        local playerPed = PlayerPedId()
        local coords = GetEntityCoords(playerPed)
        local nearbyBench = false

        for _, model in pairs(craftingProps) do
            local hash = GetHashKey(model)
            local closestObj = GetClosestObjectOfType(coords.x, coords.y, coords.z, 2.0, hash, false, false, false)
            
            if closestObj ~= 0 then
                nearbyBench = true
                break
            end
        end

        -- Avisamos al inventario si puede mostrar el crafteo
        SendNUIMessage({
            type = "update_crafting",
            status = nearbyBench
        })
    end
end)
-- Función para obtener el vehículo frente al jugador
function GetVehicleInFront()
    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    local entityWorld = GetOffsetFromEntityInWorldCoords(playerPed, 0.0, 3.0, 0.0)
    local rayHandle = CastRayPointToPoint(coords.x, coords.y, coords.z, entityWorld.x, entityWorld.y, entityWorld.z, 10, playerPed, 0)
    local a, b, c, d, vehicle = GetRaycastResult(rayHandle)
    return vehicle
end

-- Modificamos la apertura del inventario
RegisterCommand('openInventory', function()
    local vehicle = GetVehicleInFront()
    local plate = nil
    
    if DoesEntityExist(vehicle) then
        plate = GetVehicleNumberPlateText(vehicle)
        -- Abrir maletero físicamente (animación)
        SetVehicleDoorOpen(vehicle, 5, false, false)
        
        SendNUIMessage({
            action = "openSecondary",
            type = "trunk",
            id = plate
        })
    end
    
    toggleInventory(true) -- Abre tu mochila normal
end)
-- Al cerrar el inventario
function closeInventory()
    local vehicle = GetVehicleInFront()
    if DoesEntityExist(vehicle) then
        SetVehicleDoorShut(vehicle, 5, false) -- Cerrar maletero
    end
    toggleInventory(false)
end
RegisterCommand('openInventory', function()
    local vehicle = GetVehicleInFront()
    
    if DoesEntityExist(vehicle) then
        local lockStatus = GetVehicleDoorLockStatus(vehicle)
        
        -- En GTA, 1 es desbloqueado, 2 es bloqueado
        if lockStatus == 1 then
            local plate = GetVehicleNumberPlateText(vehicle)
            
            -- Animación real: Abrir el maletero
            SetVehicleDoorOpen(vehicle, 5, false, false)
            
            SendNUIMessage({
                action = "openSecondary",
                type = "trunk",
                id = plate
            })
            toggleInventory(true)
        else
            -- Si está cerrado, mandamos un aviso en vez de abrir
            SendNotification("El vehículo está cerrado con llave", "error")
            toggleInventory(true) -- Abre solo tu mochila normal
        end
    else
        toggleInventory(true) -- No hay coche, abre mochila normal
    end
end)
RegisterNUICallback('LockpickSuccess', function(data, cb)
    local vehicle = GetVehicleInFront()
    SetVehicleDoorsLocked(vehicle, 1) -- Desbloquear
    SetVehicleDoorOpen(vehicle, 5, false, false) -- Abrir maletero
    SendNotification("Has forzado el maletero", "success")
    cb('ok')
end)

RegisterNUICallback('LockpickFail', function(data, cb)
    -- Aquí podríamos quitarle la ganzúa del inventario al jugador
    TriggerServerEvent('LifeOS_Inventory:RemoveItem', 'lockpick', 1)
    cb('ok')
end)
