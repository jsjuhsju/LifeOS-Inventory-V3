local oxmysql = exports.oxmysql

-- Cargar inventario al entrar
RegisterNetEvent('LifeOS:Server:LoadInventory')
AddEventHandler('LifeOS:Server:LoadInventory', function()
    local src = source
    local identifier = GetPlayerIdentifier(src, 0) -- Obtener licencia/steam

    oxmysql:execute('SELECT items FROM lifeos_inventory WHERE identifier = ?', {identifier}, function(result)
        if result[1] then
            TriggerClientEvent('LifeOS:Client:SetupInventory', src, json.decode(result[1].items))
        else
            -- Si es nuevo, crearle una entrada vacía
            oxmysql:insert('INSERT INTO lifeos_inventory (identifier) VALUES (?)', {identifier})
            TriggerClientEvent('LifeOS:Client:SetupInventory', src, {})
        end
    end)
end)

-- Guardar inventario
RegisterNetEvent('LifeOS:Server:SaveInventory')
AddEventHandler('LifeOS:Server:SaveInventory', function(items)
    local src = source
    local identifier = GetPlayerIdentifier(src, 0)
    
    oxmysql:update('UPDATE lifeos_inventory SET items = ? WHERE identifier = ?', {json.encode(items), identifier})
end)
-- Definición de costes de materiales en el servidor (Seguridad)
local CraftingCosts = {
    ['vest'] = { {item = 'metal', amount = 2}, {item = 'cloth', amount = 1} },
    ['lockpick'] = { {item = 'metal', amount = 1}, {item = 'cable', amount = 1} }
}

-- 1. Comprobar si tiene materiales
RegisterNetEvent('LifeOS_Inventory:CheckMaterials', function(data, cb)
    local src = source
    local playerItems = GetPlayerInventory(src) -- Función que lee tu DB
    local costs = CraftingCosts[data.item]
    local canCraft = true

    for _, cost in pairs(costs) do
        if not HasItem(src, cost.item, cost.amount) then
            canCraft = false
            break
        end
    end
    cb(canCraft)
end)

-- 2. Quitar materiales y entregar producto
RegisterNetEvent('LifeOS_Inventory:GiveCraftedItem', function(data)
    local src = source
    local costs = CraftingCosts[data.item]

    -- Quitamos los materiales de la DB
    for _, cost in pairs(costs) do
        RemoveItem(src, cost.item, cost.amount)
    end

    -- Entregamos el producto final
    AddItem(src, data.item, 1)
    TriggerClientEvent('LifeOS_Inventory:Notification', src, "Has fabricado un objeto", "success")
end)
