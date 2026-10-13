# Evolución visual de Magia Archive — propuesta y muestra limitada

Estado: prototipo optativo sobre el proyecto original. No publicado. Se abre en una ejecución local añadiendo `?magic-preview=1` a la portada. Sin ese parámetro no se carga el módulo del prototipo ni aparecen sus controles.

## Integración analizada

El Site usa un único componente cliente `magia-portal.tsx` para las páginas, con datos procedentes del servidor y enlaces HTML que recargan el documento. El menú, los nueve idiomas y el catálogo se conservan. La muestra es un bloque optativo en la portada, con código aparte cargado por `import()`. No cambia autenticación, tablas, APIs de usuarios ni el plan diario.

Primera etapa preparada: profundidad suave en dos capas visuales (fondo y personaje), hasta ocho destellos, entrada breve y saludo de un familiar original. En Android modesto: sin parallax, cuatro destellos, máximo 24 FPS y resolución 1x. En otros dispositivos: máximo 30 FPS y 1,5x. La preferencia de movimiento reducido o ahorro de datos muestra la ilustración estática y elimina las animaciones. Hay pausa manual, suspensión del bucle WebGL fuera de pantalla y al ocultar la pestaña, y liberación de buffers, shaders, programa, observadores y listeners.

No se han medido FPS reales, energía ni memoria GPU: falta el navegador autorizado. Los límites anteriores son presupuestos programados, no mediciones de rendimiento ni garantías para todos los dispositivos.

## Modelo autorizado de la muestra

Lumen es un familiar original construido con 19 piezas procedurales. Tiene respiración leve, flotación, parpadeo y saludo. La geometría base tiene 280 triángulos, reutilizados por pieza: 5.320 triángulos dibujados por fotograma. No contiene archivos ni código de Magi3Dviewer, ni representa a un personaje oficial. La ilustración de respaldo también es original. Sirve para probar tamaño, ubicación, comportamiento y la convivencia con botones y noticias; no sustituye el objetivo final de integrar personajes oficiales con permiso.

No se necesitan recursos externos para esta muestra. La composición de audio son dos bocetos originales sintetizados por `scripts/create-prototype-audio.py`, sin canciones ni muestras ajenas.

## Música

El reproductor de prueba usa controles nativos y dos pistas, sin autoplay inicial ni precarga de audio. Guarda pista, volumen y posición en una clave propia. Requiere una acción del visitante para reproducir después de cargar una página. **El audio se corta al navegar con la arquitectura actual.** Guardar la posición no equivale a mantener audio continuo.

Para continuidad real se necesita un contenedor del reproductor que sobreviva a la navegación y navegación cliente compatible con Vinext. Es un cambio de arquitectura pendiente de autorización, con pruebas de navegación, cambio de idioma, Google y regreso del móvil. No se ha sustituido la navegación actual que anteriormente dio problemas. Las canciones definitivas deben ser archivos tuyos con autorización de uso o una integración admitida por su plataforma; no se han descargado covers ni audio comercial.

## Magi3Dviewer: investigación verificable

Fuentes primarias:
- https://github.com/haojiezhe12345/Magi3Dviewer
- https://github.com/haojiezhe12345/Magi3Dviewer/blob/main/package.json
- https://github.com/haojiezhe12345/Magi3Dviewer/blob/main/magia-exedra-character-three/character.ts
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository

El README y `package.json` identifican Three.js 0.182 y lz-string, TypeScript y Vite, con el paquete separado `magia-exedra-character-three`. La documentación describe materiales color/shadow/ctrl y sombreadores propios, iluminación estilizada, canales de control de transparencia y materiales especiales de vestidos. Las animaciones de cuerpo y armas son independientes; para un ciclo hay que reproducir las pistas asociadas. `_L` identifica ciclos y `_SE` transiciones. El controlador leído usa AnimationMixer y tiene un método de liberación.

La documentación reconoce que faltan shape keys faciales y que ciertas poses están mal exportadas. Por tanto, **no se puede prometer parpadeo o expresiones faciales con esos archivos**. Habría que obtener morph targets o un sistema de expresiones autorizado y validarlo en el personaje elegido.

El enlace a la demo agotó el tiempo de espera. Algunos árboles, el enlace al almacén de modelos y la descarga raw quedaron bloqueados por el servicio de consulta; no se insistió. No se descargaron modelos. **No se verificaron los bytes, tamaños, compresión ni el formato concreto de esos modelos**. FBX comprimido es una posibilidad de la solicitud, no un resultado acreditado de esta auditoría.

La vista del repositorio accesible no acreditó una licencia reutilizable para su código ni permiso de los titulares de los modelos. No se interpreta un repositorio público como autorización para redistribuir los recursos. Si se usa el código del autor, se necesita su licencia o autorización expresa. Para los recursos del juego se necesita autorización aplicable de sus titulares, incluyendo texturas y animaciones. La licencia de Three.js no transfiere derechos sobre los personajes.

## Recursos necesarios para el siguiente paso

Para una Madoka u Homura real: un paquete con modelo, texturas, animaciones de reposo y licencia o autorización verificable de exhibición en una web pública. Preferible un `GLB` con esqueleto y morph targets de ojos. Si el paquete original es FBX, harán falta el FBX, las texturas color/shadow/ctrl, los clips de cuerpo y armas y el aviso de licencia; después se evaluará una conversión que conserve piel, huesos, normales, UV y expresiones. El repositorio enlaza los modelos en su sección **Reverse engineering → exported models**; ese destino no fue accesible en esta sesión. No hay un nombre de archivo descargable confirmado que pueda solicitarse con precisión.

Segunda etapa propuesta: comprobar licencia, un único personaje, conversión GLB y perfiles de calidad, texturas reducidas y respaldo prerenderizado. Tercera: navegación que mantenga música y transiciones, después de eliminar el peso innecesario de la portada. Cuarta: pruebas reales en Android y escritorio, WebGL deshabilitado, contexto perdido, movimiento reducido, pestaña oculta y conexión lenta. Solo después se solicita aprobación de publicación.
