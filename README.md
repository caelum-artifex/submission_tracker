## Demo Video

[Screen Recording](https://screenrec.com/share/rf2e7uxLjY)

# Submission Tracker - Completed Solution

This repository contains a completed implementation of the Submission Tracker take-home challenge using:

- **Backend:** Django + Django REST Framework
- **Frontend:** Next.js 16 + React 19 + Material UI + React Query

## What I Built

### Backend

Implemented and refined API behavior for a realistic submission review workflow:

- Enhanced `GET /api/submissions/` list response with:
  - Related broker, company, and owner data
  - `documentCount` and `noteCount`
  - `latestNote` preview data
- Extended filtering support:
  - `status`
  - `brokerId`
  - `companySearch`
  - `createdFrom`
  - `createdTo`
  - `hasDocuments`
  - `hasNotes`
- Optimized query access patterns:
  - `select_related` for list performance
  - `prefetch_related` for detail retrieval
- Updated `GET /api/brokers/` to return a flat list (no pagination), suitable for dropdowns.

### Frontend

Built a complete submissions list and detail experience:

- `/submissions` list page:
  - URL-synced filters (`status`, `brokerId`, `companySearch`, `page`)
  - Paginated table view
  - Row click navigation to detail page
  - Loading, empty, and error states
  - Visual polish for readability and hierarchy
- `/submissions/[id]` detail page:
  - Header summary with status/priority and company metadata
  - Contacts section
  - Documents section
  - Notes timeline
  - Loading skeletons and section-specific empty states

### Testing

Added targeted backend automated tests covering:

- Broker endpoint shape (`/api/brokers/`)
- Submission list filters (`status`, `brokerId`, `companySearch`, `hasDocuments`)
- Submission detail nested payload shape (`contacts`, `documents`, `notes`)

## Approach

I prioritized end-to-end product flow first, then correctness and maintainability:

1. Implemented backend filters and list/detail enrichment so frontend could consume stable data.
2. Built list page with URL-driven filters and pagination for shareable/searchable state.
3. Built detail page sections to match operational review needs.
4. Added focused backend tests for critical API behaviors.
5. Performed UI/UX improvements for visual clarity and navigation confidence.

## Tradeoffs / Decisions

- Focused tests on backend API contract rather than full frontend integration tests due to scope/time.
- Used server-side filtering (query params) over client-side filtering to keep data source authoritative and scalable.
- Kept pagination server-driven to avoid large payload rendering and keep frontend simpler.
- Implemented practical UI polish (state handling, visual hierarchy, affordances) instead of introducing a heavier design system layer.

## How to Run

### 1) Backend

```bash
cd backend
python -m venv .venv
```

Activate virtual env:

- **Windows (PowerShell)**

```powershell
.venv\Scripts\Activate.ps1
```

- **Windows (cmd)**

```cmd
.venv\Scripts\activate.bat
```

- **macOS/Linux**

```bash
source .venv/bin/activate
```

Install, migrate, seed, test, run:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_submissions --force
python manage.py test submissions
python manage.py runserver 0.0.0.0:8000
```

Backend runs at `http://localhost:8000`.

### 2) Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (optional override):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

Run dev server:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000/submissions`.

## API Summary

- `GET /api/submissions/`
  - Paginated list with related broker/company/owner and counts.
  - Supports filtering via query params.
- `GET /api/submissions/<id>/`
  - Full submission detail with contacts/documents/notes.
- `GET /api/brokers/`
  - Flat list for dropdown options.

## Notes

- If using Git Bash + nvm4w and seeing `Illegal instruction` with `npm`, run frontend commands in PowerShell/cmd instead.
- Backend `.gitignore` excludes local environment/database/cache artifacts.

## Stretch Improvements (If Continuing)

- Add date-range and has-notes/has-documents controls to frontend filter UI.
- Add API serializer/unit tests for annotation fields.
- Add frontend integration tests for list/filter/detail navigation.
- Add auth/permissions layer for production readiness.
