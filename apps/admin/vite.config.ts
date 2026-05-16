import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function resolveBuildId(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
  if (sha && sha.length >= 7) return sha.slice(0, 7);
  const dep = process.env.VERCEL_DEPLOYMENT_ID;
  if (dep && dep.length >= 8) return dep.slice(0, 8);
  return "local";
}

export default defineConfig(() => {
  const buildId = resolveBuildId();

  return {
    plugins: [
      react(),
      {
        name: "dukorpay-html-build-meta",
        transformIndexHtml(html) {
          return html.replace(
            "</head>",
            `    <meta name="dukorpay-build" content="${buildId}" />\n  </head>`,
          );
        },
      },
    ],
    define: {
      __APP_BUILD_ID__: JSON.stringify(buildId),
    },
    server: { port: 5173 },
  };
});
