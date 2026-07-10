# Fitness Class Voting

A deploy-ready Next.js website for fitness-center member registration, admin approval, timed class voting, and Yes/No results.

## Features

- Email and password registration/login
- Fitness center access key
- Admin member approval or rejection
- Timed class release and optional closing time
- One Yes/No vote per approved member per class
- Admin vote totals
- Neon PostgreSQL through Prisma
- Vercel-ready build

## Open in Visual Studio Code

1. Extract the ZIP.
2. Open the extracted `fitness-class-voting` folder in Visual Studio Code.
3. Open the integrated terminal.
4. Run:

```bash
npm install
```

## Neon setup

1. Create a Neon project.
2. Open Neon **Connect**.
3. Copy the pooled PostgreSQL connection string.
4. Copy `.env.example` to `.env`.
5. Place the Neon connection string in `DATABASE_URL`.
6. Replace `JWT_SECRET` with a random value of at least 32 characters.
7. Change the seed admin email, password, and center key.

Example:

```env
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
JWT_SECRET="a-very-long-random-secret-change-this-now"
SEED_ADMIN_EMAIL="admin@yourgym.com"
SEED_ADMIN_PASSWORD="A-Strong-Password-123!"
SEED_CENTER_KEY="YOURGYM2026"
```

## Create database tables and admin

```bash
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

The seed command creates:

- One fitness center
- One approved administrator
- One registration center key

## Vercel deployment

1. Push the folder to a GitHub repository.
2. Import the repository into Vercel.
3. Add these Vercel environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `SEED_ADMIN_EMAIL`
   - `SEED_ADMIN_PASSWORD`
   - `SEED_CENTER_KEY`
4. Deploy.
5. Database seeding should be performed locally once using the same Neon `DATABASE_URL`.

## Important timezone note

Displayed class times use `Asia/Kuala_Lumpur`. The browser sends admin date/time values as the administrator's local time and stores them as UTC in Neon.
