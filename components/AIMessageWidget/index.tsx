'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Spinner } from '../ui/spinner';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function AIMessageWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState(''); // 현재 스트리밍 중인 AI 메시지

  // 메시지 전송 함수
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return; // 빈 메시지나 로딩 중이면 전송 안 함

    setInput('');
    setIsLoading(true);

    // 사용자 메시지를 히스토리에 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setStreamingMessage(''); // 이전 스트리밍 메시지 초기화

    try {
      // SSE 스트리밍 API 호출
      const url = `https://port-0-tetz-night-back-m5yo5gmx92cc34bc.sel4.cloudtype.app/api/ai/stream?message=${encodeURIComponent(
        trimmedInput
      )}&provider=GPT`;

      const response = await fetch(url);
      const reader = response.body?.getReader(); // 스트림 읽기 위한 reader
      const decoder = new TextDecoder(); // 바이트를 텍스트로 변환

      if (!reader) return;

      let fullMessage = ''; // 전체 메시지를 모을 변수

      // 스트림 데이터를 실시간으로 읽기
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 받은 데이터를 텍스트로 변환
        const text = decoder.decode(value);
        const lines = text.split('\n');

        // SSE 형식 파싱
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5);
            if (data) {
              fullMessage += data;
              setStreamingMessage(fullMessage); // 실시간으로 화면에 표시
            }
          }
        }
      }

      // 스트리밍 완료 후 완성된 AI 메시지를 히스토리에 추가
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: fullMessage,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex w-auto flex-col gap-4 rounded-b-lg border p-4 shadow-sm">
        <div>
          {messages.map((message) => (
            <div key={message.id}>
              <strong>{message.role === 'ai' ? 'T1 TETZ' : '나'}:</strong>{' '}
              {message.content}
            </div>
          ))}

          {isLoading && !streamingMessage && (
            <div>
              <Spinner />
            </div>
          )}

          {streamingMessage && (
            <div>
              <strong>T1 TETZ:</strong> {streamingMessage}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder="뭐든지 물어보세요!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            className="self-end h-auto"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            전송
          </Button>
        </div>
      </div>
    </div>
  );
}
