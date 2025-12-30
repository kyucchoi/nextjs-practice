'use client';

import * as React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WidgetBox } from '@/components/ui/widget-box';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  completeTodo,
  incompleteTodo,
  type Todo,
} from '@/lib/api/todo';

type SortField = 'createdAt' | 'completed' | null;
type SortOrder = 'asc' | 'desc';

export function TodoTable() {
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [newTask, setNewTask] = React.useState('');
  const [editingTodo, setEditingTodo] = React.useState<Todo | null>(null);
  const [editTask, setEditTask] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);

  const itemsPerPage = 5;

  const [columnVisibility, setColumnVisibility] = React.useState({
    task: true,
    createdAt: true,
    completed: true,
  });

  React.useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await getTodos();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      toast('할 일 목록을 불러오는데 실패했습니다.', {
        icon: (
          <i
            className="fa-solid fa-xmark"
            style={{ color: 'var(--red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--red)',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedTodos = React.useMemo(() => {
    let result = [...todos];

    if (searchTerm) {
      result = result.filter((todo) =>
        todo.task.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        if (sortField === 'createdAt') {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortField === 'completed') {
          const valueA = a.completed ? 1 : 0;
          const valueB = b.completed ? 1 : 0;

          if (valueA === valueB) {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          }

          return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        }
        return 0;
      });
    }

    return result;
  }, [todos, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedTodos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTodos = filteredAndSortedTodos.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortOrder]);

  const handleToggleComplete = async (id: number, completed: boolean) => {
    const previousTodos = todos;

    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      )
    );

    try {
      if (completed) {
        await incompleteTodo(id);
      } else {
        await completeTodo(id);
      }
    } catch (error) {
      setTodos(previousTodos);
      console.error('Failed to toggle todo:', error);
      toast('할 일 상태 변경에 실패했습니다.', {
        icon: (
          <i
            className="fa-solid fa-xmark"
            style={{ color: 'var(--red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--red)',
        },
      });
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await createTodo(newTask);
      setNewTask('');
      setOpen(false);
      await fetchTodos();
    } catch (error) {
      console.error('Failed to create todo:', error);
      toast('할 일 추가에 실패했습니다.', {
        icon: (
          <i
            className="fa-solid fa-xmark"
            style={{ color: 'var(--red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--red)',
        },
      });
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTask(todo.task);
    setEditOpen(true);
  };

  const handleEditTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask.trim() || !editingTodo) return;

    try {
      await updateTodo(editingTodo.id, editTask);
      setEditTask('');
      setEditingTodo(null);
      setEditOpen(false);
      toast('할 일이 수정되었습니다!', {
        icon: (
          <i
            className="fa-solid fa-pen"
            style={{ color: 'var(--green)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--green)',
        },
      });
      await fetchTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast('할 일 수정에 실패했습니다.', {
        icon: (
          <i
            className="fa-solid fa-xmark"
            style={{ color: 'var(--red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--red)',
        },
      });
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id);
      toast('할 일이 삭제되었습니다!', {
        icon: (
          <i
            className="fa-solid fa-trash"
            style={{ color: 'var(--red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--red)',
        },
      });
      await fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast('할 일 삭제에 실패했습니다.', {
        icon: (
          <i
            className="fa-solid fa-xmark"
            style={{ color: 'var(--red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--red)',
        },
      });
    }
  };

  return (
    <WidgetBox>
      {/* 검색 및 필터 영역 */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <Input
          placeholder="할 일 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                항목 표시 <i className="fa-solid fa-chevron-down"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={columnVisibility.task}
                onCheckedChange={(value) =>
                  setColumnVisibility({ ...columnVisibility, task: value })
                }
              >
                할 일
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.createdAt}
                onCheckedChange={(value) =>
                  setColumnVisibility({ ...columnVisibility, createdAt: value })
                }
              >
                생성일
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.completed}
                onCheckedChange={(value) =>
                  setColumnVisibility({ ...columnVisibility, completed: value })
                }
              >
                완료
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button">할 일 추가</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddTodo}>
                <DialogHeader>
                  <DialogTitle>할 일 추가</DialogTitle>
                  <DialogDescription>
                    새로운 할 일을 입력하세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-3">
                    <Textarea
                      id="task"
                      placeholder="할 일을 입력하세요..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      취소
                    </Button>
                  </DialogClose>
                  <Button type="submit">저장</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleEditTodo}>
                <DialogHeader>
                  <DialogTitle>할 일 수정</DialogTitle>
                  <DialogDescription>할 일을 수정하세요.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-3">
                    <Textarea
                      id="edit-task"
                      placeholder="할 일을 입력하세요..."
                      value={editTask}
                      onChange={(e) => setEditTask(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      취소
                    </Button>
                  </DialogClose>
                  <Button type="submit">수정</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 할 일 테이블 */}
      <div className="overflow-hidden rounded-md border min-h-[290px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columnVisibility.task && <TableHead>할 일</TableHead>}

              {columnVisibility.createdAt && (
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('createdAt')}
                  >
                    생성일
                    <i className="fa-solid fa-up-down"></i>
                  </Button>
                </TableHead>
              )}

              {columnVisibility.completed && (
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('completed')}
                  >
                    완료
                    <i className="fa-solid fa-up-down"></i>
                  </Button>
                </TableHead>
              )}

              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={
                    Object.values(columnVisibility).filter(Boolean).length + 1
                  }
                  className="h-24 text-center"
                >
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : currentTodos.length > 0 ? (
              currentTodos.map((todo) => (
                <TableRow key={todo.id}>
                  {columnVisibility.task && (
                    <TableCell className="break-words max-w-xs">
                      {todo.task}
                    </TableCell>
                  )}

                  {columnVisibility.createdAt && (
                    <TableCell>{formatDate(todo.createdAt)}</TableCell>
                  )}

                  {columnVisibility.completed && (
                    <TableCell>
                      <Toggle
                        pressed={todo.completed}
                        onPressedChange={() =>
                          handleToggleComplete(todo.id, todo.completed)
                        }
                        aria-label="완료 표시"
                        size="sm"
                        variant="outline"
                        className="data-[state=on]:bg-green-50 data-[state=on]:text-green-600 data-[state=on]:border-green-600"
                      >
                        <i className="fa-solid fa-check"></i>
                        {todo.completed ? '완료' : '미완료'}
                      </Toggle>
                    </TableCell>
                  )}

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">메뉴 열기</span>
                          <i className="fa-solid fa-ellipsis"></i>{' '}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(todo)}>
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteTodo(todo.id)}
                        >
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    Object.values(columnVisibility).filter(Boolean).length + 1
                  }
                  className="h-24 text-center"
                >
                  할 일이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {loading ? (
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      ) : (
        filteredAndSortedTodos.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {totalPages}페이지 중 {currentPage}페이지
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          </div>
        )
      )}
    </WidgetBox>
  );
}
