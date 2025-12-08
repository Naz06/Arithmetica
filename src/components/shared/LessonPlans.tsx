import React, { useState } from 'react';
import { ScheduleEvent, Subject } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import {
  BookOpen,
  Calendar,
  Clock,
  Target,
  CheckCircle,
  ChevronRight,
  FileText,
  Star,
  AlertCircle,
  Sparkles,
  History,
  Rocket,
} from 'lucide-react';

interface LessonPlansProps {
  schedule: ScheduleEvent[];
  showHistory?: boolean;
}

export const LessonPlans: React.FC<LessonPlansProps> = ({ schedule, showHistory = true }) => {
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const today = new Date().toISOString().split('T')[0];

  // Filter upcoming sessions (scheduled, with dates >= today)
  const upcomingSessions = schedule
    .filter(e => e.status === 'scheduled' && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  // Filter completed sessions (with session notes)
  const completedSessions = schedule
    .filter(e => e.status === 'completed' && e.sessionNotes)
    .sort((a, b) => b.date.localeCompare(a.date)); // Most recent first

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getSubjectColor = (subject: Subject) => {
    switch (subject) {
      case 'mathematics': return 'bg-blue-500';
      case 'physics': return 'bg-purple-500';
      case 'economics': return 'bg-green-500';
      default: return 'bg-neutral-500';
    }
  };

  const getPerformanceBadge = (performance?: 'excellent' | 'good' | 'needs-improvement') => {
    switch (performance) {
      case 'excellent':
        return <Badge variant="success" size="sm">Excellent</Badge>;
      case 'good':
        return <Badge variant="info" size="sm">Good Progress</Badge>;
      case 'needs-improvement':
        return <Badge variant="warning" size="sm">Keep Practicing</Badge>;
      default:
        return null;
    }
  };

  const renderUpcomingSession = (event: ScheduleEvent) => (
    <div
      key={event.id}
      onClick={() => setSelectedEvent(event)}
      className="p-4 bg-neutral-800/50 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer border border-neutral-700/50 hover:border-primary-500/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${getSubjectColor(event.subject)}`} />
            <span className="text-sm font-medium text-neutral-100 capitalize">{event.subject}</span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-primary-400">{formatDate(event.date)}</span>
          </div>
          <p className="text-sm text-neutral-300">{event.title}</p>
          {event.lessonPlan && (
            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
              <Target className="w-3 h-3" />
              <span>{event.lessonPlan.objectives.length} objectives</span>
              {event.lessonPlan.homework && (
                <>
                  <span>•</span>
                  <FileText className="w-3 h-3" />
                  <span>Pre-work required</span>
                </>
              )}
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-500 flex-shrink-0" />
      </div>
    </div>
  );

  const renderCompletedSession = (event: ScheduleEvent) => (
    <div
      key={event.id}
      onClick={() => setSelectedEvent(event)}
      className="p-4 bg-neutral-800/30 rounded-xl hover:bg-neutral-800/50 transition-colors cursor-pointer border border-neutral-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${getSubjectColor(event.subject)}`} />
            <span className="text-sm font-medium text-neutral-100 capitalize">{event.subject}</span>
            <span className="text-xs text-neutral-500">•</span>
            <span className="text-xs text-neutral-400">{formatDate(event.date)}</span>
            {event.sessionNotes?.studentPerformance && getPerformanceBadge(event.sessionNotes.studentPerformance)}
          </div>
          {event.sessionNotes && (
            <p className="text-sm text-neutral-400 line-clamp-2">{event.sessionNotes.summary}</p>
          )}
          {event.sessionNotes?.topicsCovered && (
            <div className="mt-2 flex flex-wrap gap-1">
              {event.sessionNotes.topicsCovered.map((topic, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-neutral-700/50 rounded text-neutral-400">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-600 flex-shrink-0" />
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary-500" />
                Learning Journey
              </CardTitle>
              <CardDescription>Your lesson plans and session history</CardDescription>
            </div>
          </div>

          {showHistory && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  activeTab === 'upcoming'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Upcoming ({upcomingSessions.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  activeTab === 'history'
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <History className="w-4 h-4" />
                History ({completedSessions.length})
              </button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {activeTab === 'upcoming' ? (
            upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500">No upcoming sessions scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 5).map(renderUpcomingSession)}
              </div>
            )
          ) : (
            completedSessions.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500">No session history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedSessions.slice(0, 5).map(renderCompletedSession)}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Session Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.status === 'completed' ? 'Session Review' : 'Lesson Plan'}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedEvent.subject === 'mathematics' ? 'bg-blue-500/20' :
                selectedEvent.subject === 'physics' ? 'bg-purple-500/20' : 'bg-green-500/20'
              }`}>
                <BookOpen className={`w-6 h-6 ${
                  selectedEvent.subject === 'mathematics' ? 'text-blue-400' :
                  selectedEvent.subject === 'physics' ? 'text-purple-400' : 'text-green-400'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-100">{selectedEvent.title}</h3>
                <div className="flex items-center gap-3 text-sm text-neutral-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedEvent.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </span>
                </div>
              </div>
              <Badge variant={selectedEvent.status === 'completed' ? 'success' : 'info'}>
                {selectedEvent.status}
              </Badge>
            </div>

            {/* Lesson Plan (for upcoming sessions) */}
            {selectedEvent.lessonPlan && selectedEvent.status === 'scheduled' && (
              <>
                {/* Objectives */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    What We'll Cover
                  </h4>
                  <div className="space-y-2">
                    {selectedEvent.lessonPlan.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                        <Sparkles className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-100 text-sm">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topics */}
                {selectedEvent.lessonPlan.topics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.lessonPlan.topics.map((topic, i) => (
                        <Badge key={i} variant="default" size="md">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {selectedEvent.lessonPlan.resources && selectedEvent.lessonPlan.resources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Resources to Use
                    </h4>
                    <div className="space-y-2">
                      {selectedEvent.lessonPlan.resources.map((res, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-neutral-800/50 rounded-lg">
                          <FileText className="w-4 h-4 text-neutral-500" />
                          <span className="text-sm text-neutral-300">{res}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pre-session Homework */}
                {selectedEvent.lessonPlan.homework && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Before This Session
                    </h4>
                    <p className="text-neutral-100 text-sm">{selectedEvent.lessonPlan.homework}</p>
                  </div>
                )}
              </>
            )}

            {/* Session Notes (for completed sessions) */}
            {selectedEvent.sessionNotes && selectedEvent.status === 'completed' && (
              <>
                {/* Performance */}
                {selectedEvent.sessionNotes.studentPerformance && (
                  <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl">
                    <span className="text-neutral-400">Session Performance</span>
                    {getPerformanceBadge(selectedEvent.sessionNotes.studentPerformance)}
                  </div>
                )}

                {/* Summary */}
                <div>
                  <h4 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    What Was Covered
                  </h4>
                  <p className="text-neutral-100 text-sm leading-relaxed p-4 bg-neutral-800/30 rounded-xl">
                    {selectedEvent.sessionNotes.summary}
                  </p>
                </div>

                {/* Topics Covered */}
                {selectedEvent.sessionNotes.topicsCovered.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Topics Completed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.sessionNotes.topicsCovered.map((topic, i) => (
                        <Badge key={i} variant="success" size="md">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {selectedEvent.sessionNotes.nextSteps && (
                  <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                    <h4 className="text-sm font-medium text-primary-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Next Steps
                    </h4>
                    <p className="text-neutral-100 text-sm">{selectedEvent.sessionNotes.nextSteps}</p>
                  </div>
                )}

                {/* Homework Assigned */}
                {selectedEvent.sessionNotes.homeworkAssigned && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Homework Assigned
                    </h4>
                    <p className="text-neutral-100 text-sm">{selectedEvent.sessionNotes.homeworkAssigned}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};
