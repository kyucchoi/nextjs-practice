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
import ExchangeRateAxios from './ExchangeRateAxios';
import ExchangeRateRQ from './ExchangeRateRQ';
import AIMessageWidget from './AIMessageWidget';
import AICompareWidget from './AICompareWidget';
import { TodoTable } from './TodoTable';

// 사용 가능한 위젯 목록
const AVAILABLE_WIDGETS = [
  { id: 'axios', name: '환율 (Axios)', component: ExchangeRateAxios },
  { id: 'rq', name: '환율 (React Query)', component: ExchangeRateRQ },
  { id: 'ai-message', name: 'AI 채팅', component: AIMessageWidget },
  { id: 'ai-compare', name: 'AI 비교', component: AICompareWidget },
  { id: 'todo', name: 'Todo', component: TodoTable },
];

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
  const [widgets, setWidgets] = useState([
    { id: 'axios', component: ExchangeRateAxios },
    { id: 'rq', component: ExchangeRateRQ },
    { id: 'ai-message', component: AIMessageWidget },
    { id: 'todo', component: TodoTable },
  ]);

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
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  // 위젯 제거
  const handleRemoveWidget = (id: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== id));
  };

  // 위젯 추가/제거 토글
  const handleToggleWidget = (widgetId: string, checked: boolean) => {
    if (checked) {
      const widgetToAdd = AVAILABLE_WIDGETS.find((w) => w.id === widgetId);
      if (widgetToAdd) {
        setWidgets((prev) => [
          ...prev,
          { id: widgetToAdd.id, component: widgetToAdd.component },
        ]);
      }
    } else {
      handleRemoveWidget(widgetId);
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
                onRemove={handleRemoveWidget}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
