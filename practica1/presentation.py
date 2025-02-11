""" Capa de presentación para el algoritmo A* """
import os

def mostrar_titulo():
    """Muestra el título del programa de forma amigable."""
    os.system('cls' if os.name == 'nt' else 'clear')
    print("\n========================")
    print("    Algoritmo A* 🧭")
    print("========================\n")

def solicitar_numero_entero(mensaje, min_valor=None, max_valor=None):
    """Solicita un número entero con validación opcional de rango."""
    while True:
        try:
            numero = int(input(mensaje))
            if (min_valor is not None and numero < min_valor) or (max_valor is not None and numero > max_valor):
                print(f"⚠️ El número debe estar entre {min_valor} y {max_valor}. Intenta de nuevo.")
            else:
                return numero
        except ValueError:
            print("⚠️ Entrada no válida. Por favor, ingrese un número entero.")

def solicitar_coordenadas(mensaje, filas, columnas):
    """Solicita coordenadas válidas dentro de una rejilla de filas x columnas."""
    while True:
        try:
            coordenadas = tuple(map(int, input(mensaje).split()))
            if len(coordenadas) != 2:
                raise ValueError("Debes ingresar exactamente dos números.")
            x, y = coordenadas
            if 0 <= x < filas and 0 <= y < columnas:
                return coordenadas
            else:
                print(f"⚠️ Las coordenadas deben estar entre (0, 0) y ({filas - 1}, {columnas - 1}). Intenta de nuevo.")
        except ValueError as e:
            print(f"⚠️ Entrada no válida: {e}")

def solicitar_obstaculos(filas, columnas):
    """Solicita la definición de obstáculos en una rejilla."""
    num_obstaculos = solicitar_numero_entero("Ingrese el número de posiciones prohibidas: ", min_valor=0)
    obstaculos = []
    for _ in range(num_obstaculos):
        obstaculo = solicitar_coordenadas("Ingrese la posición prohibida (fila columna): ", filas, columnas)
        obstaculos.append(obstaculo)
    return obstaculos

def solicitar_waypoints(filas, columnas):
    """Solicita la definición de waypoints dentro de una rejilla."""
    num_waypoints = solicitar_numero_entero("Ingrese el número de waypoints: ", min_valor=0)
    waypoints = []
    for _ in range(num_waypoints):
        waypoint = solicitar_coordenadas("Ingrese el waypoint (fila columna): ", filas, columnas)
        waypoints.append(waypoint)
    return waypoints

def configurar_rejilla():
    """Configura la rejilla de navegación a través de entradas del usuario."""
    mostrar_titulo()
    print("Configura la rejilla de navegación:\n")
    filas = solicitar_numero_entero("Ingrese el número de filas de la rejilla: ", min_valor=1)
    columnas = solicitar_numero_entero("Ingrese el número de columnas de la rejilla: ", min_valor=1)
    
    print("\nDefine los obstáculos en la rejilla:\n")
    obstaculos = solicitar_obstaculos(filas, columnas)
    
    print("\nDefine la posición inicial y final:\n")
    inicio = solicitar_coordenadas("Ingrese la posición inicial (fila columna): ", filas, columnas)
    meta = solicitar_coordenadas("Ingrese la posición final (fila columna): ", filas, columnas)
    
    print("\nAñade puntos intermedios (waypoints):\n")
    waypoints = solicitar_waypoints(filas, columnas)
    
    return filas, columnas, obstaculos, inicio, meta, waypoints

if __name__ == "__main__":
    filas, columnas, obstaculos, inicio, meta, waypoints = configurar_rejilla()
    print("\nResumen de la configuración:")
    print(f"Dimensiones de la rejilla: {filas} x {columnas}")
    print(f"Obstáculos: {obstaculos}")
    print(f"Posición inicial: {inicio}")
    print(f"Posición final: {meta}")
    print(f"Waypoints: {waypoints}")
