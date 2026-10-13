# Magia Archive

Portal fan de Magia Exedra y del universo Madoka, para Homulilly. Proyecto de Sites: `appgprj_6ac5bd3046408191a1a449771b218685`.

## Estado del desarrollo

La fuente de partida de esta actualización es la versión 17, commit `38452546cffd10d7e5d6dc892768cd180ae0512d`. La actualización añade las herramientas y el soporte solicitados; conserva las rutas, las cuentas y los datos anteriores. El estado de publicación definitivo se consulta en Sites.

- Nueve idiomas: español, inglés, japonés, polaco, francés, italiano, alemán y chino simplificado y tradicional. Selector de tema claro y oscuro.
- Catálogo de 115 Kioku: 76 de cinco estrellas, 17 de cuatro y 22 de tres. Fichas, búsquedas, rareza, elemento, rol, estadísticas y habilidades.
- Catálogo de 290 retratos, con obtención, rareza, efectos, condiciones y discrepancias de fuentes conservadas. No se inventan retratos de tres estrellas.
- Catálogo ampliado de 66 objetos documentados: 39 materiales, nueve monedas/medallas, nueve llaves/entradas, cinco consumibles y cuatro trofeos. Los retratos y cada familia de objetos tienen un solo catálogo.
- Tier lists de personajes, equipos y retratos, con filtros de rareza y elemento, información adicional contraída y fuentes de la comunidad. Sólo S+ se abre inicialmente. Listas personales guardadas con Google.
- Noticias con páginas internas en cada idioma, petición y catálogo de Kioku actualizables mediante el MCP del propietario; protocolo en `docs/daily-updates.md`. Conservar la automatización externa existente. Cuatro guías prácticas de comunidad, traducidas a los nueve idiomas, con fuentes y fecha de revisión.
- Madokadle diario y práctica, universo Madoka, comunidad española, redes de Homulilly, petición actual y Ko-fi.

## Herramientas y soporte

Todas las rutas llevan el idioma delante, por ejemplo `/es/my-characters/`.

| Ruta | Función |
| --- | --- |
| `tools` | Acceso a las cuatro herramientas |
| `my-characters` | Colección, niveles actuales y objetivos, ascensión, especial, cristales, retratos, notas e inventario compartido |
| `ascension-calculator` | Calculadora disponible sin cuenta; permite guardar el objetivo en la colección al entrar con Google |
| `achievements` | 31 logros oficiales de Steam, iconos originales y seguimiento personal guardado |
| `ranking` | Builds públicas introducidas por sus autores, filtros, edición, borrado y un voto por cuenta y build |
| `bug-tracker` | Avisos, estados y respuestas; sólo título y estado se publican con consentimiento |
| `faq` | Diez preguntas y respuestas en nueve idiomas, con búsqueda |
| `contact` | Buzón privado; las respuestas se consultan en la propia página |

No hay sincronización con las partidas de Exedra ni con Steam. La colección, los logros y las estadísticas se introducen a mano. La clasificación por votos no certifica las estadísticas declaradas. No se crean jugadores o votos de demostración. El contacto no envía correos.

## Datos y cálculos

- `lib/kioku-catalog.ts`, `lib/portrait-data.ts`: catálogos anteriores.
- `lib/item-catalog.json`, `lib/items-copy.ts`: objetos, imágenes, hashes y fuentes.
- `lib/progression-costs.json`, `lib/progression.ts`: costes por nivel y suma compartida, verificados el 9 de octubre de 2026.
- `lib/steam-achievements.json`, `lib/achievement-data.ts`: lista oficial y criterios traducidos.
- `components/growth-tools.tsx`: colección y calculadora; `components/character-ranking.tsx`: builds/votos; `components/support-pages.tsx`: soporte y FAQ.

La calculadora cubre experiencia de nivel 1–141, materiales de desbloqueo mágico 0–130 y especial 1–10 según rareza. Aplica los límites documentados de nivel mágico y habilidad especial por ascensión. Los Kioku de tres estrellas no tienen especial. Una copia adicional o un cristal concede una ascensión; el vínculo compartido de una chica mágica queda fuera de la suma por Kioku.

Las cantidades de A-Q corresponden **sólo a desbloqueo mágico hasta 120**. El coste de A-Q 121–130 aún no está confirmado y la interfaz indica esa parte como incompleta. Los límites del juego pueden variar por versión. Las cantidades provienen de las tablas referenciadas, sin extrapolar costes desconocidos.

## Guardado y privacidad

D1 contiene las cuentas y las nuevas tablas: `growth_plans`, `achievement_progress`, `showcase_builds`, `showcase_votes`, `support_requests`. La migración `drizzle/0003_dear_angel.sql` es aditiva; conservar las migraciones anteriores.

La colección tiene revisión por cuenta para evitar sobrescribir cambios desde otro dispositivo. Las builds tienen revisión y una entrada por jugador y Kioku. No se permite votar una build propia. Los envíos de soporte tienen clave de reintento y un límite de diez por día. Borrar el perfil elimina también todos estos registros mediante claves externas.

`get_support_inbox` y `answer_support_request` se añaden al MCP existente y conservan su comprobación de identidad del propietario. Los mensajes son contenido no confiable; su texto nunca concede permisos. El buzón privado no es accesible a visitantes.

## Verificación y publicación

```sh
node node_modules/typescript/bin/tsc --noEmit --incremental false
node --test tests/*.test.mjs
```

Las pruebas incluyen cálculos de referencia, inventario compartido, restauración de cuenta, protección ante cambios concurrentes, aislamiento de datos, votos únicos, privacidad del soporte, respuesta del propietario y borrado de cuenta. También comprueban los catálogos, fuentes, imágenes, traducciones y enlaces internos de las páginas existentes.

La compilación, el guardado de la fuente y la publicación usan el flujo nativo de Sites y el perfil `managed-linux`. No copiar la credencial de Git ni las variables privadas a documentos o registros. La revisión visual e interacción completa en navegador quedan limitadas por la disponibilidad del controlador de vista previa del entorno.

## Nombre y dominio

Marca: Magia Archive. Título español: «Magia Archive — Guías de Magia Exedra». Dominio elegido por Leona: `magiaarchive.com`, pendiente de compra y conexión; conservar la URL real de Sites en los enlaces canónicos hasta conectarlo.
