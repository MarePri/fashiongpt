import { useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────
import { OCCASIONS } from "./data/occasions.js";
import { TRENDS } from "./data/trends.js";
import { ARCHETYPES } from "./data/archetypes.js";
import { PROMPTS } from "./data/prompts.js";

// ─── Hooks ────────────────────────────────────────────────────────────────────
import useChat from "./hooks/useChat.js";
import useOccasionBuilder from "./hooks/useOccasionBuilder.js";
import useFashionDNA from "./hooks/useFashionDNA.js";
import useCapsuleWardrobe from "./hooks/useCapsuleWardrobe.js";

// ─── Components ───────────────────────────────────────────────────────────────
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import FashionDNA from "./components/FashionDNA.jsx";
import TrendsRadar from "./components/TrendsRadar.jsx";
import CapsuleWardrobe from "./components/CapsuleWardrobe.jsx";

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "chat", icon: "💬", label: "Chat" },
  { id: "discover", icon: "✨", label: "Style" },
  { id: "trends", icon: "📈", label: "Trends" },
  { id: "dna", icon: "🧬", label: "DNA" },
  { id: "capsule", icon: "🗂", label: "Capsule" },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function FashionGPT() {
  const [tab, setTab] = useState("chat");

  const chat = useChat();
  const occasion = useOccasionBuilder();
  const dna = useFashionDNA();
  const capsule = useCapsuleWardrobe();

  return (
    <div className="app">
      <div className="navbar">
        <Header />
        <Sidebar tabs={TABS} activeTab={tab} onTabChange={setTab} />
      </div>

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

      {tab === "discover" && (
        <Dashboard
          occasions={OCCASIONS}
          selectedOccasion={occasion.selectedOccasion}
          occasionResult={occasion.occasionResult}
          occasionLoading={occasion.occasionLoading}
          buildOccasionOutfit={occasion.buildOccasionOutfit}
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
    </div>
  );
}
