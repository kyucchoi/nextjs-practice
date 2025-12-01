'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Spinner } from '../ui/spinner';
import { WidgetBox } from '../ui/widget-box';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function AICompareWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // 새 대화 시작
  const startNewChat = () => {
    setMessages([]);
    setInput('');
    setStreamingMessage('');
  };

  // 메시지 전송 및 AI 응답 스트리밍 처리
  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setInput('');
    setIsLoading(true);

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setStreamingMessage('');

    try {
      // AI 비교 API 호출
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/ai/stream/compare?message=${encodeURIComponent(trimmedInput)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
        },
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let fullMessage = '';

      // 스트림 데이터를 실시간으로 읽어서 화면에 표시
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        // SSE 형식 파싱 (data: 로 시작하는 라인 추출)
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5);
            if (data) {
              fullMessage += data;
              setStreamingMessage(fullMessage);
            }
          }
        }
      }

      // 스트리밍 완료 후 완성된 메시지를 히스토리에 추가
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: fullMessage.replace(/완료$/, '').trim(), // 끝에 "완료"만 제거
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
      <WidgetBox>
        <div className="flex justify-end items-center border-b pb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={startNewChat}
            disabled={isLoading}
          >
            <i className="fa-solid fa-arrows-rotate"></i>새 대화
          </Button>
        </div>

        {/* 채팅 메시지 영역 */}
        <div className="h-60 overflow-y-auto space-y-3 border-b">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* 메시지 말풍선 */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                {/* 메시지 내용 */}
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {/* 로딩 상태 */}
          {isLoading && !streamingMessage && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  <span className="text-sm text-gray-500">
                    최적의 답변을 찾는 중...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 스트리밍 중인 메시지 실시간 표시 */}
          {streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white border border-gray-200 text-gray-900 rounded-2xl px-4 py-2">
                <div className="text-sm whitespace-pre-wrap break-words">
                  {streamingMessage}
                  {/* 타이핑 커서 */}
                  <span className="inline-block w-1 h-4 ml-1 bg-gray-400 animate-pulse"></span>
                </div>
              </div>
            </div>
          )}

          {/* 자동 스크롤 위치 참조 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="flex gap-2">
          <Textarea
            className="min-h-11 max-h-11 resize-none"
            placeholder="궁금한 게 있나요?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter 키로 전송 (Shift+Enter는 줄바꿈)
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
            className="h-11"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            전송
          </Button>
        </div>
      </WidgetBox>
    </div>
  );
}
