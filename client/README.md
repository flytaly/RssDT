# RssDT Frontend Client

RSS reader.

## Main features:
- Preview RSS/Atom feeds
- Export and import feeds as OPML or text.
- Setup email digests with custom filters

## Tech Stack:
- [Next.js 14](https://nextjs.org/) - with modern stuff like App Router, Server Actions
- [GraphQL-Codegen](https://the-guild.dev/graphql/codegen) with [graphql-request](https://github.com/jasonkuhrt/graphql-request)
- [TanStack Query](https://tanstack.com/query/latest)
- [react-spring](https://www.react-spring.dev/) - animations
- [TailwindCSS](https://tailwindcss.com/)
- [graphql-ws](https://github.com/enisdenjo/graphql-ws) - GraphQL  notification over over WebSocket


## Development

- Run the server (see [its readme](../server)).
- Create a `.env` or `.env.development` file in the root directory, containing the API URL.
  
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
  NEXT_PUBLIC_WS_API_URL=ws://localhost:4000/graphql
  ```
- Run this Next.js app
```bash
npm run dev
```
