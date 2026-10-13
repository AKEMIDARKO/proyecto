# Actualización autorizada y aplicada en el borrador

El usuario autorizó esta actualización el 13 de octubre de 2026. Se aplicaron React, React DOM y React Server DOM Webpack 19.2.8, y Vite 8.1.6 sobre el borrador v22 del Site original. `pnpm-lock.yaml` se regeneró con pnpm 11.25.0 y la instalación con lockfile congelado pasó. `framework-security.patch` se conserva como registro de la propuesta original; no debe aplicarse de nuevo.

React Server DOM Webpack 19.2.6 estaba afectado por CVE-2026-44907 (GHSA-wx67-qw84-cm4g); 19.2.8 es la versión corregida de esa rama. Vite 8.0.13 pertenecía al rango de GHSA-rq7h-c2jc-7f22; el aviso afecta al servidor de desarrollo y tiene condiciones específicas, no prueba una exposición del Worker publicado. Estos cambios todavía no protegen la versión de producción, que no se ha publicado de nuevo.

TypeScript, compilación y las 70 pruebas existentes pasaron. Se revisaron las versiones instaladas y el cambio de dependencias transitivas de Vite. Vinext permanece en 1.0.0-beta.5; sus rangos peer y los de los plugins aceptan las versiones instaladas. No se modificaron cuentas, datos persistentes, secretos, migraciones ni automatizaciones. La QA real en navegador sigue pendiente por ausencia del control de navegador requerido en este entorno. La publicación requiere una aprobación distinta. Detalles y límites en `../audit/ACTUALIZACION_SEGURIDAD.md`.

Fuentes primarias:
- https://github.com/react/react/security/advisories/GHSA-wx67-qw84-cm4g
- https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22
