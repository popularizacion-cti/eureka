const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzOi_8e18qwcIJzEHI7Gr6f9HlCSbqZZqyZKi2wz2zCj_wTWGTF1Aa6C246zHMyeRDiBw/exec"; 
let globalData = {}; 

// --- ETAPA 1: Validar Login por DNI / Carnet de Extranjería ---
document.getElementById('btnValidar').addEventListener('click', async () => {
    const btn = document.getElementById('btnValidar');
    const dni = document.getElementById('dniDocenteLogin').value.trim();
    const status = document.getElementById('statusStep1');
    
    if (!dni) {
        status.innerText = "Ingrese su número de documento.";
        return;
    }

    btn.disabled = true;
    status.style.color = "var(--dark)";
    status.innerText = "Buscando en la base de datos (esto puede tardar unos segundos)...";
    
    const url = `${WEB_APP_URL}?action=validar&dni=${encodeURIComponent(dni)}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.error) {
            status.style.color = "red";
            status.innerText = data.error;
            btn.disabled = false;
        } else {
            globalData = data; 
            prepararEtapa2();
            
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');

            btn.disabled = false; 
        }
    } catch (e) {
        status.style.color = "red";
        status.innerText = "Error de conexión. Asegúrese de tener conexión a internet.";
        btn.disabled = false;
    }
});


// --- ETAPA 2: Lógica de visualización y validación ---
function prepararEtapa2() {
    // Primera parte: Información del Proyecto e Institución
    document.getElementById('lblArea').innerText = (globalData.Area || "").toUpperCase();
    document.getElementById('lblRegion').innerText = (globalData.Region || "").toUpperCase();
    document.getElementById('lblUgel').innerText = (globalData.UGEL || "").toUpperCase();
    document.getElementById('lblDistrito').innerText = (globalData.Distrito || "").toUpperCase();
    document.getElementById('lblColegio').innerText = (globalData.Colegio || "").toUpperCase();
    document.getElementById('lblProyecto').innerText = (globalData.Proyecto || "").toUpperCase();
    
    // Estudiante 1
    document.getElementById('Nombre_E1').value = globalData.Nombre_E1 || "";
    document.getElementById('DNI_E1').value = globalData.DNI_E1 || "";
    document.getElementById('Fecha_Nacimiento_E1').value = formatearFecha(globalData.Fecha_Nacimiento_E1);
    document.getElementById('Sexo_E1').value = globalData.Sexo_E1 || "";

    // Estudiante 2
    document.getElementById('Nombre_E2').value = globalData.Nombre_E2 || "";
    document.getElementById('DNI_E2').value = globalData.DNI_E2 || "";
    document.getElementById('Fecha_Nacimiento_E2').value = formatearFecha(globalData.Fecha_Nacimiento_E2);
    document.getElementById('Sexo_E2').value = globalData.Sexo_E2 || "";

    // Docente Asesor
    document.getElementById('Nombre_Docente').value = globalData.Nombre_Docente || "";
    document.getElementById('Tipo_Documento_Docente').value = globalData.Tipo_Documento_Docente || "";
    document.getElementById('Numero_Documento_Docente').value = globalData.Numero_Documento_Docente || globalData.DNI_Docente || "";
    document.getElementById('Telefono_Docente').value = globalData.Telefono_Docente || "";
    document.getElementById('Correo_Docente').value = globalData.Correo_Docente || ""; 

    // Cargar o restaurar campos a completar del Docente
    document.getElementById('Fecha_Nacimiento_Docente').value = globalData.Fecha_Nacimiento_Docente || "";
    document.getElementById('Sexo_Docente').value = globalData.Sexo_Docente || "";

    validarCamposDocenteEtapa2();
}

// Escuchar cambios en los campos obligatorios del docente
const inputFechaNac = document.getElementById('Fecha_Nacimiento_Docente');
const selectSexoDoc = document.getElementById('Sexo_Docente');

inputFechaNac.addEventListener('change', validarCamposDocenteEtapa2);
selectSexoDoc.addEventListener('change', validarCamposDocenteEtapa2);

function validarCamposDocenteEtapa2() {
    const fecha = inputFechaNac.value;
    const sexo = selectSexoDoc.value;
    const btnContinuar = document.getElementById('btnSiguienteEtapa2');

    if (fecha !== "" && sexo !== "") {
        btnContinuar.disabled = false;
    } else {
        btnContinuar.disabled = true;
    }
}

// --- Botones de Navegación ---
document.getElementById('btnRegresar1').addEventListener('click', () => {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    document.getElementById('statusStep1').innerText = ""; 
});

document.getElementById('btnSiguienteEtapa2').addEventListener('click', () => {
    // Guardar los datos ingresados del docente formateando la fecha a DD/MM/AAAA
    globalData.Fecha_Nacimiento_Docente = formatearFechaGuardado(inputFechaNac.value);
    globalData.Sexo_Docente = selectSexoDoc.value;

    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');
    prepararEtapa3();
});

document.getElementById('btnRegresar2').addEventListener('click', () => {
    document.getElementById('step3').classList.remove('active');
    document.getElementById('step2').classList.add('active');
});


// --- ETAPA 3: Lógica, Validación y Envío ---
function prepararEtapa3() {
    if (globalData.Transporte === "AEREO") {
        document.getElementById('seccionAereo').classList.remove('hidden');
        document.getElementById('seccionTerrestre').classList.add('hidden');
    } else {
        document.getElementById('seccionTerrestre').classList.remove('hidden');
        document.getElementById('seccionAereo').classList.add('hidden');
    }

    if (globalData.isEdited) {
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

    // Comprobar la validación al cargar la vista
    validarCamposEtapa3();
}

// Elementos de la Etapa 3 para escuchar eventos
const camposEtapa3 = [
    'ciudadOrigen', 'costo', 'poseeFactura', 'tiempoViaje',
    'aeropuerto', 'rutaAereo', 'rutaTerrestre'
];

camposEtapa3.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', validarCamposEtapa3);
        el.addEventListener('change', validarCamposEtapa3);
    }
});

function validarCamposEtapa3() {
    const ciudad = document.getElementById('ciudadOrigen').value.trim();
    const costo = document.getElementById('costo').value.trim();
    const factura = document.getElementById('poseeFactura').value;
    const tiempo = document.getElementById('tiempoViaje').value.trim();

    let transporteValido = false;

    if (globalData.Transporte === "AEREO") {
        const aeropuerto = document.getElementById('aeropuerto').value.trim();
        const rutaAereo = document.getElementById('rutaAereo').value.trim();
        transporteValido = (aeropuerto !== "" && rutaAereo !== "");
    } else {
        const rutaTerrestre = document.getElementById('rutaTerrestre').value.trim();
        transporteValido = (rutaTerrestre !== "");
    }

    const todosLlenos = ciudad !== "" && costo !== "" && factura !== "" && tiempo !== "" && transporteValido;
    document.getElementById('btnFinalizar').disabled = !todosLlenos;
}

document.getElementById('btnFinalizar').addEventListener('click', async () => {
    const btn = document.getElementById('btnFinalizar');
    const status = document.getElementById('statusFinal');
    
    btn.disabled = true;
    status.style.color = "var(--dark)";
    status.innerText = "Enviando información, por favor espere...";
    
    globalData.Ciudad_Origen = document.getElementById('ciudadOrigen').value.trim();
    globalData.Costo = document.getElementById('costo').value.trim();
    globalData.Factura = document.getElementById('poseeFactura').value;
    globalData.Tiempo_Viaje = document.getElementById('tiempoViaje').value.trim();

    if (globalData.Transporte === "AEREO") {
        globalData.Aeropuerto = document.getElementById('aeropuerto').value.trim();
        globalData.Ruta = document.getElementById('rutaAereo').value.trim();
    } else {
        globalData.Aeropuerto = "";
        globalData.Ruta = document.getElementById('rutaTerrestre').value.trim();
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

function formatearFecha(fechaStr) {
    if (!fechaStr) return "";
    
    // Convertir a string por si viene como otro tipo
    const str = String(fechaStr).trim();
    
    // Si contiene la 'T' de ISO (ej: 2011-08-25T05:00:00.000Z)
    if (str.includes('T')) {
        const partesFecha = str.split('T')[0].split('-'); // ["2011", "08", "25"]
        if (partesFecha.length === 3) {
            const anio = partesFecha[0];
            const mes = partesFecha[1];
            const dia = partesFecha[2];
            return `${dia}-${mes}-${anio}`;
        }
    }
    
    // Si viene en formato AAAA-MM-DD
    if (str.includes('-')) {
        const partes = str.split('-');
        if (partes.length === 3 && partes[0].length === 4) {
            return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
    }
    
    return str;
}

function formatearFechaGuardado(fechaInput) {
    if (!fechaInput) return "";
    
    // Si la fecha viene del input type="date" tiene formato AAAA-MM-DD
    const partes = fechaInput.split('-');
    if (partes.length === 3) {
        const anio = partes[0];
        const mes = partes[1];
        const dia = partes[2];
        return `${dia}/${mes}/${anio}`; // Puedes usar '/' o '-' según tu preferencia
    }
    
    return fechaInput;
}
