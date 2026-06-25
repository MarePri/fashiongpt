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
- Never be generic. Always be specific to their request.`;

      const reply = await callAI(system, msg, 900, controller.signal);
      if (controller.signal.aborted || !mountedRef.current) return;

      const wantsOutfit =
        msg.toLowerCase().includes('outfit') ||
        msg.toLowerCase().includes('wear') ||
        msg.toLowerCase().includes('dress') ||
        msg.toLowerCase().includes('look') ||
        reply.toLowerCase().includes('outfit built');

      const outfit = wantsOutfit ? parseOutfitFromProducts(reply, msg) : null;
      if (outfit) {
        outfit.name = 'Your Styled Look';
        outfit.why = 'Curated by FashionGPT based on your request';
      }
      setMessages(prev => trimHistory([...prev, { role: 'ai', content: reply, outfit }]));
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
