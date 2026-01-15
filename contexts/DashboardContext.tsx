'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { getDashboardData, type DashboardData } from '@/lib/api/dashboard';
import type { Todo } from '@/lib/api/todo';
import type { WeatherData } from '@/lib/api/weather';
import type { ExchangeRate } from '@/lib/api/exchange';

const CURRENCIES = ['USD', 'JPY', 'EUR', 'CNY', 'GBP'];

interface DashboardContextType {
  todos: Todo[];
  weather: WeatherData | null;
  exchangeRates: ExchangeRate[];

  isLoading: boolean;
  error: string | null;

  selectedCity: string;
  setSelectedCity: (city: string) => void;

  refetch: () => Promise<void>;
  setTodos: (todos: Todo[]) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCity') || 'Seoul';
    }
    return 'Seoul';
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getDashboardData(selectedCity, CURRENCIES);

      setTodos(data.todos);
      setWeather(data.weather);
      setExchangeRates(data.exchangeRates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetSelectedCity = (city: string) => {
    setSelectedCity(city);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCity', city);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        todos,
        weather,
        exchangeRates,
        isLoading,
        error,
        selectedCity,
        setSelectedCity: handleSetSelectedCity,
        refetch: fetchData,
        setTodos,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
