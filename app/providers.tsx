'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-md mx-auto bg-white md:shadow-lg py-5">
        {children}
      </div>
    </QueryClientProvider>
  );
}
