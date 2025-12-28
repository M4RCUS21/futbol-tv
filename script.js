document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN ---
    const CONTRASEÑA_MAESTRA = "futbol"; // La contraseña para tus colegas
    // CAMBIA ESTO SI TU REPO SE LLAMA DISTINTO
    const URL_GITHUB = 'https://raw.githubusercontent.com/M4RCUS21/futbol-tv/main/lista.m3u';

    // Elementos
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const loginForm = document.getElementById('login-form');
    const errorMsg = document.getElementById('login-error');
    
    // Reproductor
    var player = videojs('mi-reproductor');
    const sectionPlayer = document.getElementById('reproductor-seccion');
    const containerPartidos = document.getElementById('partidos-container');

    // 1. LOGIN SIMULADO (Sin errores de Firebase)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('input-password').value;
        const email = document.getElementById('input-email').value;

        if(pass === CONTRASEÑA_MAESTRA) {
            loginScreen.style.display = 'none';
            appContent.style.display = 'block';
            document.getElementById('user-name').innerText = email.split('@')[0].toUpperCase();
            cargarCanalDeGitHub();
        } else {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "Contraseña incorrecta. Pista: deporte rey";
        }
    });

    document.getElementById('btn-logout').addEventListener('click', () => location.reload());

    // 2. LEER TU LISTA DE GITHUB
    function cargarCanalDeGitHub() {
        fetch(URL_GITHUB)
            .then(res => res.text())
            .then(texto => {
                const lineas = texto.split('\n');
                let urlEncontrada = "";
                
                // Buscamos la primera línea que sea un enlace http
                for(let linea of lineas) {
                    if(linea.trim().startsWith('http')) {
                        urlEncontrada = linea.trim();
                        break;
                    }
                }

                containerPartidos.innerHTML = ""; // Limpiar texto de carga

                if(urlEncontrada) {
                    crearBotonPartido("PARTIDAZO EN VIVO", urlEncontrada);
                } else {
                    containerPartidos.innerHTML = "<h3 style='color:white'>NO HAY SEÑAL ACTIVADA</h3>";
                }
            })
            .catch(err => {
                console.error(err);
                containerPartidos.innerHTML = "<h3 style='color:red'>ERROR LEYENDO GITHUB</h3>";
            });
    }

    // 3. PINTAR EL BOTÓN Y ACTIVAR EL PROXY
    function crearBotonPartido(titulo, urlOriginal) {
        const div = document.createElement('div');
        div.className = 'partido-item'; 
        // Estilos inline para asegurar que se vea bien
        div.style.background = "#222";
        div.style.padding = "20px";
        div.style.borderRadius = "10px";
        div.style.cursor = "pointer";
        div.style.border = "1px solid #444";
        div.style.marginTop = "20px";
        div.style.textAlign = "center";

        div.innerHTML = `
            <div style="background:red; color:white; padding:5px 10px; font-weight:bold; display:inline-block; border-radius:5px; margin-bottom:10px;">EN DIRECTO</div>
            <h3 style="color:white; margin:0; font-size:1.5rem;">${titulo}</h3>
            <p style="color:#aaa;">Toca para ver la señal</p>
        `;

        div.addEventListener('click', () => {
            sectionPlayer.style.display = 'block';
            
            // --- AQUÍ ESTÁ LA SOLUCIÓN AL ERROR ROJO ---
            // Usamos un proxy para que el servidor no nos bloquee
            const urlConProxy = "https://corsproxy.io/?" + encodeURIComponent(urlOriginal);
            
            console.log("Cargando vía Proxy:", urlConProxy);

            player.src({
                src: urlConProxy,
                type: 'application/x-mpegURL'
            });
            player.play();
            
            // Desplazar pantalla al video
            sectionPlayer.scrollIntoView({ behavior: 'smooth' });
        });

        containerPartidos.appendChild(div);
    }

    // Cerrar video
    document.getElementById('cerrar-reproductor').addEventListener('click', () => {
        player.pause();
        sectionPlayer.style.display = 'none';
    });
});
