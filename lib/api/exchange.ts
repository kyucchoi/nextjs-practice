import { authFetch } from './fetch';

export interface ExchangeRate {
  currency: string;
  rate: string;
}

export interface ExchangeRateResponse {
  rates: ExchangeRate[];
  executionTimeMs: number;
}

interface GraphQLResponse {
  data: {
    specificExchangeRates: {
      rates: ExchangeRate[];
      executionTimeMs: number;
    };
  };
}

export async function getExchangeRates(
  currencyCodes: string[]
): Promise<ExchangeRate[]> {
  const GRAPHQL_QUERY = `
    query GetRates($currencyCodes: [String!]!) {
      specificExchangeRates(currencyCodes: $currencyCodes) {
        rates {
          currency
          rate
        }
        executionTimeMs
      }
    }
  `;

  const res = await authFetch('/api/proxy?path=/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: { currencyCodes },
    }),
  });

  if (!res.ok) throw new Error('Failed to fetch exchange rates');

  const result: GraphQLResponse = await res.json();
  return result.data.specificExchangeRates.rates;
}

export async function getAllExchangeRates(): Promise<ExchangeRateResponse> {
  const response = await authFetch(
    '/api/proxy?path=/api/v1/exchange/rate/all/async'
  );

  if (!response.ok) {
    throw new Error('Failed to fetch all exchange rates');
  }

  return response.json();
}

export async function getAllExchangeRatesWithAxios(): Promise<ExchangeRateResponse> {
  const axios = (await import('axios')).default;

  const response = await axios.get(
    '/api/proxy?path=/api/v1/exchange/rate/all/async',
    {
      withCredentials: true,
    }
  );

  return response.data;
}
