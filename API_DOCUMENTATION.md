# StudyTrack API Documentation

Base URL:

```text
http://localhost:5000/api
```

Authentication is cookie-based. After login/register, the server sets `studytrack_token` as an httpOnly cookie.

## 1. Authentication

### POST `/auth/register`

Body:

```json
{
  "name": "Ayyappa",
  "email": "ayyappa@example.com",
  "password": "Password@123"
}
```

### POST `/auth/login`

Body:

```json
{
  "email": "ayyappa@example.com",
  "password": "Password@123"
}
```

### POST `/auth/logout`

Requires authentication.

### GET `/auth/me`

Requires authentication.

## 2. Topics CRUD

### GET `/topics`

Query parameters:

```text
search
subject
status
difficulty
page
limit
```

Example:

```text
/topics?search=react&subject=Frontend&page=1&limit=10
```

### POST `/topics`

Body:

```json
{
  "title": "React Hooks",
  "subject": "Frontend",
  "difficulty": "Intermediate",
  "description": "Learn useState and useEffect.",
  "progress": 20,
  "targetDate": "2026-10-10",
  "status": "In Progress"
}
```

### GET `/topics/:id`

### PATCH `/topics/:id`

Any subset of topic fields can be supplied.

### DELETE `/topics/:id`

## 3. Dashboard

### GET `/dashboard/overview`

Returns topic counts, average progress, topics due today and recently updated topics.

## 4. Settings

### GET `/settings`

### PATCH `/settings/profile`

```json
{
  "name": "Ayyappa Naik"
}
```

### PATCH `/settings/preferences`

```json
{
  "dailyGoal": 3,
  "preferredDifficulty": "Advanced"
}
```

### PATCH `/settings/notifications`

```json
{
  "emailUpdates": true,
  "studyReminders": false,
  "weeklySummary": true
}
```

## 5. AI Tutor

### POST `/ai/explain`

Body:

```json
{
  "question": "What is useMemo in React?",
  "topic": "React Hooks"
}
```

The endpoint requires a server-side `GEMINI_API_KEY`.

## Frontend fetch example

```ts
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/topics`, {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```
