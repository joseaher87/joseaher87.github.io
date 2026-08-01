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

## Icono de la app

El icono distintivo (microfono blanco con ondas de sonido sobre degradado morado-azul y una
insignia "ES") esta en `build/icon.svg`. A partir de ese SVG se generan los formatos que necesita
cada plataforma con:

```bash
pip install cairosvg pillow
python3 scripts/build-icons.py
```

Esto regenera `build/icon.png`, `build/icon.ico`, `build/icon.icns` y `build/icons/*.png`. Estos
archivos ya estan versionados en el repo, asi que normalmente no hace falta volver a generarlos,
salvo que cambies el diseno del icono.

## Crear el acceso directo en el Escritorio

> Esta app se desarrolla en una sesion en la nube, que no tiene acceso al Escritorio real de tu
> computadora. Por eso el acceso directo se crea corriendo uno de estos scripts **en tu propia
> maquina**, despues de clonar el repo y hacer `npm install` dentro de `voice-narrator-app`.

**Linux**

```bash
npm run shortcut:linux
```

Crea `~/Desktop/narrador-de-voz.desktop` con el icono propio y tambien lo registra en el menu de
aplicaciones. Si el icono no aparece o no abre con doble clic, clic derecho sobre el acceso
directo > "Permitir lanzamiento" (el texto exacto depende de tu entorno de escritorio).

**Windows**

```powershell
npm run shortcut:win
```

Crea `Narrador de Voz.lnk` en el Escritorio, apuntando al Electron local del proyecto y usando
`build/icon.ico` como icono.

**macOS**

```bash
npm run shortcut:mac
```

Genera `Narrador de Voz.app` (con `build/icon.icns` como icono) dentro de `dist/mac` usando
electron-builder, y coloca un alias de esa app en el Escritorio.

## Empaquetarla como instalable (opcional)

El proyecto ya incluye [electron-builder](https://www.electron.build/) configurado (ver la clave
`"build"` en `package.json`), con los iconos de `build/` para Windows, macOS y Linux. Para generar
un instalable para tu plataforma actual:

```bash
npm run dist
```

En Windows esto genera un instalador NSIS que, ademas, crea automaticamente el acceso directo de
Escritorio (y de menu inicio) al instalarse — es una alternativa a `npm run shortcut:win` para
cuando prefieras distribuir la app ya empaquetada en vez de ejecutarla desde el codigo fuente.

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
├── main.js                                     # Proceso principal de Electron (ventana + menu "Efectos")
├── preload.js                                   # Puente seguro entre el menu nativo y la interfaz web
├── index.html                                    # Interfaz de usuario
├── renderer.js                                   # Logica de sintesis de voz, voces y efectos
├── styles.css                                    # Estilos
├── package.json
├── build/
│   ├── icon.svg                                  # Icono fuente (vector)
│   ├── icon.png / icon.ico / icon.icns           # Icono exportado por plataforma
│   └── icons/                                    # Icono en varios tamanos (Linux)
└── scripts/
    ├── build-icons.py                            # Genera los icon.* a partir de icon.svg
    ├── launch.sh                                 # Lanzador usado por el acceso directo de Linux
    ├── create-desktop-shortcut-linux.sh
    ├── create-desktop-shortcut-windows.ps1
    └── create-desktop-shortcut-macos.sh
```
