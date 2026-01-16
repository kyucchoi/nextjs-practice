'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  getDashboardData,
  getWeatherGraphQL,
  getExchangeRatesGraphQL,
  getTodosGraphQL,
} from '@/lib/api/dashboard';
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
  refetchTodos: () => Promise<void>;
  refetchExchangeRates: () => Promise<void>;
  refetchWeather: (city: string) => Promise<void>;
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
      return localStorage.getItem('selectedCity') || '';
    }
    return '';
  });

  const fetchData = useCallback(async () => {
    const initialCity =
      typeof window !== 'undefined'
        ? localStorage.getItem('selectedCity') || ''
        : '';

    try {
      setIsLoading(true);
      setError(null);

      const data = await getDashboardData(initialCity || null, CURRENCIES);

      setTodos(data.todos);
      setWeather(data.weather);
      setExchangeRates(data.exchangeRates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSetSelectedCity = (city: string) => {
    setSelectedCity(city);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCity', city);
    }
  };

  const refetchExchangeRates = useCallback(async () => {
    try {
      const data = await getExchangeRatesGraphQL(CURRENCIES);
      setExchangeRates(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch exchange rates'
      );
    }
  }, []);

  const refetchWeather = useCallback(async (city: string) => {
    try {
      const data = await getWeatherGraphQL(city);
      setWeather(data);
      setSelectedCity(city);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCity', city);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    }
  }, []);

  const refetchTodos = useCallback(async () => {
    try {
      const data = await getTodosGraphQL();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    }
  }, []);

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
        refetchTodos,
        refetchExchangeRates,
        refetchWeather,
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
