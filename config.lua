Config = {}

-- Configuración General
Config.MaxWeight = 50.0 -- Peso máximo de la mochila
Config.OpenKey = 289 -- Tecla F2 por defecto

-- Ubicaciones de Mesas de Crafteo / Reparación
Config.CraftingStations = {
    {coords = vector3(450.0, -1000.0, 28.0), label = "Mesa de Trabajo Mecánico"},
}

-- Definición de Items y Durabilidad inicial
Config.Items = {
    ["ganzua"] = {label = "Ganzúa Pro", weight = 0.5, durability = 100},
    ["pistol"] = {label = "Pistola .45", weight = 2.0, durability = 100},
    ["bread"] = {label = "Pan", weight = 0.1, durability = 100},
}

-- Recetas de Reparación
Config.RepairCosts = {
    ["metal"] = 2,
    ["tools"] = 1
}
