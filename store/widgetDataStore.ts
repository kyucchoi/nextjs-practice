import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WidgetData {
  // 환율 위젯 설정
  selectedCurrency: string;
  // 날씨 위젯 설정
  selectedCity: string;
  // 설정 업데이트 함수들
  setSelectedCurrency: (currency: string) => void;
  setSelectedCity: (city: string) => void;
}

export const widgetDataStore = create<WidgetData>()(
  persist(
    (set) => ({
      // 기본값
      selectedCurrency: '',
      selectedCity: '',

      // 업데이트 함수
      setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
      setSelectedCity: (city) => set({ selectedCity: city }),
    }),
    {
      name: 'widget-data-storage',
    }
  )
);
