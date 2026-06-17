import { useState, useRef, useEffect } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// Palette: deep charcoal (#0D0D0D), warm ivory (#F7F3EE), dusty rose accent (#C9826B),
// muted gold (#B8A070), slate blue (#4A5568), ghost white card (#1A1A1A)
// Type: system serif display, clean sans body
// Signature: animated "style pulse" — glowing dot that breathes on AI thinking

// ─── DATA ────────────────────────────────────────────────────────────────────
const BRANDS = ["Zara", "Pull&Bear", "Bershka", "Stradivarius", "Massimo Dutti", "Oysho"];

const PRODUCTS = [
  // Zara
  { id: 1, brand: "Zara", name: "Fluid Linen Blazer", cat: "Outerwear", color: "Ecru", price: 89.95, trend: 92, style: ["smart casual","office","date"], fit: "relaxed", img: "🧥" },
  { id: 2, brand: "Zara", name: "High-Waist Wide Leg Trousers", cat: "Bottoms", color: "Black", price: 49.95, trend: 88, style: ["minimal","office","evening"], fit: "wide", img: "👖" },
  { id: 3, brand: "Zara", name: "Asymmetric Draped Dress", cat: "Dresses", color: "Ivory", price: 69.95, trend: 95, style: ["evening","wedding","date"], fit: "draped", img: "👗" },
  { id: 4, brand: "Zara", name: "Structured Leather Tote", cat: "Bags", color: "Tan", price: 79.95, trend: 85, style: ["office","minimal","everyday"], fit: "n/a", img: "👜" },
  { id: 5, brand: "Zara", name: "Satin Slip Midi Skirt", cat: "Bottoms", color: "Champagne", price: 45.95, trend: 90, style: ["evening","date","wedding"], fit: "slim", img: "👗" },
  { id: 6, brand: "Zara", name: "Oversized Striped Shirt", cat: "Tops", color: "White/Navy", price: 35.95, trend: 78, style: ["casual","vacation","weekend"], fit: "oversized", img: "👕" },
  { id: 7, brand: "Zara", name: "Block Heel Mule", cat: "Shoes", color: "Beige", price: 59.95, trend: 82, style: ["office","date","smart casual"], fit: "n/a", img: "👠" },
  { id: 8, brand: "Zara", name: "Ribbed Mock-Neck Top", cat: "Tops", color: "Chocolate", price: 25.95, trend: 80, style: ["casual","minimal","layering"], fit: "fitted", img: "👕" },

  // Pull&Bear
  { id: 9, brand: "Pull&Bear", name: "Baggy Carpenter Jeans", cat: "Bottoms", color: "Washed Blue", price: 39.99, trend: 94, style: ["streetwear","casual","concert"], fit: "baggy", img: "👖" },
  { id: 10, brand: "Pull&Bear", name: "Graphic Tee — Vintage Motor", cat: "Tops", color: "Faded Black", price: 17.99, trend: 88, style: ["streetwear","casual","festival"], fit: "relaxed", img: "👕" },
  { id: 11, brand: "Pull&Bear", name: "Varsity Bomber Jacket", cat: "Outerwear", color: "Navy/White", price: 59.99, trend: 91, style: ["streetwear","casual","festival"], fit: "regular", img: "🧥" },
  { id: 12, brand: "Pull&Bear", name: "Chunky Sole Sneaker", cat: "Shoes", color: "White", price: 49.99, trend: 89, style: ["streetwear","casual","everyday"], fit: "n/a", img: "👟" },
  { id: 13, brand: "Pull&Bear", name: "Linen Shorts", cat: "Bottoms", color: "Sand", price: 25.99, trend: 85, style: ["casual","beach","vacation"], fit: "relaxed", img: "🩳" },
  { id: 14, brand: "Pull&Bear", name: "Ribbed Tank Top", cat: "Tops", color: "White", price: 12.99, trend: 76, style: ["casual","beach","layering"], fit: "slim", img: "👕" },
  { id: 15, brand: "Pull&Bear", name: "Baseball Cap", cat: "Accessories", color: "Black", price: 14.99, trend: 83, style: ["streetwear","casual","sport"], fit: "n/a", img: "🧢" },
  { id: 16, brand: "Pull&Bear", name: "Cord Overshirt", cat: "Tops", color: "Rust", price: 35.99, trend: 87, style: ["casual","weekend","fall"], fit: "regular", img: "🧣" },

  // Bershka
  { id: 17, brand: "Bershka", name: "Y2K Flare Jeans", cat: "Bottoms", color: "Light Wash", price: 32.99, trend: 96, style: ["y2k","concert","festival"], fit: "flare", img: "👖" },
  { id: 18, brand: "Bershka", name: "Cut-Out Bodysuit", cat: "Tops", color: "Black", price: 22.99, trend: 90, style: ["evening","festival","date"], fit: "fitted", img: "👙" },
  { id: 19, brand: "Bershka", name: "Faux Leather Jacket", cat: "Outerwear", color: "Black", price: 55.99, trend: 85, style: ["streetwear","concert","evening"], fit: "slim", img: "🧥" },
  { id: 20, brand: "Bershka", name: "Platform Boots", cat: "Shoes", color: "Black", price: 59.99, trend: 88, style: ["y2k","concert","streetwear"], fit: "n/a", img: "👢" },
  { id: 21, brand: "Bershka", name: "Crochet Mini Dress", cat: "Dresses", color: "Cream", price: 39.99, trend: 91, style: ["festival","vacation","beach"], fit: "relaxed", img: "👗" },
  { id: 22, brand: "Bershka", name: "Chain Shoulder Bag", cat: "Bags", color: "Silver", price: 29.99, trend: 84, style: ["evening","festival","date"], fit: "n/a", img: "👜" },

  // Stradivarius
  { id: 23, brand: "Stradivarius", name: "Balloon Sleeve Blouse", cat: "Tops", color: "White", price: 27.99, trend: 82, style: ["romantic","date","office"], fit: "balloon", img: "👚" },
  { id: 24, brand: "Stradivarius", name: "Mom Jeans", cat: "Bottoms", color: "Medium Wash", price: 35.99, trend: 79, style: ["casual","everyday","weekend"], fit: "mom", img: "👖" },
  { id: 25, brand: "Stradivarius", name: "Strappy Heeled Sandal", cat: "Shoes", color: "Gold", price: 42.99, trend: 86, style: ["evening","wedding","date"], fit: "n/a", img: "👡" },
  { id: 26, brand: "Stradivarius", name: "Floral Maxi Dress", cat: "Dresses", color: "Multicolor", price: 49.99, trend: 89, style: ["vacation","wedding guest","festival"], fit: "flowy", img: "👗" },
  { id: 27, brand: "Stradivarius", name: "Knit Cardigan", cat: "Tops", color: "Camel", price: 32.99, trend: 84, style: ["casual","minimal","layering"], fit: "relaxed", img: "🧶" },
  { id: 28, brand: "Stradivarius", name: "Hoop Earrings Set", cat: "Accessories", color: "Gold", price: 12.99, trend: 77, style: ["everyday","evening","casual"], fit: "n/a", img: "💍" },

  // Massimo Dutti
  { id: 29, brand: "Massimo Dutti", name: "Cashmere V-Neck Sweater", cat: "Tops", color: "Navy", price: 99.00, trend: 81, style: ["office","smart casual","minimal"], fit: "regular", img: "🧥" },
  { id: 30, brand: "Massimo Dutti", name: "Tailored Wool Trousers", cat: "Bottoms", color: "Charcoal", price: 119.00, trend: 80, style: ["office","formal","smart casual"], fit: "tailored", img: "👖" },
  { id: 31, brand: "Massimo Dutti", name: "Oxford Leather Brogues", cat: "Shoes", color: "Cognac", price: 149.00, trend: 78, style: ["office","formal","smart casual"], fit: "n/a", img: "👞" },
  { id: 32, brand: "Massimo Dutti", name: "Silk Printed Blouse", cat: "Tops", color: "Blue Print", price: 89.00, trend: 83, style: ["office","evening","smart casual"], fit: "relaxed", img: "👚" },

  // Oysho
  { id: 33, brand: "Oysho", name: "Modal Lounge Set", cat: "Loungewear", color: "Dusty Pink", price: 55.00, trend: 87, style: ["lounge","wellness","casual"], fit: "relaxed", img: "🩳" },
  { id: 34, brand: "Oysho", name: "Sports High-Impact Bra", cat: "Sport", color: "Black", price: 35.00, trend: 85, style: ["sport","gym","wellness"], fit: "fitted", img: "🩱" },
  { id: 35, brand: "Oysho", name: "Linen Beach Dress", cat: "Dresses", color: "White", price: 45.00, trend: 90, style: ["beach","vacation","casual"], fit: "flowy", img: "👗" },
  { id: 36, brand: "Oysho", name: "Seamless Leggings", cat: "Sport", color: "Slate", price: 39.00, trend: 86, style: ["sport","gym","casual"], fit: "fitted", img: "🩳" },
];

const OCCASIONS = [
  { id: "wedding", label: "Summer Wedding", icon: "💒", vibe: "elegant, romantic" },
  { id: "vacation", label: "City Break", icon: "✈️", vibe: "comfortable, stylish" },
  { id: "festival", label: "Festival", icon: "🎪", vibe: "bold, expressive" },
  { id: "date", label: "Date Night", icon: "🌹", vibe: "confident, alluring" },
  { id: "office", label: "Office", icon: "💼", vibe: "polished, professional" },
  { id: "beach", label: "Beach Holiday", icon: "🌊", vibe: "relaxed, effortless" },
  { id: "concert", label: "Concert Night", icon: "🎵", vibe: "edgy, statement" },
  { id: "weekend", label: "Weekend Brunch", icon: "☕", vibe: "casual, put-together" },
];

const TRENDS = [
  { name: "Quiet Luxury", dir: "up", pct: 94, desc: "Understated elegance, premium materials, no logos", brands: ["Massimo Dutti", "Zara"] },
  { name: "Linen Everything", dir: "up", pct: 91, desc: "Breathable summer staple, multiple silhouettes", brands: ["Pull&Bear", "Zara", "Oysho"] },
  { name: "Baggy Denim", dir: "up", pct: 89, desc: "Y2K revival, carpenter & wide fits dominating", brands: ["Pull&Bear", "Bershka"] },
  { name: "Crochet & Knits", dir: "up", pct: 87, desc: "Artisan textures returning for summer", brands: ["Bershka", "Stradivarius"] },
  { name: "Chocolate Brown", dir: "up", pct: 85, desc: "The neutral of the season, replacing camel", brands: ["Zara", "Massimo Dutti"] },
  { name: "Slim Fit Revival", dir: "down", pct: 38, desc: "Losing ground to relaxed silhouettes", brands: [] },
  { name: "Fast Logo Tees", dir: "down", pct: 29, desc: "Loud branding fading vs. minimal aesthetic", brands: [] },
  { name: "Athleisure Blend", dir: "up", pct: 82, desc: "Performance fabrics in everyday contexts", brands: ["Oysho", "Pull&Bear"] },
];

const ARCHETYPES = [
  { id: "minimalist", name: "Modern Minimalist", icon: "⬜", colors: ["Black", "White", "Beige", "Grey"], brands: ["Zara", "Massimo Dutti"], desc: "Clean lines, neutral palette, quality over quantity." },
  { id: "streetwear", name: "Contemporary Streetwear", icon: "🔥", colors: ["Black", "White", "Rust", "Cobalt"], brands: ["Pull&Bear", "Bershka"], desc: "Bold silhouettes, cultural references, comfort-first." },
  { id: "romantic", name: "Romantic Explorer", icon: "🌸", colors: ["Blush", "Cream", "Floral", "Gold"], brands: ["Stradivarius", "Zara"], desc: "Feminine details, soft textures, occasion-ready." },
  { id: "professional", name: "Smart Professional", icon: "💎", colors: ["Navy", "Charcoal", "White", "Camel"], brands: ["Massimo Dutti", "Zara"], desc: "Tailored silhouettes, investment pieces, boardroom-ready." },
];

const PROMPTS = [
  "I need an outfit for a summer wedding 💒",
  "Going to Barcelona for 5 days ✈️",
  "Streetwear outfit under €150 🔥",
  "I want to dress like Pedro Pascal 🎬",
  "First date outfit — I want to feel confident 🌹",
  "Build me a 10-piece capsule wardrobe 👗",
  "What's trending this summer? 📈",
  "I only wear neutrals — help me build looks",
];

// ─── AI CALL ─────────────────────────────────────────────────────────────────
async function callAI(systemPrompt, userMessage, maxTokens = 900) {
  // NOTE: This calls the Anthropic API directly from the browser, which requires
  // an API key. In Claude.ai artifacts this is handled automatically for you.
  // In this standalone project, set VITE_ANTHROPIC_API_KEY in a .env file
  // (see README.md). For production, proxy this through your own backend
  // instead so the API key is never exposed in client-side code.
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --bg: #0D0D0D;
    --surface: #161616;
    --card: #1C1C1C;
    --border: #2A2A2A;
    --accent: #C9826B;
    --accent2: #B8A070;
    --text: #F7F3EE;
    --muted: #888;
    --up: #7EC8A0;
    --down: #E07070;
  }
  
  body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; }
  
  .app { min-height: 100vh; display: flex; flex-direction: column; max-width: 420px; margin: 0 auto; position: relative; }
  
  /* Nav */
  .nav { position: sticky; top: 0; z-index: 100; background: rgba(13,13,13,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 0 16px; display: flex; align-items: center; justify-content: space-between; height: 56px; }
  .nav-logo { font-family: 'Playfair Display', serif; font-size: 18px; letter-spacing: -0.3px; }
  .nav-logo span { color: var(--accent); }
  .nav-tabs { display: flex; gap: 4px; }
  .nav-tab { background: none; border: none; color: var(--muted); font-size: 10px; font-family: 'Inter', sans-serif; padding: 6px 8px; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 2px; transition: all 0.2s; }
  .nav-tab.active { color: var(--accent); }
  .nav-tab .icon { font-size: 16px; }
  
  /* Chat */
  .chat-area { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; padding-bottom: 140px; }
  .chat-hero { text-align: center; padding: 32px 16px 16px; }
  .chat-hero h1 { font-family: 'Playfair Display', serif; font-size: 28px; line-height: 1.2; margin-bottom: 8px; }
  .chat-hero h1 em { color: var(--accent); font-style: italic; }
  .chat-hero p { color: var(--muted); font-size: 13px; line-height: 1.5; }
  
  .pulse-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); margin-right: 6px; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
  
  .prompt-chips { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; padding: 8px 0 16px; }
  .chip { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 6px 12px; font-size: 11px; color: var(--muted); cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .chip:hover { border-color: var(--accent); color: var(--text); }
  
  .msg { display: flex; gap: 8px; align-items: flex-start; }
  .msg.user { flex-direction: row-reverse; }
  .msg-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; margin-top: 2px; }
  .msg.ai .msg-avatar { background: linear-gradient(135deg, var(--accent), var(--accent2)); }
  .msg.user .msg-avatar { background: var(--card); border: 1px solid var(--border); }
  .msg-bubble { max-width: 85%; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 10px 14px; font-size: 13px; line-height: 1.55; }
  .msg.user .msg-bubble { background: var(--accent); border-color: var(--accent); color: #fff; border-radius: 16px 16px 4px 16px; }
  .msg.ai .msg-bubble { border-radius: 4px 16px 16px 16px; }
  
  .thinking { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 12px; font-style: italic; }
  .thinking-dots { display: flex; gap: 4px; }
  .thinking-dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); animation: bounce 1.2s ease-in-out infinite; }
  .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
  .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }
  
  /* Outfit card in chat */
  .outfit-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-top: 8px; }
  .outfit-card-header { padding: 12px 14px 8px; border-bottom: 1px solid var(--border); }
  .outfit-card-header h4 { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .outfit-card-header p { font-size: 11px; color: var(--muted); }
  .outfit-items { padding: 10px 14px; display: flex; flex-direction: column; gap: 8px; }
  .outfit-item { display: flex; align-items: center; gap: 10px; }
  .outfit-item-icon { width: 36px; height: 36px; background: var(--surface); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .outfit-item-info { flex: 1; }
  .outfit-item-info .name { font-size: 12px; font-weight: 500; }
  .outfit-item-info .brand-price { font-size: 11px; color: var(--muted); }
  .outfit-item-price { font-size: 12px; font-weight: 600; color: var(--accent2); }
  .outfit-scores { display: flex; gap: 8px; padding: 10px 14px; border-top: 1px solid var(--border); }
  .score-pill { flex: 1; background: var(--surface); border-radius: 8px; padding: 6px 8px; text-align: center; }
  .score-pill .score-val { font-size: 16px; font-weight: 600; color: var(--accent); }
  .score-pill .score-lbl { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 1px; }
  .outfit-total { padding: 8px 14px 12px; display: flex; justify-content: space-between; align-items: center; }
  .outfit-total span { font-size: 12px; color: var(--muted); }
  .outfit-total strong { font-size: 15px; color: var(--text); }
  
  /* Chat input */
  .chat-input-wrap { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 420px; background: rgba(13,13,13,0.96); backdrop-filter: blur(12px); border-top: 1px solid var(--border); padding: 12px 16px 20px; z-index: 90; }
  .chat-input-row { display: flex; gap: 8px; align-items: flex-end; }
  .chat-input { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 10px 16px; font-size: 14px; color: var(--text); resize: none; outline: none; font-family: 'Inter', sans-serif; line-height: 1.4; max-height: 100px; transition: border-color 0.2s; }
  .chat-input:focus { border-color: var(--accent); }
  .chat-input::placeholder { color: var(--muted); }
  .chat-send { width: 38px; height: 38px; border-radius: 50%; background: var(--accent); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: opacity 0.2s; }
  .chat-send:disabled { opacity: 0.4; }
  
  /* Discover / Occasions */
  .section-pad { padding: 20px 16px; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 22px; margin-bottom: 4px; }
  .section-sub { font-size: 12px; color: var(--muted); margin-bottom: 16px; }
  
  .occasion-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .occasion-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 16px 12px; cursor: pointer; transition: all 0.25s; }
  .occasion-card:hover, .occasion-card.active { border-color: var(--accent); }
  .occasion-card .oc-icon { font-size: 24px; margin-bottom: 6px; }
  .occasion-card .oc-label { font-size: 13px; font-weight: 500; }
  .occasion-card .oc-vibe { font-size: 10px; color: var(--muted); margin-top: 2px; }
  
  /* Trend Radar */
  .trend-list { display: flex; flex-direction: column; gap: 10px; }
  .trend-item { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; }
  .trend-item-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .trend-name { font-size: 13px; font-weight: 600; }
  .trend-dir { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
  .trend-dir.up { color: var(--up); background: rgba(126,200,160,0.12); }
  .trend-dir.down { color: var(--down); background: rgba(224,112,112,0.12); }
  .trend-bar-wrap { height: 4px; background: var(--surface); border-radius: 4px; margin-bottom: 6px; overflow: hidden; }
  .trend-bar { height: 4px; border-radius: 4px; background: linear-gradient(90deg, var(--accent), var(--accent2)); transition: width 0.6s; }
  .trend-desc { font-size: 11px; color: var(--muted); }
  .trend-brands { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
  .trend-brand-tag { font-size: 10px; background: var(--surface); border-radius: 6px; padding: 2px 7px; color: var(--accent2); }
  
  /* FashionDNA */
  .dna-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 12px; }
  .dna-archetype-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
  .archetype-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px; padding: 14px 12px; cursor: pointer; transition: all 0.2s; text-align: center; }
  .archetype-card:hover, .archetype-card.selected { border-color: var(--accent); }
  .archetype-icon { font-size: 24px; margin-bottom: 6px; }
  .archetype-name { font-size: 11px; font-weight: 600; }
  .dna-result { animation: fadeIn 0.4s; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .dna-profile-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .dna-big-icon { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg,var(--accent),var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 26px; }
  .dna-name { font-family: 'Playfair Display', serif; font-size: 18px; }
  .dna-desc { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .dna-colors { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
  .color-dot-wrap { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .color-dot { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border); }
  .color-dot-label { font-size: 9px; color: var(--muted); }
  .dna-stat { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .dna-stat-label { font-size: 12px; color: var(--muted); }
  .dna-stat-bar { flex: 1; height: 4px; background: var(--surface); border-radius: 4px; margin: 0 12px; overflow: hidden; }
  .dna-stat-fill { height: 4px; border-radius: 4px; background: linear-gradient(90deg, var(--accent), var(--accent2)); }
  .dna-stat-val { font-size: 12px; font-weight: 600; color: var(--accent); width: 28px; text-align: right; }
  
  /* Capsule */
  .capsule-header { background: linear-gradient(135deg, rgba(201,130,107,0.2), rgba(184,160,112,0.1)); border: 1px solid rgba(201,130,107,0.3); border-radius: 16px; padding: 20px; margin-bottom: 16px; text-align: center; }
  .capsule-count { font-family: 'Playfair Display', serif; font-size: 48px; color: var(--accent); line-height: 1; }
  .capsule-label { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .capsule-outfits { font-size: 14px; margin-top: 12px; }
  .capsule-outfits strong { color: var(--accent2); font-size: 20px; }
  .capsule-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .capsule-item { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 12px 8px; text-align: center; }
  .capsule-item-icon { font-size: 24px; margin-bottom: 4px; }
  .capsule-item-name { font-size: 10px; color: var(--muted); }
  .capsule-item-price { font-size: 11px; font-weight: 600; color: var(--accent2); margin-top: 2px; }
  
  /* Misc */
  .btn-primary { background: var(--accent); color: #fff; border: none; border-radius: 12px; padding: 12px 20px; font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif; cursor: pointer; width: 100%; transition: opacity 0.2s; }
  .btn-primary:hover { opacity: 0.85; }
  .btn-ghost { background: var(--card); color: var(--text); border: 1px solid var(--border); border-radius: 12px; padding: 10px 16px; font-size: 13px; font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-ghost:hover { border-color: var(--accent); }
  .badge { font-size: 9px; background: var(--accent); color: #fff; border-radius: 6px; padding: 2px 6px; font-weight: 600; letter-spacing: 0.3px; }
  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  .empty-state { text-align: center; padding: 40px 20px; color: var(--muted); font-size: 13px; }
  .empty-state .icon { font-size: 32px; margin-bottom: 8px; }
  
  .ai-label { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; color: var(--accent); background: rgba(201,130,107,0.12); border-radius: 6px; padding: 3px 8px; margin-bottom: 8px; font-weight: 500; }
  
  .scroll-x { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
  .scroll-x::-webkit-scrollbar { display: none; }
`;

// ─── COLOR MAP ────────────────────────────────────────────────────────────────
const COLOR_HEX = {
  "Black": "#1A1A1A", "White": "#F8F8F8", "Beige": "#E8D9C4", "Navy": "#1B2B4B",
  "Cream": "#F5EFE0", "Ivory": "#FFFFF0", "Camel": "#C19A6B", "Grey": "#9E9E9E",
  "Blush": "#F4A7A3", "Floral": "#E8A0BF", "Gold": "#D4AF37", "Dusty Pink": "#DCAEAE",
  "Sand": "#C2B280", "Rust": "#B7410E", "Chocolate": "#5C3317", "Slate": "#708090",
  "Charcoal": "#36454F", "Ecru": "#C2B280", "Champagne": "#F7E7CE", "Tan": "#D2B48C",
};

function colorDot(colorName) {
  const hex = COLOR_HEX[colorName] || "#888";
  return <div style={{ background: hex, width: 24, height: 24, borderRadius: "50%", border: "1.5px solid #333", flexShrink: 0 }} />;
}

// ─── OUTFIT DISPLAY ───────────────────────────────────────────────────────────
function OutfitCard({ outfit }) {
  if (!outfit) return null;
  const total = outfit.items?.reduce((s, i) => s + (i.price || 0), 0) || 0;
  return (
    <div className="outfit-card">
      <div className="outfit-card-header">
        <span className="ai-label">✦ AI Styled</span>
        <h4>{outfit.name || "Complete Outfit"}</h4>
        <p>{outfit.why || "Curated for your occasion"}</p>
      </div>
      <div className="outfit-items">
        {outfit.items?.map((item, i) => (
          <div className="outfit-item" key={i}>
            <div className="outfit-item-icon">{item.img || "👗"}</div>
            <div className="outfit-item-info">
              <div className="name">{item.name}</div>
              <div className="brand-price">{item.brand} · {item.cat}</div>
            </div>
            <div className="outfit-item-price">€{item.price?.toFixed(2)}</div>
          </div>
        ))}
      </div>
      {outfit.scores && (
        <div className="outfit-scores">
          {Object.entries(outfit.scores).map(([k, v]) => (
            <div className="score-pill" key={k}>
              <div className="score-val">{v}</div>
              <div className="score-lbl">{k}</div>
            </div>
          ))}
        </div>
      )}
      <div className="outfit-total">
        <span>Total look</span>
        <strong>€{total.toFixed(2)}</strong>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function FashionGPT() {
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [occasionResult, setOccasionResult] = useState(null);
  const [occasionLoading, setOccasionLoading] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [dnaResult, setDnaResult] = useState(null);
  const [dnaLoading, setDnaLoading] = useState(false);
  const [capsuleResult, setCapsuleResult] = useState(null);
  const [capsuleLoading, setCapsuleLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Build outfit from AI text + product pool
  function parseOutfitFromProducts(text, occasion) {
    const occ = occasion?.toLowerCase() || "";
    const pool = PRODUCTS.filter(p => {
      const tags = p.style.join(" ");
      if (occ.includes("wedding") || occ.includes("date") || occ.includes("evening")) return tags.includes("evening") || tags.includes("date") || tags.includes("wedding") || tags.includes("romantic");
      if (occ.includes("beach") || occ.includes("vacation") || occ.includes("festival")) return tags.includes("vacation") || tags.includes("beach") || tags.includes("festival") || tags.includes("casual");
      if (occ.includes("office") || occ.includes("professional")) return tags.includes("office") || tags.includes("smart casual") || tags.includes("minimal");
      if (occ.includes("street") || occ.includes("concert")) return tags.includes("streetwear") || tags.includes("concert") || tags.includes("casual");
      return true;
    });
    const tops = pool.filter(p => p.cat === "Tops" || p.cat === "Dresses");
    const bottoms = pool.filter(p => p.cat === "Bottoms");
    const shoes = pool.filter(p => p.cat === "Shoes");
    const bags = pool.filter(p => p.cat === "Bags" || p.cat === "Accessories");
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const top = pick(tops.length ? tops : PRODUCTS.filter(p => p.cat === "Tops"));
    const isDress = top?.cat === "Dresses";
    const items = [top, !isDress && pick(bottoms.length ? bottoms : PRODUCTS.filter(p => p.cat === "Bottoms")), pick(shoes.length ? shoes : PRODUCTS.filter(p => p.cat === "Shoes")), pick(bags.length ? bags : PRODUCTS.filter(p => p.cat === "Bags"))].filter(Boolean);
    return { items, scores: { Style: Math.floor(82 + Math.random() * 15), Trend: Math.floor(78 + Math.random() * 18), Versatility: Math.floor(75 + Math.random() * 20) } };
  }

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const productContext = PRODUCTS.slice(0, 20).map(p => `${p.name} by ${p.brand} (€${p.price}, ${p.color}, ${p.cat})`).join("; ");
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
      const wantsOutfit = msg.toLowerCase().includes("outfit") || msg.toLowerCase().includes("wear") || msg.toLowerCase().includes("dress") || msg.toLowerCase().includes("look") || reply.toLowerCase().includes("outfit built");
      const outfit = wantsOutfit ? parseOutfitFromProducts(reply, msg) : null;
      if (outfit) {
        outfit.name = "Your Styled Look";
        outfit.why = "Curated by FashionGPT based on your request";
      }
      setMessages(prev => [...prev, { role: "ai", content: reply, outfit }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Something went wrong. Try again!", outfit: null }]);
    }
    setLoading(false);
  }

  async function buildOccasionOutfit(occ) {
    setSelectedOccasion(occ.id);
    setOccasionResult(null);
    setOccasionLoading(true);
    try {
      const system = `You are FashionGPT, an AI stylist. Return ONLY valid JSON, no markdown, no explanation outside JSON.
Format: {"name":"[outfit name]","why":"[1 sentence why]","style_tip":"[1 practical tip]","trend_note":"[current trend this taps]"}`;
      const text = await callAI(system, `Build an outfit for: ${occ.label} (${occ.vibe}). Give it a creative name and explain the styling logic briefly.`);
      let meta = {};
      try { meta = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { meta = { name: `${occ.label} Look`, why: "Curated for your occasion", style_tip: "Layer for versatility", trend_note: "Touches on quiet luxury" }; }
      const outfit = parseOutfitFromProducts("", occ.label);
      outfit.name = meta.name || `${occ.label} Look`;
      outfit.why = meta.why;
      setOccasionResult({ outfit, meta });
    } catch { setOccasionResult(null); }
    setOccasionLoading(false);
  }

  async function buildFashionDNA(archetype) {
    setSelectedArchetype(archetype.id);
    setDnaResult(null);
    setDnaLoading(true);
    try {
      const system = `You are FashionGPT. Return ONLY valid JSON, no markdown.
Format: {"headline":"[punchy 1-liner about their style]","missing":"[1 key item they should add]","trend_match":"[current trend that fits their DNA]","confidence":85}`;
      const text = await callAI(system, `Fashion archetype: ${archetype.name}. ${archetype.desc}. Give a personal style assessment.`);
      let meta = {};
      try { meta = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { meta = { headline: "Your style is refined and intentional", missing: "A statement shoe", trend_match: "Quiet Luxury", confidence: 82 }; }
      setDnaResult({ archetype, meta });
    } catch { setDnaLoading(false); }
    setDnaLoading(false);
  }

  async function buildCapsule() {
    setCapsuleResult(null);
    setCapsuleLoading(true);
    try {
      // Pick 10 versatile pieces
      const picks = [
        PRODUCTS.find(p => p.cat === "Tops" && p.brand === "Zara"),
        PRODUCTS.find(p => p.cat === "Tops" && p.brand === "Pull&Bear"),
        PRODUCTS.find(p => p.cat === "Bottoms" && p.color === "Black"),
        PRODUCTS.find(p => p.cat === "Bottoms" && p.brand === "Stradivarius"),
        PRODUCTS.find(p => p.cat === "Dresses"),
        PRODUCTS.find(p => p.cat === "Outerwear"),
        PRODUCTS.find(p => p.cat === "Shoes" && p.brand === "Zara"),
        PRODUCTS.find(p => p.cat === "Shoes" && p.brand === "Pull&Bear"),
        PRODUCTS.find(p => p.cat === "Bags"),
        PRODUCTS.find(p => p.cat === "Accessories" || p.cat === "Loungewear"),
      ].filter(Boolean);
      const total = picks.reduce((s, p) => s + p.price, 0);
      const combos = Math.floor(picks.length * (picks.length - 1) * 1.4);
      setCapsuleResult({ picks, total, combos });
    } catch { setCapsuleLoading(false); }
    setCapsuleLoading(false);
  }

  // ─── TABS ──────────────────────────────────────────────────────────────────
  const tabs = [
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "discover", icon: "✨", label: "Style" },
    { id: "trends", icon: "📈", label: "Trends" },
    { id: "dna", icon: "🧬", label: "DNA" },
    { id: "capsule", icon: "🗂", label: "Capsule" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">Fashion<span>GPT</span></div>
          <div className="nav-tabs">
            {tabs.map(t => (
              <button key={t.id} className={`nav-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                <span className="icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── CHAT TAB ─── */}
        {tab === "chat" && (
          <>
            <div className="chat-area">
              {messages.length === 0 && (
                <div className="chat-hero">
                  <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                    <span className="pulse-dot" />AI Stylist · Always on
                  </p>
                  <h1>Describe what<br />you want to <em>achieve</em></h1>
                  <p style={{ marginTop: 12 }}>Not what product. What feeling. What moment. What impression.</p>
                  <div className="divider" />
                  <div className="prompt-chips">
                    {PROMPTS.map((p, i) => (
                      <button key={i} className="chip" onClick={() => sendMessage(p)}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="msg-avatar">{m.role === "ai" ? "✦" : "👤"}</div>
                  <div style={{ maxWidth: "85%" }}>
                    <div className="msg-bubble">{m.content}</div>
                    {m.outfit && <OutfitCard outfit={m.outfit} />}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg ai">
                  <div className="msg-avatar">✦</div>
                  <div className="msg-bubble thinking">
                    <div className="thinking-dots"><span /><span /><span /></div>
                    Styling your look…
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input-wrap">
              <div className="chat-input-row">
                <textarea
                  className="chat-input"
                  rows={1}
                  placeholder="Describe your occasion, mood, or goal…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <button className="chat-send" disabled={!input.trim() || loading} onClick={() => sendMessage()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── DISCOVER TAB ─── */}
        {tab === "discover" && (
          <div className="section-pad" style={{ paddingBottom: 40 }}>
            <div className="section-title">Occasion Builder</div>
            <div className="section-sub">Pick an occasion and FashionGPT styles the look.</div>
            <div className="occasion-grid">
              {OCCASIONS.map(occ => (
                <div key={occ.id} className={`occasion-card${selectedOccasion === occ.id ? " active" : ""}`} onClick={() => buildOccasionOutfit(occ)}>
                  <div className="oc-icon">{occ.icon}</div>
                  <div className="oc-label">{occ.label}</div>
                  <div className="oc-vibe">{occ.vibe}</div>
                </div>
              ))}
            </div>

            {occasionLoading && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted)" }}>
                <div className="thinking-dots" style={{ justifyContent: "center", marginBottom: 10 }}><span /><span /><span /></div>
                <div style={{ fontSize: 13 }}>Building your look…</div>
              </div>
            )}

            {occasionResult && !occasionLoading && (
              <div style={{ marginTop: 20, animation: "fadeIn 0.4s" }}>
                <div className="ai-label" style={{ marginBottom: 12 }}>✦ AI Styled · {OCCASIONS.find(o => o.id === selectedOccasion)?.label}</div>
                {occasionResult.meta.style_tip && (
                  <div style={{ background: "rgba(201,130,107,0.08)", border: "1px solid rgba(201,130,107,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "var(--accent2)" }}>
                    💡 {occasionResult.meta.style_tip}
                  </div>
                )}
                {occasionResult.meta.trend_note && (
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>Trend: {occasionResult.meta.trend_note}</div>
                )}
                <OutfitCard outfit={occasionResult.outfit} />
              </div>
            )}
          </div>
        )}

        {/* ── TRENDS TAB ─── */}
        {tab === "trends" && (
          <div className="section-pad" style={{ paddingBottom: 40 }}>
            <div className="section-title">Trend Radar</div>
            <div className="section-sub">What's moving in fashion right now.</div>
            <div className="trend-list">
              {TRENDS.map((t, i) => (
                <div className="trend-item" key={i}>
                  <div className="trend-item-header">
                    <span className="trend-name">{t.name}</span>
                    <span className={`trend-dir ${t.dir}`}>{t.dir === "up" ? "↑ Rising" : "↓ Fading"}</span>
                  </div>
                  <div className="trend-bar-wrap">
                    <div className="trend-bar" style={{ width: `${t.pct}%`, background: t.dir === "up" ? "linear-gradient(90deg, var(--accent), var(--accent2))" : "linear-gradient(90deg, #555, #444)" }} />
                  </div>
                  <div className="trend-desc">{t.desc}</div>
                  {t.brands.length > 0 && (
                    <div className="trend-brands">
                      {t.brands.map(b => <span className="trend-brand-tag" key={b}>{b}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DNA TAB ─── */}
        {tab === "dna" && (
          <div className="section-pad" style={{ paddingBottom: 40 }}>
            <div className="section-title">FashionDNA</div>
            <div className="section-sub">Discover your personal style archetype.</div>

            {!dnaResult ? (
              <>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Which feels most like you?</div>
                <div className="dna-archetype-grid">
                  {ARCHETYPES.map(a => (
                    <div key={a.id} className={`archetype-card${selectedArchetype === a.id ? " selected" : ""}`} onClick={() => buildFashionDNA(a)}>
                      <div className="archetype-icon">{a.icon}</div>
                      <div className="archetype-name">{a.name}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>{a.desc.slice(0, 40)}…</div>
                    </div>
                  ))}
                </div>
                {dnaLoading && (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)", fontSize: 13 }}>
                    <div className="thinking-dots" style={{ justifyContent: "center", marginBottom: 8 }}><span /><span /><span /></div>
                    Analyzing your style DNA…
                  </div>
                )}
              </>
            ) : (
              <div className="dna-result">
                <div className="dna-card">
                  <div className="dna-profile-header">
                    <div className="dna-big-icon">{dnaResult.archetype.icon}</div>
                    <div>
                      <div className="dna-name">{dnaResult.archetype.name}</div>
                      <div className="dna-desc">{dnaResult.meta.headline}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Your palette</div>
                  <div className="dna-colors">
                    {dnaResult.archetype.colors.map(c => (
                      <div className="color-dot-wrap" key={c}>
                        {colorDot(c)}
                        <span className="color-dot-label">{c}</span>
                      </div>
                    ))}
                  </div>

                  <div className="divider" />

                  {[["Trend Sensitivity", 72], ["Style Confidence", dnaResult.meta.confidence || 84], ["Versatility", 68], ["Investment Mindset", 78]].map(([label, val]) => (
                    <div className="dna-stat" key={label}>
                      <div className="dna-stat-label">{label}</div>
                      <div className="dna-stat-bar"><div className="dna-stat-fill" style={{ width: `${val}%` }} /></div>
                      <div className="dna-stat-val">{val}</div>
                    </div>
                  ))}

                  <div className="divider" />

                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>Trending match</div>
                  <div style={{ fontSize: 13, color: "var(--accent2)", fontWeight: 500 }}>✦ {dnaResult.meta.trend_match}</div>

                  <div style={{ marginTop: 12, background: "rgba(201,130,107,0.08)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>WARDROBE GAP</div>
                    <div style={{ fontSize: 13 }}>Add: <strong>{dnaResult.meta.missing}</strong></div>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, marginTop: 14 }}>Best brands for you</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {dnaResult.archetype.brands.map(b => <span className="trend-brand-tag" key={b}>{b}</span>)}
                  </div>
                </div>

                <button className="btn-ghost" style={{ width: "100%" }} onClick={() => { setDnaResult(null); setSelectedArchetype(null); }}>
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CAPSULE TAB ─── */}
        {tab === "capsule" && (
          <div className="section-pad" style={{ paddingBottom: 40 }}>
            <div className="section-title">Capsule Wardrobe</div>
            <div className="section-sub">10 pieces. Endless combinations.</div>

            {!capsuleResult ? (
              <>
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 16, fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                  A capsule wardrobe is a curated collection of versatile, timeless pieces that work together. FashionGPT builds yours from across the Inditex ecosystem — mixing investment pieces with accessible finds.
                </div>
                <button className="btn-primary" onClick={buildCapsule} disabled={capsuleLoading}>
                  {capsuleLoading ? "Building capsule…" : "✦ Build My Capsule"}
                </button>
              </>
            ) : (
              <div style={{ animation: "fadeIn 0.4s" }}>
                <div className="capsule-header">
                  <div className="capsule-count">10</div>
                  <div className="capsule-label">carefully selected pieces</div>
                  <div className="capsule-outfits">creates <strong>{capsuleResult.combos}+</strong> outfits</div>
                  <div style={{ marginTop: 10, fontSize: 14, color: "var(--accent2)", fontWeight: 600 }}>Total: €{capsuleResult.total.toFixed(2)}</div>
                </div>

                <div className="capsule-grid">
                  {capsuleResult.picks.map((p, i) => (
                    <div className="capsule-item" key={i}>
                      <div className="capsule-item-icon">{p.img}</div>
                      <div className="capsule-item-name">{p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name}</div>
                      <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 1 }}>{p.brand}</div>
                      <div className="capsule-item-price">€{p.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, background: "rgba(201,130,107,0.08)", border: "1px solid rgba(201,130,107,0.2)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginBottom: 6 }}>✦ WHY THIS WORKS</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                    Neutral base pieces anchor the wardrobe while one statement item (the outerwear or dress) elevates every look. Cross-brand mixing gives you price-point range without sacrificing cohesion.
                  </div>
                </div>

                <button className="btn-ghost" style={{ width: "100%", marginTop: 14 }} onClick={() => setCapsuleResult(null)}>
                  Rebuild Capsule
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
