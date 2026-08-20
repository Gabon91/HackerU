# Gabi Advanced TODO List

A modern Kanban-style TODO app built with React, TypeScript, Material UI, Firebase, and drag-and-drop.

The app supports authentication, multiple boards, custom columns, and collaborative-style task assignment.

## Features

- Email/password authentication (register + login)
- Create and delete boards
- Create columns inside each board
- Create, edit, move, save/unsave, and delete tasks
- Drag and drop tasks between columns
- Assign tasks to users
- Filter tasks by:
  - All tasks
  - My tasks
  - Saved tasks
- Real-time updates using Firestore `onSnapshot`

## Tech Stack

- React 19
- TypeScript
- Vite
- Material UI (MUI)
- Firebase Auth + Firestore
- `@dnd-kit` for drag-and-drop
- React Router

## Project Structure

```text
src/
  components/
    BoardColumn.tsx
    ColumnDialog.tsx
    CreateTaskDialog.tsx
    EditTaskDialog.tsx
    TaskCard.tsx
  pages/
    AuthPage.tsx
    BoardsPage.tsx
    BoardPage.tsx
  types/
    index.ts
  firebase.ts
  App.tsx
  main.tsx
  index.css
```

## Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (recommended)

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Then open the local URL printed by Vite (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Type-check and create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Firebase Setup

Firebase is initialized in `src/firebase.ts`.

Current app logic expects these Firestore collections:

- `users`
- `boards`
- `columns`
- `tasks`

### Data Shape (Current)

- `users`: `{ id, email, displayName }`
- `boards`: `{ title }`
- `columns`: `{ boardId, title }`
- `tasks`: `{ columnId, title, description, assigneeId, savedBy[] }`

## Usage Flow

1. Register or login.
2. Create a board.
3. Open the board and add columns.
4. Add tasks into columns.
5. Edit tasks, assign users, save/unsave, or move tasks by dropdown/drag-and-drop.

## Notes

- This project currently keeps Firebase config directly in source (`src/firebase.ts`).
- For production, move Firebase config to environment variables and enforce Firestore security rules.

## Future Improvements

- Restrict board/task visibility by board members or owner
- Add due dates, priority, labels, and search
- Add optimistic updates and better error messaging
- Add tests (unit + integration)
- Add CI pipeline for lint/build checks

## License

This project is for learning and portfolio use.
