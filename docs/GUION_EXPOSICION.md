# Guion de exposición: FitLife, DevOps y Prometheus (15 minutos)

## 0:00–10:00 — Demostración técnica

### 0:00–1:00 — Aplicación funcionando

- Abrir FitLife en `http://localhost:3000`.
- Mostrar las pantallas principales y explicar el flujo de frontend al gateway
  y a los microservicios.
- Aclarar si la base de datos de la demostración es MySQL local o el perfil
  opcional de Compose.

### 1:00–2:00 — Repositorio y arquitectura

- Mostrar el repositorio en GitHub y ubicar `frontend/`, `gateway/` y los tres
  directorios de servicios.
- Explicar brevemente el rol de usuarios, planes y membresías.
- Abrir el diagrama Mermaid del README.

### 2:00–3:30 — Dockerfile e imagen

- Mostrar un Dockerfile: Node 20 Alpine, instalación reproducible con `npm ci`,
  usuario sin privilegios y puerto expuesto.
- Explicar por qué el gateway usa el contexto raíz para incorporar el frontend.
- Mostrar las imágenes `fitlife-*` publicadas en Docker Hub, si ya se ejecutó el
  pipeline.

### 3:30–5:00 — Ejecución local con Compose

- Mostrar `docker compose ps` y los servicios levantados.
- Abrir la aplicación en `http://localhost:3000`.
- Explicar cómo los servicios alcanzan MySQL en el host, sin incluir secretos en
  las imágenes.

### 5:00–7:00 — Pipeline CI/CD

- Abrir `.github/workflows/ci.yml` y explicar el disparador `push` a `main` y
  la matriz de cuatro servicios.
- Revisar en GitHub Actions el checkout, Node 20, `npm ci`, pruebas, login y
  build/push de Docker.
- Mostrar las etiquetas `latest` y `sha-<commit-corto>` en Docker Hub.
- Aclarar que el login usa Actions secrets, no valores del código.

### 7:00–10:00 — Prometheus, CPU y RAM

- Abrir Prometheus en `http://localhost:9090` y mostrar **Status → Targets**.
- Confirmar que los cinco servicios y cAdvisor están `UP`.
- Consultar `rate(process_cpu_seconds_total[1m]) * 100` para la CPU del proceso.
- Consultar `process_resident_memory_bytes / 1024 / 1024` para RAM del proceso.
- Mostrar una consulta de `container_cpu_usage_seconds_total` y
  `container_memory_rss` para distinguir métricas de proceso y de contenedor.
- Enseñar `http_requests_total` para relacionar actividad HTTP con el servicio.

## 10:00–15:00 — Conceptos

### 10:00–11:00 — ¿Qué problema resuelve DevOps?

DevOps acerca desarrollo y operaciones para automatizar entregas, hacerlas
repetibles y recibir retroalimentación más rápido. Reduce diferencias entre
entornos y ayuda a detectar fallas antes de que afecten a los usuarios.

### 11:00–12:00 — ¿Qué es CI?

Integración Continua (CI) valida automáticamente cada cambio integrado:
descarga el código, instala dependencias y ejecuta pruebas. En FitLife, GitHub
Actions ejecuta esos pasos para los cuatro servicios al recibir un push a
`main`.

### 12:00–13:00 — ¿Qué es CD?

Entrega/Despliegue Continuo (CD) automatiza preparar o publicar una versión
después de validarla. En este proyecto, el pipeline construye las imágenes y
las publica en Docker Hub con etiquetas legibles y asociadas al commit.

### 13:00–14:00 — ¿Qué hace Docker?

Docker empaqueta la aplicación con sus dependencias en imágenes reproducibles.
Los contenedores ejecutan esas imágenes de forma aislada y Docker Compose
coordina servicios, red, puertos y volúmenes.

### 14:00–15:00 — ¿Por qué importa el monitoreo?

El monitoreo permite conocer disponibilidad, carga y uso de recursos, además de
ayudar a localizar problemas. Prometheus recolecta muestras mediante pull cada
15 segundos, las guarda como series de tiempo y permite consultarlas con
PromQL. CPU y RAM de proceso muestran el consumo de Node.js; cAdvisor añade la
vista por contenedor.

## Plan de capturas para la presentación

Guarda las evidencias en una carpeta local llamada `evidencias-fitlife` y usa
nombres numerados. No captures archivos `.env`, contraseñas, tokens, la pantalla
de configuración de Actions secrets ni datos personales de usuarios.

| Momento del guion | Dónde abrir | Qué debe verse en la captura |
| --- | --- | --- |
| 0:00, antes de explicar la app | `http://localhost:3000` | Portada FitLife cargada; barra de direcciones visible. |
| 0:30, demostración de la app | `http://localhost:3000/register.html` o `http://localhost:3000/login.html`; después del acceso, el dashboard | Formulario sin datos sensibles o dashboard con sesión de demostración. Para el dashboard, usa una cuenta de prueba propia, no la cuenta personal de un compañero. |
| 1:00, recorrido del repo | GitHub, página principal del repositorio en la rama `main` | Estructura de frontend, gateway, tres servicios, `monitoring/` y workflow. Tómala cuando el commit ya esté publicado. |
| 2:00, Dockerfile | GitHub: abre `gateway/Dockerfile` y luego uno de los Dockerfile de servicio | Imagen Node 20 Alpine, `npm ci --omit=dev`, usuario `node` y puerto expuesto. |
| 3:30, ejecución con Docker | Terminal en la raíz: `docker compose ps` | Los cuatro servicios, Prometheus y cAdvisor en estado `Up`. |
| 4:00, app dentro de Compose | Navegador en `http://localhost:3000` | La aplicación servida por el gateway después de iniciar Compose. |
| 5:00, CI/CD | GitHub → pestaña **Actions** → ejecución más reciente de “CI y publicación de imágenes” | Los cuatro trabajos verdes con pruebas y publicación completadas. Tómala después del primer push a `main` con los Actions secrets configurados. |
| 6:00, Docker Hub | Docker Hub → repositorios del usuario | `fitlife-gateway`, `fitlife-usuarios`, `fitlife-planes` y `fitlife-membresias`, con `latest` y una etiqueta `sha-*`. |
| 7:00, targets | `http://localhost:9090/targets` → **Status → Targets** | Seis targets (`prometheus`, `gateway`, `usuarios`, `planes`, `membresias`, `cadvisor`) en estado `UP`. Espera al menos 15–30 segundos tras iniciar Compose. |
| 8:00, CPU de proceso | Prometheus → **Graph**; pega `rate(process_cpu_seconds_total[1m]) * 100` y pulsa **Execute** | La consulta y resultados por servicio. |
| 8:30, RAM de proceso | Prometheus → **Graph**; pega `process_resident_memory_bytes / 1024 / 1024` y pulsa **Execute** | La consulta y resultados en MiB. |
| 9:00, solicitudes | Prometheus → **Graph**; pega `sum by (job) (rate(http_requests_total[1m]))` y pulsa **Execute** | Peticiones por segundo agrupadas por servicio. Genera algunas visitas antes para que la tasa sea visible. |
| 9:30, recursos de contenedor | Prometheus → **Graph**; ejecuta las consultas de cAdvisor de [`monitoring/QUERIES.md`](../monitoring/QUERIES.md) | CPU y RAM que expone cAdvisor. En Docker Desktop para Windows pueden aparecer grupos de la VM Linux. |

Antes de la exposición, confirma `docker compose ps`, Targets en `UP`, GitHub
Actions verde y las cuatro imágenes en Docker Hub. No incluyas contraseñas,
tokens JWT, Actions secrets ni valores de `.env` en capturas o diapositivas.
