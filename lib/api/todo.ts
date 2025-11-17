// lib/api/todo.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface Todo {
  id: number;
  task: string;
  completed: boolean;
  createdAt: string;
}

// 공통 헤더 함수
const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
});

// TODO 목록 조회
export async function getTodos(): Promise<Todo[]> {
  const response = await fetch(`${BASE_URL}/api/v1/todo`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch todos');
  return response.json();
}

// TODO 생성
export async function createTodo(task: string): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/api/v1/todo`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ task }),
  });
  if (!response.ok) throw new Error('Failed to create todo');
  return response.json();
}

// TODO 수정
export async function updateTodo(id: number, task: string): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/api/v1/todo/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ task }),
  });
  if (!response.ok) throw new Error('Failed to update todo');
  return response.json();
}

// TODO 삭제
export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/v1/todo/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete todo');
}

// TODO 완료 처리
export async function completeTodo(id: number): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/api/v1/todo/${id}/complete`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to complete todo');
  return response.json();
}

// TODO 미완료 처리
export async function incompleteTodo(id: number): Promise<Todo> {
  const response = await fetch(`${BASE_URL}/api/v1/todo/${id}/incomplete`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to incomplete todo');
  return response.json();
}
