'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WidgetBox } from '@/components/ui/widget-box';
import { useQuery } from '@tanstack/react-query';
import { widgetDataStore } from '@/store/widgetDataStore';

interface ExchangeRate {
  currency: string;
  rate: string;
}

interface ExchangeRateResponse {
  rates: ExchangeRate[];
  executionTimeMs: number;
}

export default function ExchangeRateRQ() {
  const { selectedCurrency, setSelectedCurrency } = widgetDataStore();

  const { data, isLoading, isError } = useQuery<ExchangeRateResponse>({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/exchange/rate/all/async`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
          },
        }
      );
      if (response.status === 403) {
        throw new Error('인증이 만료되었습니다. 토큰을 갱신해주세요.');
      }
      if (!response.ok) {
        throw new Error('환율 데이터를 가져오는데 실패했습니다');
      }
      return response.json();
    },
  });

  if (isLoading) return <p>로딩 중...</p>;
  if (isError) return <p>에러 발생!</p>;
  if (!data) return <p>데이터가 없습니다.</p>;

  const selectedRate = data.rates.find((r) => r.currency === selectedCurrency);

  return (
    <div>
      <WidgetBox className="p-8">
        <div>React-Query</div>

        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="나라를 선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            {data.rates.map((rate) => (
              <SelectItem key={rate.currency} value={rate.currency}>
                {rate.currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCurrency && selectedRate && (
          <>
            <p>1 {selectedCurrency} =</p>
            <h2>{selectedRate.rate} KRW</h2>
          </>
        )}
      </WidgetBox>
    </div>
  );
}
