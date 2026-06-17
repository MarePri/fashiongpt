import { useState, useRef, useEffect, useCallback } from 'react';
import { callAI } from '../services/ai.js';
import { PRODUCTS } from '../data/products.js';
import { parseOutfitFromProducts } from '../utils/outfit.js';

/**
 * Hook managing chat state and message logic.
 */
export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
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

      const reply = await callAI(system, msg);
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
      setMessages(prev => [...prev, { role: 'ai', content: reply, outfit }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: 'Something went wrong. Try again!', outfit: null },
      ]);
    }
    setLoading(false);
  }, [input]);

  return { messages, input, loading, setInput, sendMessage, chatEndRef };
}
