import React, { useState } from 'react';
import { ScheduleEvent, Subject } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

interface CalendarProps {
  events: ScheduleEvent[];
  onEventClick?: (event: ScheduleEvent) => void;
  editable?: boolean;
  onAddEvent?: (date: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  events,
  onEventClick,
  editable = false,
  onAddEvent,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getSubjectColor = (subject: Subject): string => {
    switch (subject) {
      case 'mathematics':
        return 'bg-blue-500';
      case 'physics':
        return 'bg-purple-500';
      case 'economics':
        return 'bg-green-500';
      default:
        return 'bg-neutral-500';
    }
  };

  const getEventsForDate = (day: number): ScheduleEvent[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    if (editable && onAddEvent) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      onAddEvent(dateStr);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-neutral-100 min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-neutral-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-neutral-900/50 rounded-lg" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === currentDate.getMonth() &&
              new Date().getFullYear() === currentDate.getFullYear();

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`h-24 p-2 rounded-lg border transition-all ${
                  isToday
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                } ${editable ? 'cursor-pointer' : ''}`}
              >
                <span className={`text-sm font-medium ${isToday ? 'text-primary-500' : 'text-neutral-400'}`}>
                  {day}
                </span>
                <div className="mt-1 space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className={`text-xs px-1.5 py-0.5 rounded truncate text-white cursor-pointer ${getSubjectColor(event.subject)}`}
                    >
                      {event.startTime} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-xs text-neutral-500">+{dayEvents.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface UpcomingEventsProps {
  events: ScheduleEvent[];
  limit?: number;
  onEventClick?: (event: ScheduleEvent) => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  events,
  limit = 5,
  onEventClick,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter(e => e.date >= today && e.status === 'scheduled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, limit);

  const getSubjectBadgeVariant = (subject: Subject): 'info' | 'success' | 'warning' => {
    switch (subject) {
      case 'mathematics':
        return 'info';
      case 'physics':
        return 'warning';
      case 'economics':
        return 'success';
      default:
        return 'info';
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">No upcoming sessions</p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="p-3 bg-neutral-800/50 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSubjectBadgeVariant(event.subject)} size="sm">
                        {event.subject}
                      </Badge>
                      <span className="text-xs text-neutral-500">{formatDate(event.date)}</span>
                    </div>
                    <p className="text-sm font-medium text-neutral-100 mt-1 truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.startTime} - {event.endTime}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
