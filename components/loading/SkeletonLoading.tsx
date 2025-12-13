import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonLoading() {
  return (
    <div>
      <div className="space-y-4 py-5">
        <div className="flex justify-end">
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-60 w-full rounded-lg" />
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    </div>
  );
}
