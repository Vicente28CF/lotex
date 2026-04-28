# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Terrify** is a land marketplace web application with a mobile-first design. It's a monorepo with Django REST API backend and Next.js frontend.

- **Philosophy**: Public exploration without barriers. Users only register when performing value-add actions (publishing land or contacting sellers).
- **Location**: Initially focused on Zacoalco de Torres, Jalisco, Mexico with scalable architecture for regional/global expansion.

---

## Development Commands

### Backend (Dockerized - Recommended)

```bash
# Start backend services (PostgreSQL, Redis, Django)
docker compose up -d db redis backend

# Run Django management commands
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py check
docker compose exec backend python manage.py test
docker compose exec backend python manage.py makemigrations

# View backend logs
docker compose logs -f backend
```

Backend API is available at `http://localhost:8000/api`

### Frontend (Local)

```bash
cd frontend
npm install
npm run dev      # Development server on http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
npx tsc --noEmit # TypeScript type checking
```

### Full Stack (Docker)

```bash
# Start everything including frontend
docker compose --profile frontend up -d

# Stop all services
docker compose down
```

---

## Architecture Overview

### Backend (Django + DRF)

**Apps Structure** (`backend/apps/`):
- `users/` - Custom user model with email-based auth, role system (normal/agent/admin), JWT token management
- `terrenos/` - Land listings (Terreno), images (TerrenoImage), favorites (Favorite)
- `contacts/` - Contact requests between buyers and sellers with notification tracking

**Key Configuration**:
- Settings split: `config/settings/base.py`, `development.py`, `production.py`
- Custom permissions in `core/permissions.py`: `IsOwnerOrReadOnly`, `IsAgentOrAdmin`
- Rate limiting via `core/throttling.py` and DRF throttle config
- JWT auth with SimpleJWT: 15min access token, 7-day refresh with rotation & blacklist

**External Integrations**:
- **Cloudinary**: Image storage for land photos (max 10 images, 5MB each)
- **Resend**: Transactional email notifications for contact requests
- **PostgreSQL**: Primary database with custom indexes on municipio, status, price
- **Redis**: Cache and rate limiting backend

### Frontend (Next.js 16 + React 19)

**App Router Structure** (`frontend/app/`):
- `/` - Home with featured listings and terrain browser
- `/login` - Authentication page
- `/terrenos/[slug]` - Land detail page
- `/favoritos/` - User's favorite listings
- `/guia-legal/` - Legal guide

**Key Directories**:
- `components/` - React components: site-header, terrain-card, terrain-browser, seller-dashboard, etc.
- `lib/` - API layer (`api.ts`) and TypeScript types (`types.ts`)

**Design System** (Tailwind):
- Custom colors: `sand` (#fbf7f2), `ink` (#1f1f1f), `coral` (#ff385c), `stone` (#6a6a6a)
- Fonts: DM Sans (body), Sora (display) via Google Fonts
- Glassmorphism effects with `backdrop-blur` and semi-transparent backgrounds

**Auth Flow**:
- Client-side auth via `AuthProvider` context
- Access/refresh tokens stored in memory (secure httpOnly not used - tokens rotate)
- Automatic token refresh on 401 responses via `requestAuthenticatedJson()` in `api.ts`

### API Communication

**Base URL Resolution** (`lib/api.ts:getApiBaseUrl()`):
- Uses `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_API_BASE_URL` env vars
- Defaults to `http://localhost:8000/api`

**Data Mapping Pattern**:
- API responses use snake_case, internal types use camelCase
- Mapping functions: `mapTerrenoList()`, `mapTerrenoDetail()`, `mapAuthUser()`, `mapContactRequest()`

### Database Schema

**Key Models**:
- `users.User` - Custom user with UUID PK, email auth, role field, `can_publish` property
- `terrenos.Terreno` - Land listing with slug, geolocation (lat/lng), status, view counter
- `terrenos.TerrenoImage` - Cloudinary-stored images with ordering and cover flag
- `terrenos.Favorite` - Many-to-many user-land favorites
- `contacts.ContactRequest` - Buyer inquiries with notification status tracking

---

## Environment Configuration

### Backend (`backend/.env`)

```bash
DJANGO_SETTINGS_MODULE=config.settings.development
SECRET_KEY=<generate-strong-key>
DB_NAME=terrify_db
DB_USER=terrify_user
DB_PASSWORD=terrify_pass
DB_HOST=db  # 'localhost' if running outside Docker
DB_PORT=5432
REDIS_URL=redis://redis:6379/0
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
DEFAULT_FROM_EMAIL=noreply@terrify.mx
```

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci-cd.yml`):
1. **Backend CI**: Python 3.12, PostgreSQL service, Redis service - runs migrations, Django checks, tests
2. **Frontend CI**: Node 20 - installs deps, type checks, builds
3. **Deploy**: Render (backend) + Vercel (frontend) on pushes to main

---

## Security Considerations

- **CSP**: Configured in Django (`CSP_*` settings) and Next.js headers
- **Rate Limiting**: DRF throttling (anon: 100/hr, user: 500/hr, login: 5/min, contact: 10/hr)
- **CORS**: Open in development (`CORS_ALLOW_ALL_ORIGINS = True`), restrictive in production
- **JWT**: Short-lived access tokens with refresh rotation and blacklist on logout
- **Image Validation**: Server-side format check (JPEG/PNG/WEBP) and size limit (5MB)

---

## Key Implementation Patterns

### Backend

**ViewSets** with action-based permissions:
```python
class TerrenoViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"  # URLs use slugs not UUIDs
    
    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny]
        return [IsAuthenticated, IsOwnerOrReadOnly]
```

**Custom Actions** for business logic:
- `@action(detail=True, url_path="favorite")` - Toggle favorite status
- `@action(detail=True, url_path="upload-images")` - Multipart image upload to Cloudinary
- `@action(detail=False, url_path="mine")` - Current user's listings

### Frontend

**Server Components** with ISR:
```typescript
export const revalidate = 60; // ISR cache duration

async function HomeContent() {
  const response = await fetchTerrenos(); // Uses Next.js fetch with revalidate
}
```

**Protected Actions** via `ProtectedAction` component - shows auth modal or redirects to login based on auth state.

**Image Optimization**: Next.js `Image` component with Cloudinary remote pattern configured.

---

## Testing

### Backend Tests

```bash
docker compose exec backend python manage.py test
```

Test files: `backend/apps/*/tests.py`

### Frontend Type Checking

```bash
cd frontend
npx tsc --noEmit
```

---

## Deployment Notes

- **Production Backend**: Render (Docker-based), requires environment variables for DB, Redis, Cloudinary, Resend
- **Production Frontend**: Vercel, requires `NEXT_PUBLIC_API_URL` pointing to production backend
- **Database**: PostgreSQL 16 with migrations run on deploy
- **Static Files**: Django `collectstatic` for admin, Next.js static export for frontend assets
