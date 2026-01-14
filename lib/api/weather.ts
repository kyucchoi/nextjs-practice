import { authFetch } from './fetch';

export interface WeatherData {
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  name: string;
  sys: {
    country: string;
  };
}

export async function getWeather(city: string): Promise<WeatherData> {
  const GRAPHQL_QUERY = `
    query GetWeather($city: String!, $country: String!) {
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
    }
  `;

  const res = await authFetch('/api/proxy?path=/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: {
        city,
        country: 'KR',
      },
    }),
  });

  if (!res.ok) throw new Error('Failed to fetch weather');

  const result = await res.json();

  const weatherData = result.data.getWeather;

  return {
    ...weatherData,
    main: {
      temp: weatherData.main.temp,
      feels_like: weatherData.main.feelsLike,
      humidity: weatherData.main.humidity,
    },
  };
}
