import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import ExchangeRateGraphQL from '@/components/widgets/ExchangeRateGraphQL';
import { TodoTable } from '@/components/widgets/TodoTable';
import WeatherWidget from '@/components/widgets/WeatherWidget';
import AICompareWidget from '@/components/widgets/AICompareWidget';

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

export const AVAILABLE_WIDGETS = [
  { id: 'ai-chat', name: 'AI 채팅', component: AICompareWidget },
  { id: 'todo', name: 'Todo', component: TodoTable },
  { id: 'weather', name: '날씨', component: WeatherWidget },
  { id: 'exchange-rate', name: '환율', component: ExchangeRateGraphQL },
];

const WIDGET_STORAGE_KEYS: Record<string, string[]> = {
  'exchange-rate': ['selectedCurrency'],
  weather: ['selectedCity'],
  todo: [],
};

const getComponentById = (id: string) => {
  return AVAILABLE_WIDGETS.find((w) => w.id === id)?.component;
};

export const widgetStore = create<WidgetStore>()(
  persist(
    (set) => ({
      widgets: [],

      setWidgets: (widgets) => set({ widgets }),

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

      // 위젯 제거 (localStorage도 함께 삭제)
      removeWidget: (widgetId) =>
        set((state) => {
          const storageKeys = WIDGET_STORAGE_KEYS[widgetId] || [];
          if (typeof window !== 'undefined') {
            storageKeys.forEach((key) => {
              localStorage.removeItem(key);
            });
          }

          return {
            widgets: state.widgets.filter((w) => w.id !== widgetId),
          };
        }),

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
          state.widgets = state.widgets
            .map((w: { id: string }) => {
              const component = getComponentById(w.id);
              return component ? { id: w.id, component } : null;
            })
            .filter((w) => w !== null) as Widget[];
        }
      },
    }
  )
);
