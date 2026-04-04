# LoteX

Marketplace de terrenos enfocado en experiencia local, exploracion publica sin friccion y autenticacion solo cuando el usuario quiere ejecutar una accion sensible como publicar o contactar.

Stack principal:

- Backend: Django 4.2 + Django REST Framework + SimpleJWT + PostgreSQL + Redis
- Frontend: Next.js 14 + React 18 + TypeScript + TailwindCSS
- Infra prevista: Render + Vercel + Cloudinary + Resend + GitHub Actions

## Vision del producto

LoteX nace como un marketplace de terrenos con foco inicial en Zacoalco de Torres, Jalisco, y posibilidad de escalar por zonas y regiones.

Principios de producto:

- exploracion publica sin login
- detalle publico claro antes de convertir
- autenticacion solo en acciones con impacto
- experiencia ligera, local y mobile first
- base segura y mantenible desde el inicio

## Objetivo del MVP

El MVP busca validar:

1. Que existe demanda real por un marketplace local de terrenos.
2. Que compradores pueden descubrir terrenos facilmente sin friccion.
3. Que vendedores aceptan publicar sin costo al inicio.
4. Que la operacion puede crecer sobre una base con seguridad y orden tecnico.

## Arquitectura general

El proyecto esta organizado como monorepo:

- `backend/`: API REST en Django + DRF
- `frontend/`: app web en Next.js
- `docker-compose.yml`: orquestacion local

Arquitectura prevista:

- Frontend desplegado en Vercel
- Backend desplegado en Render
- PostgreSQL como base principal
- Redis para cache y throttling
- Cloudinary para imagenes
- Resend para emails de contacto mediado

Separacion de responsabilidades:

- el frontend nunca toca la base de datos
- el backend concentra reglas de negocio, auth, validaciones y permisos
- el contacto al vendedor es mediado
- las imagenes publicas salen de Cloudinary, pero el backend controla validacion, ownership y almacenamiento de metadata

## Estado actual del proyecto

### Backend ya implementado

El backend ya corre en Docker y actualmente tiene:

- estructura Django configurada por entornos
- `config.settings.base`, `development` y `production`
- modelo de usuario custom con email como identificador
- modelos de dominio:
  - `User`
  - `Terreno`
  - `TerrenoImage`
  - `ContactRequest`
- autenticacion JWT funcional
- refresh token con rotacion y blacklist
- throttling inicial para login y contacto
- permisos reutilizables por objeto
- migraciones funcionando en local
- admin de Django configurado
- API real de terrenos
- API real de contactos
- soporte backend para subida de imagenes a Cloudinary

### Frontend ya implementado

El frontend ya fue migrado a:

- Next.js 14
- TypeScript
- TailwindCSS

La app web ya tiene una base navegable en local con estas vistas:

- Home publica conectada al backend real
- Login redisenado
- Detalle publico de terreno conectado al backend real y mejorado visualmente
- Vista privada de publicar mejorada
- Dashboard privado del vendedor mejorado

La logica de UX ya esta alineada con el objetivo del producto:

- el home se navega sin autenticacion
- el detalle del terreno se ve sin autenticacion
- al intentar publicar o contactar se redirige a login
- el login consume el backend real
- el formulario de contacto protegido consume el backend real
- el dashboard del vendedor consume el backend real

## Estado funcional actual

### Lo que hoy si funciona

Backend:

- Docker Compose valida correctamente
- PostgreSQL levanta
- Redis levanta
- Django corre en local
- migraciones aplican correctamente
- admin de Django disponible
- login JWT funcionando
- registro funcionando
- refresh token funcionando
- logout con blacklist funcionando
- endpoint `/api/users/me/` funcionando
- listado publico de terrenos funcionando
- detalle publico por `slug` funcionando
- creacion de terreno funcionando
- edicion de terreno funcionando
- listado `mis terrenos` funcionando
- creacion de solicitud de contacto funcionando
- listado de contactos para vendedor funcionando
- cambio de estado de contacto funcionando
- subida inicial de imagenes a Cloudinary funcionando
- hardening de Cloudinary con manejo de fallos y logs funcionando
- hardening de Resend con manejo de fallos y logs funcionando
- checks y suite backend validados en Docker

Frontend:

- home publica conectada a la API real
- detalle publico conectado a la API real
- formulario protegido de contacto funcionando
- dashboard privado del vendedor funcionando
- creacion de terreno desde el panel funcionando
- edicion de terreno desde el panel funcionando
- carga de imagenes desde celular o PC funcionando desde el panel
- gestion de contactos desde frontend funcionando
- gestion avanzada de imagenes desde frontend funcionando
- UI mobile first mejorada y mucho mas consistente
- refresh de sesion y restauracion de auth mas robustos funcionando
- filtros remotos de contactos funcionando contra backend real
- paginacion real de contactos funcionando en dashboard
- refresco automatico ligero de contactos funcionando en dashboard

### Credenciales locales de prueba

Admin local:

- email: `terrenos@test.com`
- password: `terrenosLotex28`

Usuario demo:

- email: `vendedor@test.com`
- password: `LoteXDemoPass28`

### Datos demo ya creados en local

Se dejaron datos de prueba en la base local para validar admin y frontend:

- un usuario vendedor demo
- un terreno demo
- una imagen demo asociada
- una solicitud de contacto demo

## Seguridad ya aplicada

El proyecto se esta construyendo con enfoque DevSecOps desde la base.

### Medidas ya presentes

- `AUTH_USER_MODEL` custom
- passwords hasheados con Django
- JWT con access y refresh
- rotacion y blacklist de refresh tokens
- logout invalida el refresh token
- configuracion de CORS por entorno
- configuracion de CSP en settings
- configuracion HTTPS para produccion
- throttling base en DRF
- throttling especifico de login
- throttling especifico de contacto
- permisos por objeto para dominio
- configuracion separada por entorno
- variables sensibles via `.env`
- validacion de area y precio
- validacion de ownership en escritura
- validacion basica de tipo de archivo para imagenes
- limite de tamano y cantidad de imagenes
- manejo mas seguro de fallos en Cloudinary
- manejo mas seguro de fallos en Resend
- logging base para contactos, terrenos y errores HTTP relevantes

### Notas de seguridad importantes

- el backend esta en buen punto para desarrollo local, pero no debe considerarse cerrado en seguridad todavia
- la subida de imagenes ya existe, pero faltan mas validaciones de abuso y observabilidad
- el flujo de contacto ya envia email mediado con Resend en modo prueba y queda listo para dominio real en produccion
- `npm audit` sigue reportando advisories que solo desaparecen con upgrade mayor de Next

## Endpoints backend disponibles hoy

Autenticacion y perfil:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/token/refresh/`
- `POST /api/auth/logout/`
- `GET /api/users/me/`
- `PATCH /api/users/me/`

Terrenos:

- `GET /api/terrenos/`
- `GET /api/terrenos/{slug}/`
- `POST /api/terrenos/`
- `PATCH /api/terrenos/{slug}/`
- `DELETE /api/terrenos/{slug}/`
- `GET /api/terrenos/mine/`
- `PUT /api/terrenos/{slug}/images/`
- `POST /api/terrenos/{slug}/upload-images/`

Contactos:

- `POST /api/contact-requests/`
- `GET /api/contact-requests/`
- `PATCH /api/contact-requests/{id}/`
- `POST /api/contact-requests/{id}/resend-email/`

## Estructura principal actual

### Raiz

- `README.md`
- `docker-compose.yml`
- `backend/`
- `frontend/`

### Backend

Archivos y carpetas importantes:

- `backend/manage.py`
- `backend/config/settings/base.py`
- `backend/config/settings/development.py`
- `backend/config/settings/production.py`
- `backend/config/urls.py`
- `backend/core/permissions.py`
- `backend/core/throttling.py`
- `backend/apps/users/`
- `backend/apps/terrenos/`
- `backend/apps/contacts/`

### Frontend

Archivos y carpetas importantes:

- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/app/login/page.tsx`
- `frontend/app/publicar/page.tsx`
- `frontend/app/terrenos/[slug]/page.tsx`
- `frontend/components/`
- `frontend/lib/api.ts`
- `frontend/lib/types.ts`
- `frontend/tailwind.config.ts`
- `frontend/tsconfig.json`

## Flujo de usuario actualmente modelado

### Usuario comprador

1. Entra al home sin login.
2. Explora cards de terrenos reales.
3. Abre el detalle publico sin login.
4. Cuando decide contactar, se le pide autenticacion.
5. Envia solicitud mediada al vendedor.

### Usuario vendedor

1. Entra al sitio sin login.
2. Explora el producto y entiende el valor.
3. Cuando decide operar, inicia sesion.
4. Entra al dashboard privado.
5. Publica, edita y mantiene sus terrenos.
6. Revisa solicitudes de contacto recibidas.

## Lo que se mejoro recientemente

Durante esta etapa se construyo:

1. Backend de dominio real

- API de terrenos
- slug para URLs publicas
- filtros, paginacion y vistas
- reglas de ownership
- API de contactos
- soporte de subida a Cloudinary
- gestion avanzada de imagenes por backend
- notificacion mediada de contacto con Resend
- estado de notificacion persistido en contactos
- accion backend para reenviar emails de contacto
- hardening de Cloudinary y Resend con servicios dedicados, logs y errores controlados
- suite backend ampliada y verificada dentro de Docker

2. Frontend conectado al backend real

- home conectado a `GET /api/terrenos/`
- detalle conectado a `GET /api/terrenos/{slug}/`
- formulario de contacto conectado a `POST /api/contact-requests/`
- dashboard conectado a `GET /api/terrenos/mine/`
- dashboard conectado a `GET /api/contact-requests/`
- dashboard conectado a `PATCH /api/contact-requests/{id}/`
- dashboard conectado a `POST /api/contact-requests/{id}/resend-email/`
- gestion de galeria conectada a backend real
- capa API privada con refresh automatico y reintento controlado
- restauracion de sesion usando refresh token
- filtros y paginacion de contactos conectados a query params reales del backend

3. UX/UI

- rediseño visual de home publica
- rediseño visual de detalle de terreno
- rediseño visual de login
- mejora visual de publicar y dashboard
- header mas limpio y mejor resuelto en responsive
- cards, filtros, empty states y skeletons mas claros
- navegacion inferior movil refinada
- toasts, confirmaciones y estados de accion mas visibles

4. Operacion del vendedor

- crear terreno
- editar terreno
- reflejar estado visual `active / paused / sold`
- subir imagenes desde dispositivo
- borrar imagenes
- reordenar galeria
- seleccionar portada
- cambiar estado de contactos
- reenviar email de contacto fallido o pendiente

## Avances de hoy

En la sesion de hoy se cerro un bloque grande de hardening, auth y operacion:

1. Integraciones backend

- Cloudinary ya opera via servicio dedicado con logs y errores controlados
- Resend ya opera via servicio dedicado con errores tipados y mejor trazabilidad
- los fallos de integraciones ya no dejan el flujo tan opaco como antes
- se agrego logging base reutilizable para `apps.contacts`, `apps.terrenos` y errores HTTP relevantes

2. Validacion y pruebas

- la suite backend crecio a pruebas de hardening para Cloudinary y Resend
- `python manage.py test apps.terrenos apps.contacts` ya fue validado en Docker
- `python manage.py check` ya fue validado en Docker

3. Auth e infraestructura frontend

- el frontend ya restaura sesion desde `refreshToken`
- las llamadas privadas ya pueden refrescar sesion y reintentar una vez ante `401`
- logout y expiracion de sesion ya se manejan de forma mas consistente
- header y paneles protegidos ya muestran estados de restauracion, refresh y expiracion

4. Dashboard de contactos

- filtros remotos de contactos ya consultan al backend real
- la paginacion de contactos ya usa la pagina real del backend
- ya existen skeletons y estados de carga mas claros para filtros y paginacion
- el panel ya refresca contactos en segundo plano cuando la pestaña esta activa

## Lo que falta por construir

Esta es la parte critica para saber donde vamos despues de este punto.

### Backend pendiente inmediato

1. Hardening y seguridad

- pruebas mas profundas de permisos y abuso
- validacion MIME mas robusta
- observabilidad mas completa con correlacion y monitoreo externo
- mejor manejo de abuso y rate limits mas finos
- cobertura adicional para escenarios limite y regresiones

2. Contactos y operacion

- flujo de respuesta del vendedor mas completo
- reintentos masivos o tooling admin para emails fallidos
- mejor lectura de backlog operacional en panel

### Frontend pendiente inmediato

1. UX refinada final

- revision responsive fina en movil y tablet
- microinteracciones adicionales
- estados transitorios mas finos
- errores mas claros por campo y por accion
- mejor diferenciacion entre refresco automatico, carga manual y expiracion de sesion

2. Infra UX/auth

- pruebas frontend del flujo auth/dashboard
- endurecer mas la persistencia y recuperacion de sesion
- revisar si conviene mover parte del auth a cookies seguras o middleware mas adelante

3. Dashboard y operacion

- refresco optimista o notificaciones mas visibles para nuevos leads
- mejor lectura de cambios cuando entra un contacto nuevo
- posible cache local ligera para transiciones mas suaves

## Roadmap sugerido desde este punto

Orden recomendado:

### Fase 1

- completada

### Fase 2

- completada

### Fase 3

- Resend integrado en modo prueba
- reenvio manual de notificaciones desde panel
- pendiente cerrar dominio real verificado para produccion

### Fase 4

- hardening de backend
- pruebas mas profundas
- observabilidad de integraciones
- auth frontend mas robusta
- dashboard de contactos con filtros, paginacion y refresco vivo
- polish responsive final donde haga falta

### Fase 5

- Redis para cache/throttling real
- CI/CD
- audit de dependencias
- deploy a Render y Vercel
- pruebas frontend y smoke tests end-to-end

## Como levantar el proyecto localmente

### Backend

El backend corre con Docker.

Comandos utiles:

```bash
docker compose up -d db redis backend
docker compose exec backend python manage.py showmigrations
docker compose exec backend python manage.py check
docker compose exec backend python manage.py createsuperuser
```

URLs locales backend:

- `http://localhost:8000/api/terrenos/`
- `http://localhost:8000/admin/`

Nota:

- `http://localhost:8000/` responde `404` y eso es esperado, porque el backend expone API, no una pagina publica en la raiz

### Frontend

El frontend puede correrse localmente desde `frontend/`.

Comandos utiles:

```bash
cd frontend
npm install
npm run dev
```

URL local frontend:

- `http://localhost:3000/`

Nota:

- si `3000` esta ocupado, Next puede moverse a `3001` o a otro puerto; usa la URL exacta que te imprima la consola

### Variables importantes

Backend:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `DEFAULT_FROM_EMAIL`
- `RESEND_TEST_TO_EMAIL`

Frontend:

- `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

## Decisiones tomadas hasta ahora

### Decisiones de producto

- el sitio no obliga login para explorar
- el login solo aparece cuando el usuario intenta una accion protegida
- el mercado inicial es local y geografico
- la monetizacion no se fuerza desde el dia uno

### Decisiones tecnicas

- monorepo
- Django + DRF en backend
- Next App Router en frontend
- TypeScript en frontend
- TailwindCSS para base visual
- JWT para auth
- Docker para desarrollo local
- enfoque modular por apps en Django
- Cloudinary como capa de media

### Decisiones de seguridad

- auth desde modelo custom de usuario
- tokens con refresh y blacklist
- permisos por objeto
- throttling por tipo de accion
- configuracion por entorno
- seguridad incorporada desde la base del proyecto

## Riesgos actuales

Estos son los puntos aun no cerrados:

1. El flujo de contacto ya funciona en modo prueba, pero todavia no esta cerrado para produccion con dominio verificado.
2. En produccion faltara cambiar Resend de modo prueba a dominio verificado real.
3. Aun faltan pruebas profundas de permisos y abuso.
4. El manejo de errores y observabilidad de integraciones todavia puede endurecerse mas.
5. Sigue existiendo backlog de hardening adicional en frontend por advisories de Next.

## Donde nos quedamos exactamente

El proyecto hoy esta en este punto:

- backend de auth funcional
- backend de terrenos funcional
- backend de contactos funcional
- soporte backend para upload y gestion de imagenes
- frontend publico conectado a la API real
- contacto protegido funcionando
- dashboard del vendedor funcionando
- creacion y edicion de terrenos funcionando
- carga y gestion avanzada de imagenes funcionando
- email mediado de contacto funcionando en modo prueba
- Cloudinary endurecido con mejor manejo de fallos
- Resend endurecido con mejor manejo de fallos
- restauracion y refresh de sesion funcionando en frontend
- dashboard de contactos conectado a filtros y paginacion reales
- refresco ligero de contactos funcionando en segundo plano
- UX/UI ya en un nivel mucho mas cercano a producto real

En otras palabras:

Ya no estamos en fase de infraestructura ni de mocks.
Ya estamos en fase de operacion real del marketplace y refinamiento de experiencia.

## Siguiente objetivo concreto

El siguiente bloque recomendado es:

1. pruebas frontend del flujo auth, dashboard y contactos
2. refinamiento UX final de estados, responsive y microinteracciones
3. observabilidad mas completa y monitoreo externo para integraciones
4. despues preparar despliegue real con dominio verificado para Resend y CI/CD

Ese es el punto natural de continuacion del proyecto desde este estado.
