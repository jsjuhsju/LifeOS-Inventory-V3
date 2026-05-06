Config = {}
Config.MaxWeight = 50.0

-- Definiciones maestras por categoría (ahorra miles de líneas)
Config.ItemTemplates = {
    ['weapon_'] = { weight = 2.5, canRepair = true, decay = 0.01 },
    ['food_'] = { weight = 0.2, canRepair = false, decay = 0.05 },
    ['water_'] = { weight = 0.5, canRepair = false, decay = 0.0 },
}

-- Función para obtener datos de cualquier ítem aunque no esté en la lista
function GetItemData(name)
    if Config.Items[name] then return Config.Items[name] end
    
    -- Si el nombre empieza por weapon_, aplica plantilla de armas
    for prefix, data in pairs(Config.ItemTemplates) do
        if string.find(name, prefix) then
            return data
        end
    end
    
    -- Ítem genérico si no existe
    return { label = name:gsub("_", " "):upper(), weight = 0.1, durability = 100 }
end

Config.Items = {
    -- Aquí solo metes los "especiales", el resto se autogenera
    ['bread'] = { label = 'Pan', weight = 0.1, decay = 0.1 },
}
