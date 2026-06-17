# Diagnóstico Comercial Audit

## Fecha

2026-06-15

## Objetivo

Auditar el proyecto actual `COMERCIALGP` para determinar si es posible construir un dashboard transversal de diagnóstico comercial usando datos reales, comparativos históricos y alertas sin inventar información.

## 1. Dónde se cargan hoy los datos comerciales

Actualmente el proyecto **no tiene carga real desde API ni desde SQL Server**.

Las fuentes actuales son archivos de frontend con datos simulados embebidos:

- `src/components/comercial/commercial-data.ts`
- `src/components/comercial/familias/family-data.ts`
- `src/components/comercial/subfamilias/subfamily-data.ts`
- `src/components/comercial/productos/product-data.ts`

Hallazgos:

- No existen `route.ts` de API para comercial.
- No existe integración con SQL Server.
- No existe cliente `mssql`, `prisma`, `typeorm`, `sequelize` ni repositorio de acceso a base de datos.
- `axios` está instalado en `package.json`, pero no se usa para traer datos comerciales.

## 2. Campos disponibles en el código actual

### Campos normalizados que sí existen en frontend

Los módulos actuales usan nombres normalizados, no nombres reales de base de datos:

- `venta`
- `kilos`
- `unidades`
- `periodo`
- `mes`
- `origin` / `origen`
- `familia`
- `subfamilia`
- `producto`
- `productoMarca`

### Campos reales de base de datos

No hay evidencia en el código actual de nombres reales de SQL Server para estas métricas.

No se encontraron implementados en código:

- `VEN_VAL`
- `VEN_KGS`
- `SWORIGEN`
- nombres reales de tabla o vista

Conclusión:

- **No se puede confirmar todavía el nombre real de los campos en SQL Server**.
- Solo se puede afirmar que el frontend actual espera un modelo comercial equivalente a:
  - venta total
  - kilos vendidos
  - unidades
  - periodo
  - origen
  - familia
  - subfamilia
  - producto
  - productoMarca

## 3. Histórico disponible para comparaciones

### Inicio

`src/components/comercial/commercial-data.ts`

Incluye una serie mensual simulada:

- `202601` a `202612`

Eso permite, en el mock actual:

- comparar contra periodo anterior
- comparar últimos meses

Pero **no es histórico real**.

### Familias, Subfamilias y Productos

Los módulos de detalle usan escalado simulado por periodo/origen y rankings con datos embebidos.

No existe:

- snapshot histórico real por entidad
- persistencia real por periodo
- serie temporal real conectada a base de datos

### YoY

No existe histórico de más de un año real en el proyecto.

Conclusión:

- Comparación contra periodo anterior: **solo posible a nivel mock**, no validable como real.
- YoY: **no implementable con datos reales actuales**.
- Últimos 6 meses: **solo posible con mocks**, no con fuente de producción.

## 4. Helpers ya existentes

### Sí existen

En distintos módulos existen helpers de formato:

- `formatCurrencyCompact`
- `formatKilosCompact`
- `formatPercent`
- `formatPriceKg`
- `formatUnitsCompact`

### No existen todavía como helper reutilizable transversal

- `safeDivide`
- `calculateAveragePricePerKg`
- `calculateVariationPercent`
- `getPreviousPeriod`
- `getSamePeriodPreviousYear`

Conclusión:

- Hay base para formato visual.
- Faltan helpers transversales de cálculo seguro para diagnóstico.

## 5. Precio promedio kg

Sí se puede calcular conceptualmente como:

`venta total / kilos vendidos`

Pero hoy:

- en Inicio se calcula sobre mock mensual
- en Familias/Subfamilias/Productos se calcula sobre datos simulados

Conclusión:

- **La fórmula es clara**
- **No hay aún validación sobre fuente real**

## 6. Variación contra periodo anterior

Conceptualmente sí puede calcularse:

`((actual - anterior) / anterior) * 100`

Pero el proyecto actual no tiene:

- fuente real por periodo
- entidad histórica real por familia / subfamilia / producto

Conclusión:

- **La lógica sí es implementable**
- **La métrica no es confiable en producción mientras la app siga usando mocks**

## 7. Variación YoY

No hay histórico real de años anteriores.

Conclusión:

- **YoY queda bloqueado**

## 8. Riesgos para un dashboard Diagnóstico

Si se implementa usando la data actual:

- las alertas serían artificiales
- los crecimientos/caídas serían derivados de mocks
- la matriz precio-volumen no sería confiable
- el gerente vería diagnósticos no sustentados por base real

Eso violaría el criterio:

- no inventar datos
- no hardcodear ventas, kilos, familias ni variaciones
- no usar mocks en producción

## 9. Recomendación de implementación

### Sí es seguro hacer ahora

1. Crear la ruta `Diagnóstico`
2. Integrarla al sidebar
3. Crear helpers reutilizables de cálculo seguro
4. Preparar filtros consistentes con el resto del sistema
5. Mostrar estados vacíos/bloqueados claros por falta de histórico real
6. Documentar la dependencia de conexión a SQL Server/API

### No es seguro hacer ahora con datos reales

1. KPIs comparativos reales
2. Alertas comerciales reales
3. Top crecimientos / top caídas reales
4. Matriz precio vs volumen real
5. Descomposición precio vs volumen real

## 10. Conclusión final

Estado actual del proyecto:

- El sistema visual está construido y funcional.
- La data sigue siendo mockeada en frontend.
- No existe integración con SQL Server ni API comercial real.

Por tanto:

- **No se debe construir un dashboard diagnóstico con métricas reales todavía**
- **Sí se puede construir la estructura del módulo Diagnóstico y dejarlo preparado**
- **Las funciones avanzadas deben quedar bloqueadas hasta conectar la fuente real**

## 11. Resumen ejecutivo

- Variación contra periodo anterior: posible en lógica, no validable con datos reales actuales.
- YoY: bloqueado por falta de histórico real.
- Precio promedio kg: fórmula clara, fuente real no conectada.
- Campos reales SQL: no identificables aún desde el código actual.
- Campos frontend actuales: `venta`, `kilos`, `unidades`, `periodo`, `origen`, `familia`, `subfamilia`, `producto`, `productoMarca`.
