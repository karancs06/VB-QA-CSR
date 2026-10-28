// Stack settings for this site, read from VITE_* env vars at build time (see README and
// .env.example). Nothing stack-specific is committed: Launch, or a local .env, supplies the values.
const env = import.meta.env;

const config = {
  API_KEY: env.VITE_CONTENTSTACK_API_KEY as string,
  DELIVERY_TOKEN: env.VITE_CONTENTSTACK_DELIVERY_TOKEN as string,
  PREVIEW_TOKEN: env.VITE_CONTENTSTACK_PREVIEW_TOKEN as string,
  ENVIRONMENT: env.VITE_CONTENTSTACK_ENVIRONMENT as string,
  BRANCH: (env.VITE_CONTENTSTACK_BRANCH as string) || "main",
  // Delivery (CDN) host of the stack's region, e.g. eu-cdn.contentstack.com.
  API_HOST: env.VITE_CONTENTSTACK_API_HOST as string,
  // Contentstack app host of the same region, e.g. https://eu-app.contentstack.com.
  APP_HOST: env.VITE_CONTENTSTACK_APP_HOST as string,
};

const missing = Object.entries(config)
  .filter(([, value]) => !value)
  .map(([key]) => key);
if (missing.length) {
  console.error(`vb-qa-csr: missing env vars for ${missing.join(", ")}; see README.md`);
}

export default config;
