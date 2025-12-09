import React, { useEffect, useState } from 'react';
import { getItemById } from '../../data/spaceShopItems';

export type CelebrationTrigger = 'level-up' | 'achievement' | 'purchase' | 'streak' | 'perfect-score';

interface CelebrationEffectProps {
  isActive: boolean;
  celebrationId: string; // The equipped celebration item ID
  trigger?: CelebrationTrigger;
  message?: string;
  onComplete?: () => void;
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  isActive,
  celebrationId,
  trigger = 'achievement',
  message,
  onComplete,
}) => {
  const [visible, setVisible] = useState(false);
  const celebrationItem = getItemById(celebrationId);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!visible) return null;

  const getTriggerMessage = () => {
    if (message) return message;
    switch (trigger) {
      case 'level-up': return 'Level Up!';
      case 'achievement': return 'Achievement Unlocked!';
      case 'purchase': return 'Item Acquired!';
      case 'streak': return 'Streak Milestone!';
      case 'perfect-score': return 'Perfect Score!';
      default: return 'Congratulations!';
    }
  };

  // Different celebration animations based on the equipped item
  const renderCelebration = () => {
    const celebrationType = celebrationId || 'celebration-stars';

    switch (celebrationType) {
      case 'celebration-rocket-launch':
        return <RocketLaunchAnimation />;
      case 'celebration-supernova-burst':
        return <SupernovaBurstAnimation />;
      case 'celebration-constellation-form':
        return <ConstellationAnimation />;
      case 'celebration-wormhole':
        return <WormholeAnimation />;
      case 'celebration-aurora':
        return <AuroraAnimation />;
      case 'celebration-stars':
      default:
        return <StarBurstAnimation />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40 animate-fade-in" />

      {/* Celebration animation */}
      {renderCelebration()}

      {/* Message */}
      <div className="relative z-10 text-center animate-bounce-in">
        <div className="text-6xl mb-4">{celebrationItem?.icon || '⭐'}</div>
        <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
          {getTriggerMessage()}
        </h2>
        {message && trigger !== 'achievement' && (
          <p className="text-xl text-yellow-300">{message}</p>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float-up {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        @keyframes twinkle-fast {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes rocket-fly {
          0% { transform: translateY(100vh) rotate(-45deg); }
          100% { transform: translateY(-100vh) rotate(-45deg); }
        }
        @keyframes explode {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(2); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes spiral {
          0% { transform: rotate(0deg) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: rotate(720deg) scale(1.5); opacity: 0; }
        }
        @keyframes aurora-wave {
          0% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateX(100%) skewX(-15deg); opacity: 0; }
        }
        @keyframes connect-stars {
          0% { stroke-dashoffset: 100; opacity: 0; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out forwards; }
        .animate-float-up { animation: float-up 2s ease-out forwards; }
        .animate-twinkle-fast { animation: twinkle-fast 0.5s ease-in-out infinite; }
        .animate-rocket-fly { animation: rocket-fly 1.5s ease-in forwards; }
        .animate-explode { animation: explode 1s ease-out forwards; }
        .animate-spiral { animation: spiral 2s ease-out forwards; }
        .animate-aurora { animation: aurora-wave 2s ease-in-out forwards; }
      `}</style>
    </div>
  );
};

// Star Burst Animation (default)
const StarBurstAnimation: React.FC = () => {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random(),
    size: 10 + Math.random() * 20,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute animate-float-up"
          style={{
            left: `${star.left}%`,
            bottom: 0,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            fontSize: `${star.size}px`,
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
};

// Rocket Launch Animation
const RocketLaunchAnimation: React.FC = () => {
  const rockets = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    left: 20 + i * 15,
    delay: i * 0.2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {rockets.map(rocket => (
        <div
          key={rocket.id}
          className="absolute animate-rocket-fly text-4xl"
          style={{
            left: `${rocket.left}%`,
            animationDelay: `${rocket.delay}s`,
          }}
        >
          🚀
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-2xl animate-pulse">
            🔥
          </div>
        </div>
      ))}
    </div>
  );
};

// Supernova Burst Animation
const SupernovaBurstAnimation: React.FC = () => {
  const rings = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
    color: ['#FFD700', '#FF6B6B', '#A855F7', '#3B82F6'][i],
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {rings.map(ring => (
        <div
          key={ring.id}
          className="absolute w-20 h-20 rounded-full animate-explode"
          style={{
            animationDelay: `${ring.delay}s`,
            background: `radial-gradient(circle, ${ring.color} 0%, transparent 70%)`,
          }}
        />
      ))}
      <div className="absolute text-6xl animate-bounce-in" style={{ animationDelay: '0.3s' }}>
        💥
      </div>
    </div>
  );
};

// Constellation Formation Animation
const ConstellationAnimation: React.FC = () => {
  const stars = [
    { x: 30, y: 20 }, { x: 50, y: 30 }, { x: 70, y: 25 },
    { x: 40, y: 50 }, { x: 60, y: 55 }, { x: 35, y: 75 },
    { x: 55, y: 80 }, { x: 75, y: 70 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        {/* Connection lines */}
        {stars.slice(0, -1).map((star, i) => (
          <line
            key={i}
            x1={`${star.x}%`}
            y1={`${star.y}%`}
            x2={`${stars[i + 1].x}%`}
            y2={`${stars[i + 1].y}%`}
            stroke="rgba(255, 215, 0, 0.6)"
            strokeWidth="2"
            strokeDasharray="100"
            style={{
              animation: 'connect-stars 1.5s ease-out forwards',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </svg>
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-twinkle-fast"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: 'translate(-50%, -50%)',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

// Wormhole Animation
const WormholeAnimation: React.FC = () => {
  const spirals = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: i * 0.15,
    size: 50 + i * 40,
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {spirals.map(spiral => (
        <div
          key={spiral.id}
          className="absolute rounded-full animate-spiral"
          style={{
            width: `${spiral.size}px`,
            height: `${spiral.size}px`,
            animationDelay: `${spiral.delay}s`,
            border: `3px solid rgba(168, 85, 247, ${0.8 - spiral.id * 0.1})`,
            boxShadow: `0 0 20px rgba(168, 85, 247, 0.5)`,
          }}
        />
      ))}
      <div className="absolute text-4xl animate-bounce-in" style={{ animationDelay: '0.5s' }}>
        🌀
      </div>
    </div>
  );
};

// Aurora Borealis Animation
const AuroraAnimation: React.FC = () => {
  const waves = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    delay: i * 0.3,
    color: ['#22C55E', '#3B82F6', '#A855F7', '#EC4899', '#06B6D4'][i],
    top: 10 + i * 15,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {waves.map(wave => (
        <div
          key={wave.id}
          className="absolute h-32 w-[200%] animate-aurora"
          style={{
            top: `${wave.top}%`,
            animationDelay: `${wave.delay}s`,
            background: `linear-gradient(90deg, transparent, ${wave.color}40, ${wave.color}60, ${wave.color}40, transparent)`,
            filter: 'blur(20px)',
          }}
        />
      ))}
    </div>
  );
};

// Hook to manage celebration state
export const useCelebration = () => {
  const [celebration, setCelebration] = useState<{
    isActive: boolean;
    trigger: CelebrationTrigger;
    message?: string;
  }>({
    isActive: false,
    trigger: 'achievement',
  });

  const triggerCelebration = (trigger: CelebrationTrigger, message?: string) => {
    setCelebration({ isActive: true, trigger, message });
  };

  const clearCelebration = () => {
    setCelebration(prev => ({ ...prev, isActive: false }));
  };

  return { celebration, triggerCelebration, clearCelebration };
};
