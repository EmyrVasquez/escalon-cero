import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Las prácticas pasaron a llamarse proyectos: los enlaces antiguos siguen funcionando.
  async redirects() {
    return [
      { source: "/explorar", destination: "/proyectos", permanent: true },
      { source: "/practicas/:id", destination: "/proyectos/:id", permanent: true },
      { source: "/mi-practica", destination: "/en-curso", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
