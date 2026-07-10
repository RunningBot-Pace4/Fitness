# Fitness Class Voting — Member Management Version

This version supports:

- Unique member key fob
- Member / non-member classification
- Admin editing of key fob
- Admin changing membership type
- Admin approval or rejection
- Timed Yes / No voting

## Database update

Run:

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Existing users will default to:

```text
NON_MEMBER
```

The admin can change them to `MEMBER` from the admin dashboard.

## Vercel update

After testing:

```bash
git add .
git commit -m "Add member and non-member management"
git push
```

Vercel will redeploy automatically when connected to GitHub.
