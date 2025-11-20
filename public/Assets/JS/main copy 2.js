window.addEventListener("DOMContentLoaded", () => {

    //Selectores:
    const containerAvatar = document.querySelector(".container__avatar");
    const loading = document.querySelector(".loading");
    const selectCategory = document.querySelector(".category");
    const button = document.querySelector(".button");

    loading.style.display = "none";

    //Funcion para genIa:
    const genIa = async () => {

        let genCount = parseInt(localStorage.getItem('avatarGenCount') || '0');

        if (genCount >= 4) {
            loading.style.display = "none";
            alert("Has alcanzado el límite de 4 avatares gratis. ¡Gracias por probar la demo! 😊");
            return;
            return;
        }

        const category = selectCategory.value;

        loading.style.display = "block";

        try {

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

            if (data && data.image) {
                containerAvatar.innerHTML = `<img src="${data.image}"/>`;
                genCount++;
                localStorage.setItem('avatarGenCount', genCount);

            } else {
                alert(data.error || data.exception || "No se generó la imagen.");
            }

        } catch (exception) {
            console.log(exception);
            alert("Error de conexión. Intenta de nuevo.");
        } finally {
            loading.style.display = "none";
        }

    }

    button.addEventListener("click", genIa);

});