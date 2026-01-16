import { handleAuthError } from './handleAuthError';

export interface PollOption {
  id: number;
  optionText: string;
  displayOrder: number;
  voteCount: number;
  percentage: number;
}

export interface Poll {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  allowChangeVote: boolean;
  createdBy: number;
  createdAt: string;
  totalVotes: number;
  userVotedOptionId: number | null;
  options: PollOption[];
}

export interface MyVote {
  pollId: number;
  optionId: number;
  optionText: string;
  hasVoted: boolean;
}

export interface CreatePollRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  allowChangeVote: boolean;
  options: {
    optionText: string;
    displayOrder: number;
  }[];
}

export interface VoteRequest {
  pollId: number;
  optionId: number;
}

export async function getPoll(pollId: number): Promise<Poll> {
  const response = await fetch(`/api/proxy?path=/api/tetz/polls/${pollId}`, {
    method: 'GET',
    credentials: 'include',
  });

  handleAuthError(response);
  if (!response.ok) {
    throw new Error('Failed to fetch poll');
  }

  return response.json();
}

export async function getMyVote(pollId: number): Promise<MyVote> {
  const response = await fetch(
    `/api/proxy?path=/api/tetz/polls/${pollId}/my-vote`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  handleAuthError(response);
  if (!response.ok) {
    throw new Error('Failed to fetch my vote');
  }

  return response.json();
}

export async function submitVote(voteData: VoteRequest): Promise<void> {
  const response = await fetch('/api/proxy?path=/api/tetz/votes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(voteData),
    credentials: 'include',
  });

  handleAuthError(response);
  if (!response.ok) {
    throw new Error('Failed to submit vote');
  }
}

export async function getPolls(): Promise<Poll[]> {
  const response = await fetch('/api/proxy?path=/api/tetz/polls', {
    method: 'GET',
    credentials: 'include',
  });

  handleAuthError(response);
  if (!response.ok) {
    throw new Error('Failed to fetch polls');
  }

  return response.json();
}

export async function createPoll(pollData: CreatePollRequest): Promise<Poll> {
  const response = await fetch('/api/proxy?path=/api/tetz/polls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pollData),
    credentials: 'include',
  });

  handleAuthError(response);
  if (!response.ok) {
    throw new Error('Failed to create poll');
  }

  return response.json();
}
