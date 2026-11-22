# Secure Connect and Communication Platform

Node.js + Express + MongoDB, with JWT auth (bcrypt), a protected Notes API, role-based access control,
Socket.IO real-time chat and EventEmitter-driven events.

## Setup
1. Start MongoDB locally (or use an Atlas URI).
2. `npm install`
3. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`.
4. `npm start` -> http://localhost:5000
5. Open http://localhost:5000 in two browser windows (different accounts) to try the chat.

## REST API
| Method | URL | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | - | Register (`username`, `email`, `password`) |
| POST | /api/auth/login | - | Returns `{ message, token }` and sets an httpOnly `token` cookie |
| POST | /api/auth/logout | - | Clears the cookie |
| GET | /api/auth/me | yes | Current user |
| POST | /api/notes | yes | Create note (`title`, `content`) |
| GET | /api/notes | yes | List your notes |
| GET | /api/notes/:id | yes | Get one of your notes |
| PUT | /api/notes/:id | yes | Update your note |
| DELETE | /api/notes/:id | yes | Delete your note |
| GET | /api/admin/users | admin | List all users |
| GET | /api/admin/notes | admin | List all notes |
| DELETE | /api/admin/users/:id | admin | Delete user and their notes |

Authentication: send the token either as the cookie set at login (Postman stores it automatically)
or as `Authorization: Bearer <token>`. No token -> 403 `No token provided`; bad/expired token -> 401.

To get an admin account, sign up with an email listed in `ADMIN_EMAILS` in `.env`.
Roles can never be set from the request body.

## Socket.IO events
Connect with the same JWT (cookie, or `io({ auth: { token } })`). Every user auto-joins `general`.

| Client emits | Payload | Server emits |
|---|---|---|
| joinRoom | `"roomName"` | `joinedRoom`, `history`, `systemMessage` (to others) |
| leaveRoom | `"roomName"` | `leftRoom`, `systemMessage` (to others) |
| chatMessage | `{ room, text }` | `message` (to the room) |
| typing | `"roomName"` | `typing` (to others in the room) |

Errors arrive on the `chatError` event. Messages are stored in MongoDB; the last 20 are sent on join.

## EventEmitter
`src/events/eventBus.js` is a shared emitter; `src/events/listeners.js` handles
`user:registered`, `user:loggedIn`, `user:loginFailed`, `note:created`, `note:deleted`,
and the `chat:*` events (the console output like `[general] Aditi: Hello` comes from `chat:message`).
