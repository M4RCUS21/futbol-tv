document.addEventListener('DOMContentLoaded', () => {

    // --- DATOS IMPORTANTES ---
    const CONTRASEÑA_ACCESO = "futbol"; // Puedes cambiarla
    // Tu enlace de GitHub donde guardas el m3u8
    const URL_LISTA = 'https://raw.githubusercontent.com/M4RCUS21/futbol-tv/main/lista.m3u';

    // Elementos del DOM
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error');
    
    // Reproductor
    var player = videojs('mi-reproductor');
    const sectionPlayer = document.getElementById('reproductor-seccion');
    const containerPartidos = document.getElementById('partidos-container');

    // 1. GESTIÓN DEL LOGIN (Sin Firebase)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('input-password').value;
        
        if(pass === CONTRASEÑA_ACCESO) {
            loginScreen.style.display = 'none';
            appContent.style.display = 'block'; // Mostrar la app
            cargarCanales(); // Cargar la lista
        } else {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "Contraseña incorrecta";
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => location.reload());

    // 2. CARGAR EL ENLACE DESDE GITHUB
    function cargarCanales() {
        fetch(URL_LISTA)
            .then(res => res.text())
            .then(texto => {
                const lineas = texto.split('\n');
                let urlM3U8 = "";
                
                // Buscamos la primera línea que sea un enlace
                for(let linea of lineas) {
                    if(linea.trim().startsWith('http')) {
                        urlM3U8 = linea.trim();
                        break;
                    }
                }

                containerPartidos.innerHTML = ""; // Limpiar mensaje de carga

                if(urlM3U8) {
                    crearBotonPartido("PARTIDAZO EN VIVO", urlM3U8);
                } else {
                    containerPartidos.innerHTML = "<h3 style='color:white'>NO HAY SEÑAL ACTIVADA</h3>";
                }
            })
            .catch(err => console.error("Error cargando lista", err));
    }

    // 3. PINTAR EL BOTÓN Y PONER EL VÍDEO CON PROXY
    function crearBotonPartido(titulo, urlOriginal) {
        const div = document.createElement('div');
        div.className = 'partido-item'; // Usa tus estilos.css
        // Estilo rápido por si acaso
        div.style.background = "#222";
        div.style.padding = "20px";
        div.style.borderRadius = "8px";
        div.style.cursor = "pointer";
        div.style.border = "1px solid #444";
        div.innerHTML = `<h3 style="color:white; margin:0">📺 ${titulo} <span style="color:red; font-size:0.8em">LIVE</span></h3>`;

        div.addEventListener('click', () => {
            sectionPlayer.style.display = 'block';
            
            // --- EL TRUCO DEL PROXY PARA SALTAR EL ERROR 403 ---
            // Usamos corsproxy.io para que haga de intermediario
            const urlConProxy = "https://corsproxy.io/?" + encodeURIComponent(urlOriginal);
            
            console.log("Intentando cargar con proxy:", urlConProxy);

            player.src({
                src: urlConProxy,
                type: 'application/x-mpegURL'
            });
            player.play();
        });

        containerPartidos.appendChild(div);
    }

    // Cerrar video
    document.getElementById('cerrar-reproductor').addEventListener('click', () => {
        player.pause();
        sectionPlayer.style.display = 'none';
    });
});
