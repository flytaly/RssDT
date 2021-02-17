declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    COOKIE_SECRET: string;
    FRONTEND_URL: string;
    MAIL_SMTP: string;
    MAIL_PORT: string;
    MAIL_FROM: string;
    MAIL_USER: string;
    MAIL_PASS: string;
    MAIL_FEEDBACK_TO: string;
  }
}
