fx_version 'cerulean'
game 'gta5'

author 'LifeOS Team'
description 'LifeOS Inventory V3 - Minimalist & Centered'
version '1.1.0'

-- Registramos el Config primero para que otros archivos lo lean
shared_scripts {
    'config.lua'
}

client_scripts {
    'client.lua'
}

server_scripts {
    'server.lua'
}

-- Archivos de la interfaz (UI)
ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/style.css',
    'ui/script.js',
    'ui/images/*.png',
    'ui/sounds/*.mp3'
}
