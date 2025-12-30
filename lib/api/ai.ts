async function streamSSE(
  url: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch AI response');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Response body is not readable');
  }

  let fullMessage = '';

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
          onChunk(data);
        }
      }
    }
  }

  return fullMessage;
}

export async function streamAIResponse(
  message: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const url = `/api/proxy?path=/api/ai/stream/compare&message=${encodeURIComponent(
    message
  )}`;
  const fullMessage = await streamSSE(url, onChunk);
  return fullMessage.replace(/완료$/, '').trim();
}

export async function streamAIMessage(
  message: string,
  provider: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const url = `/api/proxy?path=/api/ai/stream&message=${encodeURIComponent(
    message
  )}&provider=${provider}`;
  return streamSSE(url, onChunk);
}
