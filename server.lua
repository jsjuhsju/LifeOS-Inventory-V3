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
