'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { widgetStore, AVAILABLE_WIDGETS } from '@/store/widgetStore';

const WIDGET_ICONS: Record<string, string> = {
  'ai-chat': 'fa-comments',
  todo: 'fa-list-check',
  weather: 'fa-cloud-sun',
  'exchange-rate': 'fa-money-bill-transfer',
};

export default function WidgetAddButton() {
  const { widgets, addWidget, removeWidget, setWidgets } = widgetStore();

  const handleToggleWidget = (widgetId: string) => {
    const isActive = widgets.some((w) => w.id === widgetId);

    if (isActive) {
      removeWidget(widgetId);
    } else {
      addWidget(widgetId);
    }
  };

  const handleRemoveAll = () => {
    if (widgets.length === 0) return;
    setWidgets([]);
  };

  const activeWidgetIds = widgets.map((w) => w.id);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Drawer>
          <Tooltip>
            <TooltipTrigger asChild>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <i className="fa-solid fa-plus text-xl"></i>
                </Button>
              </DrawerTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>위젯 추가</p>
            </TooltipContent>
          </Tooltip>
          <DrawerContent className="max-w-md mx-auto">
            <DrawerHeader>
              <DrawerTitle>위젯 선택</DrawerTitle>
              <DrawerDescription>
                원하는 위젯을 추가하거나 제거하세요
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-8">
              <div className="grid grid-cols-2 gap-4">
                {AVAILABLE_WIDGETS.map((widget) => {
                  const isActive = activeWidgetIds.includes(widget.id);
                  return (
                    <button
                      key={widget.id}
                      onClick={() => handleToggleWidget(widget.id)}
                      className={`
                        aspect-square rounded-lg border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all
                        ${
                          isActive
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-accent'
                        }
                      `}
                    >
                      <i
                        className={`fa-solid ${
                          WIDGET_ICONS[widget.id]
                        } text-3xl`}
                      ></i>
                      <span className="font-medium text-sm">{widget.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
        {widgets.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveAll}
                style={{ color: 'var(--css-red)' }}
              >
                <i className="fa-solid fa-trash text-xl"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>전체 삭제</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
