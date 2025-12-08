import { supabase, isDemoMode } from '../lib/supabase';
import type { FeatureSetting, Json } from '../types/database';

export interface FeatureConfig {
  gamification: boolean;
  parentAccess: boolean;
  messaging: boolean;
  resourceLibrary: boolean;
  progressTracking: boolean;
  achievements: boolean;
  shop: boolean;
  calendar: boolean;
  assessments: boolean;
  analytics: boolean;
}

export interface StudentFeatureOverride {
  studentId: string;
  featureName: string;
  enabled: boolean;
}

// Default feature configuration
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

// Demo feature settings
let demoFeatureSettings: Record<string, boolean> = { ...defaultFeatures };
let demoStudentOverrides: StudentFeatureOverride[] = [];

export const featureService = {
  // Get all feature settings for a tutor
  async getFeatureSettings(tutorId: string): Promise<FeatureConfig> {
    if (isDemoMode) {
      return demoFeatureSettings as FeatureConfig;
    }

    const { data, error } = await supabase
      .from('feature_settings')
      .select('*')
      .eq('tutor_id', tutorId);

    if (error) {
      console.error('Error fetching feature settings:', error);
      return defaultFeatures;
    }

    // Convert array to config object
    const config: FeatureConfig = { ...defaultFeatures };
    data.forEach((setting: FeatureSetting) => {
      if (setting.feature_name in config) {
        (config as Record<string, boolean>)[setting.feature_name] = setting.enabled;
      }
    });

    return config;
  },

  // Update a single feature setting
  async updateFeatureSetting(tutorId: string, featureName: string, enabled: boolean): Promise<boolean> {
    if (isDemoMode) {
      demoFeatureSettings[featureName] = enabled;
      return true;
    }

    const { error } = await supabase
      .from('feature_settings')
      .upsert({
        tutor_id: tutorId,
        feature_name: featureName,
        enabled,
      }, {
        onConflict: 'tutor_id,feature_name',
      });

    return !error;
  },

  // Update multiple feature settings
  async updateFeatureSettings(tutorId: string, settings: Partial<FeatureConfig>): Promise<boolean> {
    if (isDemoMode) {
      demoFeatureSettings = { ...demoFeatureSettings, ...settings };
      return true;
    }

    const upserts = Object.entries(settings).map(([feature_name, enabled]) => ({
      tutor_id: tutorId,
      feature_name,
      enabled,
    }));

    const { error } = await supabase
      .from('feature_settings')
      .upsert(upserts, {
        onConflict: 'tutor_id,feature_name',
      });

    return !error;
  },

  // Get feature overrides for a specific student
  async getStudentOverrides(studentId: string): Promise<Record<string, boolean>> {
    if (isDemoMode) {
      const overrides: Record<string, boolean> = {};
      demoStudentOverrides
        .filter(o => o.studentId === studentId)
        .forEach(o => {
          overrides[o.featureName] = o.enabled;
        });
      return overrides;
    }

    const { data, error } = await supabase
      .from('student_feature_overrides')
      .select('*')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching student overrides:', error);
      return {};
    }

    const overrides: Record<string, boolean> = {};
    data.forEach((override) => {
      overrides[override.feature_name] = override.enabled;
    });

    return overrides;
  },

  // Set a feature override for a student
  async setStudentOverride(studentId: string, featureName: string, enabled: boolean): Promise<boolean> {
    if (isDemoMode) {
      const existingIndex = demoStudentOverrides.findIndex(
        o => o.studentId === studentId && o.featureName === featureName
      );

      if (existingIndex >= 0) {
        demoStudentOverrides[existingIndex].enabled = enabled;
      } else {
        demoStudentOverrides.push({ studentId, featureName, enabled });
      }
      return true;
    }

    const { error } = await supabase
      .from('student_feature_overrides')
      .upsert({
        student_id: studentId,
        feature_name: featureName,
        enabled,
      }, {
        onConflict: 'student_id,feature_name',
      });

    return !error;
  },

  // Remove a feature override for a student (use tutor's default)
  async removeStudentOverride(studentId: string, featureName: string): Promise<boolean> {
    if (isDemoMode) {
      demoStudentOverrides = demoStudentOverrides.filter(
        o => !(o.studentId === studentId && o.featureName === featureName)
      );
      return true;
    }

    const { error } = await supabase
      .from('student_feature_overrides')
      .delete()
      .eq('student_id', studentId)
      .eq('feature_name', featureName);

    return !error;
  },

  // Check if a feature is enabled for a specific student
  async isFeatureEnabledForStudent(
    tutorId: string,
    studentId: string,
    featureName: string
  ): Promise<boolean> {
    // First get tutor's setting
    const tutorSettings = await this.getFeatureSettings(tutorId);
    const tutorEnabled = (tutorSettings as Record<string, boolean>)[featureName] ?? true;

    // Then check for student override
    const overrides = await this.getStudentOverrides(studentId);

    if (featureName in overrides) {
      return overrides[featureName];
    }

    return tutorEnabled;
  },

  // Get effective features for a student (combining tutor settings and overrides)
  async getEffectiveFeaturesForStudent(
    tutorId: string,
    studentId: string
  ): Promise<FeatureConfig> {
    const tutorSettings = await this.getFeatureSettings(tutorId);
    const studentOverrides = await this.getStudentOverrides(studentId);

    return {
      ...tutorSettings,
      ...studentOverrides,
    } as FeatureConfig;
  },

  // Initialize default feature settings for a new tutor
  async initializeFeatureSettings(tutorId: string): Promise<boolean> {
    if (isDemoMode) {
      demoFeatureSettings = { ...defaultFeatures };
      return true;
    }

    const inserts = Object.entries(defaultFeatures).map(([feature_name, enabled]) => ({
      tutor_id: tutorId,
      feature_name,
      enabled,
      settings: {} as Json,
    }));

    const { error } = await supabase
      .from('feature_settings')
      .insert(inserts);

    return !error;
  },

  // Get all student overrides for a tutor (for admin view)
  async getAllStudentOverridesForTutor(tutorId: string): Promise<StudentFeatureOverride[]> {
    if (isDemoMode) {
      return demoStudentOverrides;
    }

    // This would need a join with students table to filter by tutor
    const { data, error } = await supabase
      .from('student_feature_overrides')
      .select(`
        *,
        student:students!inner(tutor_id)
      `)
      .eq('student.tutor_id', tutorId);

    if (error) {
      console.error('Error fetching student overrides:', error);
      return [];
    }

    return data.map((d) => ({
      studentId: d.student_id,
      featureName: d.feature_name,
      enabled: d.enabled,
    }));
  },
};
