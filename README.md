# BuddyScript Backend

Express + TypeScript backend for the BuddyScript social feed app. It provides authentication, profile identity (`/me`), post/feed APIs, comments, reactions, and media upload support with Cloudinary.

## Tech Stack

- Node.js + TypeScript
- Express 5
- Prisma ORM + PostgreSQL
- JWT auth
- Cloudinary (file uploads)
- Zod (env and payload validation)

## Features

- User registration and login
- Authenticated user profile lookup
- Feed list and post detail APIs
- Create/update/delete posts
- Commenting and nested comment support
- Post and comment reactions
- Single file upload endpoint (Cloudinary)

## Project Structure

```txt
src/
  app.ts                   # Express app + middleware + route mounting
  index.ts                 # Server bootstrap
  routes/                  # Route definitions
  controllers/             # HTTP request handling
  services/                # Business logic
  middleware/              # Auth middleware
  lib/                     # Env, Prisma, JWT, Cloudinary clients
prisma/
  schema.prisma            # Database schema
```

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (or compatible)
- PostgreSQL database
- Cloudinary account (for upload endpoint)

## Environment Variables

Create a `.env` file in `buddyscript-backend`:

```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000

DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
DIRECT_URL=postgresql://<user>:<password>@<host>:<port>/<db>

JWT_SECRET=replace-with-a-long-random-secret

CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_SECRET_KEY=your-cloudinary-secret-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
```

Notes:

- `DATABASE_URL` is used by Prisma client at runtime.
- `DIRECT_URL` is typically used for Prisma migrations.
- `JWT_SECRET` must be at least 16 characters.

## Local Setup (Full Procedure)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env` (see variables above).
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```
5. Start development server:
   ```bash
   npm run dev
   ```
6. Verify health endpoint:
   - `GET http://localhost:4000/health`

## Available Scripts

- `npm run dev` - run server with watch mode
- `npm run build` - compile TypeScript to `dist`
- `npm run start` - run compiled server
- `npm run lint` - run ESLint
- `npm run format` - format code with Prettier
- `npm run format:check` - check formatting
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run Prisma dev migrations
- `npm run prisma:studio` - open Prisma Studio

## API Endpoints

### Public

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`

### Protected (requires Bearer token)

- `GET /me`
- `GET /posts`
- `GET /posts/:postId`
- `POST /posts`
- `PATCH /posts/:postId`
- `DELETE /posts/:postId`
- `POST /posts/:postId/comments`
- `POST /posts/:postId/reactions`
- `DELETE /posts/:postId/reactions`
- `POST /posts/:postId/comments/:commentId/reactions`
- `DELETE /posts/:postId/comments/:commentId/reactions`
- `POST /posts/file-upload` (multipart form-data, field name: `file`)

## Running In Production

1. Build:
   ```bash
   npm run build
   ```
2. Start:
   ```bash
   npm run start
   ```

Ensure production environment variables are set before startup.

## Troubleshooting

- CORS errors: verify `CORS_ORIGIN` matches frontend URL.
- Prisma connection errors: verify `DATABASE_URL`/`DIRECT_URL` and database access.
- Upload errors: verify Cloudinary credentials.
- Unauthorized responses: send `Authorization: Bearer <token>` header.
