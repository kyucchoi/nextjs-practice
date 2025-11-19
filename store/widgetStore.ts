import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import ExchangeRateAxios from '@/components/widgets/ExchangeRateAxios';
import ExchangeRateRQ from '@/components/widgets/ExchangeRateRQ';
import AIMessageWidget from '@/components/widgets/AIMessageWidget';
import AICompareWidget from '@/components/widgets/AICompareWidget';
import { TodoTable } from '@/components/widgets/TodoTable';

interface Widget {
  id: string;
  component: React.ComponentType;
}

interface WidgetStore {
  widgets: Widget[];
  setWidgets: (widgets: Widget[]) => void;
  addWidget: (widgetId: string) => void;
  removeWidget: (widgetId: string) => void;
  reorderWidgets: (startIndex: number, endIndex: number) => void;
}

// 사용 가능한 위젯 목록
export const AVAILABLE_WIDGETS = [
  { id: 'axios', name: '환율 (Axios)', component: ExchangeRateAxios },
  { id: 'rq', name: '환율 (React Query)', component: ExchangeRateRQ },
  { id: 'ai-message', name: 'AI 메시지', component: AIMessageWidget },
  { id: 'ai-compare', name: 'AI 비교', component: AICompareWidget },
  { id: 'todo', name: 'Todo', component: TodoTable },
];

const getComponentById = (id: string) => {
  return AVAILABLE_WIDGETS.find((w) => w.id === id)?.component;
};

export const widgetStore = create<WidgetStore>()(
  persist(
    (set) => ({
      // 초기 위젯 없음
      widgets: [],

      // 위젯 목록 설정
      setWidgets: (widgets) => set({ widgets }),

      // 위젯 추가
      addWidget: (widgetId) =>
        set((state) => {
          const component = getComponentById(widgetId);
          if (component && !state.widgets.find((w) => w.id === widgetId)) {
            return {
              widgets: [...state.widgets, { id: widgetId, component }],
            };
          }
          return state;
        }),

      // 위젯 제거
      removeWidget: (widgetId) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== widgetId),
        })),

      // 위젯 순서 변경
      reorderWidgets: (startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.widgets);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { widgets: result };
        }),
    }),
    {
      name: 'widget-storage',
      partialize: (state) => ({
        widgets: state.widgets.map((w) => ({ id: w.id })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.widgets = state.widgets.map((w: any) => ({
            id: w.id,
            component: getComponentById(w.id)!,
          }));
        }
      },
    }
  )
);
