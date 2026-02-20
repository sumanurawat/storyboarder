export default function MessageBubble({ message }) {
  return (
    <article className={`sb-message sb-message-${message.role}`}>
      <div className="sb-message-meta">
        <strong>{message.role === 'assistant' ? 'Storyboarder AI' : 'You'}</strong>
        <span>{formatTime(message.timestamp)}</span>
      </div>
      <div className="sb-message-content">{renderMessageContent(message.content)}</div>
    </article>
  );
}

function formatTime(timestamp) {
  if (!timestamp) {
    return '';
  }

  try {
    return new Date(timestamp).toLocaleTimeString();
  } catch {
    return '';
  }
}

function renderMessageContent(content) {
  const lines = String(content || '').split('\n');
  const blocks = [];
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }
    blocks.push({
      type: 'p',
      text: paragraph.join(' ').trim(),
    });
    paragraph = [];
  };

  const flushList = () => {
    if (!list || list.items.length === 0) {
      list = null;
      return;
    }
    blocks.push(list);
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/);

    if (unorderedMatch) {
      flushParagraph();
      if (!list || list.type !== 'ul') {
        flushList();
        list = { type: 'ul', items: [] };
      }
      list.items.push(unorderedMatch[1]);
      continue;
    }

    if (orderedMatch) {
      flushParagraph();
      if (!list || list.type !== 'ol') {
        flushList();
        list = { type: 'ol', items: [] };
      }
      list.items.push(orderedMatch[1]);
      continue;
    }

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks.map((block, index) => {
    if (block.type === 'p') {
      return <p key={`p_${index}`}>{renderInline(block.text)}</p>;
    }

    if (block.type === 'ul') {
      return (
        <ul key={`ul_${index}`}>
          {block.items.map((item, itemIndex) => (
            <li key={`uli_${index}_${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    }

    if (block.type === 'ol') {
      return (
        <ol key={`ol_${index}`}>
          {block.items.map((item, itemIndex) => (
            <li key={`oli_${index}_${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    }

    return null;
  });
}

function renderInline(text) {
  return String(text || '')
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={`b_${index}`}>{part.slice(2, -2)}</strong>;
      }
      return <span key={`t_${index}`}>{part}</span>;
    });
}
