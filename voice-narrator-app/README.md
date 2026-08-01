# Narrador de Voz (app de escritorio)

Aplicacion de escritorio (Electron) para narrar texto en voz alta, con seleccion de voz
(incluyendo voces en espanol como "Jorge") y un menu de efectos para transformar como suena.

## Como ejecutarla

```bash
cd voice-narrator-app
npm install
npm start
```

Requiere Node.js 18+. La primera vez, `npm install` descarga Electron (puede tardar un poco).

## Empaquetarla como instalable (opcional)

Este proyecto no incluye un empaquetador por defecto. Para generar un `.exe` / `.dmg` / `.AppImage`
puedes agregar [electron-builder](https://www.electron.build/):

```bash
npm install --save-dev electron-builder
npx electron-builder
```

## Funcionalidad

- **Texto**: escribe o pega el texto a narrar, o carga un archivo `.txt`.
- **Voz**: selector con todas las voces instaladas en el sistema operativo, agrupadas por
  "Espanol" y "Otros idiomas". Si el sistema tiene instalada una voz llamada "Jorge"
  (disponible por defecto en macOS para espanol de Espana), se selecciona automaticamente.
- **Reproduccion**: reproducir, pausar/reanudar y detener.
- **Menu "Efectos"**: en la barra de menu superior de la app hay un menu llamado *Efectos*
  con accesos directos a cada preset (Normal, Robot, Ardilla, Gigante, Susurro, Anciano, Bebe, Eco).
  Tambien puedes elegirlos como botones dentro de la app, o ajustar manualmente velocidad, tono
  y volumen con los deslizadores.

### Sobre las voces del sistema

Esta app usa la Web Speech API (`speechSynthesis`) del sistema operativo, por lo que las voces
disponibles dependen de lo que tengas instalado:

- **macOS**: Ajustes del Sistema → Accesibilidad → Contenido hablado → Voz del sistema →
  Gestionar voces... → instala voces en espanol (por ejemplo "Jorge", espanol de Espana).
- **Windows**: Configuracion → Hora e idioma → Voz → Agregar voces → instala un paquete de
  espanol (el nombre exacto de la voz varia segun la version de Windows).
- **Linux**: depende del motor TTS instalado (por ejemplo `espeak-ng`); normalmente no incluye
  voces con nombres propios como "Jorge".

## Efectos incluidos

Los presets actuales combinan **velocidad**, **tono** y **volumen**, que es lo que expone la Web
Speech API del sistema operativo:

| Efecto   | Descripcion                                    |
|----------|-------------------------------------------------|
| Normal   | Voz sin modificar                                |
| Robot    | Tono muy grave y ritmo firme                     |
| Ardilla  | Tono agudo y velocidad rapida                    |
| Gigante  | Tono grave y velocidad lenta                     |
| Susurro  | Volumen bajo, casi murmurado                     |
| Anciano  | Velocidad y tono ligeramente reducidos           |
| Bebe     | Tono muy agudo y velocidad algo mayor            |
| Eco      | Repite la frase con menor volumen tras la original |

## Efectos sugeridos para siguientes versiones

Estos efectos necesitan procesar la onda de audio generada (no solo velocidad/tono/volumen),
por lo que requieren un paso extra: capturar el audio con Web Audio API (a partir de un motor
de voz que entregue el audio en bruto, o un servicio de voz en la nube tipo Azure/Google/ElevenLabs)
y aplicarle nodos de procesamiento (`ConvolverNode`, `DelayNode`, `BiquadFilterNode`, `WaveShaperNode`, etc.):

- **Eco real con retroalimentacion**: varias repeticiones que se van apagando, en vez de una sola.
- **Reverberacion** (sala pequena, catedral, estudio): simula el espacio acustico.
- **Filtro de telefono / radio antigua**: recorta graves y agudos (pasa-banda) para sonar como
  una llamada o una transmision AM antigua.
- **Distorsion / autotune / vocoder real**: efecto robotico mucho mas convincente que solo bajar el tono.
- **Coro (chorus)**: varias copias de la voz ligeramente desafinadas y desfasadas.
- **Bajo el agua**: filtro pasa-bajos con modulacion lenta, sonido apagado y ondulante.
- **Voz invertida**: reproduce el audio generado al reves.
- **Ecualizador manual**: graves / medios / agudos controlables por separado.

## Estructura del proyecto

```
voice-narrator-app/
├── main.js        # Proceso principal de Electron (ventana + menu "Efectos")
├── preload.js      # Puente seguro entre el menu nativo y la interfaz web
├── index.html       # Interfaz de usuario
├── renderer.js      # Logica de sintesis de voz, voces y efectos
├── styles.css       # Estilos
└── package.json
```
