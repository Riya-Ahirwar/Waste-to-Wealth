import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ChatRequestBody {
  title: string;
  materialsNeeded: string[];
  originalItems?: string[];
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  query: string;
  language?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { title, materialsNeeded, originalItems = [], messages = [], query, language = 'english' } = body;

    if (!title || !query) {
      return NextResponse.json({ error: 'Title and query are required' }, { status: 400 });
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const systemPrompt = `You are "Crafty", a friendly, safety-first DIY upcycling mentor.
You are helping a beginner create: "${title}".
Original Waste Items: ${originalItems.join(', ') || 'Household scrap'}.
Materials Needed: ${materialsNeeded.join(', ') || 'Common household materials'}.

Instructions:
1. Keep replies SHORT, CLEAR, and SIMPLE (3-5 sentences or quick numbered steps). Beginners get overwhelmed by long essays.
2. Answer follow-up questions directly (e.g. "Can I do this without glue? -> Yes! Use jute twine or interlock the slots.").
3. Safety first: Highlight precautions when cutting, using heat, or handling edges.
4. Language & Tone:
   - If the user talks in Hinglish (Hindi written in English alphabets like "bina glue ke kaise banaye?"), reply in natural, friendly Hinglish.
   - If user asks in Hindi script, reply in Hindi.
   - Otherwise, reply in simple English.
   - Be encouraging!`;

    // 1. Claude 3.5 Sonnet Streaming
    if (anthropicKey) {
      try {
        const formattedMessages = messages.slice(-6).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
        formattedMessages.push({ role: 'user', content: query });

        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 600,
            stream: true,
            system: systemPrompt,
            messages: formattedMessages,
          }),
        });

        if (!claudeRes.ok) {
          throw new Error(`Claude API error: ${claudeRes.status}`);
        }

        // Stream SSE tokens directly to client
        const stream = new ReadableStream({
          async start(controller) {
            const reader = claudeRes.body?.getReader();
            if (!reader) {
              controller.close();
              return;
            }

            const decoder = new TextDecoder();
            const encoder = new TextEncoder();
            let buffer = '';

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6).trim();
                    if (jsonStr === '[DONE]') continue;
                    try {
                      const parsed = JSON.parse(jsonStr);
                      if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                        controller.enqueue(encoder.encode(parsed.delta.text));
                      }
                    } catch {}
                  }
                }
              }
            } catch (err) {
              console.error('Error reading Claude stream:', err);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
          },
        });
      } catch (err) {
        console.warn('Claude streaming failed, attempting Gemini fallback:', err);
      }
    }

    // 2. Gemini 2.5 Flash Streaming
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
        for (const msg of messages.slice(-6)) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          });
        }
        contents.push({ role: 'user', parts: [{ text: query }] });

        const responseStream = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.5,
          },
        });

        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              for await (const chunk of responseStream) {
                if (chunk.text) {
                  controller.enqueue(encoder.encode(chunk.text));
                }
              }
            } catch (err) {
              console.error('Gemini stream error:', err);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
          },
        });
      } catch (err) {
        console.error('Gemini streaming error:', err);
      }
    }

    // 3. Smart Demo Response if no keys are provided
    let demoText = `Great question! When making **${title}**:\n\n` +
      `1. **Clean first**: Rinse and dry your waste item thoroughly so it's easy to handle.\n` +
      `2. **No glue?**: You can punch small holes and tie sections securely using jute twine, thread, or paperclips!\n` +
      `3. **Safety**: Always cut away from your body with steady hands.\n\n` +
      `What step would you like to tackle next?`;

    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('glue') || lowerQuery.includes('gond') || lowerQuery.includes('stick')) {
      demoText = `Bina glue ke bhi aap easily bana sakte hain!\n\n` +
        `• **Option 1**: Jute rope ya simple dhaga use karke tie karein.\n` +
        `• **Option 2**: Cardboard slots cut karke ek dusre mein interlock kar dein.\n` +
        `• **Option 3**: Double-sided foam tape ya stapler use karein.`;
    }

    // Return as stream simulation
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(demoText));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 });
  }
}
