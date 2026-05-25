// Lógica para iluminar la pestaña activa en el menú
document.addEventListener("DOMContentLoaded", function() {
    // Detectamos en qué página estamos
    const rutaActual = window.location.pathname;
    const archivoActual = rutaActual.split("/").pop();

    const enlaces = document.querySelectorAll("nav a");

    enlaces.forEach(enlace => {
        const href = enlace.getAttribute("href");
        
        // Si es el index o si coincide exactamente con el archivo actual
        if (href === archivoActual || (archivoActual === "" && href === "index.html")) {
            enlace.classList.add("activo");
        }
    });
});