import type { Todo } from './todo';
import type { WeatherData } from './weather';
import type { ExchangeRate } from './exchange';
import { handleAuthError } from './handleAuthError';

export interface DashboardData {
  todos: Todo[];
  weather: WeatherData | null;
  exchangeRates: ExchangeRate[];
}

interface GraphQLDashboardResponse {
  data: {
    getAllTodos: Todo[];
    getWeather: {
      name: string;
      weather: { main: string; description: string; icon: string }[];
      main: { temp: number; feelsLike: number; humidity: number };
      wind: { speed: number };
    } | null;
    specificExchangeRates: {
      rates: ExchangeRate[];
    };
  };
}

export async function getDashboardData(
  city: string | null,
  currencyCodes: string[]
): Promise<DashboardData> {
  const DASHBOARD_QUERY = `
    query Dashboard($city: String!, $country: String!, $currencyCodes: [String!]!) {
      getAllTodos {
        id
        task
        completed
        createdAt
      }
      getWeather(city: $city, country: $country) {
        name
        weather {
          main
          description
          icon
        }
        main {
          temp
          feelsLike
          humidity
        }
        wind {
          speed
        }
      }
      specificExchangeRates(currencyCodes: $currencyCodes) {
        rates {
          currency
          rate
        }
      }
    }
  `;

  const res = await fetch('/api/proxy?path=/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: DASHBOARD_QUERY,
      variables: {
        city: city || 'Seoul',
        country: 'KR',
        currencyCodes,
      },
    }),
    credentials: 'include',
  });

  handleAuthError(res);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');

  const result: GraphQLDashboardResponse = await res.json();

  const weatherData = result.data.getWeather;

  return {
    todos: result.data.getAllTodos,
    weather: weatherData
      ? {
          ...weatherData,
          main: {
            temp: weatherData.main.temp,
            feels_like: weatherData.main.feelsLike,
            humidity: weatherData.main.humidity,
          },
          sys: { country: 'KR' },
        }
      : null,
    exchangeRates: result.data.specificExchangeRates.rates,
  };
}
