# Máquina de Turing - Paridad de Cadenas

Simulador de una máquina de Turing que verifica y mantiene la paridad de a's y b's en dos cadenas.

## Descripción

Esta aplicación web simula una máquina de Turing que:
1. Lee dos cadenas de a's y b's separadas por `|`
2. Compara la cantidad de a's y b's
3. Agrega la diferencia necesaria para mantener la paridad
4. Muestra el ID (configuraciones) de la máquina paso a paso

## Características

- Visualización paso a paso de la cinta
- Diagrama interactivo de estados
- Controles de reproducción (anterior, siguiente, play/pause)
- Etiquetas de transición en el diagrama
- Vista del ID completo de la máquina

## Uso

1. Visita la [página del simulador](https://garleoo.github.io/turing-visual-simulator)
2. Ingresa dos cadenas de a's y b's separadas por | (ejemplo: `abb|aab`)
3. Presiona "Procesar" para iniciar la simulación
4. Usa los controles para ver la ejecución paso a paso

## Ejemplo

Entrada: `abb|aab`
- La máquina procesará las cadenas
- Mostrará cada paso de la ejecución
- Resaltará el estado actual en el diagrama
- Permitirá ver las transiciones usadas