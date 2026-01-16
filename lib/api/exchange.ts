import axios from 'axios';
import { handleAuthError } from './handleAuthError';

export interface ExchangeRate {
  currency: string;
  rate: string;
}

export interface ExchangeRateResponse {
  rates: ExchangeRate[];
}

export async function getAllExchangeRatesWithAxios(): Promise<ExchangeRateResponse> {
  try {
    const response = await axios.get<ExchangeRateResponse>(
      '/api/proxy?path=/api/v1/exchange-rate',
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      window.location.href = '/login';
    }
    throw error;
  }
}

export async function getAllExchangeRatesWithFetch(): Promise<ExchangeRateResponse> {
  const res = await fetch('/api/proxy?path=/api/v1/exchange-rate', {
    credentials: 'include',
  });
  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to fetch exchange rates');
  return res.json();
}
