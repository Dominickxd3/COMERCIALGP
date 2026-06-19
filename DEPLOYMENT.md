# ComercialGP - Despliegue Producción

## Arquitectura

10.10.1.3 = origen GP
10.10.1.6 = SQL Server local/cache ComercialGP
10.10.1.11 = servidor de aplicaciones Next.js

La app solo se conecta a 10.10.1.6.

## Requisitos en 10.10.1.11

- Node.js LTS instalado
- npm instalado
- Git instalado
- NSSM instalado o disponible
- Acceso de red a 10.10.1.6:1433

## Validar conexión SQL desde 10.10.1.11

PowerShell:

```powershell
Test-NetConnection 10.10.1.6 -Port 1433
```

Debe devolver:

```text
TcpTestSucceeded : True
```

## Preparar variables de entorno

Copiar:

`.env.production.example`

como:

`.env.production`

y completar credenciales reales.

## Build

```bash
npm install
npm run check:env
npm run build
```

## Crear Servicio Windows con NSSM

Ejemplo usando NSSM:

```cmd
nssm install ComercialGP
```

Configurar en la UI de NSSM:

* **Application:** `C:\Program Files\nodejs\node.exe`
* **Arguments:** `node_modules/next/dist/bin/next start -p 3000`
* **Startup directory:** `D:\COMERCIAL_WEB_GERENCIA`
* **Environment:**
  ```text
  NODE_ENV=production
  PORT=3000
  ```

También asegurar que el archivo `.env.production` exista en:
`D:\COMERCIAL_WEB_GERENCIA\.env.production`

## Iniciar servicio

```cmd
nssm start ComercialGP
```

## Detener servicio

```cmd
nssm stop ComercialGP
```

## Reiniciar servicio

```cmd
nssm restart ComercialGP
```

## Ver estado

```cmd
nssm status ComercialGP
```

## Logs

Configurar en NSSM:

* **stdout:** `D:\COMERCIAL_WEB_GERENCIA\logs\comercialgp-out.log`
* **stderr:** `D:\COMERCIAL_WEB_GERENCIA\logs\comercialgp-error.log`

Crear carpeta:

`D:\COMERCIAL_WEB_GERENCIA\logs`

## URL temporal

http://10.10.1.11:3000

## Validación funcional

Probar:
- 2026 / Jun / S25 / GP
- Debe mostrar volumen aproximado 160 t
- Debe mostrar valor venta aproximado S/ 1.40M

## Actualizar despliegue

```bash
git pull origin master
npm install
npm run build
nssm restart ComercialGP
```

## Troubleshooting

Si no conecta a SQL:
- validar firewall 10.10.1.11 -> 10.10.1.6 puerto 1433
- validar usuario SQL
- validar variables .env.production

Si la app carga versión vieja:
- ejecutar npm run build
- reiniciar servicio ComercialGP

Si refresh falla:
- validar permisos EXECUTE sobre dbo.sp_WEB_Refrescar_VentasNetasUtilidades
