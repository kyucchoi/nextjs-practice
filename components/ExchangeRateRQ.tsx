'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

interface ExchangeRateResponse {
  data: {
    [country: string]: string;
  };
  executionTimeMs: number;
}

export default function ExchangeRateRQ() {
  const [selectedCountry, setSelectedCountry] = useState('');

  const { data, isLoading, isError } = useQuery<ExchangeRateResponse>({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL}/api/v1/exchange/rate/all/async`
      );
      if (!response.ok) {
        throw new Error('환율 데이터를 가져오는데 실패했습니다');
      }
      return response.json();
    },
  });

  if (isLoading) return <p>로딩 중...</p>;
  if (isError) return <p>에러 발생!</p>;
  if (!data) return <p>데이터가 없습니다.</p>;

  const currencies = Object.keys(data.data);

  return (
    <div>
      <div className="flex w-[320px] flex-col gap-4 rounded-lg border p-8 shadow-sm">
        <div>React-Query</div>

        <Select
          onValueChange={setSelectedCountry}
          defaultValue={selectedCountry}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="나라를 선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <h4>{selectedCountry}</h4>
        <p>1 {selectedCountry} =</p>
        <h2>{data.data[selectedCountry]} KRW</h2>
      </div>
    </div>
  );
}
