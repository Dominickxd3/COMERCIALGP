# ComercialGP - Despliegue Produccion

## Arquitectura

10.10.1.3 = servidor origen GP  
10.10.1.6 = SQL Server local/cache ComercialGP  
10.10.1.11 = servidor de aplicaciones Next.js  

La app solo se conecta a 10.10.1.6.

## Requisitos en 10.10.1.11

- Node.js LTS instalado
- npm instalado
- Git instalado
- NSSM instalado o disponible
- Acceso de red a 10.10.1.6:1433

## Validar conexion SQL desde 10.10.1.11

PowerShell:

```powershell
Test-NetConnection 10.10.1.6 -Port 1433
```

Debe devolver:

```text
TcpTestSucceeded : True
```

## Preparar proyecto

```bash
git clone https://github.com/Dominickxd3/COMERCIALGP.git
cd COMERCIALGP
git checkout feature/nuevo-dashboard
```

## Preparar variables de entorno

Copiar:

`.env.production.example`

como:

`.env.production`

Completar credenciales reales en el servidor.

No subir `.env.production` al repositorio.

## Instalar dependencias

```bash
npm install
```

## Validar entorno

```bash
npm run check:env
```

## Build produccion

```bash
npm run build
```

## Crear carpeta de logs

```powershell
mkdir logs
```

## Crear Servicio Windows con NSSM

Ejecutar en PowerShell o CMD como administrador:

```cmd
nssm install ComercialGP
```

Configurar:

Application:  
`C:\Program Files\nodejs\node.exe`

Arguments:  
`node_modules/next/dist/bin/next start -p 3000`

Startup directory:  
`D:\COMERCIAL_WEB_GERENCIA`

Environment:

```text
NODE_ENV=production
PORT=3000
```

Asegurar que exista:

`D:\COMERCIAL_WEB_GERENCIA\.env.production`

Comandos equivalentes por linea:

```cmd
nssm install ComercialGP "C:\Program Files\nodejs\node.exe" "node_modules/next/dist/bin/next start -p 3000"
nssm set ComercialGP AppDirectory D:\COMERCIAL_WEB_GERENCIA
nssm set ComercialGP AppEnvironmentExtra NODE_ENV=production PORT=3000
nssm set ComercialGP AppStdout D:\COMERCIAL_WEB_GERENCIA\logs\comercialgp-out.log
nssm set ComercialGP AppStderr D:\COMERCIAL_WEB_GERENCIA\logs\comercialgp-error.log
nssm set ComercialGP AppRotateFiles 1
nssm set ComercialGP Start SERVICE_AUTO_START
```

## Configurar logs NSSM

stdout:  
`D:\COMERCIAL_WEB_GERENCIA\logs\comercialgp-out.log`

stderr:  
`D:\COMERCIAL_WEB_GERENCIA\logs\comercialgp-error.log`

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

## URL temporal

http://10.10.1.11:3000

## Validacion funcional

Probar:
- 2026 / Jun / S25 / GP
- Debe mostrar volumen aproximado 160 T
- Debe mostrar valor venta aproximado S/ 1.40M
- Cambiar Semana a Todos no debe cambiar Mes
- Cambiar Mes a Todos debe poner Semana en Todos
- Origen default debe ser GP
- Origen Todos debe sumar GP + TDA
- Refresh debe mostrar barra de carga
- No debe aparecer pantalla vacia durante carga
- No debe duplicarse Otros

## Actualizar despliegue

```bash
git pull origin feature/nuevo-dashboard
npm install
npm run check:env
npm run build
nssm restart ComercialGP
```

## Troubleshooting

Si no conecta a SQL:
- validar firewall 10.10.1.11 -> 10.10.1.6 puerto 1433
- validar usuario SQL
- validar variables .env.production
- validar que no se use NEXT_PUBLIC para credenciales SQL

Si la app carga version vieja:
- ejecutar npm run build
- reiniciar servicio ComercialGP

Si refresh falla:
- validar permisos EXECUTE sobre dbo.sp_WEB_Refrescar_VentasNetasUtilidades
- validar que la app se conecte a 10.10.1.6, no a 10.10.1.3

Si aparece Otros duplicado:
- validar que backend no devuelva Otros sintetico
- validar que frontend filtre cualquier item con name OTROS antes de recalcular Top 5 + Otros
