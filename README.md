# Haadi Cloud — Frontend

A React + Vite single-page application for a cloud storage platform: file and folder management, authentication (including Google OAuth), subscription/billing via Razorpay, an admin panel, and account settings.

## Tech Stack

- **React 18** + **Vite 6** — UI and build tooling
- **React Router 7** — client-side routing with lazy-loaded route chunks
- **Tailwind CSS v4** (`@tailwindcss/vite`) — utility-first styling
- **Axios** — API requests, with a shared instance and response interceptor
- **@react-oauth/google** — Google Sign-In
- **react-hot-toast** — toast notifications
- **lucide-react** — icon set
- **ESLint** — linting

## Project Structure

```
src/
├── api/                  # Axios instances and per-domain API modules
│   ├── axiosInstances.js #   shared axios clients + 401 redirect interceptor
│   ├── authApi.js
│   ├── userApi.js
│   ├── directoryApi.js
│   ├── fileApi.js
│   ├── subscriptionApi.js
│   └── adminApi.js
├── components/           # Shared/reusable UI components
│   ├── admin/
│   │   ├── plansPage/    # Admin subscription-plan widgets
│   │   └── usersPage/    # Admin user-management widgets
│   └── directory/        # File/folder browser building blocks
├── context/              # UserContext + UserProvider (auth/session state)
├── hooks/                # Custom hooks (e.g. useIsMobile)
├── pages/                # Route-level page components
├── utils/                # uploadManager, directoryUtils, logger
├── App.jsx               # Router setup + route guards
└── main.jsx              # App entry point, providers
```

## Features

- **Authentication** — Email/password sign-up and login, plus Google OAuth. Client-side pre-validation for email format and password rules, per-field error handling, and OTP-based email verification.
- **File & folder management** — Upload, download, rename, move, delete, and organize files and directories, with breadcrumb navigation and a details panel showing full file paths.
- **Uploads** — Managed via a dedicated upload manager with progress tracking for multiple concurrent uploads.
- **Subscriptions & billing** — Plan selection and checkout via Razorpay, with server-side payment verification.
- **Admin panel** — Separate views for managing users (search, filters, status, storage usage) and subscription plans (active plans, stats, recent subscriptions, storage alerts). Access is gated by role (`SuperAdmin`, `Admin`, `Manager`).
- **Settings & profile** — Account settings and profile management pages.
- **Session handling** — A global Axios response interceptor redirects to `/login` on a `401`, except while already on a public auth page.

## Routing

Routing is defined in `src/App.jsx` using `createBrowserRouter`, with every page lazy-loaded via `React.lazy` and wrapped in `Suspense`. Three route guards control access:

| Guard | Behavior |
|---|---|
| `PublicRoute` | Redirects authenticated users away from `/login` and `/register` to `/directory` |
| `PrivateRoute` | Redirects unauthenticated users to `/login` |
| `AdminRoute` | Requires an authenticated user with role `SuperAdmin`, `Admin`, or `Manager` |

| Path | Page | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/login`, `/register` | Auth pages | Public only |
| `/directory`, `/directory/:dirId` | File browser | Private |
| `/settings` | Account settings | Private |
| `/profile` | User profile | Private |
| `/subscription` | Plans & billing | Private |
| `/admin/users` | Admin user management | Admin |
| `/admin/plans` | Admin plan management | Admin |
| `/privacy`, `/terms` | Legal pages | Public |
| `*` | 404 | Public |

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- A running instance of the corresponding backend API

### Installation

```bash
git clone <repository-url>
cd storageApp-frontend
npm install
```

### Environment Variables

Create a `.env` file in the project root with:

```env
VITE_BACKEND_BASE_URL=http://localhost:5000   # Base URL of the backend API
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

### Development

```bash
npm run dev
```

Starts the Vite dev server (bound to `--host`, so it's reachable on your local network too).

### Build

```bash
npm run build
```

Outputs a production build to `dist/`.

### Preview

```bash
npm run preview
```

Serves the production build locally for a final check before deploy.

### Lint

```bash
npm run lint
```

## Deployment Notes

- `public/_redirects` is included for SPA fallback routing on static hosts like Netlify (`/* /index.html 200`).
- Ensure all three environment variables above are set in your hosting provider's build environment, not just locally.
- The Razorpay key used client-side (`VITE_RAZORPAY_KEY_ID`) should be a live/test **publishable** key only — never expose a secret key in frontend code.

## Known Limitations / In Progress

This frontend is under active development. Areas flagged for hardening in recent reviews include:

- Broader accessibility coverage (ARIA roles, keyboard navigation, focus management) across remaining components
- Pagination/virtualization for large file and user lists
- Stronger password policy enforcement on registration
- Re-authentication step before destructive account actions (e.g. account deletion)

## License

Add your license of choice here.
