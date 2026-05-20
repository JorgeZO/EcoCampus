# EcoMonitor Industrial

Sistema de monitoreo ambiental y energético para plantas industriales.
Incluye backend (Node + Express + MongoDB), frontend (HTML + JS), generación de alertas automáticas y reporte de métricas imprimible.

## Estructura del proyecto

```
EcoCampus/
├── backend/                 # API REST Node.js + Express + Mongoose
│   ├── src/
│   │   ├── app.js           # Punto de entrada
│   │   ├── models/          # Esquemas Mongoose (User, EnergyReading, WaterReading, Alert, Obligation)
│   │   ├── routes/          # auth, energy, water, alerts, obligations, reports
│   │   ├── middleware/      # auth.js (JWT) y verificación de roles
│   │   ├── rules/           # engine.js – motor de reglas (semáforo y umbrales)
│   │   └── seed/seed.js     # Carga inicial de datos demo
│   ├── package.json
│   └── .env.example
│
├── frontend/                # Cliente HTML + CSS + JS vanilla
│   ├── index.html           # Pantalla de login
│   ├── dashboard.html       # Dashboard con KPIs, gráficas y alertas
│   ├── reporte.html         # Reporte imprimible / exportable a PDF
│   ├── css/styles.css
│   └── js/                  # api.js, login.js, dashboard.js, reporte.js
│
└── docs/
    ├── documento_analisis.docx
    └── diagrams/
        ├── casos_de_uso.svg
        ├── flujo_proceso.svg
        ├── modelo_bd.svg
        └── mockups.svg
```

## Requisitos previos

- Node.js 18+ y npm
- MongoDB 6+ corriendo localmente en `mongodb://localhost:27017`

## Instalación y ejecución

### 1) Backend

```bash
cd backend
cp .env.example .env       # ajusta PORT, MONGO_URI, JWT_SECRET si es necesario
npm install
npm run seed               # carga usuarios, lecturas, alertas y obligaciones demo
npm start                  # arranca la API en http://localhost:3000
```

Salida esperada:

```
[OK] Conectado a MongoDB: mongodb://localhost:27017/ecomonitor
[OK] EcoMonitor API escuchando en http://localhost:3000
```

### 2) Frontend

No requiere build. Solo abre el archivo en tu navegador:

```bash
open frontend/index.html
```

Si tu navegador bloquea `fetch` desde `file://`, puedes servirlo con:

```bash
cd frontend && python3 -m http.server 5500
# y abre http://localhost:5500
```

### 3) Cuentas de prueba

Después de correr `npm run seed`:

| Rol         | Correo                       | Contraseña |
|-------------|------------------------------|------------|
| Admin       | admin@ecomonitor.mx          | demo1234   |
| Operador    | operador@ecomonitor.mx       | demo1234   |
| Auditor     | auditor@ecomonitor.mx        | demo1234   |

## Endpoints principales

Todas las rutas devuelven JSON en el formato:

```json
{ "status": "ok", "data": { ... }, "timestamp": "2026-05-19T..." }
```

| Método | Ruta                              | Descripción                                     |
|--------|-----------------------------------|-------------------------------------------------|
| POST   | `/api/auth/login`                 | Inicia sesión (devuelve JWT)                    |
| GET    | `/api/energy`                     | Últimas lecturas de energía                     |
| GET    | `/api/energy/summary`             | Agregado de energía (últimas 24 h)              |
| POST   | `/api/energy`                     | Registra lectura (genera alerta si excede)      |
| GET    | `/api/water`                      | Últimas lecturas de agua                        |
| POST   | `/api/water`                      | Registra lectura de agua (incluye pH)           |
| GET    | `/api/alerts`                     | Lista alertas                                   |
| PATCH  | `/api/alerts/:id/ack`             | Reconoce una alerta                             |
| GET    | `/api/compliance/obligations`     | Lista obligaciones con semáforo de cumplimiento |
| GET    | `/api/reports/metrics`            | Reporte consolidado para impresión              |

Todos los endpoints (salvo `/api/auth/login`) requieren header
`Authorization: Bearer <token>`.

## Generar el reporte de métricas

1. Inicia sesión en el frontend.
2. En la barra superior del Dashboard, haz clic en **Reporte**.
3. Pulsa **Imprimir / Guardar PDF**.
4. El navegador abre la vista de impresión: selecciona "Guardar como PDF" para
   exportarlo o envíalo directamente a la impresora.

## Diagramas y mockups

- `docs/diagrams/casos_de_uso.svg` – Diagrama de casos de uso
- `docs/diagrams/flujo_proceso.svg` – Flujo de proceso del sistema
- `docs/diagrams/modelo_bd.svg` – Modelo de la base de datos (MongoDB)
- `docs/diagrams/mockups.svg` – Mockups de las 3 pantallas

## Tecnologías

- **Backend**: Node.js, Express, Mongoose, bcryptjs, jsonwebtoken, cors, dotenv
- **Base de datos**: MongoDB
- **Frontend**: HTML5, CSS3, JavaScript vanilla, Chart.js (CDN)
- **Reportes**: HTML imprimible vía `window.print()` → PDF
