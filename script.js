/*
 * Main JavaScript for the Task Manager app.
 *
 * This file is written as an ES module and uses the Supabase client
 * delivered via an ECMAScript module from jsDelivr.  It signs the user
 * in anonymously (if not already signed in), fetches tasks, and handles
 * creating and toggling tasks.  All state is kept in memory and the
 * DOM is updated whenever data changes.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.4/+esm';

// Get Supabase configuration from env.js.  The env.js file defines
// window._env_.SUPABASE_URL and window._env_.SUPABASE_ANON_KEY.  These
// values must be provided by the user and should not be committed to
// source control.
const SUPABASE_URL = window._env_?.SUPABASE_URL;
const SUPABASE_ANON_KEY = window._env_?.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase configuration missing. Please define SUPABASE_URL and SUPABASE_ANON_KEY in env.js.'
  );
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserId = null;

// Select DOM elements
const form = document.getElementById('task-form');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const prioritySelect = document.getElementById('priority');
const dueDateInput = document.getElementById('due_date');
const tasksList = document.getElementById('tasks-list');
const errorDiv = document.getElementById('error');
const loadingDiv = document.getElementById('loading');

/**
 * Display or hide the loading indicator.
 * @param {boolean} isLoading Whether to show the loading state.
 */
function setLoading(isLoading) {
  if (isLoading) {
    loadingDiv.classList.remove('hidden');
  } else {
    loadingDiv.classList.add('hidden');
  }
}

/**
 * Display an error message.  Pass `null` or empty to clear.
 * @param {string|null} message The error message to display.
 */
function setError(message) {
  if (message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  } else {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }
}

/**
 * Sign in the user anonymously if they are not already signed in.
 */
async function ensureAuthenticated() {
  // Check current session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error(sessionError.message);
  }
  let session = sessionData.session;
  if (!session) {
    // No session; sign in anonymously
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw new Error(error.message);
    }
    session = data.session;
  }
  currentUserId = session.user.id;
}

/**
 * Fetch tasks for the current user and render them.
 */
async function fetchTasks() {
  setLoading(true);
  setError(null);
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    renderTasks(data || []);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

/**
 * Create a new task from the form inputs.
 * @param {Event} e Form submit event
 */
async function createTask(e) {
  e.preventDefault();
  setError(null);
  setLoading(true);
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim() || null;
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value || null;
  if (!title) {
    setError('Title is required.');
    setLoading(false);
    return;
  }
  try {
    // Insert the new task; user_id is required to satisfy RLS policies
    const { error } = await supabase.from('tasks').insert({
      user_id: currentUserId,
      title,
      description,
      priority,
      due_date: dueDate,
      is_complete: false
    });
    if (error) {
      throw error;
    }
    // Clear form and refetch tasks
    form.reset();
    await fetchTasks();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

/**
 * Toggle a task’s completion state.
 * @param {string} taskId The task ID (UUID)
 * @param {boolean} isComplete The current completion state
 */
async function toggleTask(taskId, isComplete) {
  setError(null);
  setLoading(true);
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ is_complete: !isComplete })
      .eq('id', taskId);
    if (error) {
      throw error;
    }
    await fetchTasks();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

/**
 * Render an array of tasks into the DOM.
 * @param {Array<Object>} tasks List of task records
 */
function renderTasks(tasks) {
  tasksList.innerHTML = '';
  if (!tasks.length) {
    const emptyLi = document.createElement('li');
    emptyLi.textContent = 'No tasks yet.';
    tasksList.appendChild(emptyLi);
    return;
  }
  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.is_complete) {
      li.classList.add('completed');
    }
    const row = document.createElement('div');
    row.className = 'task-row';
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!task.is_complete;
    checkbox.addEventListener('change', () => toggleTask(task.id, task.is_complete));
    // Title
    const titleEl = document.createElement('span');
    titleEl.className = 'title';
    titleEl.textContent = task.title;
    row.appendChild(checkbox);
    row.appendChild(titleEl);
    li.appendChild(row);
    // Optional fields
    if (task.description) {
      const desc = document.createElement('div');
      desc.className = 'description';
      desc.textContent = task.description;
      li.appendChild(desc);
    }
    if (task.priority) {
      const priority = document.createElement('div');
      priority.className = 'priority';
      priority.textContent = `Priority: ${task.priority}`;
      li.appendChild(priority);
    }
    if (task.due_date) {
      const due = document.createElement('div');
      due.className = 'due-date';
      due.textContent = `Due: ${task.due_date}`;
      li.appendChild(due);
    }
    tasksList.appendChild(li);
  });
}

// Attach form submit handler
form.addEventListener('submit', createTask);

// Initialize the application on load
async function init() {
  try {
    await ensureAuthenticated();
    await fetchTasks();
  } catch (err) {
    setError(err.message);
    console.error(err);
  }
}

// Start the app
init();
