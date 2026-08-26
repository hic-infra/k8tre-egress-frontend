# frontend-egress

A React/TypeScript frontend for the [HIC Egress Backend](https://github.com/hic-infra/k8tre-egress-backend), providing an interface for
viewing and reviewing files a researcher wishes to egress.

Built with React, TypeScript, Material UI, and Keycloak for authentication, it communicates with the egress backend to present pending file requests and to manage approvals.

---

## Requirements

- Node.js 18+
- A running instance of the [HIC Egress Backend](https://github.com/hic-infra/k8tre-egress-backend)
- A Keycloak realm with a configured client for this frontend

---

## Setup

### 1. Clone the repository

```
git clone https://github.com/hic-infra/k8tre-egress-frontend
cd frontend-egress
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment

Copy the example environment file and fill in your values:

```
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_KEYCLOAK_URL` | Keycloak server URL, e.g. `https://auth.example.com` |
| `VITE_KEYCLOAK_REALM` | Keycloak realm name |
| `VITE_KEYCLOAK_CLIENT` | Keycloak client ID for this app |
| `VITE_EGRESS_BE_URL` | Base URL of the egress backend API |
| `VITE_DISABLE_AUTH` | Disables keycloak login (also has to be enabled on the BE) |

### 4. Start the dev server

```
npm run dev
```

The app is served at `http://localhost:5173` by default.

#### Docker
This can also be run with Docker
```
docker build -t hic-egress-frontend .
docker run -p 5173:80 hic-egress-frontend
```

---

## Development

### Running tests

Tests are written with [Vitest](https://vitest.dev/) and [MSW](https://mswjs.io/) for API mocking.

```
npm run test          # run all tests
```

---

## Deployment

The app is a static Vite build and can be deployed anywhere that serves static files.

### Build

```
npm run build
# output in dist/
```

---