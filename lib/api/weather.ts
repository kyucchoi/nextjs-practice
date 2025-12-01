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

// 날씨 데이터 조회
export async function getWeather(city: string): Promise<WeatherData> {
  const headers = new Headers();

  // 개발 환경에서만 임시 토큰 사용
  if (isDev && process.env.NEXT_PUBLIC_AUTH_TOKEN) {
    headers.set(
      'Authorization',
      `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`
    );
  }

  const res = await fetch(
    `${BASE_URL}/api/v1/weather?city=${encodeURIComponent(city)}`,
    {
      headers,
      credentials: 'include', // 쿠키에 jwt 있으면 같이 전송
    }
  );

  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}
