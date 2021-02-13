declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
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
