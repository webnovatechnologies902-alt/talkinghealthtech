# Talking HealthTech Frontend

A responsive React and Vite editorial website for health technology news, podcasts, events and explainers.

## Run locally

From this directory:

```sh
npm install
npm run dev
```

The project also provides `npm run build` for a production build, `npm run preview` to serve that build locally and `npm run lint` for ESLint.

## Project notes

- React Router handles client-side navigation; page components are lazy-loaded.
- Reusable UI is in `src/components`, route pages in `src/pages`, and sample editorial content in `src/data`.
- The Axios client in `src/services/api.js` is configured for a future API. No backend or newsletter delivery is implemented.
- Sample editorial photography is loaded from Unsplash URLs.
