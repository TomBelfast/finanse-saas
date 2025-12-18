/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_CHECKOUT_PRODUCT_INFO_URL: string;
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_FUNCTION_DOMAIN: string;
  readonly VITE_ENV_NAME: string;
  readonly VITE_POSTHOG_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
