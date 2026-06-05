# blog-client

Frontend client for a simple blog application with real-time comments.

Built with React + Vite + Tailwind CSS as part of a technical evaluation for professional residencies.
Consumes the [blog-api](https://github.com/OrtegaGhost/blog-api) REST API.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Construction](#construction)
- [Environment Variables](#environment-variables)
- [Compilation](#compilation)
- [Execution](#execution)
- [Application Structure](#application-structure)
- [Project Structure](#project-structure)
- [Git History](#git-history)
- [AI Methodology](#ai-methodology)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v7 |
| HTTP client | Axios |
| Real-time | Socket.io client 4 |
| State | React Context API |
| i18n | Custom I18nContext (ES / EN) |
| Dark mode | Tailwind CSS `darkMode: 'class'` + ThemeContext |
| Runtime | Node.js 20+ |

---

## Requirements

- [Node.js](https://nodejs.org/) >= 20
- [blog-api](https://github.com/OrtegaGhost/blog-api) running on `http://localhost:3000`

> Start the backend first before running the frontend.

---

## Construction

### 1. Clone the repository

```bash
git clone https://github.com/OrtegaGhost/blog-client.git
cd blog-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` if the backend runs on a different URL. See [Environment Variables](#environment-variables).

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Base URL of the blog-api backend |
| `VITE_SOCKET_URL` | `http://localhost:3000` | Socket.io server URL (usually same as API) |

> All variables must be prefixed with `VITE_` to be accessible in the browser bundle.

**Example `.env`:**

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

---

## Compilation

Generates an optimized production build in the `dist/` folder:

```bash
npm run build
```

Output summary after a successful build:

```
dist/index.html          ~0.45 kB
dist/assets/index.css    ~16 kB  (gzip: ~4 kB)
dist/assets/index.js     ~342 kB (gzip: ~110 kB)
```

To preview the production build locally:

```bash
npm run preview
```

The preview server will be available at `http://localhost:4173`.

---

## Execution

### Development (with hot module replacement)

```bash
npm run dev
```

Available at `http://localhost:5173`.

> If port 5173 is already in use, Vite will automatically try 5174. Make sure the backend's `CORS_ORIGIN` includes the active port.

Make sure the backend is already running before opening the app.

### Production build

```bash
npm run build
npm run preview
```

### Docker (serve built files with Nginx)

Add a `Dockerfile` at the root of this project:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Then build and run:

```bash
docker build -t blog-client .
docker run -p 8080:80 blog-client
```

---

## Application Structure

The app has five pages, all connecting to the blog-api backend.

### Login

Facebook-style two-panel layout:

- **Left panel** — official brand logo and tagline
- **Right panel** — login form (username + password)
- Language toggle (ES / EN) in the top-right corner
- On success: saves the JWT, fetches the user profile via `/me`, then redirects to `/feed`
- Links to the register page

### Register

Centered card with full registration form:

- Fields: full name, email, username, password
- Profile photo upload with image preview
- Responsive layout: name/email fields stack on mobile, side-by-side on larger screens
- Language toggle (ES / EN) in the top-right corner
- Validates inputs client-side before submitting
- On success: redirects to `/login`

### Feed

Main timeline page (requires authentication):

- **Navbar** — Facebook blue (`#1877F2`) fixed bar with brand logo (circular), home tab, language toggle (ES / EN), settings gear icon and logout button. The user avatar links to their own profile.
- **Left sidebar** — authenticated user's profile card with comment stats + "Tu actividad" stats card showing personal post count, total posts and member-since date (hidden on mobile)
- **Feed center**:
  - Expandable comment creation box at the top
  - Real-time comment list — new comments, edits and deletes appear instantly via Socket.io (`comment:new`, `comment:updated`, `comment:deleted`) without refreshing
  - Each card shows author avatar (clickable → profile), name, username, relative timestamp, Like button and Comment button
  - **Like** — persisted in `localStorage` per comment; survives page reloads
  - **Comment** — opens an inline reply box below the specific card; reply is threaded to that post and shown as a nested bubble
  - **Edit** (own posts only) — pencil icon expands an inline textarea with the current content; save with Ctrl+Enter or the Save button
  - **Delete** (own posts only) — trash icon shows an inline confirmation panel ("¿Eliminar esta publicacion?") before removing; cascade-deletes all replies. Reply deletions also require inline confirmation

### Profile

Public profile page at `/profile/:username` (requires authentication):

- Accessible from any author avatar or name in the feed or Navbar
- Facebook-style cover banner + overlapping circular profile photo
- Displays name, username, and total post count with member-since date
- Lists all of the user's root-level posts with their replies
- If viewing your own profile:
  - Camera icon overlay on profile photo and cover to upload new images (converts to WebP server-side)
  - Settings gear button that navigates to `/settings`
  - Edit/delete buttons are active on each post

### Settings

Protected page at `/settings`, accessible via the gear icon (⚙) in the Navbar or the profile page:

- **Account section**
  - **Change Name** — inline input, saves immediately; validates letters only
  - **Change Password** — full form (current + new + confirm); shows success banner on completion
- **Appearance section**
  - **Dark Mode toggle** — animated switch; preference persisted in `localStorage`; applied without flash on reload
- **Danger Zone section**
  - **Delete Account** — requires typing `DELETE` in a confirmation input before the button activates; calls `DELETE /me`, clears session and redirects to login

### Dark Mode

Full dark theme powered by Tailwind CSS `darkMode: 'class'`:

- Toggled via the **Settings → Appearance** switch
- Preference saved in `localStorage` and applied via an inline script in `index.html` before React hydrates, preventing any flash of unstyled content on reload
- All pages and components include `dark:` variants: backgrounds, text, borders, inputs, buttons, cards, sidebars, modals and confirmation panels

### Internationalisation (i18n)

The app ships with full Spanish and English translations via a lightweight custom context (`I18nContext`):

- Language persists in `localStorage` across sessions
- Toggling language updates the entire UI instantly with no page reload
- Default language: **Spanish (ES)**
- All user-facing strings are translated: placeholders, buttons, labels, error messages and empty states
- API error codes (`INVALID_CREDENTIALS`, `DUPLICATE_USER`, `WRONG_CURRENT_PASSWORD`, `TOO_MANY_REQUESTS`, etc.) are mapped to translated messages — no English text from the backend ever reaches the user

### Responsive Design

- **Mobile (< 640 px)**: single-column layout, sidebar hidden, Navbar condensed
- **Tablet (640 px – 1024 px)**: adjusted padding and form rows
- **Desktop (> 1024 px)**: full Facebook-style two-column layout with sidebar

---

## Project Structure

```
blog-client/
├── public/
│   └── logo.png                      # Official brand logo
├── src/
│   ├── components/
│   │   ├── CommentCard.jsx            # Post card — likes, inline reply, edit/delete with confirmation, dark mode
│   │   ├── CreateCommentBox.jsx       # Expandable "What's on your mind?" input
│   │   ├── Navbar.jsx                 # Fixed top bar — circular logo, settings gear, avatar → profile
│   │   ├── ProtectedRoute.jsx         # Redirects unauthenticated users to /login
│   │   └── UserAvatar.jsx             # Photo or initials fallback avatar (lazy-loaded)
│   ├── context/
│   │   ├── AuthContext.jsx            # JWT auth state + localStorage persistence + updateUser()
│   │   ├── I18nContext.jsx            # ES/EN translations + language toggle
│   │   └── ThemeContext.jsx           # Dark mode state — persists in localStorage, toggles <html class="dark">
│   ├── hooks/
│   │   └── useSocket.js               # Handles comment:new, comment:updated, comment:deleted
│   ├── pages/
│   │   ├── FeedPage.jsx               # Main timeline with real-time comments + activity sidebar
│   │   ├── LoginPage.jsx              # Two-panel login layout
│   │   ├── ProfilePage.jsx            # Public user profile — photo/cover upload, settings button
│   │   ├── RegisterPage.jsx           # Registration form with photo upload
│   │   └── SettingsPage.jsx           # Change name, change password, dark mode toggle, delete account
│   ├── services/
│   │   └── api.js                     # Axios instance + auth / feed / users API calls + assetUrl helper
│   ├── utils/
│   │   ├── storage.js                 # localStorage helpers (token + user)
│   │   └── timeAgo.js                 # Intl.RelativeTimeFormat i18n-aware relative time
│   ├── App.jsx                        # Router + I18nProvider + ThemeProvider + AuthProvider
│   ├── index.css                      # Tailwind directives + global component classes (dark: variants)
│   └── main.jsx                       # React DOM root
├── index.html                         # Anti-FOUC dark mode script before React hydration
├── .env.example
├── tailwind.config.js                 # Facebook blue brand color + darkMode: 'class'
├── vite.config.js
└── package.json
```

---

## Git History

```
* (HEAD -> main) docs: update README with settings page, dark mode and profile photo upload
* 68f28a8 feat: settings page with dark mode, change name and delete account
* 4d32a5d feat: UI/UX improvements — navbar, profile photo upload, activity sidebar
* 86eabae docs: update README with profile page, edit/delete and threading features
* 649ea56 feat: add profile page, comment edit/delete and reply threading
* 1780d5b refactor: fix likes, enable comment button, i18n timeAgo, lazy images, Spanish comments
* ba3c533 fix: allow polling fallback in Socket.io to avoid StrictMode race condition
* 4ea71ea fix: store token before calling /me to avoid 400 on login
* bdb55da feat: add change-password page with Navbar link and full i18n
* 0c1fefb feat: responsive design, Facebook blue theme, and ES/EN language selector
* 355eeb7 docs: add comprehensive README with setup and execution instructions
* 4488a59 feat: initial frontend setup with full UI implementation
```

```bash
# To view the full graph:
git log --oneline --graph --all
```

---

## AI Methodology

The use of AI was **not restricted** per the evaluation terms. The following methodology was applied:

### Human-Led, AI-Augmented Development (HLAD)

The developer acted as **tech lead and architect**. Claude Code (claude-sonnet-4-6) acted as an **accelerated executor**. No code was merged without human review and approval.

| Phase | Human role | AI role |
|---|---|---|
| Requirements analysis | Defined UI/UX direction (Facebook-style, blue theme, responsive, bilingual) | Proposed component structure and data flow |
| Architecture design | Approved Context/hooks/pages separation | Generated initial file structure |
| Code generation | Reviewed every component before acceptance | Generated JSX, hooks and service layer |
| i18n design | Defined ES/EN as target languages and default (ES) | Implemented I18nContext with translation dictionaries |
| Error i18n | Identified that API errors must never appear in English | Mapped all backend error codes to translated keys |
| Change password | Requested the feature and approved the UX | Implemented ChangePasswordPage, route, Navbar link |
| Bug fixes | Identified login 400 and WebSocket console errors | Fixed token timing and Socket.io transport fallback |
| Styling | Defined Facebook blue palette and responsive breakpoints | Implemented Tailwind classes |
| Branding | Provided official logo asset | Integrated logo across Navbar, Login, Register and Change Password |
| Documentation | Reviewed and approved this README | Generated initial draft |

### Tools used

| Tool | Model | Purpose |
|---|---|---|
| Claude Code | claude-sonnet-4-6 | Component generation, state management, API integration, i18n, documentation |
| Claude Code | claude-haiku-4-5 | Quick lookups and clarifications |

### Guarantees

- Every component was understood and validated by the developer before committing
- The developer defined the UI reference (Facebook layout, blue color scheme, ES/EN language)
- The developer provided the official brand logo
- AI did not decide routing strategy, state management approach, or visual design
- The developer approved the final look before the code was committed
