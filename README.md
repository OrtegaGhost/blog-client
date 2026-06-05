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
- [Pages and Features](#pages-and-features)
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
dist/assets/index.css    ~17 kB  (gzip: ~4.5 kB)
dist/assets/index.js     ~335 kB (gzip: ~108 kB)
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

The app has three main pages, all connecting to the blog-api backend.

### Login

Facebook-style two-panel layout:

- **Left panel** — brand logo and tagline
- **Right panel** — login form (username + password)
- On success: redirects to `/feed` and stores the JWT in `localStorage`
- Links to the register page

### Register

Centered card with full registration form:

- Fields: full name, email, username, password
- Profile photo upload with image preview
- Validates inputs client-side before submitting
- On success: redirects to `/login`

### Feed

Main timeline page (requires authentication):

- **Navbar** — yellow brand bar with logo, home icon and logout button
- **Left sidebar** — authenticated user's profile card with comment stats
- **Feed center**:
  - "What's on your mind?" expandible comment creation box
  - Real-time comment list — new comments appear instantly via Socket.io without refreshing
  - Each card shows author avatar, name, username, relative timestamp and Like/Comment buttons

---

## Project Structure

```
blog-client/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── CommentCard.jsx       # Individual comment — Facebook post style
│   │   ├── CreateCommentBox.jsx  # "What's on your mind?" expandible input
│   │   ├── Navbar.jsx            # Fixed top bar with yellow brand color
│   │   ├── ProtectedRoute.jsx    # Redirects unauthenticated users to /login
│   │   └── UserAvatar.jsx        # Photo or initials fallback avatar
│   ├── context/
│   │   └── AuthContext.jsx       # JWT auth state + localStorage persistence
│   ├── hooks/
│   │   └── useSocket.js          # Socket.io connection lifecycle hook
│   ├── pages/
│   │   ├── FeedPage.jsx          # Main timeline with real-time comments
│   │   ├── LoginPage.jsx         # Two-panel login layout
│   │   └── RegisterPage.jsx      # Registration form with photo upload
│   ├── services/
│   │   └── api.js                # Axios instance + auth/feed API calls
│   ├── utils/
│   │   ├── storage.js            # localStorage helpers (token + user)
│   │   └── timeAgo.js            # Relative time formatter (e.g. "3m ago")
│   ├── App.jsx                   # Router + AuthProvider wrapper
│   ├── index.css                 # Tailwind directives + global component classes
│   └── main.jsx                  # React DOM root
├── .env.example
├── tailwind.config.js            # Custom yellow brand color (#F7B928)
├── vite.config.js
└── package.json
```

---

## Git History

```
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
| Requirements analysis | Defined UI/UX direction (Facebook-style, yellow theme) | Proposed component structure and data flow |
| Architecture design | Approved Context/hooks/pages separation | Generated initial file structure |
| Code generation | Reviewed every component before acceptance | Generated JSX, hooks and service layer |
| Styling | Defined color palette and layout references | Implemented Tailwind classes and responsive breakpoints |
| Documentation | Reviewed and approved this README | Generated initial draft |

### Tools used

| Tool | Model | Purpose |
|---|---|---|
| Claude Code | claude-sonnet-4-6 | Component generation, state management, API integration, documentation |
| Claude Code | claude-haiku-4-5 | Quick lookups and clarifications |

### Guarantees

- Every component was understood and validated by the developer before committing
- The developer defined the UI reference (Facebook layout, yellow color scheme)
- AI did not decide routing strategy, state management approach, or visual design
- The developer approved the final look before the code was committed
