'use client';

import { WidgetBox } from '../ui/widget-box';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useDashboard } from '@/contexts/DashboardContext';

const CITIES = [
  { value: 'Seoul', label: '서울' },
  { value: 'Busan', label: '부산' },
  { value: 'Incheon', label: '인천' },
  { value: 'Daegu', label: '대구' },
  { value: 'Daejeon', label: '대전' },
  { value: 'Gwangju', label: '광주' },
];

export default function WeatherWidget() {
  const {
    weather,
    isLoading,
    error: isError,
    selectedCity: city,
    setSelectedCity,
  } = useDashboard();

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
  };

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

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-24 mx-auto" />
          <div className="flex justify-center items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-18 rounded-lg" />
            <Skeleton className="h-18 rounded-lg" />
            <Skeleton className="h-18 rounded-lg" />
          </div>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center h-50">
          <p className="text-gray-500">날씨 정보를 불러올 수 없습니다</p>
        </div>
      )}

      {!city && !isLoading && !isError && (
        <div className="flex items-center justify-center h-50">
          <p className="text-gray-500">날씨를 추가해보세요</p>
        </div>
      )}

      {/* 날씨 데이터 표시 */}
      {weather && !isLoading && (
        <div className="mt-4">
          <div className="text-center text-2xl font-semibold">{cityLabel}</div>

          <div className="flex justify-center items-center gap-4">
            <Image
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              width={80}
              height={80}
              unoptimized
              priority
            />
            <div>
              <div className="text-xl font-bold">{weather.main.temp}°C</div>
              <div className="text-lg text-gray-600">
                {weather.weather[0].description}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-100 rounded-lg text-center">
              <div>체감</div>
              <div>{weather.main.feels_like}°C</div>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg text-center">
              <div>습도</div>
              <div>{weather.main.humidity}%</div>
            </div>
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
