'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { getPoll, submitVote, type Poll } from '@/lib/api/vote';
import { toast } from 'sonner';

interface VoteSectionProps {
  pollId: number;
}

export default function VoteSection({ pollId }: VoteSectionProps) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isVoted, setIsVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPoll = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPoll(pollId);
      setPoll(data);

      if (data.userVotedOptionId) {
        setSelectedOptionId(data.userVotedOptionId);
        setIsVoted(true);
      }
    } catch (error) {
      console.error(
        '투표 정보 불러오기 실패:',
        error instanceof Error ? error.message : error
      );
    } finally {
      setIsLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    loadPoll();
  }, [pollId, loadPoll]);

  const handleSelect = (optionId: number) => {
    if (!isVoted) {
      setSelectedOptionId(optionId);
    }
  };

  const handleSubmitVote = async () => {
    if (!selectedOptionId || !poll) return;

    try {
      setIsSubmitting(true);
      await submitVote({
        pollId: poll.id,
        optionId: selectedOptionId,
      });

      setIsVoted(true);

      const updatedPoll = await getPoll(poll.id);
      setPoll(updatedPoll);
    } catch (error) {
      console.error(
        '투표 실패:',
        error instanceof Error ? error.message : error
      );
      toast('투표에 실패했습니다. 다시 시도해주세요.', {
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
      setIsSubmitting(false);
    }
  };

  const handleEditVote = () => {
    setIsVoted(false);
  };

  if (isLoading || !poll) {
    return (
      <div
        className="border-2 rounded-xl p-6"
        style={{
          borderColor: 'var(--hyobam-border)',
          backgroundColor: 'var(--hyobam-bg)',
        }}
      >
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded-lg w-1/2 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
          <div className="h-11 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-31 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-31 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const attendOption = poll.options.find((opt) => opt.displayOrder === 0);
  const notAttendOption = poll.options.find((opt) => opt.displayOrder === 1);

  return (
    <>
      <div
        className="border-2 rounded-xl p-6 relative"
        style={{
          borderColor: 'var(--hyobam-border)',
          backgroundColor: 'var(--hyobam-bg)',
        }}
      >
        {isVoted && poll.allowChangeVote && (
          <button
            onClick={handleEditVote}
            className="absolute top-4 right-4 rounded-lg transition-all text-sm font-medium"
            style={{ color: 'var(--hyobam-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--hyobam-primary-hover)';
              e.currentTarget.style.backgroundColor = 'var(--hyobam-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--hyobam-text)';
              e.currentTarget.style.backgroundColor = '';
            }}
            title="재투표"
          >
            재투표
          </button>
        )}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center">{poll.title}</h2>
          {poll.description && (
            <p className="text-center text-sm text-gray-600 mb-2">
              {poll.description}
            </p>
          )}

          <div className="text-center py-3 px-4 rounded-lg bg-white border border-gray-200 mb-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="flex items-center justify-center gap-1">
                <i className="fa-solid fa-users text-gray-600"></i>
                <span className="font-semibold">{poll.totalVotes}명</span>
              </div>
              <div className="flex items-center justify-center gap-1 border-x border-gray-200">
                <span style={{ color: 'var(--hyobam-text)' }}>
                  참석 {attendOption?.voteCount || 0}명
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 text-gray-600">
                불참 {notAttendOption?.voteCount || 0}명
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {attendOption && (
              <button
                onClick={() => handleSelect(attendOption.id)}
                disabled={isVoted}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedOptionId === attendOption.id && isVoted
                    ? 'shadow-lg'
                    : selectedOptionId === attendOption.id
                    ? 'shadow-lg scale-105'
                    : 'bg-white hover:shadow-md'
                } ${
                  isVoted ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                }`}
                style={{
                  borderColor:
                    selectedOptionId === attendOption.id
                      ? 'var(--hyobam-primary)'
                      : 'var(--hyobam-border)',
                  backgroundColor:
                    selectedOptionId === attendOption.id
                      ? 'var(--hyobam-bg)'
                      : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isVoted && selectedOptionId !== attendOption.id) {
                    e.currentTarget.style.borderColor = 'var(--hyobam-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isVoted && selectedOptionId !== attendOption.id) {
                    e.currentTarget.style.borderColor = 'var(--hyobam-border)';
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-4 rounded-full"
                    style={{ backgroundColor: 'var(--hyobam-bg)' }}
                  >
                    <i
                      className="fa-solid fa-check text-3xl"
                      style={{ color: 'var(--hyobam-text)' }}
                    ></i>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-xl mb-1">
                      {attendOption.optionText}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      TETZ와 함께
                      <br />
                      놀아요!
                    </p>
                  </div>
                  {selectedOptionId === attendOption.id && (
                    <i
                      className="fa-solid fa-circle-check text-2xl"
                      style={{ color: 'var(--hyobam-text)' }}
                    ></i>
                  )}
                </div>
              </button>
            )}

            {notAttendOption && (
              <button
                onClick={() => handleSelect(notAttendOption.id)}
                disabled={isVoted}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedOptionId === notAttendOption.id && isVoted
                    ? 'border-gray-500 bg-gray-50 shadow-lg'
                    : selectedOptionId === notAttendOption.id
                    ? 'border-gray-500 bg-gray-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
                } ${
                  isVoted ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <i className="fa-solid fa-xmark text-gray-600 text-3xl"></i>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-xl mb-1">
                      {notAttendOption.optionText}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      다음 기회에
                      <br />
                      만나요
                    </p>
                  </div>
                  {selectedOptionId === notAttendOption.id && (
                    <i className="fa-solid fa-circle-check text-gray-600 text-2xl"></i>
                  )}
                </div>
              </button>
            )}
          </div>

          {selectedOptionId && !isVoted && (
            <div>
              <Button
                onClick={handleSubmitVote}
                disabled={isSubmitting}
                className="w-full font-bold border-2"
                style={{
                  backgroundColor: 'var(--hyobam-bg)',
                  color: 'var(--hyobam-primary-hover)',
                  borderColor: 'var(--hyobam-primary)',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor =
                      'var(--hyobam-border)';
                    e.currentTarget.style.borderColor =
                      'var(--hyobam-primary-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = 'var(--hyobam-bg)';
                    e.currentTarget.style.borderColor = 'var(--hyobam-primary)';
                  }
                }}
                size="lg"
                variant="outline"
              >
                {isSubmitting ? '투표 중...' : '투표하기'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
