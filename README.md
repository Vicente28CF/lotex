# LoteX

Marketplace de terrenos enfocado en experiencia local, exploracion publica sin friccion y autenticacion solo cuando el usuario quiere ejecutar una accion sensible como publicar o contactar.

Stack principal:

- Backend: Django 4.2 + Django REST Framework + SimpleJWT + PostgreSQL + Redis
- Frontend: Next.js 14 + React 18 + TypeScript + TailwindCSS
- Infra prevista: Render + Vercel + Cloudinary + Resend + GitHub Actions

## Vision del producto

LoteX nace como un marketplace de terrenos con foco inicial en Zacoalco de Torres, Jalisco, y posibilidad de escalar por zonas y regiones. La idea principal no es competir frontalmente con portales inmobiliarios generalistas desde el dia uno, sino atacar un nicho mejor definido:

- mercado geografico especifico
- experiencia limpia y rapida
- cero friccion para explorar inventario
- costo inicial cero para quien publica
- posibilidad futura de monetizar via anuncios destacados y planes para agentes

Principio clave de UX:

- Cualquier persona debe poder entrar al sitio, explorar listados y ver detalles sin iniciar sesion.
- Solo se solicita autenticacion cuando el usuario intenta publicar, administrar sus anuncios o contactar al vendedor.

Ese criterio ya se reflejo en la primera base del frontend.

## Objetivo del MVP

El MVP busca validar cuatro cosas:

1. Que existe demanda real por un marketplace local de terrenos.
2. Que los usuarios pueden descubrir terrenos facilmente sin una experiencia pesada.
3. Que los vendedores aceptan publicar sin costo al inicio.
4. Que el producto puede crecer sobre una base segura y mantenible, no sobre deuda tecnica temprana.

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

- El frontend nunca debe tocar la base de datos directamente.
- El backend expone endpoints REST y concentra autenticacion, permisos, validaciones y reglas de negocio.
- El sistema de contacto debe ser mediado: nunca exponer directamente email o telefono del vendedor.

## Estado actual del proyecto

Esta seccion describe lo que ya esta construido y validado localmente.

### Backend ya implementado

El backend ya corre en Docker y actualmente tiene:

- estructura Django configurada por entornos
- `config.settings.base`, `development` y `production`
- modelo de usuario custom con email como identificador
- modelos base del dominio:
  - `User`
  - `Terreno`
  - `TerrenoImage`
  - `ContactRequest`
- migraciones funcionando en local
- admin de Django configurado para los modelos principales
- autenticacion JWT funcional
- endpoints base de auth y perfil
- throttling inicial para login
- blacklist de refresh tokens para logout
- pruebas basicas del modulo `users`

### Frontend ya implementado

El frontend ya fue migrado a:

- Next.js 14
- TypeScript
- TailwindCSS

La app web ya tiene una base navegable en local con estas vistas:

- Home publica
- Login
- Vista protegida de publicar
- Detalle publico de terreno

La logica de UX ya esta alineada con el objetivo del producto:

- el home se puede navegar sin autenticacion
- el detalle de terreno se puede ver sin autenticacion
- al intentar publicar o contactar se redirige a login
- el login ya consume el backend real de Django

Actualmente el frontend usa datos mock para los terrenos porque la API de listados y detalle todavia no esta implementada.

## Estado funcional actual

### Lo que hoy si funciona

Backend:

- Docker Compose valida correctamente
- PostgreSQL levanta
- Redis levanta
- Django corre en local
- migraciones aplican correctamente
- admin de Django disponible
- superusuario local creado
- login JWT funcionando
- registro funcionando
- refresh token funcionando
- logout con blacklist funcionando
- endpoint `/api/users/me/` funcionando

Frontend:

- servidor de Next funcionando en local
- build de produccion correcto
- home publica accesible
- login accesible
- detalle publico accesible
- flujo protegido de publicar accesible
- login conectado al backend

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

El proyecto se esta construyendo con enfoque DevSecOps desde la base. Esto significa que no se esta dejando la seguridad para el final.

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
- permisos reutilizables en `core/permissions.py`
- configuracion separada por entorno
- variables sensibles via `.env`

### Notas de seguridad importantes

- El backend esta en buen punto para desarrollo local, pero no debe considerarse “cerrado” en seguridad todavia.
- El frontend ya fue actualizado a `next@14.2.35`, pero `npm audit` sigue reportando advisories que solo desaparecen con upgrade mayor a `Next 16.x`.
- Esa actualizacion mayor debe evaluarse despues, no mezclada con la construccion del MVP.

## Endpoints backend existentes hoy

Autenticacion y perfil:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/token/refresh/`
- `POST /api/auth/logout/`
- `GET /api/users/me/`
- `PATCH /api/users/me/`

Comportamiento actual:

- `register` crea usuario y devuelve tokens
- `login` valida credenciales y devuelve tokens
- `refresh` renueva access token
- `logout` invalida el refresh token
- `me` expone perfil del usuario autenticado

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
- `frontend/lib/mock-terrenos.ts`
- `frontend/lib/types.ts`
- `frontend/tailwind.config.ts`
- `frontend/tsconfig.json`

## Flujo de usuario actualmente modelado

### Usuario comprador

1. Entra al home sin login.
2. Ve cards de terrenos.
3. Abre el detalle de un terreno sin login.
4. Cuando intenta contactar, el sistema lo redirige a login.

### Usuario vendedor

1. Entra al sitio sin login.
2. Explora el producto y entiende el valor.
3. Cuando decide publicar, el sistema lo redirige a login.
4. Despues de autenticarse, entra al flujo privado.

Este principio es central y debe mantenerse durante el desarrollo.

## Lo que falta por construir

Esta es la parte critica para saber donde nos quedamos y hacia donde vamos.

### Backend pendiente inmediato

1. API de terrenos

- listado publico
- detalle publico
- creacion de terreno
- edicion de terreno
- eliminacion
- filtros por municipio, precio y area
- paginacion
- incremento de vistas

2. API de imagenes

- subida a Cloudinary
- limite por anuncio
- portada
- borrado con `cloudinary_id`

3. API de contactos

- crear solicitud de contacto
- listado de solicitudes para el vendedor
- cambio de estado
- envio mediado por email
- nunca exponer datos privados del vendedor

4. Seguridad y reglas de negocio pendientes

- permisos por objeto aplicados a todos los endpoints del dominio
- throttling para contacto
- serializers estrictos para `terrenos` y `contacts`
- validacion de tipo MIME real en imagenes
- endurecer manejo de errores
- pruebas de permisos y abuso

### Frontend pendiente inmediato

1. Conectar el home a la API real de terrenos

- quitar mock data del listado principal
- integrar carga real desde backend

2. Conectar detalle de terreno a la API real

- cargar terreno por id o slug
- mostrar galeria real
- mostrar metadatos reales

3. Construir el formulario de contacto protegido

- visible solo al autenticarse
- conectado al endpoint mediado de contacto
- mensajes de exito y error

4. Construir dashboard privado

- mis terrenos
- publicar terreno
- editar terreno
- ver contactos recibidos

5. Mejorar infraestructura frontend

- manejo real de tokens
- refresh token mas robusto
- clientes HTTP reutilizables
- estados de carga y errores
- componentes reutilizables de UI

## Roadmap sugerido desde este punto

Orden recomendado para continuar:

### Fase 1

- implementar endpoints reales de `terrenos`
- conectar frontend home y detalle a esos endpoints
- validar listado y detalle end to end

### Fase 2

- implementar `contacts`
- conectar formulario de contacto protegido
- asegurar que el vendedor nunca exponga contacto directo

### Fase 3

- implementar dashboard del vendedor
- publicar, editar, pausar y eliminar terrenos
- gestionar imagenes

### Fase 4

- Cloudinary real
- Resend real
- Redis para cache/throttling real
- CI/CD
- audit de dependencias
- deploy a Render y Vercel

## Como levantar el proyecto localmente

### Backend

El backend ya corre con Docker.

Comandos utiles:

```bash
docker compose up -d db redis backend
docker compose exec backend python manage.py showmigrations
docker compose exec backend python manage.py check
docker compose exec backend python manage.py createsuperuser
```

URL local backend:

- `http://localhost:8000/`
- Admin: `http://localhost:8000/admin/`

### Frontend

El frontend ya puede correrse localmente desde `frontend/`.

Comandos utiles:

```bash
cd frontend
npm install
npm run build
npm run start
```

URL local frontend:

- `http://localhost:3000/`

## Decisiones tomadas hasta ahora

### Decisiones de producto

- El sitio no obliga login para explorar.
- El login solo aparece cuando el usuario intenta una accion protegida.
- El mercado inicial es local y geografico.
- La monetizacion no se fuerza desde el dia uno.

### Decisiones tecnicas

- Monorepo
- Django + DRF en backend
- Next App Router en frontend
- TypeScript en frontend
- TailwindCSS para base visual
- JWT para auth
- Docker para desarrollo local
- enfoque modular por apps en Django

### Decisiones de seguridad

- auth desde modelo custom de usuario
- tokens con refresh y blacklist
- configuracion por entorno
- seguridad incorporada desde la base del proyecto

## Riesgos actuales

Estos son los principales riesgos o puntos aun no cerrados:

1. La API de dominio real aun no existe para terrenos y contactos.
2. El frontend depende de mock data para la parte central del marketplace.
3. El dashboard de vendedor todavia no existe.
4. El flujo de imagenes no esta integrado con Cloudinary.
5. El flujo de contacto mediado no esta integrado con Resend.
6. Aun faltan pruebas profundas de permisos y abuso.
7. Existe un backlog de hardening adicional en frontend por advisories de Next que requieren upgrade mayor.

## Donde nos quedamos exactamente

El proyecto hoy esta en este punto:

- backend base funcional y corriendo
- auth funcional end to end
- frontend base funcional en TypeScript + Tailwind
- UX publica definida
- seguridad inicial ya integrada
- datos demo listos para validar
- listo para empezar la API real de terrenos

En otras palabras:

Ya no estamos atascados en infraestructura ni en arranque local.
El siguiente trabajo real es construir el dominio del marketplace y conectar frontend con backend de forma completa.

## Siguiente objetivo concreto

El siguiente bloque de trabajo recomendado es:

1. implementar endpoints reales de `terrenos`
2. conectar el listado publico del frontend
3. conectar el detalle publico del frontend
4. despues implementar el contacto protegido

Ese es el punto de continuacion natural del proyecto desde este commit de trabajo.
