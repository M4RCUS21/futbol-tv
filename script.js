document.addEventListener('DOMContentLoaded', () => {

    // 1. SALTARNOS EL LOGIN (Tus colegas entran directo)
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-content').classList.remove('hidden');

    // 2. CONECTAR CON TU ARCHIVO DE GITHUB
    // Asegúrate de que este es tu usuario y repo correcto
    const URL_LISTA = 'https://raw.githubusercontent.com/M4RCUS21/futbol-tv/main/lista.m3u';
    
    const container = document.getElementById('partidos-container');
    const playerSection = document.getElementById('reproductor-seccion');
    const titleDisplay = document.getElementById('titulo-partido-actual');
    
    // Iniciamos el reproductor
    var player = videojs('mi-reproductor');

    // 3. LEER EL ENLACE QUE PEGASTE
    fetch(URL_LISTA)
        .then(response => response.text())
        .then(texto => {
            // Buscamos la línea que empieza por http (el enlace m3u8)
            const lineas = texto.split('\n');
            let enlaceEncontrado = "";
            
            for (let linea of lineas) {
                if (linea.startsWith('http')) {
                    enlaceEncontrado = linea.trim();
                    break;
                }
            }

            if (enlaceEncontrado) {
                crearTarjetaPartido("PARTIDAZO EN DIRECTO", enlaceEncontrado);
            } else {
                container.innerHTML = "<h3 style='color:white'>NO HAY PARTIDO AHORA MISMO</h3>";
            }
        })
        .catch(error => {
            console.error("Error cargando lista:", error);
            container.innerHTML = "<h3 style='color:red'>ERROR CARGANDO CANAL</h3>";
        });

    // Función para pintar el botón del partido
    function crearTarjetaPartido(titulo, url) {
        const div = document.createElement('div');
        div.className = 'partido-item';
        div.innerHTML = `
            <div style="background:red; color:white; padding:5px; font-weight:bold; display:inline-block; margin-bottom:5px; border-radius:3px; font-size: 0.8rem;">EN VIVO</div>
            <h3 style="margin: 10px 0;">${titulo}</h3>
            <p style="color:#aaa; font-size: 0.9rem;">Pulsa para ver</p>
        `;

        // Al hacer click, ponemos el vídeo
        div.addEventListener('click', () => {
            playerSection.classList.remove('hidden');
            titleDisplay.textContent = titulo;
            player.src({
                src: url,
                type: 'application/x-mpegURL'
            });
            player.play();
            playerSection.scrollIntoView({ behavior: 'smooth' });
        });

        container.appendChild(div);
    }

    // Botón cerrar
    document.getElementById('cerrar-reproductor').addEventListener('click', () => {
        player.pause();
        playerSection.classList.add('hidden');
    });
});