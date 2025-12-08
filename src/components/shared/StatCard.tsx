import React from 'react';
import { Card } from '../ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  variant?: 'default' | 'gradient';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel,
  variant = 'default',
  className = '',
}) => {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-neutral-400" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return '';
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-neutral-400';
  };

  return (
    <Card
      className={`${variant === 'gradient' ? 'bg-gradient-to-br from-primary-500/10 to-primary-700/10 border-primary-500/30' : ''} ${className}`}
      glow={variant === 'gradient'}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-100 font-['Space_Grotesk']">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-neutral-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-500/20 rounded-xl">
          <span className="text-primary-500">{icon}</span>
        </div>
      </div>
    </Card>
  );
};

interface GameStatCardProps {
  title: string;
  value: string | number;
  maxValue?: number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  className?: string;
}

export const GameStatCard: React.FC<GameStatCardProps> = ({
  title,
  value,
  maxValue,
  icon,
  color = 'blue',
  className = '',
}) => {
  const colors = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30',
    pink: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  };

  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    pink: 'text-pink-400',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} rounded-xl border p-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className={`${iconColors[color]}`}>{icon}</div>
        <div>
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-neutral-100 font-['Space_Grotesk']">
            {value}
            {maxValue && <span className="text-sm text-neutral-500">/{maxValue}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};
