import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  showBadge = false,
  badgeContent,
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const badgeSizes = {
    sm: 'w-3 h-3 -right-0.5 -bottom-0.5',
    md: 'w-4 h-4 -right-0.5 -bottom-0.5',
    lg: 'w-5 h-5 -right-1 -bottom-1',
    xl: 'w-6 h-6 -right-1 -bottom-1',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover border-2 border-neutral-800`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-semibold text-white border-2 border-neutral-800`}
        >
          {initials}
        </div>
      )}
      {showBadge && (
        <span
          className={`absolute ${badgeSizes[size]} bg-green-500 rounded-full border-2 border-neutral-900 flex items-center justify-center`}
        >
          {badgeContent}
        </span>
      )}
    </div>
  );
};

// Gamified Avatar Component for Students
interface GameAvatarProps {
  character: string;
  outfit: string;
  accessory: string;
  background: string;
  badge: string;
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GameAvatar: React.FC<GameAvatarProps> = ({
  background,
  badge,
  level,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const backgrounds: Record<string, string> = {
    nebula: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
    galaxy: 'bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900',
    planets: 'bg-gradient-to-br from-blue-900 via-teal-900 to-cyan-900',
    'black-hole': 'bg-gradient-to-br from-gray-900 via-purple-900 to-black',
    supernova: 'bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900',
  };

  const badges: Record<string, string> = {
    'rising-star': '⭐',
    'star-explorer': '🌟',
    'quantum-master': '⚛️',
    'galaxy-champion': '🏆',
    'universe-legend': '👑',
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizes[size]} rounded-2xl ${backgrounds[background] || backgrounds.nebula} flex items-center justify-center border-2 border-primary-500/50 shadow-[0_0_24px_0_rgba(14,165,233,0.3)]`}
      >
        <span className="text-4xl">🧑‍🚀</span>
      </div>
      {/* Level Badge */}
      <div className="absolute -bottom-2 -right-2 bg-primary-500 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-white border-2 border-neutral-900">
        {level}
      </div>
      {/* Achievement Badge */}
      {badge && (
        <div className="absolute -top-2 -right-2 text-xl">
          {badges[badge] || '⭐'}
        </div>
      )}
    </div>
  );
};
