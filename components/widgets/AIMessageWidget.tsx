'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Spinner } from '../ui/spinner';
import { WidgetBox } from '../ui/widget-box';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function AIMessageWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

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
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/ai/stream?message=${encodeURIComponent(trimmedInput)}&provider=GPT`;

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
        <div className="h-60 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id}>
              <strong>{message.role === 'ai' ? 'T1 TETZ' : '나'}:</strong>
              {message.content}
            </div>
          ))}

          {isLoading && !streamingMessage && (
            <div>
              <Spinner />
            </div>
          )}

          {/* 스트리밍 중인 메시지 실시간 표시 */}
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
      </WidgetBox>
    </div>
  );
}
