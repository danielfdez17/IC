"use strict";
let timeoutId = null;
class Nodo {
  constructor(posicion, padre = null) {
    this.posicion = posicion;
    this.padre = padre;
    this.g = 0; // Costo desde el inicio
    this.h = 0; // Heurística
    this.f = 0; // Costo total
  }
}

function distanciaEuclidiana(nodoActual, nodoMeta) {
  const [x1, y1] = nodoActual;
  const [x2, y2] = nodoMeta;
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function obtenerSucesores(nodoActual, grid) {
  const movimientos = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  const [x, y] = nodoActual.posicion;
  const sucesores = [];
  const filas = grid.length;
  const columnas = grid[0].length;

  movimientos.forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (
      nx >= 0 &&
      nx < filas &&
      ny >= 0 &&
      ny < columnas &&
      grid[nx][ny] !== 1
    ) {
      sucesores.push(new Nodo([nx, ny], nodoActual));
    }
  });

  return sucesores;
}

function reconstruirCamino(nodoActual) {
  const camino = [];
  while (nodoActual) {
    camino.push(nodoActual.posicion);
    nodoActual = nodoActual.padre;
  }
  return camino.reverse();
}

function aEstrella(grid, inicio, meta) {
  const nodoInicio = new Nodo(inicio);
  const nodoMeta = new Nodo(meta);

  const abierta = [nodoInicio];
  const cerrada = new Set();

  while (abierta.length > 0) {
    abierta.sort((a, b) => a.f - b.f);
    const nodoActual = abierta.shift();

    if (
      JSON.stringify(nodoActual.posicion) === JSON.stringify(nodoMeta.posicion)
    ) {
      return reconstruirCamino(nodoActual);
    }

    cerrada.add(JSON.stringify(nodoActual.posicion));

    const sucesores = obtenerSucesores(nodoActual, grid);
    sucesores.forEach((sucesor) => {
      if (cerrada.has(JSON.stringify(sucesor.posicion))) {
        return;
      }

      sucesor.g =
        nodoActual.g +
        distanciaEuclidiana(nodoActual.posicion, sucesor.posicion);
      sucesor.h = distanciaEuclidiana(sucesor.posicion, meta);
      sucesor.f = sucesor.g + sucesor.h;

      const nodoExistente = abierta.find(
        (nodo) =>
          JSON.stringify(nodo.posicion) === JSON.stringify(sucesor.posicion)
      );

      if (nodoExistente && nodoExistente.f <= sucesor.f) {
        return;
      }

      abierta.push(sucesor);
    });
  }

  return null;
}

function parseCoordinates(input) {
  if (!input) return [];
  return input.split(";").map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return [x, y];
  });
}

// function renderGrid(
//   rows,
//   columns,
//   grid,
//   start,
//   end,
//   path,
//   obstacles,
//   waypoints
// ) {
//   const gridContainer = document.getElementById("grid");
//   gridContainer.style.gridTemplateRows = `repeat(${rows}, 50px)`;
//   gridContainer.style.gridTemplateColumns = `repeat(${columns}, 50px)`;
//   gridContainer.innerHTML = "";

//   for (let i = 0; i < rows; i++) {
//     for (let j = 0; j < columns; j++) {
//       const cell = document.createElement("div");
//       cell.classList.add("cell");

//       if (obstacles.some(([x, y]) => x === i && y === j)) {
//         cell.classList.add("obstacle");
//       } else if (start[0] === i && start[1] === j) {
//         cell.classList.add("start");
//       } else if (end[0] === i && end[1] === j) {
//         cell.classList.add("end");
//       } else if (waypoints.some(([x, y]) => x === i && y === j)) {
//         cell.classList.add("waypoint");
//       } else if (path.some(([x, y]) => x === i && y === j)) {
//         cell.classList.add("path");
//       }

//       gridContainer.appendChild(cell);
//     }
//   }
// }

function renderGrid(
  rows,
  columns,
  grid,
  start,
  end,
  path,
  obstacles,
  waypoints
) {
  const gridContainer = document.getElementById("grid");
  gridContainer.style.display = "grid";
  gridContainer.style.gridTemplateRows = `repeat(${rows + 1}, 50px)`;
  gridContainer.style.gridTemplateColumns = `repeat(${columns + 1}, 50px)`;
  gridContainer.innerHTML = "";

  for (let i = -1; i < rows; i++) {
    for (let j = -1; j < columns; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (i === -1 && j >= 0) {
        cell.textContent = "y" + j;
        cell.style.fontWeight = "bold";
        cell.style.backgroundColor = "#c4c4c4";
      } else if (j === -1 && i >= 0) {
        cell.textContent = "x" + i;
        cell.style.fontWeight = "bold";
        cell.style.backgroundColor = "#c4c4c4";
      } else if (i >= 0 && j >= 0) {
        if (obstacles.some(([x, y]) => x === i && y === j)) {
          cell.classList.add("obstacle");
        } else if (start[0] === i && start[1] === j) {
          cell.classList.add("start");
        } else if (end[0] === i && end[1] === j) {
          cell.classList.add("end");
        } else if (waypoints.some(([x, y]) => x === i && y === j)) {
          cell.classList.add("waypoint");
        } else if (path.some(([x, y]) => x === i && y === j)) {
          cell.classList.add("path");
        }
      }

      gridContainer.appendChild(cell);
    }
  }
}

function calculatePath() {
  const rows = parseInt(document.getElementById("rows").value);
  const columns = parseInt(document.getElementById("columns").value);
  const obstacles = parseCoordinates(
    document.getElementById("obstacles").value
  );
  const start = parseCoordinates(document.getElementById("start").value)[0];
  const end = parseCoordinates(document.getElementById("end").value)[0];
  const waypoints = parseCoordinates(
    document.getElementById("waypoints").value
  );

  if (!rows || !columns || !start || !end) {
    Toastify({
      text: "⚠️ Por favor, completa todos los campos obligatorios correctamente.",
      duration: 3000,
      newWindow: true,
      gravity: "top",
      position: "left",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      },
    }).showToast();

    return;
  }

  const grid = Array.from({ length: rows }, () => Array(columns).fill(0));
  obstacles.forEach(([x, y]) => {
    grid[x][y] = 1;
  });

  const fullWaypoints = [start, ...waypoints, end];
  const path = fullWaypoints.reduce((acc, point, i, arr) => {
    if (i === arr.length - 1) return acc;
    const subPath = aEstrella(grid, arr[i], arr[i + 1]);
    if (!subPath) {
      Toastify({
        text: "❌ No se encontró un camino válido.",
        duration: 3000,
        newWindow: true,
        gravity: "top",
        position: "left",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
      }).showToast();
      return null;
    }
    return acc.concat(i > 0 ? subPath.slice(1) : subPath);
  }, []);

  if (path) {
    renderGrid(rows, columns, grid, start, end, path, obstacles, waypoints);
  }
}

// $("input").on("input", () => {
//   $("#buscarCamino").click();
// });

$("#reset").on("click", () => {
  $("#obstacles").val("");
  $("#start").val("");
  $("#end").val("");
  $("#waypoints").val("");
  location.reload();
});

$(() => {
  const grid = document.getElementById("grid");
  let startCell = null;
  let endCell = null;
  const obstacles = new Set();
  const waypoints = new Set();
  let mode = "start"; // Modo actual: start, end, obstacle, waypoint

  function updateForm() {
    document.getElementById("start").value = startCell
      ? startCell.dataset.coord
      : "";
    document.getElementById("end").value = endCell ? endCell.dataset.coord : "";
    document.getElementById("obstacles").value =
      Array.from(obstacles).join(";");
    document.getElementById("waypoints").value =
      Array.from(waypoints).join(";");
  }

  function handleCellClick(cell) {
    const coord = cell.dataset.coord;

    if (mode === "start") {
      if (startCell) startCell.classList.remove("start");
      startCell = cell;
      startCell.classList.add("start");
    } else if (mode === "end") {
      if (endCell) endCell.classList.remove("end");
      endCell = cell;
      endCell.classList.add("end");
    } else if (mode === "obstacle") {
      if (!obstacles.has(coord)) {
        obstacles.add(coord);
        cell.classList.add("obstacle");
      } else {
        obstacles.delete(coord);
        cell.classList.remove("obstacle");
      }
    } else if (mode === "waypoint") {
      if (!waypoints.has(coord)) {
        waypoints.add(coord);
        cell.classList.add("waypoint");
      } else {
        waypoints.delete(coord);
        cell.classList.remove("waypoint");
      }
    }

    updateForm();
  }

  function createGrid(rows, cols) {
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${cols}, 50px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 50px)`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.coord = `${r},${c}`; // Ajuste para corregir la orientación del grid
        cell.addEventListener("click", () => handleCellClick(cell));
        grid.appendChild(cell);
      }
    }
  }

  document
    .getElementById("astar-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const rows = parseInt(document.getElementById("rows").value, 10);
      const cols = parseInt(document.getElementById("columns").value, 10);
      createGrid(rows, cols);
    });

    

  function changeMode(modeStr) {
    if (modeStr === "inicio") {
      mode = "start";
      $("#mode").text(modeStr);
      $("#mode")[0].classList = "";
      $("#mode").addClass(mode);
    } else if (modeStr === "final") {
      mode = "end";
      $("#mode").text(modeStr);
      $("#mode")[0].classList = "";
      $("#mode").addClass(mode);
    } else if (modeStr === "obstáculo") {
      mode = "obstacle";
      $("#mode").text(modeStr);
      $("#mode")[0].classList = "";
      $("#mode").addClass(mode);
    } else if (modeStr === "waypoint") {
      mode = "waypoint";
      $("#mode").text(modeStr);
      $("#mode")[0].classList = "";
      $("#mode").addClass(mode);
    }
  }

  $("#startBtn").on("click", () => {
    changeMode("inicio");
  });
  $("#endBtn").on("click", () => {
    changeMode("final");
  });
  $("#waypointsBtn").on("click", () => {
    changeMode("obstáculo");
  });
  $("#obstaculosBtn").on("click", () => {
    changeMode("waypoint");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "s") {
      changeMode("inicio");
    } else if (e.key === "e") {
      changeMode("final");
    } else if (e.key === "o") {
      changeMode("obstáculo");
    } else if (e.key === "w") {
      changeMode("waypoint");
    }
  });

  //   createGrid(10, 10);
  $("#rows").on("input", () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      createGrid(Number($("#rows").val()), Number($("#columns").val()));
    }, 500);
  });
  $("#columns").on("input", () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      createGrid(Number($("#rows").val()), Number($("#columns").val()));
    }, 500);
  });
  createGrid(Number($("#rows").val()), Number($("#columns").val()));

  // Código del script.js original fusionado aquí
  // Asegúrate de agregar cualquier funcionalidad que estaba en el archivo original

  $("#buscarCamino").click();
});
