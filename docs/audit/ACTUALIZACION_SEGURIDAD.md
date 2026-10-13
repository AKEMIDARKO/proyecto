# Actualización de seguridad de Magia Archive — 13 de octubre de 2026

Se trabajó en el Site original `appgprj_6ac5bd3046408191a1a449771b218685`, partiendo del borrador v22, commit `ac2508557e0a6a9040987f2f35df1b99eb66b148`. El usuario autorizó la actualización de React/RSC y Vite y sus comprobaciones de compatibilidad. No autorizó publicar y no se ejecutó ningún despliegue.

## Versiones

| Dependencia | Antes | Después |
|---|---|---|
| react | 19.2.6 | 19.2.8 |
| react-dom | 19.2.6 | 19.2.8 |
| react-server-dom-webpack | 19.2.6 | 19.2.8 |
| vite | 8.0.13 | 8.1.6 |

Se conservaron Vinext 1.0.0-beta.5, Next 16.3.4, Wrangler 4.92.0 y las versiones de los plugins React/RSC y Cloudflare. Sus rangos peer aceptan las versiones nuevas. pnpm 11.25.0 regeneró el lockfile con las integridades reales del registro y actualizó las referencias peer. Los cambios transitivos corresponden principalmente a Vite/Rolldown y sus binarios y utilidades. No se cambió la política de antigüedad de paquetes ni se añadieron excepciones de confianza.

La instalación terminó correctamente. Se comprobaron los cuatro `package.json` instalados y que el lockfile no conserva las versiones antiguas de estos tres paquetes React. La instalación posterior con `--frozen-lockfile`, mediante el instalador oficial de Sites, pasó sin resolver de nuevo el árbol.

## Comprobaciones ejecutadas

- `node /root/.codex/plugins/cache/openai-curated-remote/sites/1.0.0/scripts/install-dependencies.mjs`: instalación reproducible correcta.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: código de salida 0, sin errores.
- `bash scripts/sites-env.sh -- node --test tests/*.test.mjs`: 70 pruebas aprobadas, 0 fallidas, 0 omitidas; duración total 31,23 segundos.
- `node /root/.codex/plugins/cache/openai-curated-remote/sites/1.0.0/scripts/build-site.mjs`: compilación correcta con Vite 8.1.6. Se limpiaron únicamente los archivos generados de `dist`, que Git ignora, para excluir restos de compilaciones previas.
- Revisión del diff: los cambios de aplicación se limitan a `package.json` y `pnpm-lock.yaml`; el resto son registros de la auditoría. La configuración de alojamiento, las migraciones, los catálogos, las traducciones y los componentes de v22 se conservaron.

Las pruebas existentes ejercitan firma y verificación de credenciales de Google con claves ficticias, nonce de un solo uso, sesiones, rechazo de orígenes indebidos, aislamiento entre cuentas, favoritos y notas, colección, progreso de Steam, builds, contactos, Madokadle, importaciones y conservación de datos ante errores. Las pruebas de navegación y renderizado comprueban páginas y diccionarios en los nueve idiomas; las de SEO ejecutan los handlers en workerd y validan los sitemaps, incluidos nuevos Kioku. Todas las escrituras de las pruebas utilizan bases locales aisladas y datos ficticios.

Los mensajes de rechazo de OAuth, fallos de sincronización y tablas no disponibles que aparecen en las pruebas son escenarios de error comprobados deliberadamente. La instalación informa de binarios opcionales de otras plataformas omitidos y de dependencias obsoletas ya existentes; no se amplió la actualización a otros paquetes. La compilación mantiene el aviso de Vinext sobre clasificación estática incompleta de algunas rutas.

## Recuperación y límites

Antes de editar se creó y verificó un Git bundle del commit v22 con historial completo. La versión v22 guardada en Sites permanece disponible para recuperar el estado anterior. No es una copia de la base de datos de producción.

No se modificaron datos persistentes, cuentas, Google OAuth, secretos, permisos, catálogos ni automatizaciones. Se conserva el prototipo visual optativo de v22. No se enviaron ataques ni se hizo rotación de credenciales.

No se dispone del control de navegador requerido por Sites en este entorno. Quedan pendientes la interacción real con Google, la hidratación e interacción visual del cliente, la revisión móvil y las mediciones de Core Web Vitals. Las pruebas automatizadas y la compilación no demuestran esas comprobaciones de navegador. No se afirma que el Site carezca de otras vulnerabilidades: esta actualización aborda los dos avisos concretos identificados.

La producción conserva su despliegue anterior. El siguiente borrador se guarda para revisión; publicarlo necesita autorización independiente.

Fuentes primarias:

- https://github.com/react/react/security/advisories/GHSA-wx67-qw84-cm4g
- https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22
