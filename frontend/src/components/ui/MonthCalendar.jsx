import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MonthCalendar({ value = new Date(), onChange }) {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(value));

  React.useEffect(() => {
    setCurrentMonth(startOfMonth(value));
  }, [value]);

  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-2">
      <button type="button" onClick={prevMonth} className="px-3 py-1 rounded hover:bg-gray-100">&lt;</button>
      <div className="font-semibold">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</div>
      <button type="button" onClick={nextMonth} className="px-3 py-1 rounded hover:bg-gray-100">&gt;</button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 0 });
    for (let i = 0; i < 7; i++) {
      const d = addDays(startDate, i);
      days.push(
        <div key={i} className="text-xs text-center text-gray-500 font-medium">
          {format(d, 'EEE', { locale: ptBR })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-1 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = isSameDay(day, value);
        formattedDate = format(day, 'd');
        days.push(
          <button
            type="button"
            className={`h-10 flex items-center justify-center rounded transition-colors ${
              isSelected 
                ? 'bg-primary-600 text-white font-bold' 
                : isCurrentMonth 
                ? 'text-gray-700 hover:bg-primary-100' 
                : 'text-gray-300 hover:bg-gray-50'
            }`}
            key={day}
            onClick={() => onChange(cloneDay)}
          >
            {formattedDate}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7 gap-1 mb-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
