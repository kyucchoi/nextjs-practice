'use client';

import * as React from 'react';
import {
  Check,
  MoreHorizontal,
  Plus,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export type Todo = {
  id: number;
  task: string;
  completed: boolean;
  createdAt: string;
};

const sampleData: Todo[] = [
  {
    id: 0,
    task: '샘플 할 일',
    completed: false,
    createdAt: '2025-11-13T13:57:54.738Z',
  },
  {
    id: 1,
    task: '샘플 할 일',
    completed: false,
    createdAt: '2025-11-14T13:57:54.738Z',
  },
  {
    id: 2,
    task: '샘플 할 일',
    completed: false,
    createdAt: '2025-11-15T13:57:54.738Z',
  },
  {
    id: 3,
    task: '샘플 할 일',
    completed: false,
    createdAt: '2025-11-16T13:57:54.738Z',
  },
];

type SortField = 'createdAt' | 'completed' | null;
type SortOrder = 'asc' | 'desc';

export function TodoTable() {
  const [todos, setTodos] = React.useState<Todo[]>(sampleData);
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

  // 컬럼 표시 상태
  const [columnVisibility, setColumnVisibility] = React.useState({
    task: true,
    createdAt: true,
    completed: true,
  });

  // 날짜 포맷 변환 (ISO → 한국 날짜)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 정렬 토글
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 필터링 및 정렬된 할 일 목록
  const filteredAndSortedTodos = React.useMemo(() => {
    let result = [...todos];

    // 검색 필터링
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

          // 완료 상태가 같으면 날짜로 정렬 (최근순)
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

  // 페이지네이션
  const totalPages = Math.ceil(filteredAndSortedTodos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTodos = filteredAndSortedTodos.slice(startIndex, endIndex);

  // 페이지 변경 시 currentPage 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortOrder]);

  // 완료 상태 토글
  const handleToggleComplete = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 할 일 추가
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const newTodo: Todo = {
      id: todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 0,
      task: newTask,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([...todos, newTodo]);
    setNewTask('');
    setOpen(false);
  };

  // 수정 Dialog 열기
  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTask(todo.task);
    setEditOpen(true);
  };

  // 할 일 수정
  const handleEditTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask.trim() || !editingTodo) return;

    setTodos(
      todos.map((todo) =>
        todo.id === editingTodo.id ? { ...todo, task: editTask } : todo
      )
    );

    setEditTask('');
    setEditingTodo(null);
    setEditOpen(false);
  };

  // 할 일 삭제
  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-2">
        {/* 검색 */}
        <Input
          placeholder="할 일 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex gap-2">
          {/* Columns 필터 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
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

          {/* 추가 Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                할 일 추가
              </Button>
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

          {/* 수정 Dialog */}
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

      <div className="overflow-hidden rounded-md border">
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
                    <ArrowUpDown className="ml-2 h-4 w-4" />
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
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 할 일 목록 렌더링 */}
            {currentTodos.length > 0 ? (
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
                      {/* 완료 토글 버튼 */}
                      <Toggle
                        pressed={todo.completed}
                        onPressedChange={() => handleToggleComplete(todo.id)}
                        aria-label="완료 표시"
                        size="sm"
                        variant="outline"
                        className="data-[state=on]:bg-green-50 data-[state=on]:text-green-600 data-[state=on]:border-green-600"
                      >
                        <Check className="h-4 w-4" />
                        {todo.completed ? '완료' : '미완료'}
                      </Toggle>
                    </TableCell>
                  )}
                  <TableCell>
                    {/* 수정/삭제 메뉴 */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">메뉴 열기</span>
                          <MoreHorizontal className="h-4 w-4" />
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
      {filteredAndSortedTodos.length > 0 && (
        <div className="flex items-center justify-between py-4">
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
      )}
    </div>
  );
}
