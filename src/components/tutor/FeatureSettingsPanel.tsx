import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { useFeatures } from '../../hooks/useFeatures';
import type { FeatureConfig } from '../../services/featureService';
import {
  Gamepad2,
  Users,
  MessageSquare,
  FolderOpen,
  TrendingUp,
  Trophy,
  ShoppingBag,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Settings,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';

interface FeatureInfo {
  key: keyof FeatureConfig;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'core' | 'gamification' | 'communication';
}

const featureList: FeatureInfo[] = [
  {
    key: 'progressTracking',
    name: 'Progress Tracking',
    description: 'Track student learning progress over time',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'core',
  },
  {
    key: 'calendar',
    name: 'Calendar & Scheduling',
    description: 'Manage lesson schedules and events',
    icon: <Calendar className="w-5 h-5" />,
    category: 'core',
  },
  {
    key: 'resourceLibrary',
    name: 'Resource Library',
    description: 'Share worksheets, videos, and documents',
    icon: <FolderOpen className="w-5 h-5" />,
    category: 'core',
  },
  {
    key: 'assessments',
    name: 'Assessments',
    description: 'Record and track assessment scores',
    icon: <ClipboardCheck className="w-5 h-5" />,
    category: 'core',
  },
  {
    key: 'analytics',
    name: 'Analytics Dashboard',
    description: 'View detailed student analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'core',
  },
  {
    key: 'messaging',
    name: 'Messaging',
    description: 'In-app messaging with students and parents',
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'communication',
  },
  {
    key: 'parentAccess',
    name: 'Parent Dashboard',
    description: 'Allow parents to view their child\'s progress',
    icon: <Users className="w-5 h-5" />,
    category: 'communication',
  },
  {
    key: 'gamification',
    name: 'Gamification System',
    description: 'Points, streaks, and progress tracking',
    icon: <Gamepad2 className="w-5 h-5" />,
    category: 'gamification',
  },
  {
    key: 'achievements',
    name: 'Achievements',
    description: 'Award badges for accomplishments',
    icon: <Trophy className="w-5 h-5" />,
    category: 'gamification',
  },
  {
    key: 'shop',
    name: 'Avatar Shop',
    description: 'Let students spend points on avatar items',
    icon: <ShoppingBag className="w-5 h-5" />,
    category: 'gamification',
  },
];

interface FeatureSettingsPanelProps {
  onClose?: () => void;
}

export const FeatureSettingsPanel: React.FC<FeatureSettingsPanelProps> = ({ onClose }) => {
  const { features, loading, updateFeature } = useFeatures();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (featureKey: keyof FeatureConfig) => {
    setSaving(featureKey);
    setError(null);
    setSaved(null);

    const success = await updateFeature(featureKey, !features[featureKey]);

    if (success) {
      setSaved(featureKey);
      setTimeout(() => setSaved(null), 2000);
    } else {
      setError(`Failed to update ${featureKey}`);
    }

    setSaving(null);
  };

  const renderFeatureGroup = (category: 'core' | 'gamification' | 'communication', title: string) => {
    const categoryFeatures = featureList.filter(f => f.category === category);

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">
          {title}
        </h3>
        <div className="space-y-3">
          {categoryFeatures.map((feature) => (
            <div
              key={feature.key}
              className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  features[feature.key]
                    ? 'bg-primary-500/20 text-primary-500'
                    : 'bg-neutral-700 text-neutral-400'
                }`}>
                  {feature.icon}
                </div>
                <div>
                  <p className="font-medium text-neutral-100">{feature.name}</p>
                  <p className="text-sm text-neutral-400">{feature.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {saving === feature.key && (
                  <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                )}
                {saved === feature.key && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                <Switch
                  checked={features[feature.key]}
                  onCheckedChange={() => handleToggle(feature.key)}
                  disabled={saving !== null}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <Settings className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-100">Feature Settings</h2>
            <p className="text-sm text-neutral-400">
              Enable or disable features for your tutoring platform
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-8">
          {renderFeatureGroup('core', 'Core Features')}
          {renderFeatureGroup('communication', 'Communication')}
          {renderFeatureGroup('gamification', 'Gamification & Rewards')}
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-sm text-blue-400">
          <strong>Tip:</strong> You can also set feature overrides for individual students
          from their profile settings.
        </p>
      </div>
    </div>
  );
};
