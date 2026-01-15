import axios from 'axios';
import { authFetch } from './fetch';

export interface ExchangeRate {
  currency: string;
  rate: string;
}

export interface ExchangeRateResponse {
  rates: ExchangeRate[];
}

export async function getAllExchangeRatesWithAxios(): Promise<ExchangeRateResponse> {
  const response = await axios.get<ExchangeRateResponse>(
    '/api/proxy?path=/api/v1/exchange-rate',
    { withCredentials: true }
  );
  return response.data;
}

export async function getAllExchangeRatesWithFetch(): Promise<ExchangeRateResponse> {
  const res = await authFetch('/api/proxy?path=/api/v1/exchange-rate');
  if (!res.ok) throw new Error('Failed to fetch exchange rates');
  return res.json();
}
