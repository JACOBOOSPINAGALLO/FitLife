# Consultas PromQL

Ejecuta estas consultas en `http://localhost:9090`.

## Proceso Node.js por servicio

CPU de proceso como porcentaje aproximado de un núcleo:

```promql
rate(process_cpu_seconds_total[1m]) * 100
```

Memoria residente del proceso en MiB:

```promql
process_resident_memory_bytes / 1024 / 1024
```

Peticiones HTTP por segundo agrupadas por servicio:

```promql
sum by (job) (rate(http_requests_total[1m]))
```

Estado de los objetivos de recolección (`1` significa disponible):

```promql
up
```

## CPU y RAM de contenedores (cAdvisor)

Uso de CPU en núcleos, agrupado por el identificador de cgroup expuesto por
cAdvisor:

```promql
sum by (id) (rate(container_cpu_usage_seconds_total{id!=""}[1m]))
```

Memoria residente en MiB por cgroup:

```promql
container_memory_rss{id!=""} / 1024 / 1024
```

En Linux, cAdvisor suele incluir identificadores de contenedor en esas series.
Docker Desktop sobre Windows puede mostrar grupos de control de su VM Linux en
lugar de nombres de los contenedores de la aplicación.
