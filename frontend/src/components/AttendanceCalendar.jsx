import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from './ui/Card';
import { cn } from '../utils/cn';

export const AttendanceCalendar = ({ onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isToday = (day) => {
    const date = new Date(year, month, day);
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const date = new Date(year, month, day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDayClick = (day) => {
    const date = new Date(year, month, day);
    onDateSelect(date);
  };

  // Criar array de dias do mês
  const days = [];
  
  // Dias vazios no início
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-target"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-slate-600" />
          <h3 className="font-semibold text-slate-900 text-base">
            {monthNames[month]} {year}
          </h3>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-target"
          aria-label="Próximo mês"
        >
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendário */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayIsToday = isToday(day);
          const dayIsSelected = isSelected(day);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={cn(
                'aspect-square rounded-lg text-sm font-medium',
                'transition-all duration-200 touch-target',
                'hover:bg-slate-100 active:scale-95',
                dayIsToday && 'ring-2 ring-indigo-500 ring-offset-1',
                dayIsSelected && 'bg-indigo-600 text-white hover:bg-indigo-700',
                !dayIsSelected && !dayIsToday && 'text-slate-700 hover:bg-slate-50'
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </Card>
  );
};
