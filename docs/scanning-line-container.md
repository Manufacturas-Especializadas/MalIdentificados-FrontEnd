# Validación de empaques: configuración y pruebas del frontend

Se reutilizan `SetupHeader`, `ActiveScanning`, `useScanning` y `ScanningService`.
`ScanningProcess` contiene el control común de la sesión; MicroChannel y Línea 4
Empaques son envoltorios. La página de empaques y `/linea4Empaques` se recuperaron
de `linea5` (`0e0ceee`), sin fusionar esa rama. Se mantienen las demás rutas.

Contrato consultado: `MalIdentificados-BackEnd/docs/scanning-line-container.md`.
Se mantiene `POST /api/Scanning/start` y su respuesta `{ validationId, message }`.

## Habilitación pendiente

Por defecto `VITE_SCANNING_CONTRACT=legacy` (también si la variable no existe).
MicroChannel envía únicamente el contrato anterior. Línea 4 Empaques muestra que
está pendiente de habilitación y no permite comenzar ni enviar registros.
No se modificó `.env.production` ni se consultó el backend de producción.

Antes de habilitar el contrato nuevo, confirmar por separado:

1. Que la migración SQL requerida por el backend ya está disponible y aplicada en
   el entorno objetivo.
2. Que la API de ese entorno contiene el contrato actualizado.
3. Los IDs reales y activos de ambos procesos en `GET /api/Lines/getLines`.
4. Que cada ID corresponde a la línea de la pantalla, verificada con el responsable
   del catálogo. El frontend muestra el nombre e ID devueltos para esa comprobación.

Después, configurar en el entorno de compilación (ver `.env.example`):

| Variable | Valor |
| --- | --- |
| `VITE_API_BASE_URL` | URL de la API del entorno autorizado. |
| `VITE_SCANNING_CONTRACT` | `line-container`, únicamente tras las confirmaciones anteriores. |
| `VITE_MICROCHANNEL_LINE_ID` | ID real de MicroChannel; no hay valor predeterminado. |
| `VITE_LINE4_EMPAQUES_LINE_ID` | ID real de Línea 4 Empaques; no se asume 4. |

Vite incorpora estas variables al compilar; reiniciar el servidor de desarrollo o
recompilar tras cambiarlas. Una modalidad de configuración desconocida bloquea el
inicio. En el contrato nuevo, un ID ausente, inválido, inexistente o inactivo bloquea
el proceso correspondiente. Si falla el catálogo se puede volver a consultarlo.
El backend vuelve a validar la línea al guardar, incluso si cambió durante el lote.

No existe detección automática mediante POST ni fallback después de errores:
reenviar un registro con otro contrato podría duplicarlo o perder su asociación.
La habilitación y el despliegue no forman parte de esta implementación.

## Captura y contrato

- MicroChannel mantiene Nómina → Shop Order → Número de parte → Standard Pack.
  Conserva la entrada numérica de Shop Order y la conversión de códigos a mayúsculas
  con sustitución de apóstrofo por guion. En `legacy` omite los tres campos nuevos;
  en `line-container` envía `validationMode: "shopOrder"` y el ID verificado, sin
  `containerNumber`.
- Empaques usa Nómina → Número de parte → Número de contenedor → Standard Pack.
  La comparación parte/contenedor aplica `trim()` y distingue mayúsculas, como la
  API. Conserva ceros iniciales, guiones, espacios internos y el texto original de
  ambos campos enviado al backend. No aplica la normalización de MicroChannel a
  estos códigos. Una diferencia muestra el error, selecciona el contenedor para
  reescanearlo e impide iniciar. También se puede volver a corregir la parte.
- Empaques envía `validationMode: "container"`, `containerNumber` y `lineId`, y
  **omite `shopOrder`**. Capturar parte y contenedor no agrega piezas al lote.
- Standard Pack admite teclado o lector con Enter/Tab, y debe ser un entero
  positivo representable como Int32. Shift+Tab permite retroceder.
- Las piezas correctas cuentan; las incorrectas quedan en el listado, no cuentan
  y bloquean. La confirmación conserva la lectura incorrecta. La eliminación
  mantiene las reglas previas mientras el lote sigue abierto.

## Guardado, foco y duplicados

Al alcanzar la meta se bloquean lecturas y eliminaciones de inmediato, antes de la
siguiente renderización. Se envía una solicitud y se conserva su payload para un
posible reintento. El formulario se reinicia 2,5 segundos después del éxito.
El POST tiene un timeout de 30 segundos. Un error mantiene el lote y muestra los
mensajes por campo de la API, con un botón de reintento sin escanear otra pieza.

No hay reintentos automáticos. Si no se puede saber si el servidor guardó (pérdida
de conexión, timeout o error de servidor), se requiere verificar el historial antes
de habilitar el reenvío. Si el registro ya existe, no reenviarlo: tras verificarlo,
recargar la pantalla permite comenzar el siguiente lote. Mantener la pantalla
abierta hasta resolver un error; el lote pendiente solo se conserva en memoria.

El backend documenta que **no implementa idempotencia**. El frontend evita envíos
concurrentes y dobles clics, pero no puede garantizar exactamente un registro si se
pierde una respuesta y se reenvía una solicitud ya procesada. Esa garantía requiere
un identificador idempotente persistido y validado por el backend.

El input consume el texto una sola vez antes de llamar al controlador. Enter+Tab,
terminadores repetidos y autorrepetición de teclas no cuentan dos piezas. No se
deduplican códigos completos por valor o por una ventana temporal: todas las piezas
del lote pueden tener el mismo código y escanearse rápidamente. Una doble emisión
completa del lector es indistinguible de dos piezas sin un identificador de lectura
o una regla adicional del dispositivo; verificar su configuración en la estación.

La alerta enfoca el panel y bloquea Enter del lector. Se confirma con clic o Tab y
espacio. El foco vuelve al input al confirmar, eliminar o regresar a la ventana;
los textos parciales se descartan al perder el foco durante el escaneo. En setup
se recupera el último campo. Se conserva la navegación voluntaria por teclado.

## Verificación reproducible

Requiere Node 24 (lectura nativa de TypeScript para las pruebas de lógica):

```powershell
npm test
npm run test:browser
npm run build
npm run lint
```

`npm test` usa el runner incluido en Node. Las pruebas de navegador usan Chrome o
Edge ya instalado y el protocolo de depuración, sin dependencias adicionales.
Si no se detecta el ejecutable, definir `SCANNING_TEST_BROWSER` con su ruta absoluta.
Arrancan Vite en localhost, deshabilitan la carga de archivos `.env`, y reemplazan
la API con un servidor local simulado. Los IDs 72 y 91 de las pruebas son ficticios
y no se utilizan como configuración de la aplicación. No acceden a SQL ni a la API
real. El perfil temporal del navegador y los servidores se cierran al terminar.

Se cubren comparación literal, contratos antiguo y nuevos, IDs inválidos/inactivos,
captura de estándar 32, errores por mezcla, confirmación segura, recuperación del
foco, terminadores repetidos, conteo/eliminación, un envío al completar, fallo HTTP,
conexión interrumpida, reintento deliberado y payload estable entre intentos.

El lint inicial en `main` tenía 24 errores y 1 advertencia. Los archivos modificados
se verifican aparte; los errores ajenos al flujo no se corrigen en esta tarea.
Las pruebas locales no sustituyen la verificación con el lector físico ni la
integración autorizada contra el backend actualizado y la migración disponible.

Resultado local: 12 pruebas de lógica/contrato y 9 escenarios de navegador aprobados.
Compilación aprobada. ESLint de todos los archivos del cambio aprobado; el lint
global conserva 18 errores preexistentes en `api/client.ts`, `LinesService.tsx`,
`Modal.tsx`, `Table.tsx`, `useLines.ts`, `HistoricHeader.tsx`, `ValidationCard.tsx`
y `LineForm.tsx`. No se agregaron dependencias.

## Archivos del cambio

- `src/components/UI/Scanning/ScanningProcess.tsx` (nuevo).
- `src/components/UI/Scanning/SetupHeader.tsx`.
- `src/components/UI/Scanning/ActiveScanning.tsx`.
- `src/pages/MicroChannel/MicroChannel.tsx`.
- `src/pages/L-5/Line4Empaques.tsx` (recuperado como envoltorio).
- `src/hooks/useScanning.ts`.
- `src/api/services/ScanningService.ts`.
- `src/types/types.ts`.
- `src/routes/Routes.tsx`.
- `src/config/scanning.ts` (nuevo).
- `src/utils/scanning.ts` y `src/utils/scanningSession.ts` (nuevos).
- `.env.example` (nuevo; configuración deshabilitada por defecto).
- `tests/scanning.test.mjs` y `tests/scanning.browser.mjs` (nuevos).
- `package.json` (solo scripts de pruebas).
- `docs/scanning-line-container.md` (este documento).
