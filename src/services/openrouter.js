import OpenAI from 'openai';

let client = null;

export function initClient(apiKey) {
  const clean = String(apiKey || '').trim();
  if (!clean) {
    client = null;
    return null;
  }

  client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: clean,
    defaultHeaders: {
      'HTTP-Referer': 'https://storyboarder.desktop',
      'X-Title': 'Storyboarder',
    },
    dangerouslyAllowBrowser: true,
  });

  return client;
}

export async function fetchModels(apiKey) {
  const clean = String(apiKey || '').trim();
  if (!clean) {
    return [];
  }

  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      Authorization: `Bearer ${clean}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to load models: ${response.status} ${text}`);
  }

  const data = await response.json();
  const models = Array.isArray(data?.data) ? data.data : [];

  return models
    .filter((model) => Number(model?.context_length || 0) >= 8000)
    .map((model) => ({
      id: model.id,
      name: model.name || model.id,
      contextLength: model.context_length,
      pricingInput: model?.pricing?.prompt,
      pricingOutput: model?.pricing?.completion,
      supportsJsonMode: Array.isArray(model?.supported_parameters)
        ? model.supported_parameters.includes('response_format')
        : false,
      supportsTools: Array.isArray(model?.supported_parameters)
        ? model.supported_parameters.includes('tools')
        : false,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function sendMessage({
  model,
  systemPrompt,
  messages,
  onToken,
  onDone,
  onError,
}) {
  if (!client) {
    onError?.(new Error('OpenRouter client not initialized. Add API key in Settings.'));
    return;
  }

  try {
    const stream = await client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...(messages || [])],
      stream: true,
    });

    let fullText = '';

    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content;
      if (typeof delta === 'string' && delta.length > 0) {
        fullText += delta;
        onToken?.(delta, fullText);
      }
    }

    onDone?.(fullText);
  } catch (error) {
    onError?.(error);
  }
}

export async function sendMessageSync({ model, systemPrompt, messages }) {
  if (!client) {
    throw new Error('OpenRouter client not initialized. Add API key in Settings.');
  }

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...(messages || [])],
    response_format: { type: 'json_object' },
  });

  return response?.choices?.[0]?.message?.content || '';
}
