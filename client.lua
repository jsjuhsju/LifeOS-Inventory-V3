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
