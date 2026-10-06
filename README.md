# FitLife

Aplicación de gestión de gimnasio construida con un frontend estático, un API
Gateway y tres microservicios Node.js/Express. Los servicios usan MySQL y JWT.

## Requisitos

- Node.js y npm
- MySQL en ejecución en `localhost:3306` (por ejemplo, desde XAMPP)
- Las bases de datos y tablas configuradas para usuarios, planes y membresías

## Configuración local en Windows

Requisitos: Node.js/npm, XAMPP en `C:\xampp`, y las bases de datos y tablas de
usuarios, planes y membresías ya creadas en MySQL.

1. En cada carpeta de servicio, copia `.env.example` a `.env` y configura tus
   credenciales y nombres de bases de datos locales:
   - `gateway`
   - `usuarios-service`
   - `planes-service`
   - `membresias-service`
2. Ejecuta `npm ci` en cada una de esas cuatro carpetas.
3. En PowerShell, desde la raíz del proyecto, inicia MySQL y los servicios:

   ```powershell
   .\scripts\start-all.ps1
   ```

   El gateway queda en `http://localhost:3000`; los servicios de usuarios,
   planes y membresías usan los puertos `3001`, `3002` y `3003`.
4. Abre <http://localhost:3000>.

Para que se inicien automáticamente al iniciar sesión en Windows:

```powershell
.\scripts\install-autostart.ps1
```

Los registros se guardan en `%LOCALAPPDATA%\FitLife\logs`. Para detener los
servicios Node.js manualmente: `.\scripts\stop-all.ps1` (MySQL queda activo).

El gateway sirve el frontend y reenvía `/api` a los microservicios. Las
funciones de datos requieren MySQL y las bases de datos configuradas.

## Seguridad

Los `.env` locales se excluyen de Git porque contienen credenciales y secretos.
Usa `.env.example` solo como plantilla y configura secretos propios para cada
entorno. El script de creación del administrador requiere que definas sus
credenciales en `usuarios-service/.env`.
