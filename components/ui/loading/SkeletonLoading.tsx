import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonLoading() {
  return (
    <div>
      <div className="space-y-4 py-5">
        <Skeleton className="h-60 w-full rounded-lg" />
        <Skeleton className="h-60 w-full rounded-lg" />
      </div>
    </div>
  );
}
