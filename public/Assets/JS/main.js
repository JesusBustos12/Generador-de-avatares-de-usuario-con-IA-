window.addEventListener("DOMContentLoaded", () => {

    // Selección de los elementos principales del DOM
    const containerAvatar = document.querySelector(".container__avatar");
    const loading = document.querySelector(".loading");
    const selectCategory = document.querySelector(".category");
    const button = document.querySelector(".button");

    // Ocultar el mensaje “Cargando...” al cargar la página
    loading.style.display = "none";


    const genIa = async () => {

        // Recuperar cuántas imágenes ha generado este navegador
        let genCount = parseInt(localStorage.getItem('avatarGenCount') || '0');

        // Límite de 4 generaciones gratuitas por usuario (protege la clave de OpenAI)
        if (genCount >= 4) {
            loading.style.display = "none";
            alert("Has alcanzado el límite de 4 avatares gratis. Gracias por probar la demo!");
            return;
        }

        // Limpiar imagen anterior y mostrar “Cargando…” apenas se pulsa el botón
        containerAvatar.innerHTML = `<span class="loading">Cargando...</span>`;
        loading.style.display = "block";

        // Tomar la categoría seleccionada por el usuario
        const category = selectCategory.value;

        try {
            // Petición al backend usando ruta relativa (funciona local y en producción)
            const response = await fetch("/api/gen-img", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    category
                })
            });

            const data = await response.json();

            // Si llega la URL de la imagen, se inserta en el contenedor
            if (data && data.image) {
                containerAvatar.innerHTML = `<img src="${data.image}"/>`;

                // Incrementar contador y guardar en localStorage
                genCount++;
                localStorage.setItem('avatarGenCount', genCount);

            } else {
                // Mostrar mensaje de error dentro del círculo para mantener consistencia visual
                containerAvatar.innerHTML = `<span class="loading">Error al generar</span>`;
                alert(data.error || data.exception || "No se generó la imagen.");
            }

        } catch (exception) {
            // Manejo de errores de red o servidor
            console.log(exception);
            containerAvatar.innerHTML = `<span class="loading">Error de conexión</span>`;
            alert("Error de conexión. Intenta de nuevo.");
        } finally {
            // Siempre ocultar el loading una vez terminada la operación
            loading.style.display = "none";
        }
    }

    // Asignar la función al botón de generar
    button.addEventListener("click", genIa);

});