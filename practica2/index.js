"use strict";
const tiempo = document.getElementById("tiempo");
const temperatura = document.getElementById("temperatura");
const humedad = document.getElementById("humedad");
const viento = document.getElementById("viento");
let arbolDecision;

function calcularEntropia(datos, atributo) {
  let conteo = {};
  datos.forEach((fila) => {
    let clave = fila[atributo];
    conteo[clave] = (conteo[clave] || 0) + 1;
  });
  let entropia = 0;
  let total = datos.length;
  for (let clave in conteo) {
    let p = conteo[clave] / total;
    entropia -= p * Math.log2(p);
  }
  return entropia;
}

function mejorAtributo(datos, atributos) {
  let minEntropia = Infinity;
  let mejor = null;
  atributos.forEach((atributo) => {
    let entropia = calcularEntropia(datos, atributo);
    if (entropia < minEntropia) {
      minEntropia = entropia;
      mejor = atributo;
    }
  });
  return mejor;
}

function id3(datos, atributos) {
  let decisiones = [...new Set(datos.map((fila) => fila["Jugar"]))];
  if (decisiones.length === 1) {
    return decisiones[0];
  }
  if (atributos.length === 0) {
    return decisionMayoritaria(datos);
  }

  let mejor = mejorAtributo(datos, atributos);
  let valores = [...new Set(datos.map((fila) => fila[mejor]))];
  let resultado = { _mayoria: decisionMayoritaria(datos) }; // Guardamos clase mayoritaria
  resultado[mejor] = {};

  valores.forEach((valor) => {
    let subconjunto = datos.filter((fila) => fila[mejor] === valor);
    let nuevosAtributos = atributos.filter((a) => a !== mejor);
    resultado[mejor][valor] = id3(subconjunto, nuevosAtributos);
  });

  return resultado;
}

function ejecutarID3() {
  let atributos = document.getElementById("atributos").value.trim().split(",");
  let datos = document
    .getElementById("datos")
    .value.trim()
    .split("\n")
    .map((linea) => {
      let valores = linea.split(",");
      let obj = {};
      atributos.forEach((attr, index) => (obj[attr] = valores[index]));
      return obj;
    });
  arbolDecision = id3(datos, atributos.slice(0, -1));
  //   document.getElementById("resultado").textContent = JSON.stringify(
  //     arbolDecision,
  //     null,
  //     2
  //   );
}

function clasificarEjemplo() {
  if (!arbolDecision) {
    document.getElementById("decision").textContent =
      "Ejecuta el algoritmo ID3 primero.";
    return;
  }

  const ejemplo = {
    TiempoExterior: document.getElementById("tiempo").value,
    Temperatura: document.getElementById("temperatura").value,
    Humedad: document.getElementById("humedad").value,
    Viento: document.getElementById("viento").value,
  };

  let nodo = arbolDecision;
  let decisionFinal = nodo["_mayoria"]; // valor por defecto desde la raíz

  while (typeof nodo === "object") {
    const mayoria = nodo["_mayoria"];
    const claves = Object.keys(nodo).filter((k) => k !== "_mayoria");

    if (claves.length === 0) break;

    const atributo = claves[0];
    const valor = ejemplo[atributo];

    if (nodo[atributo][valor] === undefined) {
      decisionFinal = mayoria;
      break;
    }

    const siguiente = nodo[atributo][valor];
    if (typeof siguiente === "string") {
      decisionFinal = siguiente;
      break;
    }

    nodo = siguiente;
    decisionFinal = nodo["_mayoria"]; // actualizamos decisión por si luego se pierde
  }

  document.getElementById("decision").textContent = decisionFinal;

  const valores = document.getElementById("valores");
  valores.textContent =
    tiempo.value +
    " " +
    temperatura.value +
    " " +
    humedad.value +
    " " +
    viento.value;
  valores.classList = "p-1 border border-1 border-black rounded";
}

function decisionMayoritaria(datos) {
  let conteo = {};
  datos.forEach((fila) => {
    let decision = fila["Jugar"];
    conteo[decision] = (conteo[decision] || 0) + 1;
  });
  return Object.entries(conteo).sort((a, b) => b[1] - a[1])[0][0];
}

document.getElementById("ejecutarID3").click();
