# Task Manager Assessment

This project is a simple task manager built for the assessment challenge.  It uses **Supabase** as the backend and a lightweight frontend written in vanilla JavaScript.  The application demonstrates anonymous guest authentication, row‑level security (RLS) to ensure each user sees only their own tasks, and a simple user interface that allows creating, viewing, and toggling tasks as complete or incomplete.

## Features

* **Anonymous auth** – When the app first loads it signs the visitor in anonymously so there’s no need to enter an email address or password.  Each user’s tasks are tied to their unique anonymous user ID.
* **Row Level Security** – RLS policies in the database ensure users can only read and write their own tasks.
* **Task creation** – Users can create a task by entering a title and optionally a description, priority and due date.
* **Task listing** – Tasks are listed in descending creation order.  Each task shows its title and any optional fields.
* **Toggle completion** – Click the checkbox next to a task to mark it complete or incomplete.  Completed tasks are visually distinguished.
* **Loading and error states** – The UI shows a loading indicator when fetching or creating tasks and surfaces error messages to the user.

## Folder Structure

```
task-manager-assessment/
├── index.html            # Main entry point of the web app
├── script.js             # JavaScript that powers the frontend
├── styles.css            # Basic styling for the app
├── env.template.js       # Template for Supabase environment variables (do not commit `env.js`)
├── supabase_schema.sql   # SQL schema for creating the tasks table and RLS policies
├── README.md             # Project overview and setup instructions
└── .gitignore            # Ignore list for git
```

## Setup Instructions

These steps assume you already have a Supabase project created.  If not, log in to [Supabase](https://supabase.com) and create a new project using the free tier.

1. **Clone the repository**

   ```sh
   git clone https://github.com/<your-username>/task-manager-assessment.git
   cd task-manager-assessment
   ```

2. **Set up Supabase**

   * Enable **Anonymous Sign‑ins** in your project’s Authentication settings.
   * Copy your project’s URL and anon API key from **Project Settings → API**.
   * Run the SQL script in the `supabase_schema.sql` file using Supabase’s SQL editor.  This creates the `tasks` table, enables row‑level security, and adds policies that allow each authenticated user to access only their own rows.

3. **Configure environment variables**

   Create a file called `env.js` in the project root (alongside `index.html`) and add your Supabase values:

   ```js
   // env.js (DO NOT commit this file)
   window._env_ = {
     SUPABASE_URL: 'https://your-project.supabase.co',
     SUPABASE_ANON_KEY: 'your-public-anon-key'
   };
   ```

   The application reads these values at runtime; this file is ignored by git via `.gitignore`.

4. **Run locally**

   You can serve the static files with any HTTP server.  For example using `python3`:

   ```sh
   python3 -m http.server 8000
   ```

   Then open `http://localhost:8000` in your browser.  The app will automatically sign you in anonymously and load your tasks.

5. **Deploy**

   Deploy the site to your preferred hosting provider (e.g., Vercel, Netlify or GitHub Pages).  Make sure to set your Supabase URL and anon key as environment variables or include an `env.js` file on the server.  When deploying on Vercel, you can create the `env.js` file during the build step or use Vercel’s **Environment Variables** settings and replace the values in your HTML template as part of the build process.

## Supabase Schema

The `supabase_schema.sql` file contains the SQL necessary to create the `tasks` table and RLS policies:

* Creates a `tasks` table with a UUID primary key, a `user_id` column (UUID) referencing `auth.users.id`, a `title` column, an `is_complete` flag and optional `description`, `priority` and `due_date` fields.
* Enables row‑level security on the table.
* Defines policies allowing authenticated users to `SELECT`, `INSERT`, `UPDATE` and optionally `DELETE` their own rows (where `user_id = auth.uid()`).

## Notes & Tradeoffs

* **Framework** – Due to package installation restrictions in this environment, the frontend is built using vanilla JS instead of Next.js.  In a real project you could implement the same logic using React and Next.js for a richer developer experience and server‑side rendering.
* **Persistence** – Tasks persist in Supabase; closing and reopening the browser will show the same tasks for the same anonymous user.  Opening an incognito window creates a new anonymous user with its own task list.
* **Security** – Secrets (Supabase anon key) are never committed to the repository.  Use environment variables or a runtime `env.js` file to supply them.  Avoid committing the service role key to source control.
* **Improvements with more time** – With additional time, one could add user authentication with email/password or social providers, improve the UI with a framework like React or Vue, add task editing and deletion, and create unit tests.  The RLS policies could also be extended to support more complex permissions or multiple user roles.
