# StudyTrack Backend Architecture

## Request flow

```text
Next.js frontend
      |
      | HTTP + httpOnly auth cookie
      v
Express routes
      |
      v
Middleware
  - CORS
  - Helmet
  - JSON parser
  - Authentication
  - Rate limiting
      |
      v
Controllers
  - validate request
  - call service
  - format HTTP response
      |
      v
Services
  - business rules
  - ownership checks
  - database operations
  - external AI provider
      |
      +-------------------+
      |                   |
      v                   v
MongoDB/Mongoose      Gemini API
```

## Why this structure?

### Routes
Routes define HTTP contracts only. They should stay small and readable.

### Controllers
Controllers translate HTTP input/output. Validation happens at the edge and services contain reusable business logic.

### Services
Services keep business logic independent of Express. This makes them easier to test and reuse later.

### Models
Mongoose models describe MongoDB collections and database-level validation/indexes.

### Validators
Zod provides explicit request validation before data reaches business logic.

### Middleware
Cross-cutting concerns such as authentication, rate limiting and centralized errors live here instead of being duplicated in every controller.

## Authentication design

The API creates a JWT after login/register and stores it in an `httpOnly` cookie called `studytrack_token`.

Advantages:

- JavaScript running in the browser cannot directly read the token.
- The browser sends the cookie automatically for API requests when credentials are enabled.
- Authentication is centralized in `requireAuth`.

For a larger production system, a server-side session store or short-lived access token + refresh token rotation can also be considered.

## Authorization design

Every topic query uses both:

```text
_topicId + authenticated userId
```

For example:

```js
Topic.findOne({
  _id: topicId,
  userId: req.userId
})
```

This is important: knowing another user's MongoDB ObjectId is not enough to access their topic.

## Validation and sanitization

The API validates:

- required fields
- string length
- email format
- password length
- enum values
- progress range
- date format
- pagination limits

Update operations use an allow-list generated from the Zod schema, so arbitrary MongoDB operators are not accepted as user fields.

## MongoDB indexes

Topics use indexes for common access patterns:

```text
userId + createdAt
userId + status
userId + subject
```

Users have a unique index on email.

## Performance choices

- Dashboard statistics use MongoDB aggregation rather than loading every topic into Node.js.
- Topic listing uses pagination.
- `Promise.all` runs independent dashboard queries concurrently.
- Search regex is escaped before being added to the query.
- Response fields do not include password hashes.

## AI security

The Gemini API key is read only from server environment variables. It is never prefixed with `NEXT_PUBLIC_` and is never sent to the browser.

The AI endpoint also has a tighter rate limit because external AI calls can be expensive.

## Error handling

All async controllers are wrapped by `asyncHandler`. Errors reach the centralized `errorHandler`, which returns consistent JSON responses.

Example:

```json
{
  "success": false,
  "error": "Validation failed.",
  "details": [
    {
      "field": "title",
      "message": "Too small: expected string to have >=3 characters"
    }
  ]
}
```

## What to explain in the interview

1. Why MongoDB was selected: the StudyTrack topic/settings document structure is straightforward and Mongoose makes schema validation and indexing easy.
2. Why controllers/services are separated: it keeps HTTP concerns away from business logic and makes testing easier.
3. Why authentication uses httpOnly cookies: it reduces direct token exposure to client-side JavaScript.
4. How authorization works: every topic operation is scoped by the authenticated user's id.
5. How the dashboard is optimized: aggregated statistics + limited recent lists instead of returning the complete topic collection.
6. How AI secrets are protected: the browser calls the backend; the backend calls Gemini with a server-side secret.
7. How the API scales: stateless JWT authentication, indexed queries, pagination and the ability to move rate limiting to Redis for multi-instance deployment.
