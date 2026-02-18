# Task Manager Assessment

This project is a simple task manager built for an assessment challenge. It uses **Supabase** as the backend and a lightweight frontend written in vanilla JavaScript. The app demonstrates anonymous guest authentication, row-level security (RLS), and basic task management features in a clean, minimal setup.

On first load, the application automatically creates a guest session. Tasks are stored per user, and each user can only see and modify their own tasks.

---

## Features

- **Anonymous authentication**  
  When the app loads, the user is signed in anonymously using Supabase Auth. No email or password is required, and each user gets a unique guest session.

- **Row Level Security (RLS)**  
  Database policies ensure users can only read and write tasks associated with their own `user_id`.

- **Task creation**  
  Users can create a task with a required title and optional description, priority, and due date.

- **Task listing**  
  Tasks are displayed in descending order by creation time. Optional fields are shown when present.

- **Toggle completion**  
  Tasks can be marked complete or incomplete using a checkbox. Completed tasks are visually distinguished.

- **Loading and error states**  
  The UI shows a loading indicator during database operations and displays error messages when something goes wrong.

---

## Folder Structure

```

task-manager-assessment/
├── index.html            # Main entry point of the web app
├── script.js             # Frontend application logic
├── styles.css            # Styling for the UI
├── env.template.js       # Template for Supabase environment variables
├── supabase_schema.sql   # SQL schema and RLS policies
├── README.md             # Project overview and instructions
└── .gitignore            # Git ignore rules

````

---

## Setup Instructions

These steps assume you already have a Supabase project created on the free tier.

### 1. Clone the repository

```sh
git clone https://github.com/nishmethuku/task-manager-assessment.git
cd task-manager-assessment
````

### 2. Configure Supabase

* Enable **Anonymous Sign-ins** in **Authentication → Sign In / Providers**
* Copy your project URL and public anon key from **Project Settings → API**
* Run the SQL in `supabase_schema.sql` using the Supabase SQL editor

This creates the `tasks` table, enables row-level security, and ensures each user can only access their own tasks.

### 3. Set environment variables

Create an `env.js` file in the project root (next to `index.html`):

```js
// env.js (DO NOT commit this file)
window._env_ = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-public-anon-key'
};
```

This file is ignored by git and loaded by the frontend at runtime.

### 4. Run locally

Serve the app using any static HTTP server. For example:

```sh
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000
```

The app will automatically create a guest session and load tasks.

---

## Live Demo

The application is deployed using **Vercel**.

**Live URL:**
[https://task-manager-assessment-kaf93r4ve-nishs-projects-4cfd0c25.vercel.app/](https://task-manager-assessment-kaf93r4ve-nishs-projects-4cfd0c25.vercel.app/)

---

## Supabase Schema

The `supabase_schema.sql` file:

* Creates a `tasks` table with a UUID primary key
* Associates tasks with `auth.users.id` via `user_id`
* Includes required fields (`title`, `is_complete`, `created_at`)
* Includes optional fields (`description`, `priority`, `due_date`)
* Enables row-level security
* Defines policies allowing users to `SELECT`, `INSERT`, `UPDATE`, and `DELETE` only their own tasks

---

## Notes & Tradeoffs

* **Frontend choice**
  The frontend is written in vanilla JavaScript to keep the setup simple and dependency-free. With more time, this could be rebuilt using React or Next.js.

* **Authentication**
  Only anonymous guest authentication is implemented, as required. Each browser session has isolated data.

* **Security**
  Only the public Supabase anon key is used in the frontend. No service role keys are committed to the repository.

* **Future improvements**
  With additional time, features such as task editing, deletion, pagination, user accounts, and automated tests could be added.
```
