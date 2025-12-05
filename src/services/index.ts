// Export all services
export { studentService } from './studentService';
export { lessonService } from './lessonService';
export { messageService } from './messageService';
export { resourceService } from './resourceService';
export { assessmentService } from './assessmentService';
export { featureService } from './featureService';
export { shopService } from './shopService';

// Re-export types
export type { StudentWithProfile } from './studentService';
export type { MessageWithSender, Conversation } from './messageService';
export type { FeatureConfig, StudentFeatureOverride } from './featureService';
