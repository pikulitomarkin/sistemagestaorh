import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export function MonthCalendar({ value, onChange, tileContent }) {
  return (
    <Calendar
      onChange={onChange}
      value={value}
      calendarType="ISO 8601"
      locale="pt-BR"
      tileContent={tileContent}
      minDetail="month"
      maxDetail="month"
      showNeighboringMonth={false}
    />
  );
}
