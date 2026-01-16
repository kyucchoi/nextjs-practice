import { handleAuthError } from './handleAuthError';

export interface Todo {
  id: number;
  task: string;
  completed: boolean;
  createdAt: string;
}

export async function createTodo(task: string): Promise<Todo> {
  const res = await fetch('/api/proxy?path=/api/v1/todo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task }),
    credentials: 'include',
  });

  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

export async function updateTodo(id: number, task: string): Promise<Todo> {
  const res = await fetch(`/api/proxy?path=/api/v1/todo/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task }),
    credentials: 'include',
  });

  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`/api/proxy?path=/api/v1/todo/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to delete todo');
}

export async function completeTodo(id: number): Promise<Todo> {
  const res = await fetch(`/api/proxy?path=/api/v1/todo/${id}/complete`, {
    method: 'PATCH',
    credentials: 'include',
  });

  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to complete todo');
  return res.json();
}

export async function incompleteTodo(id: number): Promise<Todo> {
  const res = await fetch(`/api/proxy?path=/api/v1/todo/${id}/incomplete`, {
    method: 'PATCH',
    credentials: 'include',
  });

  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to incomplete todo');
  return res.json();
}
