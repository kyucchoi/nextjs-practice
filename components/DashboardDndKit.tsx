'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { X, Plus, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { widgetStore, AVAILABLE_WIDGETS } from '@/store/widgetStore';

// 드래그 가능한 아이템 컴포넌트
function SortableItem({
  id,
  component: Component,
  isDragging,
  onRemove,
}: {
  id: string;
  component: React.ComponentType;
  isDragging: boolean;
  onRemove: (id: string) => void;
}) {
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
      <div className="flex items-center justify-between bg-gray-100 p-2 rounded-t-lg hover:bg-gray-200">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-move flex-1"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(id)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Component />
    </div>
  );
}

// 위젯 드래그 정렬 대시보드
export default function DashboardDndKit() {
  // Zustand로 변경
  const { widgets, addWidget, removeWidget } = widgetStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // 드래그 시작
  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  // 드래그 종료 - 위젯 순서 변경
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((item) => item.id === active.id);
      const newIndex = widgets.findIndex((item) => item.id === over.id);

      // Zustand store 업데이트
      const newWidgets = arrayMove(widgets, oldIndex, newIndex);
      widgetStore.setState({ widgets: newWidgets });
    }

    setActiveId(null);
  };

  // 위젯 추가/제거 토글
  const handleToggleWidget = (widgetId: string, checked: boolean) => {
    if (checked) {
      addWidget(widgetId); // Zustand 사용
    } else {
      removeWidget(widgetId); // Zustand 사용
    }
  };

  // 현재 추가된 위젯 ID 목록
  const activeWidgetIds = widgets.map((w) => w.id);

  return (
    <div>
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
                  handleToggleWidget(widget.id, checked)
                }
              >
                {widget.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 위젯이 없을 때 메시지 */}
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={widgets.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {widgets.map((widget) => (
                <SortableItem
                  key={widget.id}
                  id={widget.id}
                  component={widget.component}
                  isDragging={activeId === widget.id}
                  onRemove={removeWidget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
