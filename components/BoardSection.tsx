'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  getComments,
  createComment,
  likeComment,
  type Comment as ApiComment,
} from '@/lib/api/comment';
import { toast } from 'sonner';

const generateNickname = () => {
  const animals = [
    '고양이',
    '강아지',
    '토끼',
    '여우',
    '햄스터',
    '다람쥐',
    '판다',
    '코알라',
  ];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAnimal}${randomNumber}`;
};

interface BoardSectionProps {
  pollId: number;
}

export default function BoardSection({ pollId }: BoardSectionProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');

  const loadComments = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setIsLoadingComments(true);
        }
        const data = await getComments(pollId);
        setComments(data);
      } catch (error) {
        console.error(
          '댓글 불러오기 실패:',
          error instanceof Error ? error.message : error
        );
      } finally {
        if (showLoading) {
          setIsLoadingComments(false);
        }
      }
    },
    [pollId]
  );

  useEffect(() => {
    loadComments();

    const nicknameKey = `nickname_${pollId}`;
    const savedNickname = localStorage.getItem(nicknameKey);
    if (savedNickname) {
      setNickname(savedNickname);
    } else {
      const newNickname = generateNickname();
      setNickname(newNickname);
      localStorage.setItem(nicknameKey, newNickname);
    }
  }, [pollId, loadComments]);

  const handleCreateComment = async () => {
    if (!newCommentContent.trim()) return;

    try {
      await createComment({
        pollId,
        nickname,
        comment: newCommentContent,
      });

      setNewCommentContent('');

      await loadComments(false);
    } catch (error) {
      console.error(
        '댓글 작성 실패:',
        error instanceof Error ? error.message : error
      );
      toast('댓글 작성에 실패했습니다. 다시 시도해주세요.', {
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
    }
  };

  const handleNicknameEdit = () => {
    setTempNickname(nickname);
    setIsEditingNickname(true);
  };

  const handleNicknameSave = () => {
    if (tempNickname.trim()) {
      const sanitized = tempNickname.trim().replace(/[<>]/g, '');
      setNickname(sanitized);
      localStorage.setItem(`nickname_${pollId}`, sanitized);
      setIsEditingNickname(false);
    }
  };

  const handleNicknameCancel = () => {
    setIsEditingNickname(false);
    setTempNickname('');
  };

  const handleLike = async (commentId: string) => {
    try {
      await likeComment(commentId);
      await loadComments(false);
    } catch (error) {
      console.error(
        '좋아요 실패:',
        error instanceof Error ? error.message : error
      );
      toast('좋아요에 실패했습니다. 다시 시도해주세요.', {
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
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const getBestComment = () => {
    if (comments.length === 0) return null;
    const maxLikes = Math.max(...comments.map((c) => c.likeCount));
    if (maxLikes === 0) return null;
    return comments.find((c) => c.likeCount === maxLikes);
  };

  const getTop3Comments = () => {
    if (comments.length === 0) return [];
    return [...comments]
      .sort((a, b) => b.likeCount - a.likeCount)
      .filter((c) => c.likeCount > 0)
      .slice(0, 3);
  };

  const bestComment = getBestComment();
  const top3Comments = getTop3Comments();

  return (
    <div
      className="mt-8 border-2 rounded-xl p-5"
      style={{
        borderColor: 'var(--hyobam-border)',
        backgroundColor: 'var(--hyobam-bg)',
      }}
    >
      <h2 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
        효밤 자유게시판
      </h2>

      {/* 닉네임 영역 */}
      <div className="mb-3 flex items-center gap-2 h-8">
        {isEditingNickname ? (
          <>
            <input
              type="text"
              value={tempNickname}
              onChange={(e) => setTempNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleNicknameSave();
                }
              }}
              className="flex-1 px-2 py-1 border rounded text-sm focus:outline-none h-full"
              style={{ borderColor: 'var(--hyobam-border)' }}
              onFocus={(e) =>
                (e.target.style.borderColor = 'var(--hyobam-primary)')
              }
              onBlur={(e) =>
                (e.target.style.borderColor = 'var(--hyobam-border)')
              }
              autoFocus
            />
            <button
              onClick={handleNicknameSave}
              className="text-xs px-2 rounded h-full cursor-pointer"
              style={{
                backgroundColor: 'var(--hyobam-primary)',
                color: 'white',
              }}
            >
              <i className="fa-solid fa-check"></i>
            </button>
            <button
              onClick={handleNicknameCancel}
              className="text-xs px-2 rounded bg-gray-200 text-gray-700 h-full cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-600">닉네임 :</span>
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--hyobam-text)' }}
            >
              {nickname}
            </span>
            <button
              onClick={handleNicknameEdit}
              className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <i className="fa-solid fa-pen"></i>
            </button>
          </>
        )}
      </div>

      {/* 댓글 작성 영역 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newCommentContent.trim()) {
              handleCreateComment();
            }
          }}
          placeholder="TETZ와 떠들어 봐요!"
          className="flex-1 p-2 border rounded-lg text-sm focus:outline-none"
          style={{ borderColor: 'var(--hyobam-border)' }}
          onFocus={(e) =>
            (e.target.style.borderColor = 'var(--hyobam-primary)')
          }
          onBlur={(e) => (e.target.style.borderColor = 'var(--hyobam-border)')}
        />
        <Button
          onClick={handleCreateComment}
          className="text-white cursor-pointer"
          style={{ backgroundColor: 'var(--hyobam-primary)' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor =
              'var(--hyobam-primary-hover)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--hyobam-primary)')
          }
          disabled={!newCommentContent.trim()}
        >
          <i className="fa-solid fa-paper-plane"></i>
        </Button>
      </div>

      {/* 인기 댓글 TOP 3 */}
      {top3Comments.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
            <i
              className="fa-brands fa-gulp"
              style={{ color: 'var(--hyobam-text)' }}
            ></i>
            인기 댓글 TOP 3
          </h3>
          <div className="space-y-2">
            {top3Comments.map((comment, index) => (
              <div
                key={`top-${comment.id}`}
                className="border border-gray-200 rounded-lg p-2 bg-white"
                style={{
                  borderColor:
                    index === 0 ? 'var(--hyobam-primary)' : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-1.5 py-0.5 text-white text-xs font-bold rounded"
                    style={{
                      background:
                        index === 0
                          ? 'linear-gradient(to right, var(--badge-gold-start), var(--badge-gold-end))'
                          : index === 1
                          ? 'linear-gradient(to right, var(--badge-silver-start), var(--badge-silver-end))'
                          : 'linear-gradient(to right, var(--badge-bronze-start), var(--badge-bronze-end))',
                    }}
                  >
                    LGTM
                  </span>
                  <span
                    className="font-bold text-xs"
                    style={{ color: 'var(--hyobam-text)' }}
                  >
                    {comment.nickname}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`ml-auto flex items-center gap-1 text-xs ${
                      comment.isLiked ? 'font-bold' : 'text-gray-500'
                    }`}
                    style={
                      comment.isLiked ? { color: 'var(--hyobam-primary)' } : {}
                    }
                  >
                    <i className="fa-solid fa-thumbs-up"></i>
                    {comment.likeCount}
                  </button>
                </div>
                <p className="text-xs text-gray-800">{comment.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전체 댓글 목록 */}
      <div className="space-y-2">
        {isLoadingComments ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            로딩 중...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            <p>아직 댓글이 없습니다.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="border border-gray-200 rounded-lg p-3 bg-white"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {bestComment?.id === comment.id && (
                    <span
                      className="px-1.5 py-0.5 text-white text-xs font-bold rounded"
                      style={{
                        background:
                          'linear-gradient(to right, var(--badge-gold-start), var(--badge-gold-end))',
                      }}
                    >
                      LGTM
                    </span>
                  )}
                  <span
                    className="font-bold text-xs"
                    style={{ color: 'var(--hyobam-text)' }}
                  >
                    {comment.nickname}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-800 mb-2">{comment.comment}</p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1 text-xs cursor-pointer ${
                    comment.isLiked ? 'font-bold' : 'text-gray-500'
                  }`}
                  style={
                    comment.isLiked ? { color: 'var(--hyobam-primary)' } : {}
                  }
                  onMouseEnter={(e) => {
                    if (!comment.isLiked) {
                      e.currentTarget.style.color = 'var(--hyobam-text)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!comment.isLiked) {
                      e.currentTarget.style.color = '';
                    }
                  }}
                >
                  <i className="fa-solid fa-thumbs-up"></i>
                  {comment.likeCount}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
