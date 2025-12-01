const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const isDev = process.env.NODE_ENV === 'development';

export interface Todo {
  id: number;
  task: string;
  completed: boolean;
  createdAt: string;
}

// 공통 옵션
const getOptions = (init?: RequestInit): RequestInit => {
  const headers = new Headers(init?.headers);

  headers.set('Content-Type', 'application/json');

  if (isDev && process.env.NEXT_PUBLIC_AUTH_TOKEN) {
    headers.set(
      'Authorization',
      `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
    );
  }

  return {
    ...init,
    headers,
    credentials: 'include',
  };
};

// TODO 목록 조회
export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(`${BASE_URL}/api/v1/todo`, getOptions());
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

// TODO 생성
export async function createTodo(task: string): Promise<Todo> {
  const res = await fetch(
    `${BASE_URL}/api/v1/todo`,
    getOptions({
      method: 'POST',
      body: JSON.stringify({ task }),
    })
  );
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

// TODO 수정
export async function updateTodo(id: number, task: string): Promise<Todo> {
  const res = await fetch(
    `${BASE_URL}/api/v1/todo/${id}`,
    getOptions({
      method: 'PUT',
      body: JSON.stringify({ task }),
    })
  );
  if (!res.ok) throw new Error('Failed to update todo');
  return res.json();
}

// TODO 삭제
export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/api/v1/todo/${id}`,
    getOptions({ method: 'DELETE' })
  );
  if (!res.ok) throw new Error('Failed to delete todo');
}

// TODO 완료
export async function completeTodo(id: number): Promise<Todo> {
  const res = await fetch(
    `${BASE_URL}/api/v1/todo/${id}/complete`,
    getOptions({ method: 'PATCH' })
  );
  if (!res.ok) throw new Error('Failed to complete todo');
  return res.json();
}

// TODO 미완료
export async function incompleteTodo(id: number): Promise<Todo> {
  const res = await fetch(
    `${BASE_URL}/api/v1/todo/${id}/incomplete`,
    getOptions({ method: 'PATCH' })
  );
  if (!res.ok) throw new Error('Failed to incomplete todo');
  return res.json();
}
