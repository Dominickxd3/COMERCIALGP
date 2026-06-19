# Checklist Produccion ComercialGP

## Base de datos 10.10.1.6

- [ ] Existe base dbWEB_ComercialBI
- [ ] Existe vista dbo.vw_WEB_Comercial_VentasNetasUtilidades_Clean
- [ ] Existe SP dbo.sp_WEB_Refrescar_VentasNetasUtilidades
- [ ] Linked server hacia 10.10.1.3 funciona
- [ ] Usuario usuario_web creado
- [ ] usuario_web tiene SELECT sobre vista limpia
- [ ] usuario_web tiene EXECUTE sobre SP refresh
- [ ] Hay datos para periodo actual
- [ ] 2026 / Jun / S25 / GP devuelve datos

## Servidor app 10.10.1.11

- [ ] Node.js LTS instalado
- [ ] Git instalado
- [ ] NSSM instalado o disponible
- [ ] Puerto 3000 disponible
- [ ] Test-NetConnection 10.10.1.6 -Port 1433 exitoso
- [ ] Repositorio clonado
- [ ] Rama feature/nuevo-dashboard activa
- [ ] .env.production creado
- [ ] npm install OK
- [ ] npm run check:env OK
- [ ] npm run build OK
- [ ] Servicio Windows ComercialGP creado
- [ ] Servicio Windows ComercialGP iniciado
- [ ] Logs configurados
- [ ] App abre en http://10.10.1.11:3000

## Validacion funcional

- [ ] Muestra año/mes actual automaticamente
- [ ] Origen default es GP
- [ ] 2026 / Jun / S25 / GP muestra datos
- [ ] Semana Todos suma todas las semanas del mes
- [ ] Mes Todos cambia Semana a Todos
- [ ] Origen Todos suma GP + TDA
- [ ] Refresh muestra barra de carga
- [ ] No aparece pantalla vacia durante carga
- [ ] No se bloquean selects durante carga normal
- [ ] Otros aparece una sola vez
- [ ] Al seleccionar Otros muestra familias fuera del Top 5
- [ ] No hay mocks
