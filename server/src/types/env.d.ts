declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    COOKIE_SECRET: string;
  }
}
