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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Image from 'next/image';

// 날씨 API 응답 데이터 타입 정의
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

// 도시 목록 (영문 value, 한글 label)
const CITIES = [
  { value: 'Seoul', label: '서울' },
  { value: 'Busan', label: '부산' },
  { value: 'Incheon', label: '인천' },
  { value: 'Daegu', label: '대구' },
  { value: 'Daejeon', label: '대전' },
  { value: 'Gwangju', label: '광주' },
];

export default function WeatherWidget() {
  // localStorage에서 초기값 가져오기
  const [city, setCity] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCity') || '';
    }
    return '';
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // 날씨 데이터 fetch 함수
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
      toast('날씨 정보를 불러오는데 실패했습니다.', {
        icon: (
          <i
            className="fa-solid fa-xmark"
            style={{ color: 'var(--red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--white)',
          color: 'var(--black)',
          border: '1px solid var(--red)',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 도시 선택 시 날씨 데이터 fetch
  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city]);

  // 도시 선택 변경 시 localStorage에 저장
  const handleCityChange = (value: string) => {
    setCity(value);
    localStorage.setItem('selectedCity', value);
  };

  // 영문 도시명을 한글로 변환
  const cityLabel = weather
    ? CITIES.find((c) => c.value === weather.name)?.label || weather.name
    : '';

  return (
    <WidgetBox>
      {/* 도시 선택 드롭다운 */}
      <Select value={city} onValueChange={handleCityChange}>
        <SelectTrigger className="w-[180px]">
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

      {/* 로딩 상태: Skeleton UI 표시 */}
      {isLoading && (
        <div className="space-y-2">
          {/* 도시 이름 스켈레톤 */}
          <Skeleton className="h-8 w-24 mx-auto" />
          {/* 날씨 아이콘 + 온도 스켈레톤 */}
          <div className="flex justify-center items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          {/* 상세 정보 박스 스켈레톤 */}
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-18 rounded-lg" />
            <Skeleton className="h-18 rounded-lg" />
            <Skeleton className="h-18 rounded-lg" />
          </div>
        </div>
      )}

      {/* 에러 상태: 에러 메시지 표시 */}
      {isError && (
        <div className="flex items-center justify-center h-50">
          <p className="text-gray-500">날씨 정보를 불러올 수 없습니다</p>
        </div>
      )}

      {/* 초기 상태: 도시 미선택 시 안내 문구 */}
      {!city && !isLoading && !isError && (
        <div className="flex items-center justify-center h-50">
          <p className="text-gray-500">날씨를 추가해보세요</p>
        </div>
      )}

      {/* 날씨 데이터 표시 */}
      {weather && !isLoading && (
        <div className="mt-4">
          {/* 도시 이름 (한글) */}
          <div className="text-center text-2xl font-semibold">{cityLabel}</div>

          {/* 날씨 아이콘 + 온도 + 상태 */}
          <div className="flex justify-center items-center gap-4">
            <Image
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              width={80}
              height={80}
              unoptimized
            />
            <div>
              <div className="text-xl font-bold">{weather.main.temp}°C</div>
              <div className="text-lg text-gray-600">
                {weather.weather[0].description}
              </div>
            </div>
          </div>

          {/* 상세 정보: 체감/습도/풍속 */}
          <div className="grid grid-cols-3 gap-3">
            {/* 체감 온도 */}
            <div className="p-3 bg-gray-100 rounded-lg text-center">
              <div>체감</div>
              <div>{weather.main.feels_like}°C</div>
            </div>

            {/* 습도 */}
            <div className="p-3 bg-gray-100 rounded-lg text-center">
              <div>습도</div>
              <div>{weather.main.humidity}%</div>
            </div>

            {/* 풍속 */}
            <div className="p-3 bg-gray-100 rounded-lg text-center">
              <div>풍속</div>
              <div>{weather.wind.speed} m/s</div>
            </div>
          </div>
        </div>
      )}
    </WidgetBox>
  );
}
