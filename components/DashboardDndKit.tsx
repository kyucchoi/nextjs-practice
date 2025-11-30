'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { widgetStore, AVAILABLE_WIDGETS } from '@/store/widgetStore';
import { toast } from 'sonner';

interface SortableItemProps {
  id: string;
  component: React.ComponentType;
  isDragging: boolean;
}

/**
 * 드래그 가능한 위젯 아이템 컴포넌트
 * - 상단 회색 영역을 드래그하면 순서 변경 가능
 * - 위젯 내용은 정상적으로 클릭/입력 가능
 */
function SortableItem({
  id,
  component: Component,
  isDragging,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        hover:shadow-lg transition-shadow
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* 드래그 핸들 영역 - 이 영역을 잡아서 드래그 */}
      <div
        className="flex items-center bg-gray-100 p-2 rounded-t-lg hover:bg-gray-200 cursor-move"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      {/* 실제 위젯 내용 - 드래그 리스너 없음, 자유롭게 클릭/입력 가능 */}
      <Component />
    </div>
  );
}

/**
 * 위젯 드래그 정렬 대시보드
 * - 위젯 추가/삭제 기능
 * - 드래그 앤 드롭으로 순서 변경
 * - Zustand로 상태 관리 및 persist로 새로고침 시에도 유지
 */
export default function DashboardDndKit() {
  const { widgets, addWidget, removeWidget, setWidgets } = widgetStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  // 마우스 및 터치 센서 설정
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  /**
   * 드래그 시작 이벤트
   * - 현재 드래그 중인 위젯 ID 저장 (투명도 변경용)
   */
  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  /**
   * 드래그 종료 이벤트
   * - 위젯 순서 변경 및 Zustand 스토어 업데이트
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // 드롭 영역이 없거나 같은 위치면 종료
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // 이전/새로운 인덱스 찾기
    const oldIndex = widgets.findIndex((item) => item.id === active.id);
    const newIndex = widgets.findIndex((item) => item.id === over.id);

    // 인덱스가 유효하지 않으면 종료
    if (oldIndex === -1 || newIndex === -1) {
      setActiveId(null);
      return;
    }

    // arrayMove로 순서 변경 후 Zustand 업데이트
    setWidgets(arrayMove(widgets, oldIndex, newIndex));
    setActiveId(null);
  };

  const handleToggleWidget = (widgetId: string, checked: boolean) => {
    // 위젯 이름 가져오기
    const widgetName =
      AVAILABLE_WIDGETS.find((w) => w.id === widgetId)?.name || '위젯';

    if (checked) {
      // 위젯 추가
      addWidget(widgetId);
      toast(`${widgetName} 위젯이 추가되었습니다!`, {
        icon: (
          <i
            className="fa-solid fa-check"
            style={{ color: 'var(--green)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--green)',
        },
      });
    } else {
      // 위젯 삭제
      removeWidget(widgetId);
      toast(`${widgetName} 위젯이 삭제되었습니다!`, {
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
    }
  };

  // 현재 추가된 위젯 ID 목록
  const activeWidgetIds = widgets.map((w) => w.id);

  return (
    <div className="py-5">
      {/* 위젯 추가 버튼 */}
      <div className="mb-4 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              위젯 추가
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {AVAILABLE_WIDGETS.map((widget) => (
              <DropdownMenuCheckboxItem
                key={widget.id}
                checked={activeWidgetIds.includes(widget.id)}
                onCheckedChange={(checked) =>
                  handleToggleWidget(widget.id, Boolean(checked))
                }
              >
                {widget.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 위젯이 없을 때 안내 메시지 */}
      {widgets.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px] text-center">
          <div className="text-muted-foreground">
            <p className="text-lg">위젯을 추가해보세요!</p>
            <p className="text-sm mt-2">
              우측 상단의 &quot;위젯 추가&quot; 버튼을 눌러보세요!
            </p>
          </div>
        </div>
      ) : (
        // 드래그 앤 드롭 컨텍스트
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* 정렬 가능한 컨텍스트 */}
          <SortableContext
            items={widgets.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {/* 위젯 목록 렌더링 */}
              {widgets.map((widget) => (
                <SortableItem
                  key={widget.id}
                  id={widget.id}
                  component={widget.component}
                  isDragging={activeId === widget.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
