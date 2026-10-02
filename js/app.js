const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzOi_8e18qwcIJzEHI7Gr6f9HlCSbqZZqyZKi2wz2zCj_wTWGTF1Aa6C246zHMyeRDiBw/exec"; 
let globalData = {}; 

// --- ETAPA 1: Validar Login ---
document.getElementById('btnValidar').addEventListener('click', async () => {
    const btn = document.getElementById('btnValidar');
    const dni = document.getElementById('dniDocenteLogin').value;
    const correo = document.getElementById('correoDocenteLogin').value.trim().toLowerCase();
    const status = document.getElementById('statusStep1');
    
    if(!dni || !correo) {
        status.innerText = "Complete DNI y Correo.";
        return;
    }

    // Mejora UI: Deshabilitar botón y avisar de la demora normal
    btn.disabled = true;
    status.style.color = "var(--dark)";
    status.innerText = "Buscando en la base de datos (esto puede tardar unos segundos)...";
    
    const url = `${WEB_APP_URL}?action=validar&dni=${encodeURIComponent(dni)}&correo=${encodeURIComponent(correo)}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
            status.style.color = "red";
            status.innerText = data.error;
            btn.disabled = false; // Volver a habilitar si hay error
        } else {
            globalData = data; 
            prepararEtapa2();
            
            // 1. Mostrar la Etapa 2 primero
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            
            // 2. Ajustar el tamaño del cuadro DESPUÉS de que sea visible en pantalla
            setTimeout(() => {
                const txtProyecto = document.getElementById('nombreProyecto');
                txtProyecto.style.height = 'auto'; 
                txtProyecto.style.height = (txtProyecto.scrollHeight) + 'px';
            }, 50);

            btn.disabled = false; 
        }
    } catch (e) {
        status.style.color = "red";
        status.innerText = "Error de conexión. Asegúrate de tener conexión a internet.";
        btn.disabled = false;
    }
});


// --- ETAPA 2: Lógica de visualización ---
function prepararEtapa2() {
    // Aplicamos .toUpperCase() para que siempre se vean en MAYÚSCULAS
    document.getElementById('lblArea').innerText = (globalData.Area || "").toUpperCase();
    document.getElementById('lblRegion').innerText = (globalData.Region || "").toUpperCase();
    document.getElementById('lblColegio').innerText = (globalData.Colegio || "").toUpperCase();
    
    // Asignamos el valor en mayúsculas, el tamaño se ajusta en el evento del botón
    document.getElementById('nombreProyecto').value = (globalData.Proyecto || "").toUpperCase();
    
    // Los demás campos quedan igual
    document.getElementById('Nombre_E1').value = globalData.Nombre_E1 || "";
    document.getElementById('DNI_E1').value = globalData.DNI_E1 || "";
    document.getElementById('Grado_E1').value = globalData.Grado_E1 || globalData["Grado E1"] || ""; 
    
    document.getElementById('Nombre_E2').value = globalData.Nombre_E2 || "";
    document.getElementById('DNI_E2').value = globalData.DNI_E2 || "";
    document.getElementById('Grado_E2').value = globalData.Grado_E2 || globalData["Grado E2"] || "";
    
    document.getElementById('Nombre_Docente').value = globalData.Nombre_Docente || "";
    document.getElementById('Telefono_Docente').value = globalData.Telefono_Docente || "";
    document.getElementById('Correo_Docente').value = globalData.Correo_Docente || ""; 

    const docDocente = globalData.DNI_Docente || "";
    document.getElementById('Doc_Docente_View').value = docDocente;
    
    if (docDocente.toString().trim().length === 8) {
        document.getElementById('lblDocumentoDocente').innerText = "DNI:";
    } else {
        document.getElementById('lblDocumentoDocente').innerText = "Carnet de Extranjería:";
    }
}

// --- Botones de Navegación ---
document.getElementById('btnRegresar1').addEventListener('click', () => {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    document.getElementById('statusStep1').innerText = ""; 
});

document.getElementById('btnSiguienteEtapa2').addEventListener('click', () => {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    prepararEtapa3();
});

document.getElementById('btnRegresar2').addEventListener('click', () => {
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step2').classList.add('active');
});


// --- ETAPA 3: Lógica y Envío ---
function prepararEtapa3() {
    if (globalData.Transporte === "AEREO") {
        document.getElementById('seccionAereo').classList.remove('hidden');
        document.getElementById('seccionTerrestre').classList.add('hidden');
    } else {
        document.getElementById('seccionTerrestre').classList.remove('hidden');
        document.getElementById('seccionAereo').classList.add('hidden');
    }

    if(globalData.isEdited) {
        document.getElementById('ciudadOrigen').value = globalData.Ciudad_Origen || "";
        document.getElementById('costo').value = globalData.Costo || "";
        document.getElementById('poseeFactura').value = globalData.Factura || "";
        document.getElementById('tiempoViaje').value = globalData.Tiempo_Viaje || "";
        
        if (globalData.Transporte === "AEREO") {
            document.getElementById('aeropuerto').value = globalData.Aeropuerto || "";
            document.getElementById('rutaAereo').value = globalData.Ruta || "";
        } else {
            document.getElementById('rutaTerrestre').value = globalData.Ruta || "";
        }
    }
}

document.getElementById('btnFinalizar').addEventListener('click', async () => {
    const btn = document.getElementById('btnFinalizar');
    const status = document.getElementById('statusFinal');
    
    btn.disabled = true;
    status.style.color = "var(--dark)";
    status.innerText = "Enviando información, por favor espere...";
    
    globalData.Ciudad_Origen = document.getElementById('ciudadOrigen').value;
    globalData.Costo = document.getElementById('costo').value;
    globalData.Factura = document.getElementById('poseeFactura').value;
    globalData.Tiempo_Viaje = document.getElementById('tiempoViaje').value;

    if (globalData.Transporte === "AEREO") {
        globalData.Aeropuerto = document.getElementById('aeropuerto').value;
        globalData.Ruta = document.getElementById('rutaAereo').value;
    } else {
        globalData.Ruta = document.getElementById('rutaTerrestre').value;
    }

    try {
        await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: {'Content-Type': 'text/plain;charset=utf-8'},
            body: JSON.stringify(globalData)
        });
        
        document.getElementById('step3').classList.remove('active');
        document.getElementById('step4').classList.add('active');
        
    } catch(e) {
        status.style.color = "red";
        status.innerText = "Hubo un error al enviar. Por favor intente de nuevo.";
        btn.disabled = false;
    }
});
