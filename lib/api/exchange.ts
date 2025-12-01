const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const isDev = process.env.NODE_ENV === 'development';

export interface ExchangeRate {
  currency: string;
  rate: string;
}

interface GraphQLResponse {
  data: {
    specificExchangeRates: {
      rates: ExchangeRate[];
      executionTimeMs: number;
    };
  };
}

// 환율 조회
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

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  // 개발 환경에서만 임시 토큰 사용
  if (isDev && process.env.NEXT_PUBLIC_AUTH_TOKEN) {
    headers.set(
      'Authorization',
      `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
    );
  }

  const res = await fetch(`${BASE_URL}/graphql`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: { currencyCodes },
    }),
  });

  if (!res.ok) throw new Error('Failed to fetch exchange rates');

  const result: GraphQLResponse = await res.json();
  return result.data.specificExchangeRates.rates;
}
