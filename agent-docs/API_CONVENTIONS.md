# Nexora Frontend — API Conventions

## 1. Purpose

This document defines the contract between the frontend and backend.

Frontend and backend are developed in parallel.

The frontend must therefore remain independent from mock implementation details.

---

## 2. Base URL

API version prefix:

```text
/api/v1
```

---

## 3. HTTP Format

All API communication uses:

```text
REST
JSON
Content-Type: application/json
```

---

## 4. Resource IDs

Resource identifiers use UUID strings.

Do not assume numeric IDs.

---

## 5. Date / Time

Dates and timestamps use ISO 8601 UTC strings.

Example:

```text
2026-09-22T08:30:00.000Z
```

The UI may format dates for display, but API values remain standardized.

---

## 6. Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

## 7. Error Response

```json
{
  "success": false,
  "error": {
    "code": "CARD_NOT_FOUND",
    "message": "The requested card was not found.",
    "details": []
  }
}
```

---

## 8. HTTP Status Codes

Common statuses:

| Status | Meaning               |
| -----: | --------------------- |
|    200 | OK                    |
|    201 | Created               |
|    400 | Bad Request           |
|    401 | Unauthorized          |
|    403 | Forbidden             |
|    404 | Not Found             |
|    409 | Conflict              |
|    429 | Too Many Requests     |
|    500 | Internal Server Error |

---

## 9. API Modules

API communication belongs in:

```text
src/apis/
```

Examples:

```text
auth.api.ts
workspace.api.ts
board.api.ts
list.api.ts
card.api.ts
task.api.ts
notification.api.ts
comment.api.ts
```

Only create modules when required.

---

## 10. API Client

Create one centralized HTTP client.

Do not create:

```text
axiosClient.ts
apiClient.ts
httpClient.ts
requestClient.ts
```

all doing the same thing.

Use one approved client.

---

## 11. Query Keys

TanStack Query keys must be centralized or consistently generated.

Do not scatter arbitrary query-key strings throughout components.

Example conceptual structure:

```text
workspace
board
card
task
notification
```

---

## 12. Authentication

Authentication/session behavior must follow the backend contract.

Do not expose secrets or tokens in UI code.

Do not hard-code credentials.

---

## 13. Permissions

The backend is authoritative.

A frontend permission check can:

* hide unavailable controls
* disable unavailable actions
* improve UX

It cannot provide security.

---

## 14. Mock API

MSW may simulate backend responses during parallel development.

Mock handlers must follow the same contract as the real backend.

Do not create a mock response shape that differs from the real API.

---

## 15. API Contract Changes

If backend API requirements change:

1. Update the agreed API contract.
2. Update frontend API types.
3. Update mock handlers.
4. Update affected hooks/components.
5. Verify all consumers.

Do not silently adapt one feature to a new response shape without updating the shared contract.

---

## 16. Business Rules

The API layer should not invent business rules.

Business rules come from the backend/SRS.

Frontend transforms API data only when necessary for presentation or strongly typed view models.
