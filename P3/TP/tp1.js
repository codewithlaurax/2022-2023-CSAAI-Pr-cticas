console.log("Ejecutando JS...");

//-- Obtención del canvas y de los elementos HTML a usar
const canvas = document.getElementById("ctiro");

const angulo_disparo = document.getElementById("rangeField2");
const velocidad_disparo = document.getElementById("rangeField1");

const angulo_valor = document.getElementById("output2");
const velocidad_valor = document.getElementById("output1");

//-- Definir el tamaño del canvas
canvas.width = 700;
canvas.height = 300;

//-- Obtener el contexto del canvas
const ctx = canvas.getContext("2d");

//-- Posicion inicial del proyectil
let xp = 0;
let yp = 260;
// let xop = xp;
// let yop = xy;

//-- Tamaño del proyectil
let lx = 40;
let ly = 40;

//-- función para pintar el proyectil
function dibujarP(xp,yp,lx,ly,color) {

  //-- Pintando el proyectil
  ctx.beginPath();

  //-- Definir un rectángulo de dimensiones lx x ly,
  ctx.rect(xp, yp, lx, ly);

  //-- Color de relleno del rectángulo
  ctx.fillStyle = color;

  //-- Mostrar el relleno
  ctx.fill();

  //-- Mostrar el trazo del rectángulo
  ctx.stroke();

  ctx.closePath();
  console.log("Dibuja el proyectil correctamente")
}

//-- Dibujar el proyectil
dibujarP(xp, yp, lx, ly, "yellow"); // Pintar el proyectil


// -- Coordenadas iniciales del objetivo
let xomin = 100;
let xomax = 675;
let xo = getRandomInt(xomin, xomax);
let yo = 275;

//-- función para pintar el objetivo
function dibujarO(xo,yo) {

  //-- Pintando el objetivo
  ctx.beginPath();

  //-- Dibujar un circulo: coordenadas x,y del centro
  //-- Radio, Angulo inicial y angulo final
  ctx.arc(xo, yo, 25, 0, 2 * Math.PI);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'red';

  //-- Dibujar el relleno
  ctx.fill()    

  //-- Dibujar el trazo
  ctx.stroke();

  ctx.closePath();
  console.log("Dibuja el objeto correctamente")
}

dibujarO(xo, yo);


//-- OBJETIVO: lanzar el proyectil hasta impactar en la bola roja (posición aleatoria).
//--
//-- Lo que hacía falta para conseguirlo (implementado abajo):
//--  1) Calcular la velocidad inicial (vx, vy) a partir del ángulo y la velocidad
//--     de los sliders. El slider va de 0 a 100 y se escala a px/s.
//--  2) Animar el proyectil con las ecuaciones del tiro parabólico:
//--        x(t) = x0 + vx·t
//--        y(t) = y0 - (vy·t - ½·g·t²)     (en el canvas, y crece hacia abajo)
//--  3) En cada fotograma (requestAnimationFrame) repintar el objetivo y el proyectil.
//--  4) Detectar el impacto comparando el rectángulo del proyectil con el círculo rojo.
//--  5) Terminar el tiro: impacto o caída al suelo (se para el cronómetro) o salida del canvas
//--     por la derecha o por arriba (el tiro se reinicia y se puede volver a lanzar).
//--
//-- Para impactar a una distancia d con ángulo de 45°, la velocidad necesaria es
//-- v0 = √(g·d). Con g = 200 y d = 400 px, v0 ≈ 283 px/s, es decir, slider ≈ 71.
//--
//-- Errores de la versión anterior:
//--  - lanzar() y tiroParabolico() estaban comentadas, así que el botón no hacía nada.
//--  - La gravedad se usaba como `gt`, que no existe.
//--  - angp = Number(angulo_disparo) convertía el elemento HTML, no su valor.
//--  - `t` nunca avanzaba y `xop`/`yop` no estaban definidas.
//--  - g = 9.8 (m/s²) no sirve en píxeles: con v0 = 200 px/s el alcance a 45° sería
//--    v²/g ≈ 4080 px, unas 6 veces el canvas. Por eso se usa g = 200 px/s², una escala de juego
//--    con la que el alcance a 45° con v0 = 200 px/s es de 200 px.

//-- Constantes del tiro parabólico (unidades en píxeles y segundos)
const g = 200; //-- Gravedad (px/s²)
const factor_velocidad = 4; //-- Convierte el valor del slider (0-100) en px/s
const y_suelo = 260; //-- Posición vertical del proyectil en el suelo
const radio_objetivo = 25;

let volando = false; //-- Indica si hay un tiro en curso
let t_inicio = 0; //-- Instante del lanzamiento (ms)
let t_anterior = 0; //-- Último instante comprobado en la animación (s)
let x0 = 0; //-- Posición de partida del proyectil
let y0 = y_suelo;
let vx = 0; //-- Componentes de la velocidad inicial
let vy = 0;

//-- Elemento donde mostrar el resultado del tiro
const resultado = document.getElementById("resultado");

//-- Calcula la velocidad inicial a partir del ángulo y la velocidad elegidos
function calcularVelocidad() {
  const v0 = Number(velocidad) * factor_velocidad;
  const rad = Number(angulo) * Math.PI / 180;
  vx = v0 * Math.cos(rad);
  vy = v0 * Math.sin(rad);
}

//-- Comienza el tiro: guarda la posición de partida y arranca la animación
function lanzar() {
  if (volando) return;

  volando = true;
  resultado.textContent = "";
  calcularVelocidad();

  //-- CORRECCIÓN: cada tiro sale del cañón (x = 0, esquina inferior izquierda).
  //-- Antes era `x0 = xp`, así que el siguiente tiro empezaba donde había caído el anterior.
  x0 = 0;
  y0 = y_suelo;
  t_inicio = performance.now();
  t_anterior = 0;
  requestAnimationFrame(actualizar);
}

//-- Posición del proyectil en el instante t (s) desde el lanzamiento
function posicionEn(t) {
  return {
    x: x0 + vx * t,
    y: y0 - (vy * t - 0.5 * g * t * t) //-- el eje y crece hacia abajo en el canvas
  };
}

//-- Función de animación: se ejecuta en cada fotograma mientras dura el tiro
function actualizar(ahora) {
  //-- Tiempo transcurrido desde el lanzamiento (s)
  const t = (ahora - t_inicio) / 1000;

  //-- Nueva posición del proyectil
  const p = posicionEn(t);
  xp = p.x;
  yp = p.y;

  //-- Repintar el canvas con el objetivo y el proyectil
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dibujarO(xo, yo);
  dibujarP(xp, yp, lx, ly, "yellow");

  if (impactaEntre(t_anterior, t)) {
    terminar("¡Impacto!");
  } else if (fueraDelCanvas()) {
    reiniciar("El proyectil ha salido del canvas. Vuelve a intentarlo.");
  } else if (yp > y_suelo && t > 0) {
    terminar("Fallo");
  } else {
    t_anterior = t;
    requestAnimationFrame(actualizar);
  }
}

//-- Comprueba si el proyectil toca el objetivo en la posición (x, y)
function impacta(x, y) {
  //-- Punto del rectángulo del proyectil más cercano al centro del objetivo
  const cx = Math.max(x, Math.min(xo, x + lx));
  const cy = Math.max(y, Math.min(yo, y + ly));
  const dx = xo - cx;
  const dy = yo - cy;
  return dx * dx + dy * dy <= radio_objetivo * radio_objetivo;
}

//-- Comprueba si hubo impacto entre dos instantes, revisando la trayectoria intermedia.
//-- Así no se salta el objetivo si el navegador tarda en pintar un fotograma.
function impactaEntre(t0, t1) {
  const pasos = 20;
  for (let i = 1; i <= pasos; i++) {
    const p = posicionEn(t0 + (t1 - t0) * i / pasos);
    if (impacta(p.x, p.y)) return true;
  }
  return false;
}

//-- Comprueba si el proyectil ha salido del canvas por la derecha o por arriba
function fueraDelCanvas() {
  return xp > canvas.width || yp + ly < 0;
}

//-- Termina el tiro: para el cronómetro y muestra el resultado
function terminar(mensaje) {
  volando = false;
  crono.stop();
  resultado.textContent = mensaje;
}

//-- Reinicia el tiro: el proyectil vuelve a la posición de partida y el cronómetro a cero
function reiniciar(mensaje) {
  volando = false;
  crono.stop();
  crono.reset();
  xp = 0;
  yp = y_suelo;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dibujarO(xo, yo);
  dibujarP(xp, yp, lx, ly, "yellow");
  resultado.textContent = mensaje;
}


//-- Genera nuevas coordenadas para el objeto
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//-- Para usar los valores seleccionados de angulo y velocidad del disparo
let angulo = angulo_disparo.value;
let velocidad = velocidad_disparo.value;

angulo_disparo.addEventListener('input', function() {
  angulo = angulo_disparo.value;
  console.log("Angulo: ", angulo);
  angulo_valor.textContent = angulo;
  
});

velocidad_disparo.addEventListener('input', function() {
  velocidad = velocidad_disparo.value;
  console.log("Velocidad: ", velocidad);
  velocidad_valor.textContent = velocidad;
});


//-- Elementos de la gui
const gui = {
  display: document.getElementById("display"),
  btnLanzar: document.getElementById("btnLanzar"),
  btnIniciar: document.getElementById("btnIniciar")
}

//-- Definir un objeto cronómetro
const crono = new Crono(gui.display);

//-- Función de retrollamada del botón de disparo
gui.btnLanzar.onclick = () => {
  crono.start();
  lanzar();
  console.log("Start!!!")
}

//-- Función de retrollamada del botón iniciar
gui.btnIniciar.onclick = () => {
  location.reload();
  console.log("Reset!!!")
}

// //-- Llamamos a la funcion por primera vez
// lanzar();