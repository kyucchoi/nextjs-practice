'use client';

import dynamic from 'next/dynamic';
import AIMessageWidget from '@/components/widgets/AIMessageWidget';
import { TodoTable } from '@/components/widgets/TodoTable';
import AICompareWidget from '@/components/widgets/AICompareWidget';
import WeatherWidget from '@/components/widgets/WeatherWidget';
import ExchangeRateGraphQL from '@/components/widgets/ExchangeRateGraphQL';

// DashboardDndKit을 동적 import로 변경
const DashboardDndKit = dynamic(() => import('@/components/DashboardDndKit'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="mx-5">
      <DashboardDndKit />
      {/* <AIMessageWidget /> */}
      {/* <TodoTable /> */}
      {/* <AICompareWidget /> */}
      {/* <WeatherWidget /> */}
      {/* <ExchangeRateGraphQL /> */}
    </div>
  );
}
