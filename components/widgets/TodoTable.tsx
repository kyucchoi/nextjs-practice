'use client';

import * as React from 'react';
import { Check, MoreHorizontal, ChevronDown, ArrowUpDown } from 'lucide-react';
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

// 정렬 필드 타입 정의
type SortField = 'createdAt' | 'completed' | null;
// 정렬 순서 타입 정의
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

  const itemsPerPage = 5; // 페이지당 표시 개수

  // 컬럼 표시 상태
  const [columnVisibility, setColumnVisibility] = React.useState({
    task: true,
    createdAt: true,
    completed: true,
  });

  // 초기 데이터 로드
  React.useEffect(() => {
    fetchTodos();
  }, []);

  // TODO 목록 조회
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

  // 날짜 포맷 변환 (ISO → 한국 날짜)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 정렬 토글 함수
  const handleSort = (field: SortField) => {
    // 같은 필드 클릭 시 정렬 순서만 변경 (오름차순 ↔ 내림차순)
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 필드 클릭 시 해당 필드로 변경하고 오름차순으로 시작
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 필터링 및 정렬된 할 일 목록 (useMemo로 최적화)
  const filteredAndSortedTodos = React.useMemo(() => {
    let result = [...todos];

    // 검색 필터링: 할 일 텍스트에 검색어 포함 여부
    if (searchTerm) {
      result = result.filter((todo) =>
        todo.task.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬 로직
    if (sortField) {
      result.sort((a, b) => {
        // 생성일 기준 정렬
        if (sortField === 'createdAt') {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        }
        // 완료 상태 기준 정렬
        else if (sortField === 'completed') {
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

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredAndSortedTodos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTodos = filteredAndSortedTodos.slice(startIndex, endIndex);

  // 검색어/정렬 변경 시 첫 페이지로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortOrder]);

  // 완료 상태 토글 (낙관적 업데이트)
  const handleToggleComplete = async (id: number, completed: boolean) => {
    // 1. 이전 상태 백업 (실패 시 롤백용)
    const previousTodos = todos;

    // 2. UI 먼저 업데이트 (낙관적 업데이트 - 서버 응답 기다리지 않음)
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      )
    );

    try {
      // 3. 서버에 상태 변경 요청
      if (completed) {
        await incompleteTodo(id);
        // toast 제거
      } else {
        await completeTodo(id);
        // toast 제거
      }
    } catch (error) {
      // 4. 실패 시 원래 상태로 롤백
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

  // 할 일 추가
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      await createTodo(newTask);
      setNewTask('');
      setOpen(false);
      // toast 제거
      // 성공하면 목록 다시 불러오기
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

  // 수정 Dialog 열기
  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTask(todo.task);
    setEditOpen(true);
  };

  // 할 일 수정
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
      // 성공하면 목록 다시 불러오기
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

  // 할 일 삭제
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
      // 성공하면 목록 다시 불러오기
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
        {/* 검색 입력 */}
        <Input
          placeholder="할 일 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex gap-2">
          {/* 컬럼 표시/숨김 필터 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                항목 표시 <ChevronDown className="ml-2 h-4 w-4" />
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

          {/* 할 일 추가 Dialog */}
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

          {/* 할 일 수정 Dialog */}
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
              {/* 할 일 컬럼 */}
              {columnVisibility.task && <TableHead>할 일</TableHead>}

              {/* 생성일 컬럼 (정렬 가능) */}
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

              {/* 완료 상태 컬럼 (정렬 가능) */}
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

              {/* 액션 컬럼 (수정/삭제) */}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 로딩 상태 */}
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
              // 할 일 목록 렌더링
              currentTodos.map((todo) => (
                <TableRow key={todo.id}>
                  {/* 할 일 내용 */}
                  {columnVisibility.task && (
                    <TableCell className="break-words max-w-xs">
                      {todo.task}
                    </TableCell>
                  )}

                  {/* 생성일 */}
                  {columnVisibility.createdAt && (
                    <TableCell>{formatDate(todo.createdAt)}</TableCell>
                  )}

                  {/* 완료 상태 토글 */}
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
                        <Check className="h-4 w-4" />
                        {todo.completed ? '완료' : '미완료'}
                      </Toggle>
                    </TableCell>
                  )}

                  {/* 수정/삭제 메뉴 */}
                  <TableCell>
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
              // 할 일 없을 때
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
        // 로딩 중일 때 Skeleton 표시
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      ) : (
        // 할 일이 있을 때만 페이지네이션 표시
        filteredAndSortedTodos.length > 0 && (
          <div className="flex items-center justify-between">
            {/* 페이지 정보 */}
            <div className="text-sm text-muted-foreground">
              {totalPages}페이지 중 {currentPage}페이지
            </div>
            {/* 페이지 이동 버튼 */}
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1} // 첫 페이지에서 비활성화
              >
                이전
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages} // 마지막 페이지에서 비활성화
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
