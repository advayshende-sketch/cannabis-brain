import { defineConfig } from 'vite';

// Relative base so the built site works at any URL path
// (root domains like Netlify/Vercel *and* GitHub Pages subpaths).
export default defineConfig({
  base: './'
});
