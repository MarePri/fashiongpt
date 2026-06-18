import { useState, lazy, Suspense } from "react";

// ─── Data (small, kept synchronous) ──────────────────────────────────────────
import { OCCASIONS } from "./data/occasions.js";
import { TRENDS } from "./data/trends.js";
import { ARCHETYPES } from "./data/archetypes.js";
import { PROMPTS } from "./data/prompts.js";

// ─── Hooks (always needed, synchronous) ─────────────────────────────────────
import useMemory from "./hooks/useMemory.js";
import useChat from "./hooks/useChat.js";
import useFashionDNA from "./hooks/useFashionDNA.js";
import useCapsuleWardrobe from "./hooks/useCapsuleWardrobe.js";

// ─── Components (static — always visible) ───────────────────────────────────
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { SavedOutfitsProvider } from "./hooks/SavedOutfitsContext.jsx";

// ─── Components (lazy — code-split by tab) ──────────────────────────────────
const OutfitGenerator = lazy(() => import("./components/OutfitGenerator.jsx"));
const SavedLooks = lazy(() => import("./components/SavedLooks.jsx"));
const Discovery = lazy(() => import("./components/Discovery.jsx"));
const ChatPanel = lazy(() => import("./components/ChatPanel.jsx"));
const FashionDNA = lazy(() => import("./components/FashionDNA.jsx"));
const TrendsRadar = lazy(() => import("./components/TrendsRadar.jsx"));
const CapsuleWardrobe = lazy(() => import("./components/CapsuleWardrobe.jsx"));

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "outfit", icon: "✨", label: "Outfit" },
  { id: "looks", icon: "❤️", label: "Saved" },
  { id: "discover", icon: "🌍", label: "Discover" },
  { id: "dna", icon: "🧬", label: "DNA" },
  { id: "trends", icon: "📈", label: "Trends" },
  { id: "chat", icon: "💬", label: "Chat" },
  { id: "capsule", icon: "🗂", label: "Capsule" },
];

// ─── Loading Skeleton (shown while lazy chunks load) ──────────────────────────
function TabFallback() {
  return (
    <div className="section-pad">
      <div className="section-title" style={{ opacity: 0.3 }}>Loading…</div>
      <div className="og-skeleton">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-block" />
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function FashionGPT() {
  const memory = useMemory();
  const [tab, setTab] = useState(() => memory.data.lastTab || "outfit");
  const [tryLookNonce, setTryLookNonce] = useState(0);

  // Persist tab changes to memory
  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    memory.save({ lastTab: nextTab });
  };

  const chat = useChat();
  const dna = useFashionDNA();
  const capsule = useCapsuleWardrobe();

  return (
    <div className="app">
      <div className="navbar">
        <Header />
        <Sidebar tabs={TABS} activeTab={tab} onTabChange={handleTabChange} />
      </div>

      <Suspense fallback={<TabFallback />}>
        <SavedOutfitsProvider>
          {tab === "outfit" && <OutfitGenerator key={`og-${tryLookNonce}`} memory={memory} />}
          {tab === "looks" && <SavedLooks />}
          {tab === "discover" && <Discovery onTryLook={(archId) => { memory.save({ lastTab: 'outfit', lastInputs: { ...(memory.data.lastInputs || {}), archetype: archId } }); setTryLookNonce(c => c + 1); handleTabChange('outfit'); }} />}
        </SavedOutfitsProvider>

        {tab === "chat" && (
          <ChatPanel
            messages={chat.messages}
            input={chat.input}
            loading={chat.loading}
            setInput={chat.setInput}
            sendMessage={chat.sendMessage}
            prompts={PROMPTS}
            chatEndRef={chat.chatEndRef}
          />
        )}

        {tab === "trends" && <TrendsRadar trends={TRENDS} />}

        {tab === "dna" && (
          <FashionDNA
            archetypes={ARCHETYPES}
            selectedArchetype={dna.selectedArchetype}
            dnaResult={dna.dnaResult}
            dnaLoading={dna.dnaLoading}
            buildFashionDNA={dna.buildFashionDNA}
            onReset={dna.reset}
          />
        )}

        {tab === "capsule" && (
          <CapsuleWardrobe
            capsuleResult={capsule.capsuleResult}
            capsuleLoading={capsule.capsuleLoading}
            buildCapsule={capsule.buildCapsule}
            onReset={capsule.reset}
          />
        )}
      </Suspense>
    </div>
  );
}
