console.log("Ejecutando JS...");

const digitos = document.getElementsByClassName("digito");
let clave = document.getElementsByClassName("clave");
let count = 0;
let secretkey = "";

//-- Cada posición de la clave ya acertada (para no contar dos veces el mismo acierto)
let acertada = [false, false, false, false];

//-- Generar una clave de 4 dígitos aleatorios del 0 al 9
function getRandomInt() {
    let nueva = "";
    for (let i = 0; i < 4; i++) {
        nueva += Math.floor(Math.random() * 10);
    }
    return nueva;
}

//-- La clave se genera una sola vez al cargar la página
secretkey = getRandomInt();
console.log("Clave secreta: " + secretkey)

//---- Necesitamos estados
const ESTADO = {
    INIT: 0,
    STATE_1: 1,
    FIN: 2,
}

let estado = ESTADO.INIT;

//-- Funcion retrollamada de los botones y define los estados
function digito(ev) {
    console.log("Valor: " + ev);

    //-- Con la combinación adivinada no se admiten más clics
    if (estado == ESTADO.FIN) {
        return;
    }

    //-- Definimos funcionalidad del primer estado
    if (estado == ESTADO.INIT) {
        //-- Pasamos al siguiente estado
        estado = ESTADO.STATE_1;
        crono.start();
        document.body.style.backgroundColor = "red";
    }

    //-- Con el cronómetro parado (Stop) no se juega
    if (estado == ESTADO.STATE_1 && !crono.timer) {
        return;
    }

    //-- Iteraciones sobre cada click y comprobamos que pertenezca a la secretkey
    if (estado == ESTADO.STATE_1) {
        for (let i = 0; i < secretkey.length; i++) {
            //-- Solo cuenta si la posición coincide y todavía no estaba acertada
            if (secretkey[i] == ev && !acertada[i]) {
                acertada[i] = true;
                clave[i].innerHTML = secretkey[i];
                //-- Cuando se acierta cambiamos el color a verde
                clave[i].style.color = "white";
                count += 1;
                console.log('Count: ' + count);
            }
        }
        //-- Para el crono cuando se adivinen las cuatro
        if (count == 4) {
            estado = ESTADO.FIN;
            crono.stop();
            document.body.style.backgroundColor = "green";
        }
    }
}

//-- Bucle que recorrer todos los digitos
for (let boton of digitos) {
    boton.onclick = (ev) => {
        digito(ev.target.value)
    }
}

//-- Elementos de la gui
const gui = {
    display: document.getElementById("display"),
    start: document.getElementById("start"),
    stop: document.getElementById("stop"),
    reset: document.getElementById("reset")
}

//-- Definir un objeto cronómetro
const crono = new Crono(gui.display);

//---- Configurar las funciones de retrollamada

//-- Arranque del cronometro (no reanuda el juego si ya está ganado)
gui.start.onclick = () => {
    console.log("Start!!");
    if (estado == ESTADO.FIN) {
        return;
    }
    crono.start();
    document.body.style.backgroundColor = "red";
}

//-- Detener el cronómetro
gui.stop.onclick = () => {
    console.log("Stop!");
    crono.stop();

}

//-- Reset del cronómetro
gui.reset.onclick = () => {
    console.log("Reset!");
    crono.reset();
    //-- Recarga la pagina cuando se resetea
    window.location.reload();
}
