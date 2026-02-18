/*
 * Main JavaScript for the Task Manager app.
 *
 * This file is written as an ES module and uses the Supabase client
 * delivered via an ECMAScript module from jsDelivr. It signs the user
 * in anonymously (if not already signed in), fetches tasks, and handles
 * creating and toggling tasks.
 */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm?v=2";

// Read config from env.js
const SUPABASE_URL = window._env_?.SUPABASE_URL;
const SUPABASE_ANON_KEY = window._env_?.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Supabase configuration missing. Please define SUPABASE_URL and SUPABASE_ANON_KEY in env.js."
  );
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserId = null;

// DOM elements
const form = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const prioritySelect = document.getElementById("priority");
const dueDateInput = document.getElementById("due_date");
const tasksList = document.getElementById("tasks-list");
const errorDiv = document.getElementById("error");
const loadingDiv = document.getElementById("loading");

// UI helpers
function setLoading(isLoading) {
  loadingDiv.style.display = isLoading ? "block" : "none";
}

function setError(message) {
  if (message) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  } else {
    errorDiv.textContent = "";
    errorDiv.style.display = "none";
  }
}

/**
 * Ensure we have an anonymous session.
 * THIS is what actually creates the user in Supabase.
 */
async function ensureAuthenticated() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  if (!data.session) {
    const { data: anonData, error: anonError } =
      await supabase.auth.signInAnonymously();
    if (anonError) throw anonError;
    currentUserId = anonData.session.user.id;
  } else {
    currentUserId = data.session.user.id;
  }
}

/**
 * Fetch tasks for the current user.
 */
async function fetchTasks() {
  setLoading(true);
  setError(null);

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    renderTasks(data || []);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

/**
 * Create a new task.
 */
async function createTask(e) {
  e.preventDefault();
  setError(null);
  setLoading(true);

  const title = titleInput.value.trim();
  if (!title) {
    setError("Title is required.");
    setLoading(false);
    return;
  }

  const description = descriptionInput.value.trim() || null;
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value || null;

  try {
    const { error } = await supabase.from("tasks").insert({
      user_id: currentUserId,
      title,
      description,
      priority,
      due_date: dueDate,
      is_complete: false,
    });

    if (error) throw error;

    form.reset();
    await fetchTasks();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

/**
 * Toggle completion.
 */
async function toggleTask(taskId, isComplete) {
  setLoading(true);
  setError(null);

  try {
    const { error } = await supabase
      .from("tasks")
      .update({ is_complete: !isComplete })
      .eq("id", taskId);

    if (error) throw error;
    await fetchTasks();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

/**
 * Render tasks to the DOM.
 */
function renderTasks(tasks) {
  tasksList.innerHTML = "";

  if (!tasks.length) {
    const li = document.createElement("li");
    li.textContent = "No tasks yet.";
    tasksList.appendChild(li);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";
    if (task.is_complete) li.classList.add("completed");

    const row = document.createElement("div");
    row.className = "task-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.is_complete;
    checkbox.addEventListener("change", () =>
      toggleTask(task.id, task.is_complete)
    );

    const titleEl = document.createElement("span");
    titleEl.textContent = task.title;

    row.appendChild(checkbox);
    row.appendChild(titleEl);
    li.appendChild(row);

    if (task.description) {
      const d = document.createElement("div");
      d.textContent = task.description;
      li.appendChild(d);
    }

    if (task.priority) {
      const p = document.createElement("div");
      p.textContent = `Priority: ${task.priority}`;
      li.appendChild(p);
    }

    if (task.due_date) {
      const d = document.createElement("div");
      d.textContent = `Due: ${task.due_date}`;
      li.appendChild(d);
    }

    tasksList.appendChild(li);
  });
}

// Events
form.addEventListener("submit", createTask);

// App entry point
async function init() {
  try {
    await ensureAuthenticated(); // 🔑 THIS CREATES THE USER
    await fetchTasks();
  } catch (err) {
    setError(err.message);
    console.error(err);
  }
}

init();
