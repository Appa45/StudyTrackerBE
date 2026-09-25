# StudyTrack Backend

A production-oriented Node.js + Express + MongoDB/Mongoose REST API for the StudyTrack EdTech assessment.

## Stack

- Node.js 20+
- Express 5
- MongoDB + Mongoose
- JWT authentication stored in an httpOnly cookie
- bcryptjs password hashing
- Zod request validation
- Helmet security headers
- CORS with credentials
- express-rate-limit for abuse protection
- Gemini REST API for the optional AI Tutor endpoint

## API count

There are **15 business APIs**:

### Authentication — 4
1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `POST /api/auth/logout`
4. `GET /api/auth/me`

### Topics CRUD — 5
5. `GET /api/topics`
6. `POST /api/topics`
7. `GET /api/topics/:id`
8. `PATCH /api/topics/:id`
9. `DELETE /api/topics/:id`

### Dashboard — 1
10. `GET /api/dashboard/overview`

### Settings — 3
11. `GET /api/settings`
12. `PATCH /api/settings/profile`
13. `PATCH /api/settings/preferences`
14. `PATCH /api/settings/notifications`

### AI Tutor — 1
15. `POST /api/ai/explain`

> Optional operational endpoint: `GET /api/health` is included for deployment/monitoring, but it is not counted as one of the 15 business APIs.

## Folder structure

```text
studytrack-backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers/
│   │   ├── ai.controller.js
│   │   ├── auth.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── settings.controller.js
│   │   └── topic.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── models/
│   │   ├── Topic.js
│   │   └── User.js
│   ├── routes/
│   │   ├── ai.routes.js
│   │   ├── auth.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── settings.routes.js
│   │   └── topic.routes.js
│   ├── services/
│   │   ├── ai.service.js
│   │   ├── auth.service.js
│   │   ├── dashboard.service.js
│   │   ├── settings.service.js
│   │   └── topic.service.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── jwt.js
│   │   └── sanitize.js
│   ├── validators/
│   │   ├── ai.validator.js
│   │   ├── auth.validator.js
│   │   ├── settings.validator.js
│   │   └── topic.validator.js
│   ├── app.js
│   └── server.js
├── tests/
│   └── api.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Set `MONGODB_URI` and a strong `JWT_SECRET`.

3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

## Connect your Next.js frontend

Set the frontend API base URL, for example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Because authentication uses a cookie, frontend requests must include credentials:

```ts
fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
  credentials: "include",
});
```

## API notes

### Authentication

A successful register/login response sets the `studytrack_token` httpOnly cookie. The token contains the user id and role. The cookie is `secure` in production and uses `sameSite=lax` by default.

### Authorization

Topic queries always include the authenticated `userId`. A user cannot update or delete another user's topic merely by knowing its MongoDB id.

### Validation

Zod schemas validate request payloads before service methods run. Topic updates use a strict allow-list of fields.

### Search and pagination

`GET /api/topics` supports:

```text
?search=react
&subject=Frontend
&status=In%20Progress
&difficulty=Intermediate
&page=1
&limit=10
```

### AI Tutor

`POST /api/ai/explain` accepts:

```json
{
  "question": "What is useMemo in React?",
  "topicId": "optional MongoDB ObjectId"
}
```

The Gemini API key is only read on the server. Do not use `NEXT_PUBLIC_` for AI secrets.

## Example requests

### Register

```bash
curl -i -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"name":"Ayyappa","email":"ayyappa@example.com","password":"Password@123"}'
```

### Create topic

```bash
curl -i -X POST http://localhost:5000/api/topics \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"title":"React Hooks","subject":"Frontend","difficulty":"Intermediate","description":"Learn useState and useEffect.","progress":20,"targetDate":"2026-10-10","status":"In Progress"}'
```

## Production checklist

- Use a strong random `JWT_SECRET`.
- Use a managed MongoDB deployment with network/IP restrictions.
- Configure an exact `CLIENT_URL` instead of `*`.
- Run behind HTTPS.
- Use Vercel/Render/Railway/AWS or another production host with environment variables.
- Add a proper centralized logger and error tracking (for example, Pino + Sentry) before production.
- Consider Redis-backed rate limiting when deploying multiple instances.
- Add automated API/E2E coverage for critical flows.
