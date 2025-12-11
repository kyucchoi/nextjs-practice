const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const isDev = process.env.NODE_ENV === 'development';

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

// // 날씨 데이터 조회
// export async function getWeather(city: string): Promise<WeatherData> {
//   const headers = new Headers();

//   // 개발 환경에서만 임시 토큰 사용
//   if (isDev && process.env.NEXT_PUBLIC_AUTH_TOKEN) {
//     headers.set(
//       'Authorization',
//       `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
//     );
//   }

//   const res = await fetch(
//     `${BASE_URL}/api/v1/weather?city=${encodeURIComponent(city)}`,
//     {
//       headers,
//       credentials: 'include', // 쿠키에 jwt 있으면 같이 전송
//     }
//   );

//   if (!res.ok) throw new Error('Failed to fetch weather');
//   return res.json();
// }

// 날씨 데이터 조회 (GraphQL)
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
      variables: {
        city,
        country: 'KR', // 한국 고정
      },
    }),
  });

  if (!res.ok) throw new Error('Failed to fetch weather');

  const result = await res.json();

  // GraphQL 응답에서 데이터 추출
  const weatherData = result.data.getWeather;

  // feelsLike → feels_like 변환 (컴포넌트 호환성)
  return {
    ...weatherData,
    main: {
      temp: weatherData.main.temp,
      feels_like: weatherData.main.feelsLike,
      humidity: weatherData.main.humidity,
    },
  };
}
