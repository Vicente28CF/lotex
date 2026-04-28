# AGENTS.md

## Quick Start

```bash
# Backend (Docker - recommended)
docker compose up -d db redis backend

# Frontend
cd frontend && npm install && npm run dev
```

**API**: http://localhost:8000/api | **Frontend**: http://localhost:3000

---

## Essential Commands

### Backend
```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py check
docker compose exec backend python manage.py test
docker compose exec backend python manage.py makemigrations
```

### Frontend
```bash
cd frontend && npm run lint    # ESLint
cd frontend && npx tsc --noEmit  # TypeScript
```

---

## Critical Quirks

- **Root URL returns 404**: The backend exposes REST API only, not HTML pages.
- **URLs use slugs, not UUIDs**: Endpoints like `/api/terrenos/{slug}/`
- **Tokens in memory**: Auth tokens stored client-side (not httpOnly). Token refresh handled automatically via `requestAuthenticatedJson()` in `lib/api.ts`.
- **Database host**: In Docker use `db`, outside Docker use `localhost`.
- **Action-based permissions**: ViewSets check `self.action` to determine permissions (e.g., `list`/`retrieve` = AllowAny, others = authenticated).

---

## Data Mapping

- **API responses**: snake_case (e.g., `created_at`)
- **Frontend types**: camelCase (e.g., `createdAt`)
- Mapper functions: `mapTerrenoList()`, `mapTerrenoDetail()`, `mapAuthUser()`, `mapContactRequest()`

---

## External Integrations

- **Cloudinary**: Image storage (max 10 images, 5MB each, JPEG/PNG/WEBP)
- **Resend**: Email notifications
- **PostgreSQL**: Primary database
- **Redis**: Cache + rate limiting
- **SimpleJWT**: 15min access token, 7-day refresh with rotation & blacklist

---

## Directory Ownership

- `backend/apps/users/` - User model, auth, roles (normal/agent/admin)
- `backend/apps/terrenos/` - Land listings, images, favorites
- `backend/apps/contacts/` - Contact requests between buyers/sellers
- `frontend/components/` - React components
- `frontend/lib/` - API layer (`api.ts`), types (`types.ts`)

---

## Custom Actions (Backend)

- `@action(detail=True, url_path="favorite")` - Toggle favorite
- `@action(detail=True, url_path="upload-images")` - Upload images to Cloudinary
- `@action(detail=False, url_path="mine")` - Current user's listings