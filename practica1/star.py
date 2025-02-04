""" Algoritmo A* """
import heapq
import math

def obtener_entrada_usuario():
    """
    Función para obtener la entrada del usuario, que debe ser un entero
    mayor que 0 para las dimensiones de la rejilla, un entero mayor que 0
    para el número de posiciones prohibidas y un entero mayor que 0 para el
    número de waypoints. Para cada posición prohibida, se debe ingresar una
    tupla (fila, columna) con la posición. Para cada waypoint, se debe
    ingresar una tupla (fila, columna) con la posición. La posición inicial y
    final se deben ingresar también como tuplas (fila, columna).

    Si se ingresa una entrada incorrecta, se mostrará un mensaje de error y
    se volverá a pedir la entrada.

    Devuelve una tupla (grid, waypoints) con la rejilla y los waypoints.

    """
    try:
        filas = int(input("Ingrese el número de filas de la rejilla: "))
        columnas = int(input("Ingrese el número de columnas de la rejilla: "))
        if filas <= 0 or columnas <= 0:
            raise ValueError("Las dimensiones deben ser mayores que 0.")
        grid = [[0] * columnas for _ in range(filas)]
        
        num_obstaculos = int(input("Ingrese el número de posiciones prohibidas: "))
        for _ in range(num_obstaculos):
            x, y = map(int, input("Ingrese la posición prohibida (fila columna): ").split())
            if 0 <= x < filas and 0 <= y < columnas:
                grid[x][y] = 1
            else:
                print("Coordenadas fuera de rango, intenta de nuevo.")
        
        inicio = tuple(map(int, input("Ingrese la posición inicial (fila columna): ").split()))
        meta = tuple(map(int, input("Ingrese la posición final (fila columna): ").split()))
        
        if grid[inicio[0]][inicio[1]] == 1 or grid[meta[0]][meta[1]] == 1:
            raise ValueError("La posición inicial o final no puede ser un obstáculo.")
        
        num_waypoints = int(input("Ingrese el número de waypoints: "))
        waypoints = [inicio]
        for _ in range(num_waypoints):
            waypoint = tuple(map(int, input("Ingrese el waypoint (fila columna): ").split()))
            if 0 <= waypoint[0] < filas and 0 <= waypoint[1] < columnas and grid[waypoint[0]][waypoint[1]] == 0:
                waypoints.append(waypoint)
            else:
                print("Waypoint fuera de rango o en un obstáculo, intenta de nuevo.")
        waypoints.append(meta)
        
        return grid, waypoints
    except ValueError as e:
        print("Error de entrada:", e)
        return obtener_entrada_usuario()

class Nodo:
    """
    Clase que representa a un Nodo
    """
    def __init__(self, posicion, padre=None):
        """
        Inicializa un nodo para el algoritmo A*.

        Args:
            posicion (tuple): La posición del nodo en la rejilla como una tupla (fila, columna).
            padre (Nodo, opcional): El nodo padre de este nodo actual. Por defecto es None.

        Atributos:
            g (float): El costo desde el nodo inicial hasta este nodo.
            h (float): La estimación del costo desde este nodo hasta el nodo meta.
            f (float): La suma de g y h, utilizada para priorizar nodos en la cola de prioridad.
        """

        self.posicion = posicion
        self.padre = padre
        self.g = 0
        self.h = 0
        self.f = 0

    def __lt__(self, otro):
        return self.f < otro.f

def distancia_euclidiana(nodo_actual, nodo_meta):
    """
    Calcula la distancia euclidiana entre dos nodos.

    Args:
        nodo_actual (tuple): La posición del nodo actual como una tupla (fila, columna).
        nodo_meta (tuple): La posición del nodo meta como una tupla (fila, columna).

    Returns:
        float: La distancia euclidiana entre nodo_actual y nodo_meta.
    """

    x1, y1 = nodo_actual
    x2, y2 = nodo_meta
    return math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

def obtener_sucesores(nodo_actual, grid):
    """
    Genera una lista de nodos sucesores a partir del nodo actual en la rejilla.

    Args:
        nodo_actual (Nodo): El nodo actual desde el cual se generan los sucesores.
        grid (list of list of int): La rejilla en la cual se está realizando la búsqueda,
                                    donde 0 representa un espacio libre y 1 un obstáculo.

    Returns:
        list of Nodo: Una lista de nodos sucesores que son accesibles desde el nodo actual,
                      considerando solo movimientos válidos en la rejilla.
    """

    movimientos = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]
    x, y = nodo_actual.posicion
    sucesores = []
    filas, columnas = len(grid), len(grid[0])

    for dx, dy in movimientos:
        nx, ny = x + dx, y + dy
        if 0 <= nx < filas and 0 <= ny < columnas and grid[nx][ny] != 1:
            sucesor = Nodo((nx, ny), nodo_actual)
            sucesores.append(sucesor)

    return sucesores

def reconstruir_camino(nodo_actual):
    """
    Reconstruye el camino desde el nodo actual hasta el nodo inicial.

    Args:
        nodo_actual (Nodo): El nodo actual desde el cual se construye el camino.

    Returns:
        list of tuple: El camino desde el nodo actual hasta el nodo inicial como una lista de
                       posiciones en la rejilla, representadas como tuplas (fila, columna).
    """
    camino = []
    while nodo_actual:
        camino.append(nodo_actual.posicion)
        nodo_actual = nodo_actual.padre
    return camino[::-1]

def a_estrella(grid, inicio, meta):
    nodo_inicio = Nodo(inicio)
    nodo_meta = Nodo(meta)

    abierta = []
    cerrada = set()
    heapq.heappush(abierta, nodo_inicio)

    while abierta:
        nodo_actual = heapq.heappop(abierta)

        if nodo_actual.posicion == nodo_meta.posicion:
            return reconstruir_camino(nodo_actual)

        cerrada.add(nodo_actual.posicion)

        for sucesor in obtener_sucesores(nodo_actual, grid):
            if sucesor.posicion in cerrada:
                continue

            sucesor.g = nodo_actual.g + distancia_euclidiana(nodo_actual.posicion, sucesor.posicion)
            sucesor.h = distancia_euclidiana(sucesor.posicion, nodo_meta.posicion)
            sucesor.f = sucesor.g + sucesor.h

            if any(nodo.posicion == sucesor.posicion and nodo.f <= sucesor.f for nodo in abierta):
                continue

            heapq.heappush(abierta, sucesor)

    return None

def generar_waypoints(grid, waypoints):
    """
    Genera un camino que pasa por todos los waypoints dados, utilizando el algoritmo A* 
    para cada tramo.

    Args:
        grid (list of list of int): La rejilla en la que se encuentra el robot, 
        donde 0 representa un espacio libre y 1 un obst aculo.
        waypoints (list of tuple): La lista de waypoints que se desean recorrer.

    Returns:
        list of tuple: El camino que pasa por todos los waypoints. 
        Si no se encuentra un camino, se devuelve None.
    """

    camino_completo = []
    for i in range(len(waypoints) - 1):
        sub_camino = a_estrella(grid, waypoints[i], waypoints[i + 1])
        if not sub_camino:
            return None
        if camino_completo:
            sub_camino.pop(0)
        camino_completo.extend(sub_camino)
    return camino_completo

grid, waypoints = obtener_entrada_usuario()
camino = generar_waypoints(grid, waypoints)

if camino:
    print("Camino encontrado con waypoints:", camino)
else:
    print("No se encontró un camino.")
