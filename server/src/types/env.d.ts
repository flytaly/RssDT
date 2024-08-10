declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;
      POSTGRES_PORT: string;
      POSTGRES_HOST: string;
      REDIS_URL: string;
      COOKIE_SECRET: string;
      FRONTEND_URL: string;
      BESTICON_URL: string;
      MAIL_SMTP: string;
      MAIL_PORT: string;
      MAIL_FROM: string;
      MAIL_USER: string;
      MAIL_PASS: string;
      MAIL_FEEDBACK_TO: string;
    }
  }
}

export {}
