'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { WidgetBox } from '@/components/ui/widget-box';
import { toast } from 'sonner';
import { getExchangeRates, type ExchangeRate } from '@/lib/api/exchange';

const CURRENCIES = ['USD', 'JPY', 'EUR', 'CNY', 'GBP'];

export default function ExchangeRateGraphQL() {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedCurrency') || '';
    }
    return '';
  });
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    if (!selectedCurrency) return;

    try {
      setIsLoading(true);
      setIsError(false);

      const data = await getExchangeRates(CURRENCIES);
      setRates(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching rates:', error);
      setIsError(true);
      toast('환율 정보를 불러오는데 실패했습니다.', {
        icon: (
          <i
            className="fa-solid fa-xmark"
            style={{ color: 'var(--css-red)', fontSize: '20px' }}
          ></i>
        ),
        style: {
          background: 'var(--css-white)',
          color: 'var(--css-black)',
          border: '1px solid var(--css-red)',
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleRefresh = () => {
    fetchRates();
  };

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    localStorage.setItem('selectedCurrency', value);
  };

  const formatUpdateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const selectedRate = rates.find((r) => r.currency === selectedCurrency);

  return (
    <WidgetBox>
      <div className="flex justify-between items-center gap-2">
        <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="통화를 선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || !selectedCurrency}
        >
          <i className="fa-solid fa-arrows-rotate"></i>
          새로고침
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[167px]">
          <p className="text-gray-400 text-lg">로딩 중...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-[167px]">
          <p className="text-gray-400 text-sm">에러 발생!</p>
        </div>
      ) : selectedCurrency && selectedRate ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-200 rounded-lg p-6 border border-gray-100">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-600 mb-2">
              1 {selectedCurrency}
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold">
                {Number(selectedRate.rate).toLocaleString()}
              </span>
              <span className="text-xl font-semibold text-gray-600">KRW</span>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          {lastUpdated && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <i className="fa-regular fa-clock"></i>
              <span>마지막 업데이트: {formatUpdateTime(lastUpdated)}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[167px]">
          <p className="text-gray-400 text-lg">환율이 궁금하세요?</p>
        </div>
      )}
    </WidgetBox>
  );
}
