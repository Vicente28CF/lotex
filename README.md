<div align="center">
  <h1>🌱 Terrify</h1>
  <p><strong>El marketplace de terrenos moderno y local</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black.svg?style=flat&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Django-4.2-0C4B33.svg?style=flat&logo=django" alt="Django" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=flat&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat&logo=typescript" alt="TypeScript" />
  </p>
</div>

<br />

**Terrify** es un marketplace de terrenos orientado a la experiencia del usuario y transacciones sin fricción. Pensado para iniciar operativamente en Zacoalco de Torres, Jalisco, con una arquitectura escalable para habilitar un mercado regional y posteriormente global.

Nuestra filosofía de producto es sencilla: **Exploración pública sin barreras.** El usuario solo necesita registrarse cuando va a ejecutar una acción que aporta valor (publicar un terreno o contactar a un vendedor).

---

## 🎨 Características principales

- 🚀 **Navegación Sin Fricción**: Exploración y lectura de perfiles de terrenos de manera inmediata sin solicitar registro.
- 📱 **Mobile First**: Diseño adaptativo con componentes optimizados para smartphones orientados a navegación vertical tipo app.
- 🔒 **Contacto Mediado**: Solicitudes de contacto encriptadas y moderadas. El vendedor no expone su información públicamente; recibe los contactos desde su panel o vía correo electrónico.
- ⚡ **Performance (SSR + ISR)**: Renderizado optimizado con Next.js App Router para una carga instantánea y beneficios supremos en SEO.
- 🛡️ **Seguridad por diseño**: API protegida, autenticación robusta mediante tokens expensivos JWT, rotación y *Throttling* para evitar abusos.

---

## 🛠️ Stack Tecnológico

El proyecto está diseñado sobre un **Monorepo** que divide claramente la lógica de negocio y presentación frontal.

### 🌐 Frontend
- **Framework:** Next.js 14 (App Router)
- **UI & Estilos:** React 18, TailwindCSS, CSS Variables (Preferencia Reducción de movimiento)
- **Lenguaje:** TypeScript

### ⚙️ Backend
- **Framework:** Django 4.2 + Django REST Framework (DRF)
- **Base de Datos:** PostgreSQL
- **Cache & Colas:** Redis (Throttling y manejo de sesiones)
- **Autenticación:** SimpleJWT (Access/Refresh Tokens) con Blacklist

### ☁️ Infraestructura & Proveedores
- **Imágenes:** Cloudinary (Manipulación y almacenamiento cloud)
- **Correos:** Resend (Notificaciones transaccionales)
- **Contenedores:** Docker & Docker Compose
- **Despliegues (CI/CD):** GitHub Actions -> Vercel (Front) + Render (Back)

---

## 🏗️ Arquitectura de Software

La base fue construida manteniendo separación crítica de responsabilidades (SoC):
1. El **frontend interactúa unicamente** mediante una API REST protegida y no tiene conocimiento del acceso físico de la base de datos.
2. El **backend gestiona todas las reglas de negocio**, controlando autenticación, Rate Limiting y validación de propiedades espaciales del terreno.
3. Se integran políticas de seguridad agresivas para Cross-Origin (CORS), Content Security Policy (CSP) y JWT.

---

## 💻 Entorno de Desarrollo Local

El proyecto está listo para correr localmente mediante contenedores garantizando paridad en el equipo de desarrollo. 

### Prerrequisitos
- Node.js (v18+)
- Docker y Docker Compose
- Python 3.10+ (si desarrollas backend sin contenedor)

### Backend (Dockerizado)

El backend expone su API en `localhost:8000/api`.

```bash
# Iniciar servicios de backend y BD
docker compose up -d db redis backend

# (Opcional) Revisar migraciones o checks
docker compose exec backend python manage.py check
```
*(Nota: la URL raíz del backend puede devolver 404 intencionalmente, ya que expone un API REST).*

### Frontend (Local)

El proyecto utiliza dependencias del paquete standard npm.

```bash
cd frontend
npm install
npm run dev
```

La app estará disponible en `http://localhost:3000`.

---

## 🔐 Entorno Demo

Para pruebas operativas al flujo del vendedor e ingresos, el backend levanta datos tipo *seed* preconfigurados en la inicialización (ver scripts del backend). 

**Nota de seguridad**: Las variables sensibles (`CLOUDINARY_API_KEY`, `RESEND_API_KEY`, passwords locales, etc.) **jamás** deben agregarse al repositorio. Utiliza el archivo `frontend/.env.local` y el `backend/.env` copiando de los `.env.example` proporcionados.

---

## 🗺️ Roadmap Actual

El proyecto superó las fases de arquitectura, mocks y conectividad básica de la API. Nos encontramos operando integraciones reales (Cloudinary/Resend).

- [x] Desarrollo base Backend API & Base de Datos.
- [x] Autenticación JWT y roles de usuario.
- [x] Conexión Pública de Listado + Detalle (Next.js SSR).
- [x] Gestión privada (CRUD de terrenos, Carga de Imágenes a Cloudinary).
- [x] Dashboard de leads (Recepción de mensajes, gestión de pipeline, email notification).
- [x] Optimización UX y Rendimiento SSR/SEO.
- [ ] Pruebas unitarias extendidas a endpoints de contactos (Backend).
- [ ] Implementar pipelines de GitHub Actions automatizadas.
- [ ] Deploy nativo Multi-Entorno (Staging / Producción).

---

<div align="center">
  <small>Desarrollado con ❤️ para empoderar transacciones seguras de bienes raíces.</small>
</div>
