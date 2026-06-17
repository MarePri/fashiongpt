import React from 'react';

function SkeletonBlock({ width = '100%', height = 16, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

/**
 * Loading skeleton for chat messages.
 */
export function ChatSkeleton() {
  return (
    <div className="msg ai">
      <div className="msg-avatar">✦</div>
      <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonBlock width="60%" height={14} />
        <SkeletonBlock width="90%" height={14} />
        <SkeletonBlock width="40%" height={14} />
      </div>
    </div>
  );
}

/**
 * Loading skeleton for outfit cards.
 */
export function OutfitSkeleton() {
  return (
    <div className="outfit-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SkeletonBlock width="40%" height={18} />
      <SkeletonBlock width="70%" height={14} />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SkeletonBlock width={40} height={40} style={{ borderRadius: 8 }} />
          <div style={{ flex: 1 }}>
            <SkeletonBlock width="50%" height={12} />
            <SkeletonBlock width="30%" height={10} style={{ marginTop: 4 }} />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} width={48} height={24} style={{ borderRadius: 20 }} />
        ))}
      </div>
      <SkeletonBlock width="30%" height={16} />
    </div>
  );
}

/**
 * Loading skeleton for DNA result card.
 */
export function DnaSkeleton() {
  return (
    <div className="dna-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <SkeletonBlock width={48} height={48} style={{ borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <SkeletonBlock width="40%" height={18} />
          <SkeletonBlock width="60%" height={12} style={{ marginTop: 4 }} />
        </div>
      </div>
      <SkeletonBlock width="30%" height={12} />
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} width={32} height={32} style={{ borderRadius: '50%' }} />
        ))}
      </div>
    </div>
  );
}
