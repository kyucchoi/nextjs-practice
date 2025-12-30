'use client';

import { useState, useEffect } from 'react';
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
import { widgetStore } from '@/store/widgetStore';

interface SortableItemProps {
  id: string;
  component: React.ComponentType;
  isDragging: boolean;
}

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
        className="flex items-center justify-between bg-gray-100 p-2 rounded-t-lg hover:bg-gray-200 cursor-move"
        {...attributes}
        {...listeners}
      >
        <i className="fa-solid fa-grip-vertical text-gray-400"></i>
        <span className="text-xs text-gray-500">드래그 해보세요!</span>
      </div>

      {/* 실제 위젯 내용 - 드래그 리스너 없음, 자유롭게 클릭/입력 가능 */}
      <Component />
    </div>
  );
}

export default function DashboardDndKit() {
  const { widgets, setWidgets } = widgetStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [widgets.length]);

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = widgets.findIndex((item) => item.id === active.id);
    const newIndex = widgets.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      setActiveId(null);
      return;
    }

    setWidgets(arrayMove(widgets, oldIndex, newIndex));
    setActiveId(null);
  };

  return (
    <div className="mt-5">
      {widgets.length === 0 ? (
        <div className="flex items-center justify-center h-[calc(100vh-400px)]">
          <div className="text-center text-muted-foreground">
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
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
