# RssDT API Server

## General architecture

![image](https://github.com/user-attachments/assets/a3724b56-9bb3-4e10-9f66-3841825c42dd)

- HTTP GraphQL API Server `./src/index.ts`
  - Apollo Server + Express
  - WebSockets server
  - Cookie Sessions with [express-session](https://github.com/expressjs/session#readme)
  - [Drizzle ORM](https://orm.drizzle.team/)
- Feed Parser `./src/feed-parser/`
- BullMQ-based microservices:
  - Mail Worker `./src/mail/`
  - Feed Watcher`./src/feed-watcher/`

External tools and services:

- PostgreSQL
- Redis (Valkey) as a cache storage for sessions, rate limits and as a message broker for BullMQ
- [besticon](https://github.com/mat/besticon) (go-based favicon service)

## Usage

### Development

#### Prerequisites:

1. Redis (Valkey) and Postgres need to be installed and running.

The easiest way to do this is by using Docker Compose:

```bash
docker-compose -f docker-compose-dev.yml up
# or
npm run start:docker-dev
```

2. Create Postgres Database, for example:

```bash
createdb rssdt_dev
# or to create in the docker container
createdb -h localhost rssdt_dev
```

3. Create and edit the `.env` file in the root directory of the server. For reference, see `.env.example`.

4. To create necessary database structure using Drizzle Kit:

```bash
npm run build
npm run migrate
```

#### Launch commands

```bash
npm run watch # compile TypeScript into /dist and watch for changes
npm run dev # start server and mail worker in development mode
npm run feed-watcher:dev # start feed-watcher worker
```

#### Local Mail server

To test sending emails, you can use a local email server, such as [MailHog](https://github.com/mailhog/MailHog).
It also included in development Docker Compose file, with a default address for the web interface at `http://localhost:8025`.
