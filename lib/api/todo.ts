export interface Todo {
  id: number;
  task: string;
  completed: boolean;
  createdAt: string;
}

const getOptions = (init?: RequestInit): RequestInit => {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  return {
    ...init,
    headers,
    credentials: 'include',
  };
};

export async function getTodos(): Promise<Todo[]> {
  const GRAPHQL_QUERY = `
    query GetAllTodos {
      getAllTodos {
        id
        task
        completed
        createdAt
      }
    }
  `;

  const res = await fetch(
    '/api/proxy?path=/graphql',
    getOptions({
      method: 'POST',
      body: JSON.stringify({ query: GRAPHQL_QUERY }),
    })
  );

  if (!res.ok) throw new Error('Failed to fetch todos');

  const result = await res.json();
  return result.data.getAllTodos;
}

export async function createTodo(task: string): Promise<Todo> {
  const res = await fetch(
    '/api/proxy?path=/api/v1/todo',
    getOptions({
      method: 'POST',
      body: JSON.stringify({ task }),
    })
  );
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

export async function updateTodo(id: number, task: string): Promise<Todo> {
  const res = await fetch(
    `/api/proxy?path=/api/v1/todo/${id}`,
    getOptions({
      method: 'PUT',
      body: JSON.stringify({ task }),
    })
  );
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(
    `/api/proxy?path=/api/v1/todo/${id}`,
    getOptions({ method: 'DELETE' })
  );
  if (!res.ok) throw new Error('Failed to delete todo');
}

export async function completeTodo(id: number): Promise<Todo> {
  const res = await fetch(
    `/api/proxy?path=/api/v1/todo/${id}/complete`,
    getOptions({ method: 'PATCH' })
  );
  if (!res.ok) throw new Error('Failed to complete todo');
  return res.json();
}

export async function incompleteTodo(id: number): Promise<Todo> {
  const res = await fetch(
    `/api/proxy?path=/api/v1/todo/${id}/incomplete`,
    getOptions({ method: 'PATCH' })
  );
  if (!res.ok) throw new Error('Failed to incomplete todo');
  return res.json();
}
