window.addEventListener("DOMContentLoaded", () => {

    //Selectores:
    const containerAvatar = document.querySelector(".container__avatar");
    const loading = document.querySelector(".loading");
    const selectCategory = document.querySelector(".category");
    const button = document.querySelector(".button");

    loading.style.display = "none";

    //Funcion para genIa:
    const genIa = async() => {

        const category = selectCategory.value;

        loading.style.display = "block";

        try{

            const response = await fetch("http://localhost:3126/api/gen-img", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    category
                })
            });

            const data = await response.json();

            if(data && data.image){
                containerAvatar.innerHTML = `<img src="${data.image}"/>`;
            }else{
                alert("No se genero la imagen.");
            }

        }catch(exception){
            console.log(exception, "Error. No se genero la imagen.");
        }finally{
            loading.style.display = "none";
        }

    }

    button.addEventListener("click", genIa);

});