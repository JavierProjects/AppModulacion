# Laboratorio interactivo de modulación

Aplicación web educativa para explorar, comparar y practicar los fundamentos de las modulaciones analógicas, por pulsos y digitales de portadora.

El simulador permite modificar parámetros en tiempo real y observar de forma sincronizada la señal de información, la referencia o portadora y la señal modulada. También incluye prácticas guiadas con pequeños experimentos y preguntas de opción múltiple.

## Modulaciones incluidas

- **Analógicas:** AM, FM y PM.
- **Por pulsos:** PAM, PWM, PPM y PCM.
- **Digitales de portadora:** ASK, FSK, PSK, 4-QAM, 8-QAM y 16-QAM.

## Funciones principales

- Tres gráficas sincronizadas para comparar las señales.
- Control contextual para pausar o reiniciar la animación junto a su indicador de estado.
- Controles interactivos con límites máximos editables.
- Secuencias binarias personalizables para modulaciones digitales.
- Constelaciones para BPSK y QAM.
- Visualización de muestreo, cuantización y codificación en PCM.
- Pestaña de práctica guiada que cambia con la modulación seleccionada.
- 11 guías, 33 microexperimentos y 33 preguntas de opción múltiple.
- Exportación de evidencias en PNG:
  - Las tres gráficas principales en todas las modulaciones.
  - La constelación en PSK y QAM.
  - Las etapas de muestreo, cuantización y codificación en PCM.
- Funcionamiento completamente local, sin dependencias ni conexión a Internet.

## Cómo ejecutar la aplicación

### Opción recomendada: Visual Studio Code y Live Server

1. Clona o descarga este repositorio.
2. Abre la carpeta del proyecto en Visual Studio Code.
3. Instala la extensión **Live Server** si aún no la tienes.
4. Abre `index.html` y selecciona **Open with Live Server**.

También puedes abrir `index.html` directamente en un navegador moderno. No es necesario instalar Node.js ni ejecutar un proceso de compilación.

## Uso básico

1. Selecciona una familia y una modulación en la parte superior.
2. En **Simulador**, ajusta los controles y observa las tres señales.
3. En **Práctica guiada**, sigue los experimentos en el orden recomendado o elige libremente otra modulación.
4. Regresa al simulador cuando la guía solicite cambiar parámetros.
5. Usa el botón con el icono de impresora para descargar la evidencia gráfica en formato PNG.

## Estructura del proyecto

```text
AppModulacion/
├── favicon.svg # Icono de la aplicación para la pestaña del navegador
├── index.html   # Estructura y contenido de la interfaz
├── styles.css   # Diseño visual y adaptación a distintos tamaños
├── app.js       # Simulación, gráficas, prácticas y exportación
└── README.md    # Documentación del proyecto
```

## Alcance educativo

La aplicación está pensada para introducir visualmente las características esenciales de cada técnica. Las escalas, señales y modelos buscan claridad didáctica; no sustituyen un simulador de ingeniería para diseño, medición o validación de sistemas reales.

