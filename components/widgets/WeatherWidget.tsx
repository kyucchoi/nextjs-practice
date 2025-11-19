'use client';

import { useState, useEffect } from 'react';
import { WidgetBox } from '../ui/widget-box';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WeatherData {
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

// 도시 목록
const CITIES = [
  { value: 'Seoul', label: '서울' },
  { value: 'Busan', label: '부산' },
  { value: 'Incheon', label: '인천' },
  { value: 'Daegu', label: '대구' },
  { value: 'Daejeon', label: '대전' },
  { value: 'Gwangju', label: '광주' },
];

export default function WeatherWidget() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchWeather = async (cityName: string) => {
    try {
      setIsLoading(true);
      setIsError(false);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/v1/weather?city=${encodeURIComponent(cityName)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('날씨 데이터를 가져오는데 실패했습니다');
      }

      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city]);

  const kelvinToCelsius = (kelvin: number) => {
    return Math.round(kelvin - 273.15);
  };

  if (isLoading) return <WidgetBox>로딩 중...</WidgetBox>;
  if (isError) return <WidgetBox>날씨 정보를 불러올 수 없습니다</WidgetBox>;

  return (
    <WidgetBox>
      <Select value={city} onValueChange={setCity}>
        <SelectTrigger>
          <SelectValue placeholder="도시 선택" />
        </SelectTrigger>
        <SelectContent>
          {CITIES.map((cityOption) => (
            <SelectItem key={cityOption.value} value={cityOption.value}>
              {cityOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {weather && (
        <div>
          <h2>
            {weather.name}, {weather.sys.country}
          </h2>

          <div>
            <div>{kelvinToCelsius(weather.main.temp)}°C</div>
            <div>{weather.weather[0].description}</div>
          </div>

          <div>
            <div>체감: {kelvinToCelsius(weather.main.feels_like)}°C</div>
            <div>습도: {weather.main.humidity}%</div>
            <div>풍속: {weather.wind.speed} m/s</div>
          </div>
        </div>
      )}
    </WidgetBox>
  );
}
