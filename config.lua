Config = {}

-- Configuración de Interfaz
Config.Locale = 'es'
Config.InventoryKey = 289 -- Tecla F2
Config.BlurBackground = true -- Desenfoque al abrir

-- Configuración de Peso (Sistema que hicimos)
Config.MaxWeight = 50.0 
Config.WeightPenalty = true -- ¿El jugador camina lento si está lleno?

-- Sistema de Durabilidad
Config.DurabilityLossOnUse = 2.5 -- % que pierde por cada uso
Config.DurabilityLossOnDeath = 10.0 -- % que pierde si el jugador muere

-- Registro de Ítems (Asegúrate de tener estos .png en ui/images)
Config.Items = {
    ['pistol'] = { label = 'Pistola .45', weight = 2.0, canRepair = true },
    ['ganzua'] = { label = 'Ganzúa Pro', weight = 0.5, canRepair = true },
    ['bread'] = { label = 'Pan', weight = 0.1, canRepair = false },
    ['water'] = { label = 'Agua', weight = 0.2, canRepair = false },
    ['repair_kit'] = { label = 'Kit de Reparación', weight = 1.5, canRepair = false }
}

-- Ubicación de las Mesas de Crafteo/Reparación
Config.Stations = {
    { coords = vector3(450.0, -1000.0, 28.0), label = "Mesa de Mecánico" },
    { coords = vector3(-1100.0, -2700.0, 19.0), label = "Mesa del Puerto" }
}
