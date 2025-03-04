"use strict";
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
    return "Desconocido";
  }
  let mejor = mejorAtributo(datos, atributos);
  let valores = [...new Set(datos.map((fila) => fila[mejor]))];
  let resultado = {};
  valores.forEach((valor) => {
    let subconjunto = datos.filter((fila) => fila[mejor] === valor);
    let nuevosAtributos = atributos.filter((a) => a !== mejor);
    resultado[valor] = id3(subconjunto, nuevosAtributos);
  });
  return { [mejor]: resultado };
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
  document.getElementById("resultado").textContent = JSON.stringify(
    arbolDecision,
    null,
    2
  );
}

function clasificarEjemplo() {
  if (!arbolDecision) {
    document.getElementById("decision").textContent =
      "Ejecuta el algoritmo ID3 primero.";
    return;
  }
  let ejemplo = {
    TiempoExterior: document.getElementById("tiempo").value,
    Temperatura: document.getElementById("temperatura").value,
    Humedad: document.getElementById("humedad").value,
    Viento: document.getElementById("viento").value,
  };
  let nodo = arbolDecision;
  while (typeof nodo === "object") {
    let clave = Object.keys(nodo)[0];
    nodo = nodo[clave][ejemplo[clave]];
    if (!nodo) {
      nodo = "Desconocido";
      break;
    }
  }
  document.getElementById("decision").textContent = nodo;
}

document.getElementById("ejecutarID3").click();