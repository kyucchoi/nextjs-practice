'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Spinner } from '../ui/spinner';
import { WidgetBox } from '../ui/widget-box';
import { streamAIResponse } from '@/lib/api/ai';

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const startNewChat = () => {
    setMessages([]);
    setInput('');
    setStreamingMessage('');
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setStreamingMessage('');

    try {
      const fullMessage = await streamAIResponse(trimmedInput, (chunk) => {
        setStreamingMessage((prev) => prev + chunk);
      });

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
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

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

          {streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white border border-gray-200 text-gray-900 rounded-2xl px-4 py-2">
                <div className="text-sm whitespace-pre-wrap break-words">
                  {streamingMessage}
                  <span className="inline-block w-1 h-4 ml-1 bg-gray-400 animate-pulse"></span>
                </div>
              </div>
            </div>
          )}

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
