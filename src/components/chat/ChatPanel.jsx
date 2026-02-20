import { useMemo, useState } from 'react';

import MessageBubble from './MessageBubble.jsx';

export default function ChatPanel({
  messages,
  streamingText,
  isStreaming,
  isSending,
  onSend,
}) {
  const [input, setInput] = useState('');

  const displayMessages = useMemo(() => {
    const safe = Array.isArray(messages) ? messages : [];
    if (isStreaming && streamingText) {
      return [
        ...safe,
        {
          role: 'assistant',
          content: streamingText,
          timestamp: new Date().toISOString(),
          _streaming: true,
        },
      ];
    }
    return safe;
  }, [messages, isStreaming, streamingText]);

  const submit = () => {
    const text = input.trim();
    if (!text || isSending) {
      return;
    }

    onSend?.(text);
    setInput('');
  };

  return (
    <section className="sb-chat-panel">
      <header className="sb-section-head">
        <h2>Conversation</h2>
        <p>Talk naturally. The storyboard updates in real time.</p>
      </header>

      <div className="sb-message-list">
        {displayMessages.map((message, index) => (
          <MessageBubble key={`${message.timestamp || ''}_${index}`} message={message} />
        ))}
      </div>

      <div className="sb-chat-compose">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submit();
            }
          }}
          placeholder={'Try: "Maya finds a map in her grandmother\'s attic"'}
        />
        <button className="sb-btn sb-btn-primary" onClick={submit} disabled={isSending}>
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </section>
  );
}
