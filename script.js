document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN ---
    const PASS_MAESTRA = "futbol"; // La contraseña para entrar
    const URL_GITHUB = 'https://raw.githubusercontent.com/M4RCUS21/futbol-tv/main/lista.m3u';

    // ELEMENTOS
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const userNameDisplay = document.getElementById('user-name');
    const btnLogout = document.getElementById('btn-logout');
    
    // REPRODUCTOR
    var player = videojs('mi-reproductor');
    const playerSection = document.getElementById('reproductor-seccion');
    const container = document.getElementById('partidos-container');

    // 1. LÓGICA DE LOGIN (Sin Firebase, más fácil)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('input-password').value;
        const email = document.getElementById('input-email').value;

        if (pass === PASS_MAESTRA) {
            // Login correcto
            loginScreen.style.display = 'none';
            appContent.classList.remove('hidden');
            userNameDisplay.innerText = email.split('@')[0].toUpperCase();
            cargarPartidosDesdeGitHub();
        } else {
            // Login incorrecto
            loginError.style.display = 'block';
            loginError.innerText = "Contraseña incorrecta. Prueba 'futbol'";
        }
    });

    // 2. LOGOUT
    btnLogout.addEventListener('click', () => {
        location.reload(); // Recarga la página para volver al login
    });

    // 3. CARGAR LISTA DE GITHUB
    function cargarPartidosDesdeGitHub() {
        container.innerHTML = '<p style="color:yellow">Buscando señal en GitHub...</p>';
        
        fetch(URL_GITHUB)
            .then(res => res.text())
            .then(texto => {
                container.innerHTML = ''; // Limpiar mensaje de carga
                
                // Buscar enlace http o https
                const lineas = texto.split('\n');
                let urlEncontrada = "";
                
                for(let linea of lineas){
                    if(linea.trim().startsWith('http')){
                        urlEncontrada = linea.trim();
                        break;
                    }
                }

                if(urlEncontrada){
                    crearTarjeta("PARTIDAZO EN VIVO", urlEncontrada);
                } else {
                    container.innerHTML = '<h3 style="color:white">NO HAY SEÑAL ACTIVADA</h3><p style="color:#777">Sube un enlace a lista.m3u en GitHub</p>';
                }
            })
            .catch(err => {
                container.innerHTML = '<h3 style="color:red">ERROR DE CONEXIÓN</h3>';
                console.error(err);
            });
    }

    // 4. CREAR TARJETA DE PARTIDO
    function crearTarjeta(titulo, urlOriginal) {
        const div = document.createElement('div');
        div.className = 'partido-item'; // Usa tus estilos.css
        // Si no tienes estilo para .partido-item, añadimos uno básico inline
        div.style.background = "#1f1f1f";
        div.style.padding = "20px";
        div.style.margin = "10px 0";
        div.style.borderRadius = "8px";
        div.style.cursor = "pointer";
        div.style.border = "1px solid #333";

        div.innerHTML = `
            <div style="background:red; color:white; padding:4px 8px; font-weight:bold; display:inline-block; border-radius:4px; font-size:0.8rem;">LIVE</div>
            <h3 style="margin:10px 0; color:white;">${titulo}</h3>
            <p style="color:#aaa; font-size:0.9rem;">Pulsa para conectar</p>
        `;

        div.addEventListener('click', () => {
            playerSection.classList.remove('hidden');
            document.getElementById('titulo-partido-actual').innerText = titulo;

            // USAMOS EL PROXY PARA EVITAR EL BLOQUEO
            const urlConProxy = "https://corsproxy.io/?" + encodeURIComponent(urlOriginal);
            
            console.log("Cargando:", urlConProxy);
            
            player.src({
                src: urlConProxy,
                type: 'application/x-mpegURL'
            });
            player.play();
            
            playerSection.scrollIntoView({behavior: 'smooth'});
        });

        container.appendChild(div);
    }

    // 5. CERRAR REPRODUCTOR
    document.getElementById('cerrar-reproductor').addEventListener('click', () => {
        player.pause();
        playerSection.classList.add('hidden');
    });

});