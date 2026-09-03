"use strict";

const MODES = {
  AM: {
    family: "analog",
    title: "Modulación en amplitud",
    summary: "La señal de información modifica continuamente la amplitud de la portadora.",
    target: "AMPLITUD",
    properties: [["Amplitud", "Variable", true], ["Frecuencia", "Base fᶜ", false], ["Fase", "Sin cambio", false]],
    equation: "s(t) = A<sub>c</sub>[1 + μm(t)] cos(2πf<sub>c</sub>t)",
    note: "μ es el índice de modulación. Si μ supera 1 aparece sobremodulación y la envolvente deja de reproducir fielmente a m(t).",
    challenge: "¿Qué ocurre con la envolvente cuando aumentas el índice de modulación por encima de 1?",
    answer: "La envolvente cruza por cero y se invierte en algunos intervalos: aparece sobremodulación y un detector de envolvente produciría distorsión."
  },
  FM: {
    family: "analog",
    title: "Modulación en frecuencia",
    summary: "La amplitud permanece constante; la información acerca o separa los ciclos de la portadora.",
    target: "FRECUENCIA INSTANTÁNEA",
    properties: [["Amplitud", "Constante", false], ["Frecuencia", "Variable", true], ["Fase", "Acumulada", false]],
    equation: "s(t) = A<sub>c</sub> cos[2πf<sub>c</sub>t + β sin(2πf<sub>m</sub>t)]",
    note: "Para una información senoidal, β = Δf/fm. La fase acumula el efecto de la frecuencia instantánea.",
    challenge: "Localiza los tramos donde los ciclos están más juntos. ¿Qué valor tiene m(t) ahí?",
    answer: "Cuando m(t) es positiva y máxima, la frecuencia instantánea es mayor y los ciclos aparecen más juntos."
  },
  PM: {
    family: "analog",
    title: "Modulación en fase",
    summary: "La información adelanta o retrasa la fase de la portadora manteniendo su amplitud.",
    target: "FASE",
    properties: [["Amplitud", "Constante", false], ["Frecuencia", "Inducida", false], ["Fase", "Variable", true]],
    equation: "s(t) = A<sub>c</sub> cos[2πf<sub>c</sub>t + k<sub>p</sub>m(t)]",
    note: "En PM la fase sigue directamente a m(t). Por eso también cambia la frecuencia instantánea cuando m(t) cambia.",
    challenge: "¿Por qué una señal PM parece cambiar de frecuencia aunque la información controle la fase?",
    answer: "Porque la frecuencia instantánea es la rapidez con la que cambia la fase. Cuando m(t) varía, su derivada introduce cambios momentáneos de frecuencia."
  },
  PAM: {
    family: "pulse",
    title: "Modulación por amplitud de pulsos",
    summary: "Cada muestra controla la altura de un pulso; el instante y el ancho permanecen regulares.",
    target: "ALTURA DE LOS PULSOS",
    properties: [["Altura", "Variable", true], ["Ancho", "Constante", false], ["Posición", "Regular", false]],
    equation: "s(t) = Σ m(nT<sub>s</sub>) · p(t − nT<sub>s</sub>)",
    note: "La altura de cada pulso conserva el valor de la muestra tomada cada Ts segundos.",
    challenge: "Aumenta la frecuencia de muestreo. ¿Qué cambia y qué permanece igual?",
    answer: "Aparecen más pulsos por segundo y la forma de la señal original se representa con mayor detalle; cada pulso sigue tomando la amplitud de su muestra."
  },
  PWM: {
    family: "pulse",
    title: "Modulación por ancho de pulsos",
    summary: "La amplitud de los pulsos es constante; la información modifica su duración.",
    target: "ANCHO DE LOS PULSOS",
    properties: [["Altura", "Constante", false], ["Ancho", "Variable", true], ["Posición", "Regular", false]],
    equation: "D[n] = D<sub>0</sub> + k<sub>w</sub>m(nT<sub>s</sub>)",
    note: "D[n] es el ciclo de trabajo del pulso n. Se limita entre 5 % y 95 % para conservar pulsos visibles.",
    challenge: "Observa un máximo y un mínimo de m(t). ¿Cómo cambia el ciclo de trabajo?",
    answer: "En esta convención, los máximos producen pulsos más anchos y los mínimos producen pulsos más estrechos."
  },
  PPM: {
    family: "pulse",
    title: "Modulación por posición de pulsos",
    summary: "Todos los pulsos conservan altura y ancho; la información desplaza su posición dentro de cada intervalo.",
    target: "POSICIÓN DE LOS PULSOS",
    properties: [["Altura", "Constante", false], ["Ancho", "Constante", false], ["Posición", "Variable", true]],
    equation: "t<sub>p</sub>[n] = nT<sub>s</sub> + τ<sub>0</sub> + k<sub>p</sub>m(nT<sub>s</sub>)",
    note: "Cada pulso se adelanta o retrasa respecto a una posición central, sin salir de su intervalo de muestreo.",
    challenge: "¿Por qué conviene mostrar un reloj de referencia al explicar PPM?",
    answer: "Porque la información está en el desplazamiento temporal. Sin una referencia sería difícil medir cuánto se adelantó o retrasó cada pulso."
  },
  PCM: {
    family: "pulse",
    title: "Modulación por codificación de pulsos",
    summary: "Las muestras se cuantizan en niveles discretos y cada nivel se representa mediante un código binario.",
    target: "CÓDIGO BINARIO DE CADA MUESTRA",
    properties: [["Muestreo", "Discreto", true], ["Cuantización", "Por niveles", true], ["Código", "Binario", true]],
    equation: "m(t) → m[n] → Q{m[n]} → palabra binaria",
    note: "Con L niveles se requieren ⌈log₂L⌉ bits por muestra. Más niveles reducen el error de cuantización, pero generan más bits.",
    challenge: "Compara 4 y 16 niveles. ¿Cuál sigue mejor a la señal y cuál genera más bits por muestra?",
    answer: "Con 16 niveles la aproximación es más precisa, pero cada muestra requiere 4 bits; con 4 niveles requiere solo 2 bits."
  },
  ASK: {
    family: "digital",
    title: "Modulación por desplazamiento de amplitud",
    summary: "Cada bit selecciona una amplitud de portadora; en OOK el bit 0 casi apaga la señal.",
    target: "AMPLITUD SEGÚN EL BIT",
    properties: [["Amplitud", "A₀ / A₁", true], ["Frecuencia", "Constante", false], ["Fase", "Constante", false]],
    equation: "s(t) = A<sub>b</sub> cos(2πf<sub>c</sub>t), &nbsp; A<sub>b</sub> ∈ {A<sub>0</sub>, A<sub>1</sub>}",
    note: "La visualización permite variar A₀. Si A₀ = 0 se obtiene OOK (On-Off Keying).",
    challenge: "Lleva la amplitud para el bit 0 a cero. ¿Qué técnica particular estás observando?",
    answer: "Es OOK: la presencia de portadora representa 1 y su ausencia representa 0."
  },
  FSK: {
    family: "digital",
    title: "Modulación por desplazamiento de frecuencia",
    summary: "Cada bit selecciona una frecuencia: f₀ para 0 y f₁ para 1.",
    target: "FRECUENCIA SEGÚN EL BIT",
    properties: [["Amplitud", "Constante", false], ["Frecuencia", "f₀ / f₁", true], ["Fase", "Continua*", false]],
    equation: "s(t) = A<sub>c</sub> cos(2πf<sub>b</sub>t + φ), &nbsp; f<sub>b</sub> ∈ {f<sub>0</sub>, f<sub>1</sub>}",
    note: "La simulación usa números enteros de ciclos por bit para conservar continuidad de fase entre intervalos.",
    challenge: "Cambia f₀ y f₁ hasta hacerlas muy parecidas. ¿Qué dificultad tendría el receptor?",
    answer: "Le resultaría más difícil distinguir los dos tonos en presencia de ruido o con un intervalo de observación corto."
  },
  PSK: {
    family: "digital",
    title: "Modulación por desplazamiento de fase",
    summary: "En BPSK, los bits seleccionan dos fases separadas 180°.",
    target: "FASE SEGÚN EL BIT",
    properties: [["Amplitud", "Constante", false], ["Frecuencia", "Constante", false], ["Fase", "0° / 180°", true]],
    equation: "s(t) = A<sub>c</sub> cos(2πf<sub>c</sub>t + φ<sub>b</sub>), &nbsp; φ<sub>b</sub> ∈ {0, π}",
    note: "BPSK tiene dos símbolos. En la constelación aparecen como dos puntos opuestos sobre el eje I.",
    challenge: "¿Por qué los dos puntos de BPSK están en lados opuestos de la constelación?",
    answer: "Porque una diferencia de fase de 180° invierte el signo de la portadora: los símbolos quedan en +I y −I."
  },
  QAM: {
    family: "digital",
    title: "Modulación de amplitud en cuadratura",
    summary: "Dos portadoras ortogonales transportan componentes I y Q; cada grupo de bits selecciona un símbolo.",
    target: "AMPLITUDES I Y Q",
    properties: [["Amplitud", "Combinada", true], ["Frecuencia", "Constante", false], ["Fase", "Por símbolo", true]],
    equation: "s(t) = I<sub>k</sub> cos(2πf<sub>c</sub>t) − Q<sub>k</sub> sin(2πf<sub>c</sub>t)",
    note: "El orden M determina cuántos puntos tiene la constelación y cuántos bits contiene cada símbolo.",
    challenge: "¿Cuántos bits representa cada símbolo y cómo se relaciona con el número de puntos?",
    answer: "Cada símbolo representa log₂(M) bits: 2 en 4-QAM, 3 en 8-QAM y 4 en 16-QAM."
  }
};

const PRACTICE_ORDER = ["AM", "FM", "PM", "PAM", "PWM", "PPM", "PCM", "ASK", "FSK", "PSK", "QAM"];

const PRACTICES = {
  AM: {
    objective: "Identificar cómo la información modifica la amplitud de la portadora y reconocer la sobremodulación.",
    concept: "En AM, la envolvente de la señal modulada sigue la forma de la información. El índice μ controla qué tan profunda es esa variación.",
    baseline: { msgFreq: 1, msgAmp: 0.8, carrierFreq: 8, carrierAmp: 1, modIndex: 0.3 },
    baselineRows: [["Frecuencia de información", "1 Hz"], ["Amplitud de información", "0.8"], ["Frecuencia portadora", "8 Hz"], ["Amplitud portadora", "1"], ["Índice μ", "0.3"]],
    steps: [
      { title: "Reconoce la envolvente", instruction: "Aplica los valores iniciales. Compara la señal de información con las dos líneas punteadas que rodean la señal AM.", change: "Mantén μ = 0.3", observe: "Los máximos y mínimos de la información coinciden con la expansión y contracción de la envolvente." },
      { title: "Aumenta la profundidad", instruction: "Cambia únicamente el índice de modulación de 0.3 a 0.8 y compara la nueva envolvente con la anterior.", change: "Cambia μ: 0.3 → 0.8", observe: "La envolvente cambia con mayor profundidad, pero la separación entre los ciclos de la portadora se conserva." },
      { title: "Provoca sobremodulación", instruction: "Predice qué ocurrirá y después cambia μ a 1.2. Observa los puntos donde la envolvente se cruza o invierte.", change: "Cambia μ: 0.8 → 1.2", observe: "Cuando μ supera 1 aparece sobremodulación y la envolvente deja de representar fielmente la información." }
    ],
    quiz: [
      { question: "¿Qué propiedad de la portadora representa la información en AM?", options: ["La frecuencia", "La amplitud", "La velocidad de propagación", "El periodo de muestreo"], correct: 1, explanation: "AM significa modulación en amplitud: la información controla la amplitud de la portadora." },
      { question: "¿Qué observaste al aumentar μ de 0.3 a 0.8?", options: ["Aumentó la profundidad de la envolvente", "Disminuyó la frecuencia portadora", "La señal se volvió digital", "Desapareció la información"], correct: 0, explanation: "Un índice mayor produce una variación más profunda de la amplitud." },
      { question: "¿Qué fenómeno aparece cuando μ supera 1?", options: ["Cuantización", "Multiplexación", "Sobremodulación", "Muestreo"], correct: 2, explanation: "Con μ > 1 la envolvente cruza por cero y se distorsiona." }
    ]
  },
  FM: {
    objective: "Relacionar el valor de la información con la frecuencia instantánea de la portadora.",
    concept: "En FM la amplitud permanece constante. La información hace que los ciclos se junten o se separen alrededor de una frecuencia central.",
    baseline: { msgFreq: 1, msgAmp: 0.8, carrierFreq: 8, carrierAmp: 1, freqDeviation: 1 },
    baselineRows: [["Frecuencia de información", "1 Hz"], ["Amplitud de información", "0.8"], ["Frecuencia portadora", "8 Hz"], ["Amplitud portadora", "1"], ["Desviación Δf", "1 Hz"]],
    steps: [
      { title: "Encuentra los cambios", instruction: "Aplica el caso inicial y localiza zonas donde los ciclos FM están más juntos y más separados.", change: "Mantén Δf = 1 Hz", observe: "La altura de la señal permanece constante; cambia la cantidad de ciclos por intervalo." },
      { title: "Aumenta la desviación", instruction: "Cambia únicamente Δf de 1 Hz a 5 Hz y observa la diferencia entre las frecuencias extremas.", change: "Cambia Δf: 1 → 5 Hz", observe: "Los ciclos se comprimen y expanden con mayor intensidad sin cambiar su amplitud." },
      { title: "Relaciona información y frecuencia", instruction: "Compara los máximos positivos y negativos de m(t) con la densidad de ciclos de FM.", change: "Conserva Δf = 5 Hz", observe: "En esta convención, un valor positivo aumenta la frecuencia instantánea y uno negativo la reduce." }
    ],
    quiz: [
      { question: "¿Qué propiedad transporta la información en FM?", options: ["La amplitud", "La frecuencia instantánea", "El ancho de pulso", "El nivel de cuantización"], correct: 1, explanation: "FM representa la información mediante variaciones de frecuencia." },
      { question: "¿Qué cambia al aumentar Δf?", options: ["La altura máxima", "La diferencia entre las frecuencias extremas", "La secuencia de bits", "El número de niveles"], correct: 1, explanation: "Δf determina cuánto puede alejarse la frecuencia instantánea de la portadora central." },
      { question: "¿Qué característica se mantuvo constante en la gráfica FM?", options: ["La frecuencia", "La fase instantánea", "La amplitud", "La distancia entre ciclos"], correct: 2, explanation: "La envolvente de FM conserva una amplitud constante." }
    ]
  },
  PM: {
    objective: "Reconocer cómo la información adelanta o retrasa la fase de una portadora.",
    concept: "En PM, la fase sigue directamente el valor de la información. La amplitud permanece constante, aunque visualmente también aparecen cambios instantáneos de frecuencia.",
    baseline: { msgFreq: 1, msgAmp: 0.8, carrierFreq: 8, carrierAmp: 1, phaseIndex: 0.5 },
    baselineRows: [["Frecuencia de información", "1 Hz"], ["Amplitud de información", "0.8"], ["Frecuencia portadora", "8 Hz"], ["Amplitud portadora", "1"], ["Sensibilidad kₚ", "0.5 rad"]],
    steps: [
      { title: "Compara las fases", instruction: "Aplica el caso inicial y compara las posiciones de crestas y cruces por cero entre portadora y señal PM.", change: "Mantén kₚ = 0.5 rad", observe: "Algunos ciclos aparecen adelantados o retrasados respecto de la referencia." },
      { title: "Amplía el desplazamiento", instruction: "Cambia únicamente kₚ de 0.5 a 2.5 rad y observa cuánto se desplazan los ciclos.", change: "Cambia kₚ: 0.5 → 2.5 rad", observe: "El desplazamiento de fase crece, mientras la amplitud máxima permanece igual." },
      { title: "Distingue fase y frecuencia", instruction: "Observa dónde m(t) cambia con mayor rapidez y relaciona esos tramos con la separación momentánea de los ciclos.", change: "Conserva kₚ = 2.5 rad", observe: "La frecuencia instantánea también varía porque representa la rapidez de cambio de la fase." }
    ],
    quiz: [
      { question: "¿Qué parámetro controla directamente la información en PM?", options: ["La fase", "La amplitud", "La posición del pulso", "La frecuencia de muestreo"], correct: 0, explanation: "PM codifica la información mediante desplazamientos de fase." },
      { question: "¿Qué ocurrió al aumentar kₚ?", options: ["Desapareció la portadora", "Aumentó el desplazamiento de fase", "Bajó la amplitud", "Aparecieron niveles digitales"], correct: 1, explanation: "kₚ determina la sensibilidad de la fase ante la información." },
      { question: "¿Por qué una señal PM también parece cambiar de frecuencia?", options: ["Porque la frecuencia es la rapidez de cambio de la fase", "Porque su amplitud es cero", "Porque se cuantiza", "Porque elimina la portadora"], correct: 0, explanation: "Una fase que cambia con distinta rapidez produce variaciones de frecuencia instantánea." }
    ]
  },
  PAM: {
    objective: "Comprobar que la altura de cada pulso representa el valor de una muestra de la señal.",
    concept: "PAM toma muestras periódicas de m(t). Todos los pulsos conservan posición y ancho; su altura cambia con el valor muestreado.",
    baseline: { msgFreq: 1, msgAmp: 0.8, sampleRate: 6, pulseWidth: 0.25 },
    baselineRows: [["Frecuencia de información", "1 Hz"], ["Amplitud de información", "0.8"], ["Frecuencia de muestreo", "6 muestras/s"], ["Ancho relativo", "0.25"]],
    steps: [
      { title: "Relaciona muestra y pulso", instruction: "Aplica el caso inicial y compara la altura de cada pulso PAM con el valor de m(t) en el mismo instante.", change: "Mantén 6 muestras/s", observe: "Cada pulso toma una altura positiva o negativa semejante a la muestra correspondiente." },
      { title: "Toma más muestras", instruction: "Cambia únicamente la frecuencia de muestreo de 6 a 12 muestras/s.", change: "Cambia fₛ: 6 → 12 muestras/s", observe: "Aparecen más pulsos y se representa con mayor detalle la evolución de m(t)." },
      { title: "Cambia la señal", instruction: "Reduce la amplitud de información de 0.8 a 0.4 y observa las alturas PAM.", change: "Cambia Aₘ: 0.8 → 0.4", observe: "Las alturas se reducen proporcionalmente; el ancho y la posición no cambian." }
    ],
    quiz: [
      { question: "¿Qué característica de los pulsos cambia en PAM?", options: ["La altura", "La posición", "El ancho", "El orden temporal"], correct: 0, explanation: "La amplitud o altura de cada pulso representa una muestra." },
      { question: "¿Qué produjo aumentar la frecuencia de muestreo?", options: ["Menos pulsos", "Más muestras por segundo", "Pulsos más anchos", "Una portadora más baja"], correct: 1, explanation: "Una frecuencia de muestreo mayor genera más muestras en el mismo tiempo." },
      { question: "Si disminuye la amplitud de m(t), ¿qué ocurre con PAM?", options: ["Los pulsos se desplazan", "Las alturas disminuyen", "El ancho aumenta", "Los pulsos desaparecen siempre"], correct: 1, explanation: "Las alturas PAM siguen directamente los valores muestreados." }
    ]
  },
  PWM: {
    objective: "Identificar cómo el valor de la información modifica el ancho de los pulsos.",
    concept: "PWM conserva la altura y el inicio periódico de cada pulso. La información se representa mediante su duración o ciclo de trabajo.",
    baseline: { msgFreq: 1, msgAmp: 0.8, sampleRate: 8, pwmDepth: 0.3 },
    baselineRows: [["Frecuencia de información", "1 Hz"], ["Amplitud de información", "0.8"], ["Frecuencia de muestreo", "8 muestras/s"], ["Profundidad de ancho", "0.3"]],
    steps: [
      { title: "Observa el ancho", instruction: "Aplica el caso inicial y compara los pulsos que coinciden con máximos y mínimos de m(t).", change: "Mantén profundidad = 0.3", observe: "Los valores positivos producen pulsos más anchos y los negativos, más estrechos." },
      { title: "Aumenta el contraste", instruction: "Cambia únicamente la profundidad de ancho de 0.3 a 0.9.", change: "Cambia profundidad: 0.3 → 0.9", observe: "La diferencia entre pulsos anchos y estrechos se vuelve más evidente." },
      { title: "Comprueba lo constante", instruction: "Revisa las crestas y los inicios de todos los pulsos PWM.", change: "Conserva profundidad = 0.9", observe: "La altura permanece constante y los pulsos comienzan en intervalos regulares." }
    ],
    quiz: [
      { question: "¿Dónde se encuentra la información en PWM?", options: ["En la altura", "En la duración de los pulsos", "En la fase senoidal", "En niveles binarios PCM"], correct: 1, explanation: "PWM significa modulación por ancho de pulsos." },
      { question: "¿Qué ocurrió al aumentar la profundidad de ancho?", options: ["Aumentó la diferencia entre anchos", "Cambió la altura", "Se redujo el número de muestras", "Desapareció el reloj"], correct: 0, explanation: "La profundidad controla cuánto puede variar el ciclo de trabajo." },
      { question: "¿Qué propiedad se mantuvo constante?", options: ["El ancho", "La altura de los pulsos", "El valor de m(t)", "El ciclo de trabajo"], correct: 1, explanation: "En PWM ideal cambia el ancho, no la amplitud del pulso." }
    ]
  },
  PPM: {
    objective: "Relacionar el valor de cada muestra con el desplazamiento temporal de un pulso.",
    concept: "PPM conserva la altura y el ancho. Cada pulso se adelanta o retrasa respecto de una posición de referencia dentro de su intervalo.",
    baseline: { msgFreq: 1, msgAmp: 0.8, sampleRate: 8, ppmShift: 0.2 },
    baselineRows: [["Frecuencia de información", "1 Hz"], ["Amplitud de información", "0.8"], ["Frecuencia de muestreo", "8 muestras/s"], ["Desplazamiento máximo", "0.2"]],
    steps: [
      { title: "Usa el reloj como referencia", instruction: "Aplica el caso inicial y compara la posición de los pulsos PPM con los pulsos regulares del reloj.", change: "Mantén desplazamiento = 0.2", observe: "Los pulsos aparecen ligeramente adelantados o retrasados dentro de cada intervalo." },
      { title: "Aumenta el desplazamiento", instruction: "Cambia únicamente el desplazamiento máximo de 0.2 a 0.8.", change: "Cambia desplazamiento: 0.2 → 0.8", observe: "Las diferencias de posición se hacen mayores sin modificar altura ni ancho." },
      { title: "Relaciona signo y posición", instruction: "Compara muestras positivas y negativas con la posición del pulso dentro de su intervalo.", change: "Conserva desplazamiento = 0.8", observe: "En la convención mostrada, el signo de la muestra determina si el pulso se adelanta o se retrasa." }
    ],
    quiz: [
      { question: "¿Qué característica transporta la información en PPM?", options: ["La altura", "El ancho", "La posición temporal", "El código binario"], correct: 2, explanation: "PPM representa cada muestra mediante un desplazamiento temporal." },
      { question: "¿Qué produjo aumentar el desplazamiento máximo?", options: ["Pulsos más altos", "Mayor separación respecto a la posición central", "Más niveles", "Menor frecuencia de información"], correct: 1, explanation: "El control amplía cuánto puede adelantarse o retrasarse un pulso." },
      { question: "¿Por qué es útil el reloj de referencia en PPM?", options: ["Para medir el desplazamiento", "Para cambiar la altura", "Para cuantizar", "Para crear QAM"], correct: 0, explanation: "La posición solo puede interpretarse comparándola con una referencia temporal." }
    ]
  },
  PCM: {
    objective: "Distinguir muestreo, cuantización y codificación, y relacionar niveles con bits por muestra.",
    concept: "PCM convierte muestras analógicas en niveles discretos y después asigna una palabra binaria a cada nivel.",
    baseline: { msgFreq: 1, msgAmp: 0.8, sampleRate: 8, quantLevels: 4 },
    baselineRows: [["Frecuencia de información", "1 Hz"], ["Amplitud de información", "0.8"], ["Frecuencia de muestreo", "8 muestras/s"], ["Niveles de cuantización", "4"]],
    steps: [
      { title: "Identifica las etapas", instruction: "Aplica el caso inicial y sigue la señal original, las muestras cuantizadas y el flujo binario PCM.", change: "Mantén 4 niveles", observe: "Los valores continuos se aproximan a uno de cuatro niveles y cada muestra produce 2 bits." },
      { title: "Aumenta los niveles", instruction: "Cambia únicamente los niveles de cuantización de 4 a 8.", change: "Cambia niveles: 4 → 8", observe: "La escalera sigue mejor a m(t), pero ahora se necesitan 3 bits por muestra." },
      { title: "Compara con 16 niveles", instruction: "Predice los bits necesarios y cambia los niveles de 8 a 16.", change: "Cambia niveles: 8 → 16", observe: "La aproximación mejora y cada muestra requiere 4 bits." }
    ],
    quiz: [
      { question: "¿Cuál es el orden correcto del proceso PCM?", options: ["Codificación → muestreo → cuantización", "Muestreo → cuantización → codificación", "Cuantización → modulación → muestreo", "Frecuencia → fase → amplitud"], correct: 1, explanation: "Primero se toman muestras, luego se asignan niveles y finalmente se codifican." },
      { question: "¿Cuántos bits por muestra requieren 8 niveles?", options: ["2", "3", "4", "8"], correct: 1, explanation: "Con 3 bits existen 2³ = 8 combinaciones." },
      { question: "¿Qué efecto tiene aumentar los niveles de cuantización?", options: ["Aproxima mejor la señal y aumenta los bits necesarios", "Elimina el muestreo", "Reduce siempre la frecuencia", "Convierte PCM en PWM"], correct: 0, explanation: "Más niveles reducen el error visual de cuantización, a costa de más bits." }
    ]
  },
  ASK: {
    objective: "Relacionar los bits con dos amplitudes de portadora e identificar el caso OOK.",
    concept: "ASK asigna una amplitud a cada símbolo. Si la amplitud del bit 0 es cero, la portadora se enciende para 1 y se apaga para 0.",
    baseline: { bitSequence: "10110010", carrierCycles: 4, carrierAmp: 1, askZero: 0 },
    baselineRows: [["Secuencia", "10110010"], ["Ciclos por bit", "4"], ["Amplitud portadora", "1"], ["Amplitud del bit 0", "0"]],
    steps: [
      { title: "Reconoce OOK", instruction: "Aplica el caso inicial y relaciona cada bit con la presencia o ausencia de portadora.", change: "Mantén A₀ = 0", observe: "Los intervalos con 1 contienen portadora y los intervalos con 0 quedan en cero." },
      { title: "Crea dos amplitudes", instruction: "Cambia únicamente la amplitud del bit 0 de 0 a 0.5.", change: "Cambia A₀: 0 → 0.5", observe: "La portadora ya no desaparece: los bits se distinguen mediante dos amplitudes." },
      { title: "Comprueba lo constante", instruction: "Cuenta los ciclos en intervalos con 0 y con 1.", change: "Conserva A₀ = 0.5", observe: "La frecuencia y la fase permanecen iguales; solo cambia la amplitud." }
    ],
    quiz: [
      { question: "¿Qué propiedad cambia entre símbolos ASK?", options: ["La amplitud", "La frecuencia", "La posición", "El número de muestras"], correct: 0, explanation: "ASK usa diferentes amplitudes para representar símbolos." },
      { question: "¿Cómo se llama ASK cuando A₀ = 0?", options: ["BPSK", "OOK", "PCM", "PPM"], correct: 1, explanation: "On-Off Keying representa los bits encendiendo y apagando la portadora." },
      { question: "Al cambiar A₀ de 0 a 0.5, ¿qué permaneció constante?", options: ["La amplitud", "La frecuencia de la portadora", "La información", "La altura de ambos símbolos"], correct: 1, explanation: "ASK no necesita cambiar la frecuencia de la portadora." }
    ]
  },
  FSK: {
    objective: "Distinguir bits mediante el número de ciclos presentes en cada intervalo.",
    concept: "FSK asigna una frecuencia a 0 y otra a 1. La amplitud puede permanecer constante mientras cambia la densidad de ciclos.",
    baseline: { bitSequence: "10110010", carrierCycles: 4, carrierAmp: 1, fskZero: 2, fskOne: 5 },
    baselineRows: [["Secuencia", "10110010"], ["Amplitud", "1"], ["Frecuencia para 0", "2 ciclos/bit"], ["Frecuencia para 1", "5 ciclos/bit"]],
    steps: [
      { title: "Cuenta los ciclos", instruction: "Aplica el caso inicial y cuenta los ciclos en un intervalo con 0 y otro con 1.", change: "f₀ = 2 y f₁ = 5 ciclos/bit", observe: "Los unos presentan más ciclos que los ceros, con la misma amplitud." },
      { title: "Acerca las frecuencias", instruction: "Cambia f₀ de 2 a 4 y conserva f₁ = 5.", change: "Cambia f₀: 2 → 4 ciclos/bit", observe: "La diferencia visual entre ambos símbolos se vuelve menor." },
      { title: "Separa los tonos", instruction: "Regresa f₀ a 1 y cambia f₁ a 7 para maximizar la diferencia.", change: "Usa f₀ = 1 y f₁ = 7", observe: "Los símbolos se distinguen fácilmente por su número de ciclos." }
    ],
    quiz: [
      { question: "¿Qué característica representa los bits en FSK?", options: ["La frecuencia", "La amplitud", "El ancho de pulso", "La cuantización"], correct: 0, explanation: "FSK selecciona una frecuencia distinta para cada símbolo." },
      { question: "Con f₀ = 2 y f₁ = 5, ¿qué bit presenta más ciclos?", options: ["El bit 0", "El bit 1", "Ambos", "Ninguno"], correct: 1, explanation: "f₁ es mayor, por lo que el intervalo del bit 1 contiene más ciclos." },
      { question: "¿Qué ocurre cuando f₀ y f₁ son muy parecidas?", options: ["Es más difícil distinguir los símbolos", "La amplitud se duplica", "Se produce PCM", "Desaparecen los bits"], correct: 0, explanation: "Una separación pequeña hace que los dos tonos se parezcan más." }
    ]
  },
  PSK: {
    objective: "Reconocer la inversión de fase de 180° utilizada para representar bits en BPSK.",
    concept: "BPSK utiliza dos fases opuestas. Los puntos de su constelación aparecen en lados contrarios del eje I.",
    baseline: { bitSequence: "10110010", carrierCycles: 4, carrierAmp: 1 },
    baselineRows: [["Secuencia", "10110010"], ["Ciclos por bit", "4"], ["Amplitud portadora", "1"], ["Esquema", "BPSK"]],
    steps: [
      { title: "Compara 0 y 1", instruction: "Aplica el caso inicial y compara el inicio de un intervalo con bit 0 y otro con bit 1.", change: "Mantén la secuencia 10110010", observe: "Las ondas tienen la misma amplitud y frecuencia, pero aparecen invertidas." },
      { title: "Localiza transiciones", instruction: "Busca límites 1→0 y 0→1 y observa el cambio de orientación de la onda.", change: "Observa los límites de bit", observe: "Cuando el bit cambia, la fase seleccionada cambia 180°." },
      { title: "Interpreta la constelación", instruction: "Relaciona los bits con los dos puntos opuestos mostrados en el plano I–Q.", change: "Compara los puntos 0 y 1", observe: "Dos puntos opuestos representan las dos fases posibles de BPSK." }
    ],
    quiz: [
      { question: "¿Qué propiedad distingue los bits en BPSK?", options: ["La fase", "La amplitud", "La frecuencia", "El ancho"], correct: 0, explanation: "BPSK utiliza dos fases separadas 180°." },
      { question: "¿Cuántos puntos tiene la constelación BPSK?", options: ["1", "2", "4", "8"], correct: 1, explanation: "Hay un punto por cada uno de los dos símbolos posibles." },
      { question: "Entre los dos símbolos BPSK, ¿qué se conserva?", options: ["Amplitud y frecuencia", "Fase y amplitud", "Posición de pulso", "Código PCM"], correct: 0, explanation: "Los símbolos cambian de fase, pero conservan amplitud y frecuencia." }
    ]
  },
  QAM: {
    objective: "Relacionar el orden QAM con los puntos de la constelación y los bits transportados por símbolo.",
    concept: "QAM combina dos componentes ortogonales, I y Q. Cada combinación selecciona un punto cuya amplitud y fase representan varios bits.",
    baseline: { bitSequence: "00101101", carrierCycles: 4, carrierAmp: 1, qamOrder: 4 },
    baselineRows: [["Secuencia", "00101101"], ["Ciclos por bit", "4"], ["Amplitud portadora", "1"], ["Orden inicial", "4-QAM"]],
    steps: [
      { title: "Explora 4-QAM", instruction: "Aplica el caso inicial y observa cómo la secuencia se agrupa de dos en dos en la señal y la constelación.", change: "Selecciona 4-QAM", observe: "La constelación tiene 4 puntos y cada símbolo representa 2 bits." },
      { title: "Cambia a 8-QAM", instruction: "Selecciona 8-QAM y observa la nueva agrupación de bits y la constelación rectangular.", change: "Cambia 4-QAM → 8-QAM", observe: "Aparecen 8 puntos organizados en 4 × 2 y cada símbolo representa 3 bits." },
      { title: "Compara 16-QAM", instruction: "Selecciona 16-QAM y compara el número de puntos y bits por símbolo con los casos anteriores.", change: "Cambia 8-QAM → 16-QAM", observe: "La constelación tiene 16 puntos y cada símbolo representa 4 bits." }
    ],
    quiz: [
      { question: "¿Cuántos bits representa un símbolo de 8-QAM?", options: ["2", "3", "4", "8"], correct: 1, explanation: "2³ = 8, por lo que se requieren 3 bits para seleccionar uno de ocho símbolos." },
      { question: "¿Qué características combina QAM para formar símbolos?", options: ["Amplitud y fase", "Frecuencia y muestreo", "Ancho y posición", "Tiempo y cuantización"], correct: 0, explanation: "Las componentes I y Q producen combinaciones de amplitud y fase." },
      { question: "¿Qué relación es correcta?", options: ["4-QAM = 4 bits/símbolo", "8-QAM = 8 bits/símbolo", "16-QAM = 4 bits/símbolo", "16-QAM = 16 bits/símbolo"], correct: 2, explanation: "log₂(16) = 4 bits por símbolo." }
    ]
  }
};

const INITIAL = Object.freeze({
  mode: "AM",
  msgFreq: 1,
  msgAmp: 0.8,
  carrierFreq: 8,
  carrierAmp: 1,
  modIndex: 0.8,
  freqDeviation: 3,
  phaseIndex: 1.8,
  sampleRate: 8,
  pulseWidth: 0.28,
  pwmDepth: 0.85,
  ppmShift: 0.72,
  quantLevels: 8,
  bitSequence: "10110010",
  carrierCycles: 4,
  askZero: 0.18,
  fskZero: 2,
  fskOne: 5,
  qamOrder: 4
});

const state = { ...INITIAL, rangeMax: {}, playing: true, playhead: 0, lastFrame: performance.now(), currentView: "simulator" };
const practiceState = Object.fromEntries(PRACTICE_ORDER.map(mode => [mode, { stage: 0, answers: [null, null, null], checked: false, notice: "" }]));
let activePracticeTask = null;

const COLORS = {
  info: "#ee7b45",
  reference: "#13a8b7",
  output: "#7357d6",
  grid: "#e8edf3",
  axis: "#aab4c3",
  text: "#657087",
  navy: "#102d4f",
  bandA: "rgba(115,87,214,.055)",
  bandB: "rgba(19,168,183,.045)",
  playhead: "rgba(16,45,79,.62)"
};

const els = {
  modeBadge: document.querySelector("#modeBadge"),
  modeTitle: document.querySelector("#modeTitle"),
  modeSummary: document.querySelector("#modeSummary"),
  changeFlow: document.querySelector("#changeFlow"),
  propertyIndicators: document.querySelector("#propertyIndicators"),
  dynamicControls: document.querySelector("#dynamicControls"),
  bitInputGroup: document.querySelector("#bitInputGroup"),
  bitSequence: document.querySelector("#bitSequence"),
  equation: document.querySelector("#equation"),
  equationNote: document.querySelector("#equationNote"),
  playPause: document.querySelector("#playPause"),
  playIcon: document.querySelector("#playIcon"),
  playText: document.querySelector("#playText"),
  resetAnimation: document.querySelector("#resetAnimation"),
  defaultsButton: document.querySelector("#defaultsButton"),
  randomBits: document.querySelector("#randomBits"),
  bitHelp: document.querySelector("#bitHelp"),
  exportPng: document.querySelector("#exportPng"),
  timeStatus: document.querySelector("#timeStatus"),
  plot1Title: document.querySelector("#plot1Title"),
  plot1Meta: document.querySelector("#plot1Meta"),
  plot2Title: document.querySelector("#plot2Title"),
  plot2Meta: document.querySelector("#plot2Meta"),
  plot3Title: document.querySelector("#plot3Title"),
  plot3Meta: document.querySelector("#plot3Meta"),
  plot1: document.querySelector("#plot1"),
  plot2: document.querySelector("#plot2"),
  plot3: document.querySelector("#plot3"),
  specialView: document.querySelector("#specialView"),
  specialKicker: document.querySelector("#specialKicker"),
  specialTitle: document.querySelector("#specialTitle"),
  specialDescription: document.querySelector("#specialDescription"),
  specialCanvas: document.querySelector("#specialCanvas"),
  pcmPipeline: document.querySelector("#pcmPipeline"),
  simulatorTab: document.querySelector("#simulatorTab"),
  practiceTab: document.querySelector("#practiceTab"),
  simulatorTabButton: document.querySelector("#simulatorTabButton"),
  practiceTabButton: document.querySelector("#practiceTabButton"),
  activeTaskBanner: document.querySelector("#activeTaskBanner"),
  activeTaskLabel: document.querySelector("#activeTaskLabel"),
  activeTaskText: document.querySelector("#activeTaskText"),
  backToGuide: document.querySelector("#backToGuide"),
  practiceTitle: document.querySelector("#practiceTitle"),
  practiceObjective: document.querySelector("#practiceObjective"),
  practicePosition: document.querySelector("#practicePosition"),
  practiceOrder: document.querySelector("#practiceOrder"),
  practiceStageButtons: document.querySelector("#practiceStageButtons"),
  practiceProgressBar: document.querySelector("#practiceProgressBar"),
  practiceProgressText: document.querySelector("#practiceProgressText"),
  practiceContent: document.querySelector("#practiceContent")
};

const CONTROL_GROUPS = {
  analog: [
    ["msgFreq", "Frecuencia de información", 0.5, 2.5, 0.1, " Hz"],
    ["msgAmp", "Amplitud de información", 0.2, 1, 0.05, ""],
    ["carrierFreq", "Frecuencia portadora", 5, 15, 1, " Hz"],
    ["carrierAmp", "Amplitud portadora", 0.4, 1.4, 0.1, ""]
  ],
  pulse: [
    ["msgFreq", "Frecuencia de información", 0.5, 2.5, 0.1, " Hz"],
    ["msgAmp", "Amplitud de información", 0.2, 1, 0.05, ""],
    ["sampleRate", "Frecuencia de muestreo", 4, 16, 1, " muestras/s"]
  ],
  digital: [
    ["carrierCycles", "Ciclos de portadora por bit", 2, 7, 1, ""],
    ["carrierAmp", "Amplitud portadora", 0.4, 1.4, 0.1, ""]
  ]
};

const MODE_CONTROLS = {
  AM: [["modIndex", "Índice de modulación μ", 0, 1.4, 0.05, ""]],
  FM: [["freqDeviation", "Desviación de frecuencia Δf", 0.5, 6, 0.5, " Hz"]],
  PM: [["phaseIndex", "Sensibilidad de fase kₚ", 0.2, 3.2, 0.1, " rad"]],
  PAM: [["pulseWidth", "Ancho relativo del pulso", 0.12, 0.7, 0.02, ""]],
  PWM: [["pwmDepth", "Profundidad de ancho", 0.1, 1, 0.05, ""]],
  PPM: [["ppmShift", "Desplazamiento máximo", 0.1, 0.9, 0.05, ""]],
  PCM: [["quantLevels", "Niveles de cuantización", 4, 16, 4, " niveles"]],
  ASK: [["askZero", "Amplitud para bit 0", 0, 0.8, 0.05, " × Aᶜ"]],
  FSK: [
    ["fskZero", "Frecuencia para bit 0", 1, 5, 1, " ciclos/bit"],
    ["fskOne", "Frecuencia para bit 1", 3, 8, 1, " ciclos/bit"]
  ],
  PSK: [],
  QAM: []
};

const MAX_LIMITS = {
  msgFreq: 10,
  msgAmp: 2,
  carrierFreq: 60,
  carrierAmp: 3,
  modIndex: 3,
  freqDeviation: 20,
  phaseIndex: 8,
  sampleRate: 48,
  pulseWidth: 0.95,
  pwmDepth: 1,
  ppmShift: 1,
  quantLevels: 32,
  carrierCycles: 16,
  askZero: 1.5,
  fskZero: 16,
  fskOne: 16
};

function qamBitsPerSymbol() { return Math.log2(state.qamOrder); }

function qamConstellation() {
  const gray4 = { "00": -3, "01": -1, "11": 1, "10": 3 };
  const binary2 = { "0": -1, "1": 1 };
  const labels = Array.from({ length: state.qamOrder }, (_, index) => index.toString(2).padStart(qamBitsPerSymbol(), "0"));
  const raw = labels.map(label => {
    if (state.qamOrder === 4) return { label, i: binary2[label[0]], q: binary2[label[1]] };
    if (state.qamOrder === 8) return { label, i: gray4[label.slice(0, 2)], q: binary2[label[2]] };
    return { label, i: gray4[label.slice(0, 2)], q: gray4[label.slice(2, 4)] };
  });
  const maxRadius = Math.max(...raw.map(point => Math.hypot(point.i, point.q)));
  return raw.map(point => ({ ...point, i: point.i / maxRadius, q: point.q / maxRadius }));
}

function qamSymbols() {
  const sequence = bits();
  const width = qamBitsPerSymbol();
  const count = Math.ceil(sequence.length / width);
  const map = new Map(qamConstellation().map(point => [point.label, point]));
  return Array.from({ length: count }, (_, index) => {
    const label = Array.from({ length: width }, (__, offset) => sequence[index * width + offset] ?? 0).join("");
    return map.get(label);
  });
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function bits() { return state.bitSequence.split("").map(Number); }
function isDigital() { return MODES[state.mode].family === "digital"; }
function isPulse() { return MODES[state.mode].family === "pulse"; }
function message(t) { return state.msgAmp * Math.sin(2 * Math.PI * state.msgFreq * t); }

function formatValue(value, step, suffix) {
  const decimals = String(step).includes(".") ? Math.min(2, String(step).split(".")[1].length) : 0;
  return `${Number(value).toFixed(decimals)}${suffix}`;
}

function sliderTemplate([key, label, min, max, step, suffix]) {
  const activeMax = state.rangeMax[key] ?? max;
  const progress = ((state[key] - min) / (activeMax - min)) * 100;
  return `
    <div class="slider-row">
      <div class="slider-heading">
        <label for="control-${key}">${label}</label>
        <output id="output-${key}" for="control-${key}">${formatValue(state[key], step, suffix)}</output>
      </div>
      <input id="control-${key}" type="range" min="${min}" max="${activeMax}" step="${step}" value="${state[key]}"
        data-key="${key}" data-suffix="${suffix}" style="--range-progress:${progress}%">
      <div class="range-extents">
        <span>Mín. ${min}</span>
        <span class="range-maximum">
          <label for="maximum-${key}">Máx.</label>
          <input id="maximum-${key}" type="number" min="${min + step}" max="${MAX_LIMITS[key]}" step="${step}"
            value="${activeMax}" data-maximum-for="${key}" aria-label="Valor máximo para ${label}"
            title="Puedes modificar el límite superior hasta ${MAX_LIMITS[key]}">
        </span>
      </div>
    </div>`;
}

function qamSelectorTemplate() {
  return `
    <div class="qam-control">
      <span>Orden de la constelación</span>
      <div class="qam-options" role="group" aria-label="Seleccionar orden QAM">
        ${[4, 8, 16].map(order => `<button class="qam-option ${state.qamOrder === order ? "active" : ""}" type="button" data-qam-order="${order}" aria-pressed="${state.qamOrder === order}">${order}-QAM</button>`).join("")}
      </div>
      <p class="qam-hint">${state.qamOrder === 8 ? "Se usa una constelación rectangular de 4 × 2 puntos." : `${qamBitsPerSymbol()} bits por símbolo.`}</p>
    </div>`;
}

function renderModeUI() {
  const spec = MODES[state.mode];
  els.modeBadge.textContent = state.mode;
  els.modeTitle.textContent = spec.title;
  els.modeSummary.textContent = spec.summary;
  els.changeFlow.innerHTML = `
    <span class="flow-chip">Información</span><span class="flow-arrow">→</span>
    <span>modifica</span><span class="flow-arrow">→</span>
    <span class="flow-chip flow-target">${spec.target}</span>`;
  els.propertyIndicators.innerHTML = spec.properties.map(([name, value, variable]) => `
    <div class="property ${variable ? "variable" : ""}"><span>${name}</span><strong>${value}</strong></div>`).join("");
  els.equation.innerHTML = spec.equation;
  els.equationNote.textContent = state.mode === "QAM"
    ? `${state.qamOrder}-QAM representa ${qamBitsPerSymbol()} bits por símbolo. ${state.qamOrder === 8 ? "La simulación emplea una constelación rectangular de 4 × 2 puntos." : ""}`
    : spec.note;

  document.querySelectorAll(".mode-button").forEach(button => {
    const active = button.dataset.mode === state.mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  els.bitInputGroup.classList.toggle("hidden", !isDigital());
  els.bitSequence.value = state.bitSequence;
  els.bitHelp.textContent = state.mode === "QAM"
    ? `Escribe entre 4 y 16 bits. En ${state.qamOrder}-QAM se agrupan de ${qamBitsPerSymbol()} en ${qamBitsPerSymbol()}.`
    : "Escribe entre 4 y 16 bits.";
  const controls = [...CONTROL_GROUPS[spec.family], ...MODE_CONTROLS[state.mode]];
  els.dynamicControls.innerHTML = `${state.mode === "QAM" ? qamSelectorTemplate() : ""}${controls.map(sliderTemplate).join("")}`;
  els.dynamicControls.querySelectorAll("input[type='range']").forEach(input => {
    input.addEventListener("input", onSliderInput);
  });
  els.dynamicControls.querySelectorAll("input[data-maximum-for]").forEach(input => {
    input.addEventListener("change", onMaximumChange);
    input.addEventListener("blur", onMaximumChange);
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.currentTarget.blur();
      }
    });
  });
  els.dynamicControls.querySelectorAll(".qam-option").forEach(button => button.addEventListener("click", onQamOrderChange));

  updatePlotLabels();
  updateSpecialView();
  renderPractice();
  updateActiveTaskBanner();
  if (state.currentView === "simulator") drawAll();
}

function onSliderInput(event) {
  const input = event.currentTarget;
  const key = input.dataset.key;
  state[key] = Number(input.value);
  const min = Number(input.min);
  const max = Number(input.max);
  input.style.setProperty("--range-progress", `${((state[key] - min) / (max - min)) * 100}%`);
  const control = [...CONTROL_GROUPS[MODES[state.mode].family], ...MODE_CONTROLS[state.mode]].find(c => c[0] === key);
  document.querySelector(`#output-${key}`).textContent = formatValue(state[key], control[4], input.dataset.suffix);
  updateSpecialView();
  drawAll();
}

function onMaximumChange(event) {
  const key = event.currentTarget.dataset.maximumFor;
  const control = [...CONTROL_GROUPS[MODES[state.mode].family], ...MODE_CONTROLS[state.mode]].find(item => item[0] === key);
  if (!control) return;
  const [, , min, defaultMax, step] = control;
  const hardMax = MAX_LIMITS[key];
  const raw = Number(event.currentTarget.value);
  const fallback = state.rangeMax[key] ?? defaultMax;
  const requested = Number.isFinite(raw) ? raw : fallback;
  const aligned = min + Math.round((requested - min) / step) * step;
  const newMax = clamp(aligned, min + step, hardMax);
  state.rangeMax[key] = Number(newMax.toFixed(6));
  if (state[key] > newMax) state[key] = newMax;
  renderModeUI();
}

function onQamOrderChange(event) {
  state.qamOrder = Number(event.currentTarget.dataset.qamOrder);
  state.bitSequence = sanitizeBits(state.bitSequence);
  state.playhead = 0;
  renderModeUI();
}

function updatePlotLabels() {
  if (isDigital()) {
    els.plot1Title.textContent = "Señal de datos · b(t)";
    els.plot1Meta.textContent = `${bits().length} bits`;
    els.plot2Title.textContent = "Portadora de referencia · c(t)";
    els.plot2Meta.textContent = state.mode === "FSK" ? "Comparación temporal" : `${state.carrierCycles} ciclos/bit`;
    els.plot3Title.textContent = state.mode === "QAM" ? `Señal ${state.qamOrder}-QAM · s(t)` : `Señal ${state.mode} · s(t)`;
    els.plot3Meta.textContent = state.mode === "QAM" ? `${qamBitsPerSymbol()} bits/símbolo` : "1 bit/símbolo";
  } else if (isPulse()) {
    els.plot1Title.textContent = "Señal de información · m(t)";
    els.plot1Meta.textContent = "Analógica";
    els.plot2Title.textContent = state.mode === "PCM" ? "Muestreo y cuantización" : "Reloj de muestreo";
    els.plot2Meta.textContent = `${state.sampleRate} muestras/s`;
    els.plot3Title.textContent = state.mode === "PCM" ? "Flujo PCM · bits" : `Señal ${state.mode} · s(t)`;
    els.plot3Meta.textContent = state.mode === "PCM" ? `${Math.ceil(Math.log2(state.quantLevels))} bits/muestra` : "Tren de pulsos";
  } else {
    els.plot1Title.textContent = "Señal de información · m(t)";
    els.plot1Meta.textContent = `${state.msgFreq.toFixed(1)} Hz`;
    els.plot2Title.textContent = "Portadora · c(t)";
    els.plot2Meta.textContent = `${state.carrierFreq} Hz`;
    els.plot3Title.textContent = `Señal ${state.mode} · s(t)`;
    els.plot3Meta.textContent = "Resultado";
  }
}

function updateSpecialView() {
  const constellation = state.mode === "PSK" || state.mode === "QAM";
  const pcm = state.mode === "PCM";
  els.specialView.classList.toggle("hidden", !(constellation || pcm));
  els.specialCanvas.classList.toggle("hidden", pcm);
  els.pcmPipeline.classList.toggle("hidden", !pcm);

  if (constellation) {
    els.specialKicker.textContent = "Vista en el plano I–Q";
    els.specialTitle.textContent = state.mode === "PSK" ? "Constelación BPSK" : `Constelación ${state.qamOrder}-QAM`;
    els.specialDescription.textContent = state.mode === "PSK"
      ? "Cada punto representa una fase posible; los símbolos están separados 180°."
      : `Cada punto representa ${qamBitsPerSymbol()} bits mediante sus componentes en fase (I) y cuadratura (Q).`;
  }

  if (pcm) {
    els.specialKicker.textContent = "De analógico a digital";
    els.specialTitle.textContent = "Etapas de PCM";
    els.specialDescription.textContent = "Sigue el proceso y relaciónalo con las tres gráficas superiores.";
    const bps = Math.ceil(Math.log2(state.quantLevels));
    els.pcmPipeline.innerHTML = `
      <div class="pipeline-step"><strong>1 · Señal</strong><span>m(t) continua</span></div><div class="pipeline-arrow">→</div>
      <div class="pipeline-step"><strong>2 · Muestreo</strong><span>${state.sampleRate} muestras/s</span></div><div class="pipeline-arrow">→</div>
      <div class="pipeline-step"><strong>3 · Cuantización</strong><span>${state.quantLevels} niveles</span></div><div class="pipeline-arrow">→</div>
      <div class="pipeline-step"><strong>4 · Codificación</strong><span>${bps} bits/muestra</span></div>`;
  }
}

const PRACTICE_STAGE_NAMES = ["Introducción", "Experimento 1", "Experimento 2", "Experimento 3", "Evaluación"];

function switchView(view) {
  state.currentView = view;
  const simulatorActive = view === "simulator";
  els.simulatorTab.classList.toggle("hidden", !simulatorActive);
  els.practiceTab.classList.toggle("hidden", simulatorActive);
  els.simulatorTabButton.classList.toggle("active", simulatorActive);
  els.practiceTabButton.classList.toggle("active", !simulatorActive);
  els.simulatorTabButton.setAttribute("aria-selected", String(simulatorActive));
  els.practiceTabButton.setAttribute("aria-selected", String(!simulatorActive));
  if (simulatorActive) requestAnimationFrame(drawAll);
  else renderPractice();
}

function selectMode(mode) {
  state.mode = mode;
  if (state.mode === "QAM") state.bitSequence = sanitizeBits(state.bitSequence);
  state.playhead = 0;
  if (activePracticeTask?.mode !== mode) activePracticeTask = null;
  renderModeUI();
}

function updateActiveTaskBanner() {
  const active = activePracticeTask && activePracticeTask.mode === state.mode;
  els.activeTaskBanner.classList.toggle("hidden", !active);
  if (!active) return;
  const task = PRACTICES[state.mode].steps[activePracticeTask.step];
  els.activeTaskLabel.textContent = `Práctica ${state.mode} · Paso ${activePracticeTask.step + 1} de 3`;
  els.activeTaskText.textContent = task.instruction;
}

function applyPracticeBaseline() {
  const guide = PRACTICES[state.mode];
  Object.entries(guide.baseline).forEach(([key, value]) => {
    if (typeof value === "number" && state.rangeMax[key] !== undefined && value > state.rangeMax[key]) {
      state.rangeMax[key] = Math.min(value, MAX_LIMITS[key] ?? value);
    }
  });
  Object.assign(state, guide.baseline);
  if (state.mode === "QAM") state.bitSequence = sanitizeBits(state.bitSequence);
  state.playhead = 0;
  practiceState[state.mode].notice = "Valores iniciales aplicados correctamente.";
  renderModeUI();
}

function renderPracticeOrder() {
  const pieces = [`<span class="order-label">Ruta sugerida</span>`];
  PRACTICE_ORDER.forEach((mode, index) => {
    pieces.push(`<button class="order-mode ${mode === state.mode ? "active" : ""}" type="button" data-practice-mode="${mode}" aria-label="Abrir práctica de ${mode}">${mode}</button>`);
    if (index < PRACTICE_ORDER.length - 1) pieces.push(`<span class="order-arrow" aria-hidden="true">→</span>`);
  });
  els.practiceOrder.innerHTML = pieces.join("");
  els.practiceOrder.querySelectorAll("[data-practice-mode]").forEach(button => {
    button.addEventListener("click", () => selectMode(button.dataset.practiceMode));
  });
}

function renderPracticeNavigation() {
  const progress = practiceState[state.mode];
  els.practiceStageButtons.innerHTML = PRACTICE_STAGE_NAMES.map((name, index) => `
    <button class="stage-button ${progress.stage === index ? "active" : ""}" type="button" data-stage="${index}" aria-current="${progress.stage === index ? "step" : "false"}">
      <span class="stage-number">${index + 1}</span><span>${name}</span>
    </button>`).join("");
  els.practiceProgressBar.style.width = `${((progress.stage + 1) / PRACTICE_STAGE_NAMES.length) * 100}%`;
  els.practiceProgressText.textContent = `Etapa ${progress.stage + 1} de ${PRACTICE_STAGE_NAMES.length}`;
  els.practiceStageButtons.querySelectorAll("[data-stage]").forEach(button => {
    button.addEventListener("click", () => {
      progress.stage = Number(button.dataset.stage);
      progress.notice = "";
      renderPractice();
    });
  });
}

function practiceFooter(stage) {
  return `
    <div class="practice-footer-nav">
      <button class="practice-nav-button" type="button" data-practice-action="previous" ${stage === 0 ? "disabled" : ""}>← Anterior</button>
      ${stage < 4 ? `<button class="primary-action" type="button" data-practice-action="next">${stage === 3 ? "Ir a la evaluación" : "Siguiente"} →</button>` : ""}
    </div>`;
}

function renderPracticeIntroduction(guide, progress) {
  const rows = guide.baselineRows.map(([parameter, value]) => `<tr><td>${parameter}</td><td>${value}</td></tr>`).join("");
  return `
    <h3>Antes de comenzar</h3>
    <p class="practice-lead">${guide.concept}</p>
    <div class="learning-key"><strong>Propósito</strong><p>${guide.objective}</p></div>
    <h4>Configuración inicial</h4>
    <table class="baseline-table"><thead><tr><th>Parámetro</th><th>Valor</th></tr></thead><tbody>${rows}</tbody></table>
    ${progress.notice ? `<div class="observation-box"><strong>Configuración lista</strong><p>${progress.notice}</p></div>` : ""}
    <div class="practice-actions">
      <button class="primary-action" type="button" data-practice-action="apply-baseline">Aplicar valores iniciales</button>
      <button class="secondary-button" type="button" data-practice-action="open-simulator">Ir al simulador</button>
    </div>
    ${practiceFooter(0)}`;
}

function renderPracticeStep(guide, progress) {
  const stepIndex = progress.stage - 1;
  const step = guide.steps[stepIndex];
  return `
    <p class="section-kicker">Experimento ${stepIndex + 1} de 3</p>
    <h3>${step.title}</h3>
    <p class="task-instruction">${step.instruction}</p>
    <span class="task-change">${step.change}</span>
    <div class="observation-box"><strong>Qué debes identificar</strong><p>${step.observe}</p></div>
    ${progress.notice ? `<div class="learning-key"><strong>Configuración lista</strong><p>${progress.notice}</p></div>` : ""}
    <div class="practice-actions">
      <button class="secondary-button" type="button" data-practice-action="apply-baseline">Restablecer valores iniciales</button>
      <button class="primary-action" type="button" data-practice-action="open-simulator">Ir al simulador con esta tarea</button>
    </div>
    ${practiceFooter(progress.stage)}`;
}

function renderPracticeQuiz(guide, progress) {
  const allAnswered = progress.answers.every(answer => answer !== null);
  const score = progress.answers.reduce((total, answer, index) => total + Number(answer === guide.quiz[index].correct), 0);
  const questions = guide.quiz.map((item, questionIndex) => {
    const selected = progress.answers[questionIndex];
    const statusClass = progress.checked ? (selected === item.correct ? "correct" : "incorrect") : "";
    const options = item.options.map((option, optionIndex) => `
      <label class="quiz-option">
        <input type="radio" name="quiz-${state.mode}-${questionIndex}" value="${optionIndex}" ${selected === optionIndex ? "checked" : ""} ${progress.checked ? "disabled" : ""}>
        <span>${option}</span>
      </label>`).join("");
    return `
      <div class="quiz-question ${statusClass}">
        <fieldset><legend>${questionIndex + 1}. ${item.question}</legend>${options}</fieldset>
        ${progress.checked ? `<p class="quiz-feedback"><strong>${selected === item.correct ? "Correcto." : `Respuesta correcta: ${item.options[item.correct]}.`}</strong> ${item.explanation}</p>` : ""}
      </div>`;
  }).join("");

  return `
    <p class="section-kicker">Comprueba lo aprendido</p>
    <h3>Evaluación de ${state.mode}</h3>
    <p>Responde los tres reactivos y después comprueba tus respuestas.</p>
    <div class="quiz-list">${questions}</div>
    ${progress.checked ? `<div class="result-box"><strong>Resultado: ${score} de 3</strong><p>${score === 3 ? "Has identificado correctamente las características esenciales de esta modulación." : "Revisa la retroalimentación y vuelve al simulador si necesitas comprobar alguna respuesta."}</p></div>` : ""}
    <div class="practice-actions">
      ${progress.checked
        ? `<button class="retry-button" type="button" data-practice-action="retry">Intentar nuevamente</button><button class="secondary-button" type="button" data-practice-action="open-simulator">Volver al simulador</button>`
        : `<button id="checkAnswers" class="check-answers" type="button" data-practice-action="check" ${allAnswered ? "" : "disabled"}>Comprobar respuestas</button>`}
    </div>
    ${practiceFooter(4)}`;
}

function wirePracticeContent() {
  const progress = practiceState[state.mode];
  els.practiceContent.querySelectorAll("[data-practice-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.practiceAction;
      if (action === "apply-baseline") applyPracticeBaseline();
      if (action === "open-simulator") {
        if (progress.stage >= 1 && progress.stage <= 3) activePracticeTask = { mode: state.mode, step: progress.stage - 1 };
        else activePracticeTask = null;
        updateActiveTaskBanner();
        switchView("simulator");
      }
      if (action === "previous" && progress.stage > 0) { progress.stage -= 1; progress.notice = ""; renderPractice(); }
      if (action === "next" && progress.stage < 4) { progress.stage += 1; progress.notice = ""; renderPractice(); }
      if (action === "check" && progress.answers.every(answer => answer !== null)) { progress.checked = true; renderPractice(); }
      if (action === "retry") { progress.answers = [null, null, null]; progress.checked = false; renderPractice(); }
    });
  });

  els.practiceContent.querySelectorAll("input[type='radio']").forEach(input => {
    input.addEventListener("change", event => {
      const questionIndex = Number(event.currentTarget.name.split("-").pop());
      progress.answers[questionIndex] = Number(event.currentTarget.value);
      const checkButton = els.practiceContent.querySelector("#checkAnswers");
      if (checkButton) checkButton.disabled = !progress.answers.every(answer => answer !== null);
    });
  });
}

function renderPractice() {
  if (!els.practiceContent) return;
  const guide = PRACTICES[state.mode];
  const progress = practiceState[state.mode];
  const position = PRACTICE_ORDER.indexOf(state.mode) + 1;
  els.practiceTitle.textContent = `Práctica guiada · ${state.mode}`;
  els.practiceObjective.textContent = guide.objective;
  els.practicePosition.textContent = `${position} de ${PRACTICE_ORDER.length}`;
  renderPracticeOrder();
  renderPracticeNavigation();
  if (progress.stage === 0) els.practiceContent.innerHTML = renderPracticeIntroduction(guide, progress);
  else if (progress.stage <= 3) els.practiceContent.innerHTML = renderPracticeStep(guide, progress);
  else els.practiceContent.innerHTML = renderPracticeQuiz(guide, progress);
  wirePracticeContent();
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(300, rect.width);
  const height = Math.max(120, rect.height);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

function makePlot(canvas, options = {}) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 40, right: 13, top: 11, bottom: 23 };
  const pw = width - pad.left - pad.right;
  const ph = height - pad.top - pad.bottom;
  const yMin = options.yMin ?? -1.4;
  const yMax = options.yMax ?? 1.4;
  const x = u => pad.left + u * pw;
  const y = value => pad.top + (yMax - value) / (yMax - yMin) * ph;

  ctx.fillStyle = "#fbfcfe";
  ctx.fillRect(0, 0, width, height);

  if (options.bands) {
    const count = options.bands.length;
    options.bands.forEach((label, index) => {
      ctx.fillStyle = index % 2 ? COLORS.bandA : COLORS.bandB;
      ctx.fillRect(x(index / count), pad.top, pw / count, ph);
      ctx.strokeStyle = "rgba(170,180,195,.45)";
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(x(index / count), pad.top);
      ctx.lineTo(x(index / count), pad.top + ph);
      ctx.stroke();
      ctx.setLineDash([]);
      if (options.bandLabels !== false) {
        ctx.fillStyle = COLORS.text;
        ctx.font = "700 11px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(label), x((index + 0.5) / count), 10);
      }
    });
  }

  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const gy = pad.top + i * ph / 4;
    ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(width - pad.right, gy); ctx.stroke();
  }
  for (let i = 0; i <= 8; i++) {
    const gx = pad.left + i * pw / 8;
    ctx.beginPath(); ctx.moveTo(gx, pad.top); ctx.lineTo(gx, pad.top + ph); ctx.stroke();
  }

  ctx.strokeStyle = COLORS.axis;
  ctx.lineWidth = 1.2;
  if (yMin < 0 && yMax > 0) {
    ctx.beginPath(); ctx.moveTo(pad.left, y(0)); ctx.lineTo(width - pad.right, y(0)); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top + ph); ctx.stroke();

  ctx.fillStyle = COLORS.text;
  ctx.font = "10px ui-monospace, monospace";
  ctx.textAlign = "right";
  ctx.fillText(String(yMax.toFixed(yMax % 1 ? 1 : 0)), pad.left - 6, pad.top + 7);
  ctx.fillText(String(yMin.toFixed(yMin % 1 ? 1 : 0)), pad.left - 6, pad.top + ph);
  ctx.textAlign = "left";
  ctx.fillText(options.xLabel || "tiempo →", width - 59, height - 5);
  return { ctx, width, height, pad, pw, ph, x, y };
}

function strokeFunction(plot, fn, color, lineWidth = 2.1, samples = 900) {
  const { ctx, x, y } = plot;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const py = y(fn(u));
    if (i === 0) ctx.moveTo(x(u), py); else ctx.lineTo(x(u), py);
  }
  ctx.stroke();
  ctx.restore();
}

function strokeStep(plot, points, color, lineWidth = 2.1) {
  const { ctx, x, y } = plot;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.beginPath();
  points.forEach((point, index) => {
    const px = x(point[0]);
    const py = y(point[1]);
    if (index === 0) ctx.moveTo(px, py);
    else {
      ctx.lineTo(px, y(points[index - 1][1]));
      ctx.lineTo(px, py);
    }
  });
  ctx.stroke();
  ctx.restore();
}

function drawPlayhead(plot) {
  const { ctx, x, pad, ph } = plot;
  const px = x(state.playhead);
  ctx.save();
  ctx.strokeStyle = COLORS.playhead;
  ctx.lineWidth = 1.25;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, pad.top + ph); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = COLORS.navy;
  ctx.beginPath(); ctx.arc(px, pad.top + 4, 3.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawAnalog() {
  const duration = 2;
  const messageRange = Math.max(1.2, state.msgAmp * 1.18);
  const carrierRange = Math.max(1.55, state.carrierAmp * 1.15);
  const maxAmp = state.mode === "AM"
    ? Math.max(1.4, state.carrierAmp * (1 + state.modIndex * state.msgAmp) + 0.15)
    : carrierRange;
  const carrierSamples = Math.min(12000, Math.max(900, state.carrierFreq * duration * 22));
  const modulatedMaxFrequency = state.mode === "FM"
    ? state.carrierFreq + state.freqDeviation * state.msgAmp
    : state.carrierFreq + state.phaseIndex * state.msgAmp * state.msgFreq;
  const modulatedSamples = Math.min(12000, Math.max(900, modulatedMaxFrequency * duration * 22));
  const p1 = makePlot(els.plot1, { yMin: -messageRange, yMax: messageRange, xLabel: "t (s) →" });
  strokeFunction(p1, u => message(u * duration), COLORS.info, 2.3);
  drawPlayhead(p1);

  const p2 = makePlot(els.plot2, { yMin: -carrierRange, yMax: carrierRange, xLabel: "t (s) →" });
  strokeFunction(p2, u => state.carrierAmp * Math.cos(2 * Math.PI * state.carrierFreq * u * duration), COLORS.reference, 1.85, carrierSamples);
  drawPlayhead(p2);

  const p3 = makePlot(els.plot3, { yMin: -maxAmp, yMax: maxAmp, xLabel: "t (s) →" });
  const signal = u => {
    const t = u * duration;
    const mn = Math.sin(2 * Math.PI * state.msgFreq * t);
    if (state.mode === "AM") return state.carrierAmp * (1 + state.modIndex * state.msgAmp * mn) * Math.cos(2 * Math.PI * state.carrierFreq * t);
    if (state.mode === "FM") {
      const beta = (state.freqDeviation * state.msgAmp) / state.msgFreq;
      return state.carrierAmp * Math.cos(2 * Math.PI * state.carrierFreq * t + beta * Math.sin(2 * Math.PI * state.msgFreq * t));
    }
    return state.carrierAmp * Math.cos(2 * Math.PI * state.carrierFreq * t + state.phaseIndex * state.msgAmp * mn);
  };
  strokeFunction(p3, signal, COLORS.output, 2.05, modulatedSamples);
  if (state.mode === "AM") {
    const env = u => state.carrierAmp * (1 + state.modIndex * state.msgAmp * Math.sin(2 * Math.PI * state.msgFreq * u * duration));
    p3.ctx.save(); p3.ctx.setLineDash([5, 4]);
    strokeFunction(p3, env, "rgba(238,123,69,.82)", 1.4);
    strokeFunction(p3, u => -env(u), "rgba(238,123,69,.82)", 1.4);
    p3.ctx.restore();
  }
  drawPlayhead(p3);
}

function sampleData(duration = 2) {
  const count = Math.floor(duration * state.sampleRate);
  return Array.from({ length: count }, (_, n) => {
    const t = n / state.sampleRate;
    return { n, t, u: t / duration, value: message(t) };
  });
}

function drawAnalogInformationPlot() {
  const range = Math.max(1.2, state.msgAmp * 1.18);
  const p = makePlot(els.plot1, { yMin: -range, yMax: range, xLabel: "t (s) →" });
  strokeFunction(p, u => message(u * 2), COLORS.info, 2.3);
  drawPlayhead(p);
}

function drawSampleClock() {
  const duration = 2;
  const samples = sampleData(duration);
  const p = makePlot(els.plot2, { yMin: -0.2, yMax: 1.25, xLabel: "t (s) →" });
  const halfWidth = Math.min(0.018, 0.18 / samples.length);
  samples.forEach(s => {
    p.ctx.fillStyle = "rgba(19,168,183,.22)";
    p.ctx.fillRect(p.x(s.u - halfWidth), p.y(1), p.x(s.u + halfWidth) - p.x(s.u - halfWidth), p.y(0) - p.y(1));
    p.ctx.strokeStyle = COLORS.reference;
    p.ctx.lineWidth = 1.6;
    p.ctx.beginPath(); p.ctx.moveTo(p.x(s.u), p.y(0)); p.ctx.lineTo(p.x(s.u), p.y(1)); p.ctx.stroke();
  });
  drawPlayhead(p);
}

function drawPulseOutput() {
  const duration = 2;
  const samples = sampleData(duration);
  const pamRange = Math.max(1.2, state.msgAmp * 1.18);
  const p = makePlot(els.plot3, { yMin: state.mode === "PAM" ? -pamRange : -0.2, yMax: state.mode === "PAM" ? pamRange : 1.25, xLabel: "t (s) →" });
  const slot = 1 / samples.length;

  samples.forEach(s => {
    const next = s.u + slot;
    let start = s.u;
    let end = s.u + slot * state.pulseWidth;
    let height = s.value;
    if (state.mode === "PWM") {
      const normalized = s.value / Math.max(state.msgAmp, 0.001);
      const duty = clamp(0.5 + normalized * 0.43 * state.pwmDepth, 0.05, 0.95);
      end = s.u + slot * duty;
      height = 1;
    }
    if (state.mode === "PPM") {
      const normalized = s.value / Math.max(state.msgAmp, 0.001);
      const center = 0.5 + normalized * 0.34 * state.ppmShift;
      const width = slot * 0.12;
      start = s.u + slot * center - width / 2;
      end = start + width;
      height = 1;
    }
    start = clamp(start, s.u, next);
    end = clamp(end, start, next);
    const baseY = p.y(0);
    const topY = p.y(height);
    p.ctx.fillStyle = "rgba(115,87,214,.24)";
    p.ctx.fillRect(p.x(start), Math.min(baseY, topY), Math.max(1, p.x(end) - p.x(start)), Math.abs(baseY - topY));
    p.ctx.strokeStyle = COLORS.output;
    p.ctx.lineWidth = 1.55;
    p.ctx.strokeRect(p.x(start), Math.min(baseY, topY), Math.max(1, p.x(end) - p.x(start)), Math.abs(baseY - topY));
  });
  drawPlayhead(p);
}

function quantize(value) {
  const levels = state.quantLevels;
  const normalized = clamp((value / state.msgAmp + 1) / 2, 0, 1);
  const index = Math.round(normalized * (levels - 1));
  const qNorm = (index / (levels - 1)) * 2 - 1;
  return { index, value: qNorm * state.msgAmp };
}

function pcmData() {
  return sampleData(2).map(sample => ({ ...sample, ...quantize(sample.value) }));
}

function drawPCM() {
  drawAnalogInformationPlot();
  const data = pcmData();
  const pcmRange = Math.max(1.2, state.msgAmp * 1.18);
  const p2 = makePlot(els.plot2, { yMin: -pcmRange, yMax: pcmRange, xLabel: "t (s) →" });
  const stepPoints = [];
  data.forEach((s, index) => {
    const nextU = index === data.length - 1 ? 1 : data[index + 1].u;
    stepPoints.push([s.u, s.value], [nextU, s.value]);
    p2.ctx.strokeStyle = "rgba(19,168,183,.42)";
    p2.ctx.beginPath(); p2.ctx.moveTo(p2.x(s.u), p2.y(0)); p2.ctx.lineTo(p2.x(s.u), p2.y(s.value)); p2.ctx.stroke();
    p2.ctx.fillStyle = COLORS.reference;
    p2.ctx.beginPath(); p2.ctx.arc(p2.x(s.u), p2.y(s.value), 3, 0, 2 * Math.PI); p2.ctx.fill();
  });
  strokeStep(p2, stepPoints, COLORS.reference, 1.9);
  drawPlayhead(p2);

  const width = Math.ceil(Math.log2(state.quantLevels));
  const words = data.map(s => s.index.toString(2).padStart(width, "0"));
  const stream = words.join("").split("").map(Number);
  const p3 = makePlot(els.plot3, { yMin: -0.15, yMax: 1.25, bands: stream, xLabel: "bits →", bandLabels: false });
  const points = [[0, stream[0]]];
  stream.forEach((bit, i) => points.push([i / stream.length, bit], [(i + 1) / stream.length, bit]));
  strokeStep(p3, points, COLORS.output, 2.2);
  p3.ctx.fillStyle = COLORS.text;
  p3.ctx.font = "700 10px ui-monospace, monospace";
  p3.ctx.textAlign = "center";
  words.forEach((word, i) => {
    if (data.length <= 18 || i % 2 === 0) p3.ctx.fillText(word, p3.x((i + .5) / words.length), 10);
  });
  drawPlayhead(p3);
}

function drawDigitalData() {
  const sequence = bits();
  const p = makePlot(els.plot1, { yMin: -0.15, yMax: 1.25, bands: sequence, xLabel: "intervalos de bit →" });
  const points = [[0, sequence[0]]];
  sequence.forEach((bit, i) => points.push([i / sequence.length, bit], [(i + 1) / sequence.length, bit]));
  strokeStep(p, points, COLORS.info, 2.35);
  drawPlayhead(p);
}

function drawDigitalCarrier() {
  const sequence = bits();
  const range = Math.max(1.55, state.carrierAmp * 1.15);
  const samples = Math.min(12000, Math.max(900, state.carrierCycles * sequence.length * 22));
  const p = makePlot(els.plot2, { yMin: -range, yMax: range, bands: sequence, bandLabels: false, xLabel: "intervalos de bit →" });
  strokeFunction(p, u => state.carrierAmp * Math.cos(2 * Math.PI * state.carrierCycles * sequence.length * u), COLORS.reference, 1.85, samples);
  drawPlayhead(p);
}

function digitalSignal(u) {
  const sequence = bits();
  const n = sequence.length;
  if (state.mode === "QAM") {
    const symbols = qamSymbols();
    const symbolPos = clamp(u * symbols.length, 0, symbols.length - 1e-9);
    const index = Math.floor(symbolPos);
    const local = symbolPos - index;
    const { i, q } = symbols[index];
    const phase = 2 * Math.PI * state.carrierCycles * qamBitsPerSymbol() * local;
    return state.carrierAmp * (i * Math.cos(phase) - q * Math.sin(phase));
  }

  const bitPos = clamp(u * n, 0, n - 1e-9);
  const index = Math.floor(bitPos);
  const local = bitPos - index;
  const bit = sequence[index];
  if (state.mode === "ASK") {
    const amp = bit ? 1 : state.askZero;
    return state.carrierAmp * amp * Math.cos(2 * Math.PI * state.carrierCycles * local);
  }
  if (state.mode === "FSK") {
    const cycles = bit ? state.fskOne : state.fskZero;
    let previousCycles = 0;
    for (let i = 0; i < index; i++) previousCycles += sequence[i] ? state.fskOne : state.fskZero;
    return state.carrierAmp * Math.cos(2 * Math.PI * (previousCycles + cycles * local));
  }
  const phaseShift = bit ? 0 : Math.PI;
  return state.carrierAmp * Math.cos(2 * Math.PI * state.carrierCycles * local + phaseShift);
}

function drawDigital() {
  const sequence = bits();
  drawDigitalData();
  drawDigitalCarrier();
  const labels = state.mode === "QAM"
    ? qamSymbols().map(symbol => symbol.label)
    : sequence;
  const digitalRange = Math.max(1.55, state.carrierAmp * 1.15);
  const p3 = makePlot(els.plot3, { yMin: -digitalRange, yMax: digitalRange, bands: labels, xLabel: state.mode === "QAM" ? "símbolos →" : "intervalos de bit →" });
  const maxCycles = state.mode === "FSK"
    ? Math.max(state.fskZero, state.fskOne) * sequence.length
    : state.carrierCycles * sequence.length;
  const samples = Math.min(12000, Math.max(1100, maxCycles * 22));
  strokeFunction(p3, digitalSignal, COLORS.output, 2.05, samples);
  drawPlayhead(p3);
  if (state.mode === "PSK" || state.mode === "QAM") drawConstellation();
}

function drawConstellation() {
  const { ctx, width, height } = setupCanvas(els.specialCanvas);
  ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width * .25, height * .34);
  ctx.strokeStyle = COLORS.grid; ctx.lineWidth = 1;
  [-1, -.5, 0, .5, 1].forEach(v => {
    ctx.beginPath(); ctx.moveTo(cx + v * radius, cy - radius - 15); ctx.lineTo(cx + v * radius, cy + radius + 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - radius - 15, cy + v * radius); ctx.lineTo(cx + radius + 15, cy + v * radius); ctx.stroke();
  });
  ctx.strokeStyle = COLORS.axis; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cx - radius - 27, cy); ctx.lineTo(cx + radius + 27, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy - radius - 27); ctx.lineTo(cx, cy + radius + 27); ctx.stroke();
  ctx.fillStyle = COLORS.text; ctx.font = "700 12px ui-sans-serif, sans-serif";
  ctx.fillText("I", cx + radius + 32, cy + 4); ctx.fillText("Q", cx + 5, cy - radius - 30);

  const points = state.mode === "PSK"
    ? [{ i: 1, q: 0, label: "1" }, { i: -1, q: 0, label: "0" }]
    : qamConstellation();
  const present = new Set(state.mode === "PSK"
    ? bits().map(String)
    : qamSymbols().map(symbol => symbol.label));

  points.forEach(({ i, q, label }) => {
    const px = cx + i * radius * .9;
    const py = cy - q * radius * .9;
    ctx.fillStyle = present.has(label) ? COLORS.output : "#cbd2dc";
    const pointRadius = state.qamOrder === 16 && state.mode === "QAM" ? 6 : (present.has(label) ? 8 : 6);
    ctx.beginPath(); ctx.arc(px, py, pointRadius, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = COLORS.navy;
    ctx.font = `800 ${state.qamOrder === 16 && state.mode === "QAM" ? 9 : 12}px ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.fillText(label, px, py - (state.qamOrder === 16 && state.mode === "QAM" ? 9 : 14));
  });
}

function drawPulse() {
  if (state.mode === "PCM") {
    drawPCM();
    return;
  }
  drawAnalogInformationPlot();
  drawSampleClock();
  drawPulseOutput();
}

function drawAll() {
  updatePlotLabels();
  if (MODES[state.mode].family === "analog") drawAnalog();
  else if (isPulse()) drawPulse();
  else drawDigital();
}

function setPlaying(playing) {
  state.playing = playing;
  els.playIcon.textContent = playing ? "Ⅱ" : "▶";
  els.playText.textContent = playing ? "Pausar" : "Reproducir";
  els.playPause.setAttribute("aria-label", playing ? "Pausar animación" : "Reproducir animación");
  els.timeStatus.textContent = playing ? "Animación activa" : "Animación pausada";
  document.querySelector(".live-dot").classList.toggle("paused", !playing);
}

function sanitizeBits(raw) {
  let clean = raw.replace(/[^01]/g, "").slice(0, 16);
  if (clean.length < 4) clean = clean.padEnd(4, "0");
  if (state.mode === "QAM") {
    const width = qamBitsPerSymbol();
    const remainder = clean.length % width;
    if (remainder) {
      const missing = width - remainder;
      clean = clean.length + missing <= 16 ? clean.padEnd(clean.length + missing, "0") : clean.slice(0, clean.length - remainder);
    }
  }
  return clean;
}

function resetDefaults() {
  const mode = state.mode;
  Object.assign(state, INITIAL, { mode, playing: state.playing, playhead: 0 });
  state.rangeMax = {};
  if (mode === "QAM") state.bitSequence = sanitizeBits(state.bitSequence);
  renderModeUI();
}

function exportGraphsAsPng() {
  drawAll();
  const exportCanvas = document.createElement("canvas");
  const width = 1800;
  const margin = 76;
  const graphWidth = width - margin * 2;
  const graphHeight = 255;
  const graphHeader = 64;
  const gap = 28;
  const headerHeight = 176;
  const height = headerHeight + 3 * (graphHeader + graphHeight) + 2 * gap + 72;
  exportCanvas.width = width;
  exportCanvas.height = height;
  const ctx = exportCanvas.getContext("2d");

  ctx.fillStyle = "#f5f7fb";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = COLORS.navy;
  ctx.fillRect(0, 0, width, 14);
  ctx.fillStyle = "#13a8b7";
  ctx.fillRect(0, 14, width, 6);

  ctx.fillStyle = COLORS.navy;
  ctx.font = "700 44px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText(`Laboratorio de modulación · ${state.mode === "QAM" ? `${state.qamOrder}-QAM` : state.mode}`, margin, 78);
  ctx.fillStyle = COLORS.text;
  ctx.font = "500 23px ui-sans-serif, sans-serif";
  ctx.fillText(MODES[state.mode].title, margin, 116);

  const legend = [[COLORS.info, "Información"], [COLORS.reference, "Referencia"], [COLORS.output, "Modulada"]];
  let legendX = margin;
  legend.forEach(([color, label]) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(legendX, 151); ctx.lineTo(legendX + 38, 151); ctx.stroke();
    ctx.fillStyle = COLORS.text;
    ctx.font = "600 19px ui-sans-serif, sans-serif";
    ctx.fillText(label, legendX + 52, 158);
    legendX += ctx.measureText(label).width + 92;
  });

  const graphs = [
    [els.plot1, els.plot1Title.textContent, els.plot1Meta.textContent, COLORS.info],
    [els.plot2, els.plot2Title.textContent, els.plot2Meta.textContent, COLORS.reference],
    [els.plot3, els.plot3Title.textContent, els.plot3Meta.textContent, COLORS.output]
  ];

  graphs.forEach(([source, title, meta, accent], index) => {
    const top = headerHeight + index * (graphHeader + graphHeight + gap);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(margin, top, graphWidth, graphHeader + graphHeight, 18);
    ctx.fill();
    ctx.strokeStyle = "#dfe5ee";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.fillRect(margin, top, 8, graphHeader + graphHeight);
    ctx.fillStyle = "#99a5b6";
    ctx.font = "800 17px ui-monospace, monospace";
    ctx.fillText(`0${index + 1}`, margin + 30, top + 40);
    ctx.fillStyle = COLORS.navy;
    ctx.font = "750 25px ui-sans-serif, sans-serif";
    ctx.fillText(title, margin + 78, top + 41);
    ctx.fillStyle = COLORS.text;
    ctx.font = "600 19px ui-sans-serif, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(meta, width - margin - 24, top + 40);
    ctx.textAlign = "left";
    ctx.drawImage(source, margin + 10, top + graphHeader, graphWidth - 20, graphHeight - 8);
  });

  ctx.fillStyle = COLORS.text;
  ctx.font = "500 17px ui-sans-serif, sans-serif";
  ctx.fillText("Las tres señales comparten el mismo instante de observación.", margin, height - 31);

  const date = new Date().toISOString().slice(0, 10);
  const filename = `graficas-${state.mode === "QAM" ? `${state.qamOrder}-QAM` : state.mode}-${date}.png`;
  exportCanvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    els.exportPng.classList.add("downloaded");
    els.exportPng.setAttribute("aria-label", "PNG descargado");
    window.setTimeout(() => {
      els.exportPng.classList.remove("downloaded");
      els.exportPng.setAttribute("aria-label", "Descargar las tres gráficas en formato PNG");
    }, 1400);
  }, "image/png");
}

document.querySelectorAll(".mode-button").forEach(button => {
  button.addEventListener("click", () => selectMode(button.dataset.mode));
});

els.bitSequence.addEventListener("input", event => {
  const caret = event.currentTarget.selectionStart;
  event.currentTarget.value = event.currentTarget.value.replace(/[^01]/g, "").slice(0, 16);
  event.currentTarget.setSelectionRange(caret, caret);
  if (event.currentTarget.value.length >= 1) {
    state.bitSequence = event.currentTarget.value;
    drawAll();
  }
});

els.bitSequence.addEventListener("blur", event => {
  state.bitSequence = sanitizeBits(event.currentTarget.value);
  event.currentTarget.value = state.bitSequence;
  drawAll();
});

els.randomBits.addEventListener("click", () => {
  const length = state.mode === "QAM" ? Math.min(16, qamBitsPerSymbol() * 4) : 8;
  state.bitSequence = Array.from({ length }, () => Math.random() > .5 ? "1" : "0").join("");
  els.bitSequence.value = state.bitSequence;
  drawAll();
});

els.playPause.addEventListener("click", () => setPlaying(!state.playing));
els.resetAnimation.addEventListener("click", () => { state.playhead = 0; drawAll(); });
els.exportPng.addEventListener("click", exportGraphsAsPng);
els.defaultsButton.addEventListener("click", resetDefaults);
els.simulatorTabButton.addEventListener("click", () => switchView("simulator"));
els.practiceTabButton.addEventListener("click", () => switchView("practice"));
els.backToGuide.addEventListener("click", () => switchView("practice"));

window.addEventListener("resize", () => { if (state.currentView === "simulator") drawAll(); });

function animate(now) {
  const delta = Math.min(50, now - state.lastFrame);
  state.lastFrame = now;
  if (state.playing) {
    state.playhead = (state.playhead + delta / 7000) % 1;
    if (state.currentView === "simulator") drawAll();
  }
  requestAnimationFrame(animate);
}

renderModeUI();
setPlaying(true);
requestAnimationFrame(animate);
