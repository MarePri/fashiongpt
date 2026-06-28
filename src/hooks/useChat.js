import { useState, useRef, useEffect, useCallback } from 'react';
import { callAI } from '../services/ai.js';
import { PRODUCTS } from '../data/products.js';
import { parseOutfitFromProducts } from '../utils/outfit.js';

// ─── Keep chat history manageable ─────────────────────────────────────────────
const MAX_HISTORY = 30;

/**
 * Hook managing chat state and message logic.
 */
export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  /**
   * Trim old messages when history exceeds MAX_HISTORY.
   * Keeps the most recent messages and preserves at least one user+ai pair.
   */
  const trimHistory = useCallback((msgs) => {
    if (msgs.length <= MAX_HISTORY) return msgs;
    // Always keep the last MAX_HISTORY messages
    return msgs.slice(msgs.length - MAX_HISTORY);
  }, []);

  // Track mount state and abort in-flight requests on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    // Abort any in-flight request before starting a new one
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInput('');
    setMessages(prev => trimHistory([...prev, { role: 'user', content: msg }]));
    setLoading(true);
    try {
      const productContext = PRODUCTS.slice(0, 20)
        .map(p => `${p.name} by ${p.brand} (€${p.price}, ${p.color}, ${p.cat})`)
        .join('; ');
      const system = `You are FashionGPT — a brilliant AI personal stylist for the Inditex fashion ecosystem (Zara, Pull&Bear, Bershka, Stradivarius, Massimo Dutti, Oysho). You help people make confident fashion decisions with warmth, expertise, and specificity.

Available products include: ${productContext}

Rules:
- Always give concrete, specific outfit advice
- Mention actual product names and brands from the ecosystem
- Reference current trends naturally (quiet luxury, linen, baggy denim, chocolate brown)
- Include WHY each choice works (color harmony, occasion fit, trend moment)
- Be conversational, warm, and inspiring — like a stylish friend
- If they ask for an outfit, end with "✦ Outfit built — see below!" and I'll show product cards
- Keep responses under 200 words but make them feel rich and considered
- Never be generic. Always be specific to their request.
- After your response, on a NEW LINE, output <<INTENT>> then a JSON object: {"wantsOutfit":true/false,"occasion":"evening"|"casual"|"wedding"|"office"|"date"|"formal"|"vacation"|"sport"|"","budget":0|number}
  — wantsOutfit: true if they asked for a specific outfit/styling, false for general chat or opinions
  — occasion: the occasion they're dressing for, empty string if not mentioned
  — budget: max € they mentioned, 0 if not specified`;

      const reply = await callAI(system, msg, 900, controller.signal);
      if (controller.signal.aborted || !mountedRef.current) return;

      // ─── Structured intent classification (from AI reply) ────────────────────
      let wantsOutfit = false;
      let occasion = null;
      let budget = null;

      const intentMatch = reply.match(/<<INTENT>>\s*(\{[\s\S]*?\})/);
      if (intentMatch) {
        try {
          const intent = JSON.parse(intentMatch[1]);
          wantsOutfit = intent.wantsOutfit === true;
          occasion = intent.occasion || null;
          budget = typeof intent.budget === 'number' && intent.budget > 0 ? intent.budget : null;
        } catch {
          // Structured parse failed — fall through to fallback below
        }
      }

      // ─── Fallback: substring detection when structured path fails ────────────
      if (!intentMatch) {
        const lower = msg.toLowerCase();
        wantsOutfit =
          lower.includes('outfit') ||
          lower.includes('wear') ||
          lower.includes('style me') ||
          lower.includes('what should i') ||
          reply.toLowerCase().includes('outfit built');
      }

      const cleanReply = reply.replace(/<<INTENT>>\s*\{.*?\}\s*/s, '').trim();
      const outfit = wantsOutfit ? parseOutfitFromProducts(cleanReply, occasion || msg, budget) : null;
      if (outfit) {
        outfit.name = 'Your Styled Look';
        outfit.why = 'Curated by FashionGPT based on your request';
      }
      setMessages(prev => trimHistory([...prev, { role: 'ai', content: cleanReply, outfit }]));
    } catch (err) {
      if (!mountedRef.current) return;
      const suggestion = err?.message?.includes('fetch') || err?.message?.includes('NetworkError')
        ? 'Check your internet connection. If the issue persists, the AI service may be unavailable.'
        : err?.message?.includes('401') || err?.message?.includes('403')
        ? 'API key issue. Check your .env file has a valid API key.'
        : 'Something went wrong. Check your API key in .env or try again later.';
      setMessages(prev => trimHistory([
        ...prev,
        { role: 'ai', content: `⚠️ ${suggestion}`, outfit: null },
      ]));
    }
    if (mountedRef.current) setLoading(false);
  }, [input]);

  return { messages, input, loading, setInput, sendMessage, chatEndRef };
}
