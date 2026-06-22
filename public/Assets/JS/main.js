window.addEventListener("DOMContentLoaded", () => {

    // Selección de los elementos principales del DOM
    const containerAvatar = document.querySelector(".container__avatar");
    const initialState = document.querySelector(".initial-state");
    const loadingOverlay = document.querySelector(".loading-overlay");
    const selectCategory = document.querySelector("#category-select");
    const button = document.querySelector("#generate-btn");
    const downloadBtn = document.querySelector("#download-btn");
    
    // UI del límite
    const limitCounterEl = document.querySelector("#limit-counter");
    const progressFill = document.querySelector("#progress-fill");

    const MAX_GENERATIONS = 5;

    // Función para actualizar la UI del límite consultando al servidor
    const updateLimitUI = async () => {
        try {
            const response = await fetch('/api/limit-status');
            if (response.ok) {
                const data = await response.json();
                const remaining = data.remaining;
                
                limitCounterEl.textContent = remaining;
                
                // Calcular porcentaje para la barra (100% = 3 restantes, 0% = 0 restantes)
                const percentage = (remaining / MAX_GENERATIONS) * 100;
                progressFill.style.width = `${percentage}%`;

                // Si se alcanzó el límite
                if (remaining === 0) {
                    button.disabled = true;
                    button.innerHTML = `
                        <span>Límite Alcanzado</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-lock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    `;
                    // Cambiar la barra a color gris
                    progressFill.style.background = "#52525b"; 
                    return true;
                }
                return false;
            }
        } catch (error) {
            console.error("Error al obtener el límite:", error);
        }
        return false;
    };

    // Función para migrar datos locales antiguos al servidor
    const migrateLocalStorage = async () => {
        const localCount = localStorage.getItem('avatarGenCount');
        if (localCount) {
            try {
                const response = await fetch('/api/migrate-local-storage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ count: localCount })
                });
                if (response.ok) {
                    localStorage.removeItem('avatarGenCount');
                    console.log('Migración de localStorage a TiDB completada.');
                }
            } catch (err) {
                console.error("Error al migrar localStorage:", err);
            }
        }
    };

    // Inicializar la UI al cargar y migrar datos locales si existen
    migrateLocalStorage().then(() => {
        updateLimitUI();
    });

    const genIa = async () => {
        // Verificar límite de nuevo por seguridad localmente visual (el backend lo verificará de todas formas)
        const isLimitReached = await updateLimitUI();
        if (isLimitReached) {
            alert("Has alcanzado el límite de avatares para este dispositivo.");
            return;
        }

        // Ocultar botón de descarga al iniciar nueva generación
        if (downloadBtn) downloadBtn.style.display = "none";

        // Mostrar loading
        loadingOverlay.style.display = "flex";
        if (initialState) initialState.style.display = "none";

        // Quitar imagen generada anterior si existe
        const oldImage = containerAvatar.querySelector('.generated');
        if (oldImage) oldImage.remove();

        const category = selectCategory.value;

        try {
            // Petición al backend
            const response = await fetch("/api/gen-img", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ category })
            });

            const data = await response.json();

            if (response.ok && data.image) {
                // Inyectar imagen
                const imgElement = document.createElement("img");
                imgElement.src = data.image;
                imgElement.className = "generated";
                imgElement.alt = `Avatar IA de ${category}`;
                containerAvatar.appendChild(imgElement);

                // Mostrar botón de descarga y asignar evento
                if (downloadBtn) {
                    downloadBtn.style.display = "flex";
                    downloadBtn.onclick = async () => {
                        try {
                            const response = await fetch(data.image);
                            const blob = await response.blob();
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = `avatar-${category}-${Date.now()}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(link.href);
                        } catch (error) {
                            console.error("Error al descargar:", error);
                            alert("Hubo un error al intentar descargar la imagen.");
                        }
                    };
                }

                // Incrementar contador local y actualizar gráfica
                await updateLimitUI();

            } else {
                // Error de Backend (ej. rate limit por IP o OpenAI error)
                alert(data.error || "No se pudo generar la imagen. Intenta más tarde.");
                if (initialState) initialState.style.display = "flex";
            }

        } catch (exception) {
            console.error(exception);
            alert("Error de conexión con el servidor.");
            if (initialState) initialState.style.display = "flex";
        } finally {
            // Ocultar loading
            loadingOverlay.style.display = "none";
        }
    }

    // Asignar evento click
    button.addEventListener("click", genIa);

});