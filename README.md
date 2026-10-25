# Exam Portal — Government Competitive Exam Study Portal

A modern, responsive educational website where an administrator uploads study material (PDF, DOC,
DOCX) and students browse, search and read it online as individual document pages.

Built as a full MERN stack application:

| Layer     | Technology                                                       |
| --------- | ---------------------------------------------------------------- |
| Frontend  | React 18, Vite 5, React Router 6, Axios, react-pdf (pdf.js)       |
| Backend   | Node.js, Express 4, Multer, express-validator, JWT auth          |
| Database  | MongoDB with Mongoose 8                                          |
| Storage   | Local disk driver by default (swappable for S3 / Cloudinary)      |

---

## 1. Project structure

```
Website_Project/
├── backend/
│   ├── config/          # env loading + database connection
│   ├── controllers/     # auth, documents, categories, statistics
│   ├── middleware/      # auth, upload, validation, rate limits, errors
│   ├── models/          # Admin, Category, Document, Question
│   ├── routes/          # REST route definitions
│   ├── scripts/seed.js  # sample data + admin creation CLI
│   ├── services/        # storage, Word→PDF conversion, queries, seeding
│   ├── uploads/         # stored files (served read-only)
│   ├── utils/           # response helpers, slugs, pagination, PDF writer
│   ├── .env.example
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/  # header, footer, cards, viewer, filters, dialogs
    │   ├── context/     # AuthContext (administrator session)
    │   ├── hooks/       # useDebounce
    │   ├── layouts/     # PublicLayout, AdminLayout
    │   ├── pages/       # public pages + admin/ console pages
    │   ├── services/    # axios client and per-resource API wrappers
    │   ├── styles/      # global, components, pages, admin stylesheets
    │   └── utils/       # constants, formatters, download helper
    ├── .env.example
    └── vite.config.js
```

---

## 2. Prerequisites

Install these before running the project:

1. **Node.js 18 or newer** — <https://nodejs.org> (includes npm). Verify with `node -v` and `npm -v`.
2. **MongoDB 6 or newer**, either:
   - a local server (`mongod`) — <https://www.mongodb.com/try/download/community>, or
   - a free **MongoDB Atlas** cluster (copy the SRV connection string).
3. *(Optional but recommended)* **LibreOffice** — required only to generate online PDF previews for
   `.doc` / `.docx` uploads. Without it, Word documents can still be uploaded and downloaded, but
   they will show a "preview not available" message instead of an inline viewer.

---

## 3. Backend setup

```bash
cd backend
npm install
copy .env.example .env      # Windows (PowerShell users can also use: Copy-Item .env.example .env)
npm run seed                # creates categories, sample documents, MCQs and the admin account
npm run dev                 # starts the API on http://localhost:5000
```

`npm run seed -- --reset` wipes existing documents, categories, questions and admins before
seeding — use it to start from a clean library.

### Required packages (installed by `npm install`)

`express`, `mongoose`, `multer`, `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `cors`, `helmet`,
`express-rate-limit`, `express-validator`, `morgan`, `dotenv`; `nodemon` as a development tool.

### Environment variables — `backend/.env`

| Variable           | Required | Default                 | Purpose                                                          |
| ------------------ | -------- | ----------------------- | ---------------------------------------------------------------- |
| `PORT`             | no       | `5000`                  | API port.                                                        |
| `NODE_ENV`         | no       | `development`           | Enables readable errors and request logging in development.       |
| `MONGODB_URI`      | **yes**  | —                       | Mongo connection string, e.g. `mongodb://127.0.0.1:27017/exam_portal`. |
| `JWT_SECRET`       | **yes**  | —                       | Long random string used to sign session tokens.                  |
| `JWT_EXPIRES_IN`   | no       | `7d`                    | Administrator session lifetime.                                   |
| `COOKIE_SECURE`    | no       | `false`                 | Set to `true` when serving over HTTPS.                            |
| `CLIENT_URL`       | no       | `http://localhost:5173` | Allowed CORS origin (comma-separate multiple origins).            |
| `MAX_UPLOAD_MB`    | no       | `25`                    | Maximum upload size in megabytes.                                 |
| `LIBREOFFICE_PATH` | no       | —                       | Full path to `soffice` for Word → PDF preview conversion.         |
| `ADMIN_NAME`       | no       | `Portal Administrator`  | Name given to the seeded administrator.                           |
| `ADMIN_EMAIL`      | no       | `admin@examportal.in`   | Seeded administrator email.                                       |
| `ADMIN_PASSWORD`   | no       | `Admin@12345`           | Seeded administrator password — **change it after first sign in**. |

Example:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/exam_portal
JWT_SECRET=replace-this-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
MAX_UPLOAD_MB=25
LIBREOFFICE_PATH=C:\Program Files\LibreOffice\program\soffice.exe
ADMIN_EMAIL=admin@examportal.in
ADMIN_PASSWORD=Admin@12345
```

---

## 4. Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev                 # starts the app on http://localhost:5173
```

### Required packages (installed by `npm install`)

`react`, `react-dom`, `react-router-dom`, `axios`, `react-pdf`; `vite` and `@vitejs/plugin-react`
as development tools.

### Environment variables — `frontend/.env`

| Variable             | Required | Default                 | Purpose                                        |
| -------------------- | -------- | ----------------------- | ---------------------------------------------- |
| `VITE_API_BASE_URL`  | no       | `http://localhost:5000` | Base URL of the backend API.                   |
| `VITE_MAX_UPLOAD_MB` | no       | `25`                    | Upload limit shown in the admin upload screen. |

Run `npm run build` to produce a production bundle in `frontend/dist`.

---

## 5. Administrator access

After seeding, sign in at **`/admin/login`** using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values you
set in `backend/.env`:

```
Email:    <ADMIN_EMAIL from backend/.env>
Password: <ADMIN_PASSWORD from backend/.env>
```

The template defaults are `admin@examportal.in` / `Admin@12345`. Change the password before putting
the portal on a public server.

Sessions are kept in an HTTP-only cookie named `exam_portal_token`. Passwords are stored as bcrypt
hashes and are never returned by the API.

From the console you can:

- **Dashboard** — totals for documents, published, drafts, reads, questions and categories, plus
  recent uploads, most-read documents and per-category breakdowns.
- **Upload material** — attach a PDF/DOC/DOCX file, set category, subject, examination, tags,
  publish state and whether downloads are allowed.
- **Manage documents** — search and filter the full catalogue including drafts, open a document
  page, edit or replace a file, publish/unpublish and delete.

---

## 6. File storage configuration

Uploads are handled by a single abstraction, `backend/services/storage.service.js`, which uses a
local-disk driver by default:

- files are written to `backend/uploads/`,
- metadata (`fileUrl`, `filePath`, size, type, page count, preview) is stored in MongoDB,
- `backend/server.js` serves `uploads/` **read-only** with `X-Content-Type-Options: nosniff` and a
  `Content-Disposition` header, so uploaded files are never executed.

To move to Cloudinary, Amazon S3 or another provider, replace `saveBuffer` / `saveFileCopy` /
`removeFile` / `publicUrl` in that one module with provider calls. Controllers and models need no
changes because they only use the exported helpers.

### Word → PDF preview conversion

`backend/services/convert.service.js` converts `.doc` / `.docx` uploads to a PDF preview using
LibreOffice in headless mode. PDF uploads are used directly and their page count is read from the
file itself. When conversion is unavailable the upload still succeeds; the document is marked with a
friendly `previewError` reason and students are offered the download instead.

---

## 7. API reference

Base URL: `http://localhost:5000/api`

### Public

| Method | Endpoint                         | Description                                             |
| ------ | -------------------------------- | ------------------------------------------------------- |
| `GET`  | `/health`                        | Service and database status.                            |
| `GET`  | `/categories`                    | Categories with published document counts.              |
| `GET`  | `/documents`                     | Published catalogue — `q`, `category`, `subject`, `examination`, `fileType`, `from`, `to`, `sort`, `page`, `limit`. |
| `GET`  | `/documents/:idOrSlug`           | One document plus related material (drafts only for signed-in admins). |
| `GET`  | `/documents/:idOrSlug/related`   | Related documents by category/subject.                  |
| `POST` | `/documents/:idOrSlug/view`      | Records a read and returns the new view count.          |
| `GET`  | `/comments`                      | Visitor comments, newest first — `page`, `limit` (max 50). |
| `POST` | `/comments`                      | Post a comment — JSON `{ name, message }` (hidden `website` honeypot). Rate limited. |

### Administrator (cookie or `Authorization: Bearer <token>`)

| Method   | Endpoint                     | Description                                        |
| -------- | ---------------------------- | -------------------------------------------------- |
| `POST`   | `/auth/login`                | Sign in; sets the session cookie.                  |
| `POST`   | `/auth/logout`               | Clear the session cookie.                          |
| `GET`    | `/auth/me`                   | Current administrator.                             |
| `GET`    | `/documents/admin`           | Full catalogue including drafts.                   |
| `POST`   | `/documents`                 | Create a document (multipart, field `file`).       |
| `PUT`    | `/documents/:id`             | Update details and optionally replace the file.    |
| `PATCH`  | `/documents/:id/status`      | Publish or unpublish.                              |
| `DELETE` | `/documents/:id`             | Delete the record and all stored files.            |
| `DELETE` | `/comments/:id`              | Remove an inappropriate or spam comment.           |
| `GET`    | `/stats/dashboard`           | Dashboard counters and highlights.                 |
| `POST`   | `/categories`                | Create a category.                                 |

---

## 8. Data models

- **Admin** — name, unique email, bcrypt `passwordHash` (never serialised), role
  (`admin` | `superadmin`).
- **Category** — name, slug, description, icon key, display order.
- **Document** — title, unique slug, description, category reference, subject, examination,
  file metadata (URL, path, original name, type, MIME, size), preview URL/error, page count, tags,
  status (`draft` | `published`), `allowDownload`, uploader, view count, publish timestamp.
- **Question** — question text, optional passage, four options, correct answer index, explanation,
  subject, topic, examination, difficulty, marks.
- **Comment** — visitor name (max 60), message (max 1000, stored as plain text), timestamps.

The Document model's `toJSON` removes the internal storage path, and `canPreview` is exposed so the
reading page knows whether to render the viewer or the download fallback.

---

## 9. Security notes

- `helmet` security headers and a CORS allowlist driven by `CLIENT_URL`.
- Rate limiting: a general limiter for the API, a stricter limiter on login, an upload limiter and a
  comment limiter (5 posts per 10 minutes).
- All input validated with `express-validator`; Mongoose schemas enforce length and enum rules.
- Comment text is stripped of markup before it is stored and is rendered as plain text on the page,
  so HTML or JavaScript posted as a comment can never execute. A hidden honeypot field plus the
  comment rate limiter handle bots, and deleting a comment requires an administrator session.
- Uploads are validated by extension and size before being written to disk, and orphaned files are
  cleaned up when a request fails.
- Sign-in errors are intentionally generic so account existence is not disclosed.
- Uploaded files are served read-only and never executed.

---

## 10. Troubleshooting

| Symptom                                                | Fix                                                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `MONGODB_URI and JWT_SECRET must be set` on start       | Create `backend/.env` from `.env.example` and fill both values.                                        |
| Frontend shows "Unable to reach the server"             | Confirm the API is running on port 5000 and that `VITE_API_BASE_URL` matches it.                      |
| `ENOENT` / connection refused on start                  | MongoDB is not running. Start `mongod` or use an Atlas connection string.                              |
| Word document shows "preview is not available"          | Set `LIBREOFFICE_PATH` to the `soffice` executable and restart the API.                                |
| Sign in always fails after seeding                      | Re-run `npm run seed` (or `npm run seed -- --reset`) and use the credentials in `backend/.env`.        |
| CORS error in the browser console                       | Add the frontend origin to `CLIENT_URL` in `backend/.env` (comma-separated for multiple origins).      |

---

## 11. Current scope and next steps

Implemented and working end to end:

- Public home page (hero, popular categories, latest uploads, popular materials), study materials
  catalogue with filters and pagination, keyword search page, dedicated document reading page with a
  full PDF viewer (page navigation, zoom, fullscreen, download), about, contact, privacy policy,
  terms and a 404 page.
- Administrator sign in, dashboard, upload/replace/edit, manage, publish/unpublish and delete.
- Backend documents, categories, authentication and statistics APIs with the four Mongoose models.

Planned for the next phase: interactive practice sections for GK questions, Mathematics (with
formula rendering), Current Affairs and timed Mock Tests, building on the existing `Question` model
and `/api` conventions.
