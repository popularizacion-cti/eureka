// Lógica que solo funciona en la página de inicio
const botonInicio = document.getElementById("boton-inicio");

if (botonInicio) {
    botonInicio.addEventListener("click", () => {
        alert("¡Hola! Estás en la página principal. Este script es independiente.");
    });
}