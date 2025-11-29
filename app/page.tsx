'use client';

import dynamic from 'next/dynamic';

// DashboardDndKit을 동적 import로 변경
const DashboardDndKit = dynamic(() => import('@/components/DashboardDndKit'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="mx-5">
      <DashboardDndKit />
    </div>
  );
}
