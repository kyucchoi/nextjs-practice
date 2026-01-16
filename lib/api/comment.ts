export interface Comment {
  id: string;
  pollId: number;
  nickname: string;
  comment: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
}

interface CreateCommentRequest {
  pollId: number;
  nickname: string;
  comment: string;
}

interface CreateCommentResponse {
  id: string;
  pollId: number;
  nickname: string;
  comment: string;
  createdAt: string;
}

interface LikeCountResponse {
  count: number;
}

interface LikeStatusResponse {
  isLiked: boolean;
}

export async function createComment(
  data: CreateCommentRequest
): Promise<Comment> {
  const response = await fetch(`/api/proxy?path=/api/tetz/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('댓글 작성에 실패했습니다.');
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const result: CreateCommentResponse = await response.json();
    return {
      id: result.id,
      pollId: result.pollId,
      nickname: result.nickname,
      comment: result.comment,
      createdAt: result.createdAt,
      likeCount: 0,
      isLiked: false,
    };
  } else {
    return {
      id: Date.now().toString(),
      pollId: data.pollId,
      nickname: data.nickname,
      comment: data.comment,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      isLiked: false,
    };
  }
}

export async function likeComment(commentId: string): Promise<void> {
  const response = await fetch(
    `/api/proxy?path=/api/tetz/comments/${commentId}/like`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error('좋아요에 실패했습니다.');
  }
}

export async function getCommentLikeCount(commentId: string): Promise<number> {
  const response = await fetch(
    `/api/proxy?path=/api/tetz/comments/${commentId}/like/count`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw new Error('좋아요 수 조회에 실패했습니다.');
  }

  const data: LikeCountResponse = await response.json();
  return data.count;
}

export async function getCommentLikeStatus(
  commentId: string
): Promise<boolean> {
  const response = await fetch(
    `/api/proxy?path=/api/tetz/comments/${commentId}/like/status`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw new Error('좋아요 상태 조회에 실패했습니다.');
  }

  const data: LikeStatusResponse = await response.json();
  return data.isLiked;
}

export async function getComments(pollId: number): Promise<Comment[]> {
  const response = await fetch(
    `/api/proxy?path=/api/tetz/polls/${pollId}/comments`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw new Error('댓글 목록 조회에 실패했습니다.');
  }

  const comments: Comment[] = await response.json();
  return comments;
}
