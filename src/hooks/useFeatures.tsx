import { useState, useEffect, useCallback } from 'react';
import { featureService, type FeatureConfig } from '../services/featureService';
import { useAuth } from '../context/AuthContext';

// Default features (all enabled)
const defaultFeatures: FeatureConfig = {
  gamification: true,
  parentAccess: true,
  messaging: true,
  resourceLibrary: true,
  progressTracking: true,
  achievements: true,
  shop: true,
  calendar: true,
  assessments: true,
  analytics: true,
};

export function useFeatures(tutorId?: string, studentId?: string) {
  const { user } = useAuth();
  const [features, setFeatures] = useState<FeatureConfig>(defaultFeatures);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the tutor ID to use
  const effectiveTutorId = tutorId || (user?.role === 'tutor' ? user.id : undefined);

  // Load features
  const loadFeatures = useCallback(async () => {
    if (!effectiveTutorId) {
      setFeatures(defaultFeatures);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (studentId) {
        // Get effective features for a specific student
        const studentFeatures = await featureService.getEffectiveFeaturesForStudent(
          effectiveTutorId,
          studentId
        );
        setFeatures(studentFeatures);
      } else {
        // Get tutor's feature settings
        const tutorFeatures = await featureService.getFeatureSettings(effectiveTutorId);
        setFeatures(tutorFeatures);
      }
    } catch (err) {
      console.error('Error loading features:', err);
      setError('Failed to load feature settings');
      setFeatures(defaultFeatures);
    } finally {
      setLoading(false);
    }
  }, [effectiveTutorId, studentId]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  // Check if a specific feature is enabled
  const isEnabled = useCallback(
    (featureName: keyof FeatureConfig): boolean => {
      return features[featureName] ?? true;
    },
    [features]
  );

  // Update a feature setting (tutor only)
  const updateFeature = useCallback(
    async (featureName: keyof FeatureConfig, enabled: boolean): Promise<boolean> => {
      if (!effectiveTutorId || user?.role !== 'tutor') {
        return false;
      }

      const success = await featureService.updateFeatureSetting(
        effectiveTutorId,
        featureName,
        enabled
      );

      if (success) {
        setFeatures(prev => ({ ...prev, [featureName]: enabled }));
      }

      return success;
    },
    [effectiveTutorId, user?.role]
  );

  // Update multiple features at once
  const updateFeatures = useCallback(
    async (updates: Partial<FeatureConfig>): Promise<boolean> => {
      if (!effectiveTutorId || user?.role !== 'tutor') {
        return false;
      }

      const success = await featureService.updateFeatureSettings(effectiveTutorId, updates);

      if (success) {
        setFeatures(prev => ({ ...prev, ...updates }));
      }

      return success;
    },
    [effectiveTutorId, user?.role]
  );

  // Set a student-specific override
  const setStudentOverride = useCallback(
    async (targetStudentId: string, featureName: keyof FeatureConfig, enabled: boolean): Promise<boolean> => {
      if (user?.role !== 'tutor') {
        return false;
      }

      return await featureService.setStudentOverride(targetStudentId, featureName, enabled);
    },
    [user?.role]
  );

  // Remove a student-specific override
  const removeStudentOverride = useCallback(
    async (targetStudentId: string, featureName: keyof FeatureConfig): Promise<boolean> => {
      if (user?.role !== 'tutor') {
        return false;
      }

      return await featureService.removeStudentOverride(targetStudentId, featureName);
    },
    [user?.role]
  );

  // Get student overrides
  const getStudentOverrides = useCallback(
    async (targetStudentId: string): Promise<Record<string, boolean>> => {
      return await featureService.getStudentOverrides(targetStudentId);
    },
    []
  );

  return {
    features,
    loading,
    error,
    isEnabled,
    updateFeature,
    updateFeatures,
    setStudentOverride,
    removeStudentOverride,
    getStudentOverrides,
    refresh: loadFeatures,
  };
}

// Feature-gated component wrapper
interface FeatureGateProps {
  feature: keyof FeatureConfig;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  tutorId?: string;
  studentId?: string;
}

export function FeatureGate({
  feature,
  children,
  fallback = null,
  tutorId,
  studentId,
}: FeatureGateProps) {
  const { isEnabled, loading } = useFeatures(tutorId, studentId);

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!isEnabled(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
