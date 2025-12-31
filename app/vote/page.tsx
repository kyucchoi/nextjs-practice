'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import VoteSection from '@/components/VoteSection';
import BoardSection from '@/components/BoardSection';
import { getPolls } from '@/lib/api/vote';
import InvitationSection from '@/components/InvitationSection';

export default function VotePage() {
  const [pollId, setPollId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivePoll();
  }, []);

  const loadActivePoll = async () => {
    try {
      setIsLoading(true);
      const polls = await getPolls();

      const latestPoll = polls
        .filter((poll) => poll.isActive)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      if (latestPoll) {
        setPollId(latestPoll.id);
      }
    } catch (error) {
      console.error('투표 목록 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-5">
      <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
        <i className="fa-solid fa-angle-left text-xl"></i>
      </Button>
      <div className="space-y-5">
        <InvitationSection />

        {pollId ? (
          <>
            <VoteSection pollId={pollId} />
            <BoardSection pollId={pollId} />
          </>
        ) : !isLoading ? (
          <div
            className="border-2 rounded-xl p-6"
            style={{
              borderColor: 'var(--hyobam-border)',
              backgroundColor: 'var(--hyobam-bg)',
            }}
          >
            <div className="text-center py-10">
              <i className="fa-solid fa-inbox text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">진행 중인 투표가 없습니다.</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
