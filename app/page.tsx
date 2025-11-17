import AIMessageWidget from '@/components/AIMessageWidget';
import DashboardDndKit from '@/components/DashboardDndKit';
import { TodoTable } from '@/components/TodoTable';
import AICompareWidget from '@/components/AICompareWidget';

export default function Home() {
  return (
    <div className="mx-5">
      {/* <DashboardDndKit /> */}
      {/* <AIMessageWidget /> */}
      <TodoTable />
      {/* <AICompareWidget /> */}
    </div>
  );
}
