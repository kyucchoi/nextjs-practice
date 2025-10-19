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
import ExchangeRateAxios from './ExchangeRateAxios';
import ExchangeRateRQ from './ExchangeRateRQ';

// 드래그 가능한 아이템 컴포넌트
function SortableItem({
  id,
  component: Component,
  isDragging,
}: {
  id: string;
  component: React.ComponentType;
  isDragging: boolean;
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
      {...attributes}
      {...listeners}
      className={`
        cursor-move hover:shadow-lg transition-shadow
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <Component />
    </div>
  );
}

// 위젯 드래그 정렬 대시보드
export default function DashboardDndKit() {
  const [widgets, setWidgets] = useState([
    { id: 'axios', component: ExchangeRateAxios },
    { id: 'rq', component: ExchangeRateRQ },
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

  return (
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
  );
}
