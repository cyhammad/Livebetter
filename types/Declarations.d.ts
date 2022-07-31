/**
 * Here we tell TypeScript exactly what variables are present in our
 * process.env. It helps with IntelliSense (code-completion) in VS code.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    NEXT_PUBLIC_GA_ID: string;
    SENDGRID_API_KEY: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    NEXT_PUBLIC_VERCEL_ENV: string;
    VERCEL_ENV: string;
  }
}
