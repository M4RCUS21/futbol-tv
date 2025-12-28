document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURACIÓN FIREBASE ---
    const firebaseConfig = {
        apiKey: "AIzaSyDRGE_eUKxM4q_nw_xFyWVLXanEhbyKHa8",
        authDomain: "mideportetv-bf999.firebaseapp.com",
        projectId: "mideportetv-bf999",
        storageBucket: "mideportetv-bf999.firebasestorage.app",
        messagingSenderId: "779230841308",
        appId: "1:779230841308:web:4583c61e8c0abf9c9fe719"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- 2. ELEMENTOS DE LA PANTALLA ---
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app-content');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const btnLogout = document.getElementById('btn-logout');
    
    // Elementos de la App
    const container = document.getElementById('partidos-container');
    const playerSection = document.getElementById('reproductor-seccion');
    const titleDisplay = document.getElementById('titulo-partido-actual');
    
    // Inicializar reproductor (solo si existe)
    let player;
    if (document.getElementById('mi-reproductor')) {
        player = videojs('mi-reproductor', { fluid: true });
    }

    // --- 3. GESTIÓN DEL LOGIN ---
    
    // Escuchar si el usuario está logueado o no
    auth.onAuthStateChanged(user => {
        if (user) {
            // USUARIO LOGUEADO: Mostrar App, ocultar Login
            console.log("Usuario conectado:", user.email);
            loginScreen.classList.add('hidden');
            appContent.classList.remove('hidden');
            cargarCanales(); // Cargar la lista de canales
        } else {
            // NO LOGUEADO: Mostrar Login, ocultar App
            loginScreen.classList.remove('hidden');
            appContent.classList.add('hidden');
        }
    });

    // Botón de Login (Entrar)
    if(loginForm){
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('input-email').value;
            const pass = document.getElementById('input-password').value;

            auth.signInWithEmailAndPassword(email, pass)
                .catch(error => {
                    console.error("Error:", error);
                    loginError.style.display = 'block';
                    loginError.textContent = "Error: Usuario o contraseña incorrectos";
                });
        });
    }

    // Botón de Logout (Salir)
    if(btnLogout){
        btnLogout.addEventListener('click', () => {
            auth.signOut();
            if(player) player.pause(); // Parar vídeo al salir
        });
    }

    // --- 4. FUNCIONES DE CANALES (BASE DE DATOS) ---

    function cargarCanales() {
        // Escuchar la base de datos en tiempo real
        db.collection("partidos").onSnapshot((snapshot) => {
            if(container) container.innerHTML = ''; // Limpiar lista anterior
            
            if (snapshot.empty) {
                if(container) container.innerHTML = '<p style="text-align:center; padding:20px;">No hay emisiones activas.</p>';
            } else {
                snapshot.forEach((doc) => {
                    agregarTarjeta(doc.data());
                });
            }
        });
    }

    function agregarTarjeta(data) {
        const div = document.createElement('div');
        div.className = 'partido-item';
        // Diseño de la tarjeta del canal
        div.innerHTML = `
            <div style="background:red; color:white; padding:5px; font-weight:bold; display:inline-block; margin-bottom:5px; border-radius:3px; font-size: 0.8rem;">EN VIVO</div>
            <h3 style="margin: 10px 0;">${data.titulo}</h3>
            <p style="color:#aaa; font-size: 0.9rem;">Click para ver</p>
        `;

        div.addEventListener('click', () => {
            // Al hacer click, abrir reproductor
            if(playerSection) playerSection.classList.remove('hidden');
            if(titleDisplay) titleDisplay.textContent = data.titulo;
            
            if(player) {
                player.src({ src: data.enlace, type: 'application/x-mpegURL' });
                player.play();
            }
            // Bajar suavemente hasta el video
            playerSection.scrollIntoView({ behavior: 'smooth' });
        });

        if(container) container.appendChild(div);
    }

    // Botón cerrar reproductor
    const cerrarVideoBtn = document.getElementById('cerrar-reproductor');
    if(cerrarVideoBtn){
        cerrarVideoBtn.addEventListener('click', () => {
            if(player) player.pause();
            if(playerSection) playerSection.classList.add('hidden');
        });
    }
});