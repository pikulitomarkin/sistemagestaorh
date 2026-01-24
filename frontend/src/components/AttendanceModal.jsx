import { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, Moon, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../utils/cn';

export const AttendanceModal = ({ 
  isOpen, 
  onClose, 
  employee, 
  date, 
  onConfirm 
}) => {
  const [selectedType, setSelectedType] = useState(null);
  const [hours, setHours] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedType(null);
      setHours('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const attendanceTypes = [
    { 
      id: 'absence', 
      label: 'Falta', 
      icon: AlertCircle, 
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-300'
    },
    { 
      id: 'overtime', 
      label: 'Hora Extra', 
      icon: Clock, 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      requiresInput: true
    },
    { 
      id: 'night', 
      label: 'Dobra/Noitada', 
      icon: Moon, 
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300'
    },
  ];

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleConfirm = () => {
    if (!selectedType) return;
    
    const data = {
      type: selectedType,
      hours: selectedType === 'overtime' ? parseFloat(hours) || 0 : null,
    };

    onConfirm(data);
    onClose();
  };

  const selectedTypeData = attendanceTypes.find(t => t.id === selectedType);
  const canConfirm = selectedType && (selectedType !== 'overtime' || hours);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">Lançar Frequência</h2>
              {employee && (
                <p className="text-sm text-slate-600 mt-1">{employee.name}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-target"
              aria-label="Fechar"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Data selecionada */}
            {date && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Data selecionada</p>
                <p className="font-semibold text-slate-900">{formatDate(date)}</p>
              </div>
            )}

            {/* Tipos de frequência */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Selecione o tipo:</p>
              <div className="space-y-3">
                {attendanceTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;

                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 transition-all duration-200',
                        'touch-target flex items-center gap-4',
                        isSelected
                          ? `${type.bgColor} ${type.borderColor} border-current`
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <div className={cn(
                        'p-3 rounded-lg',
                        isSelected ? type.color : 'bg-slate-100'
                      )}>
                        <Icon 
                          size={24} 
                          className={isSelected ? 'text-white' : 'text-slate-600'} 
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={cn(
                          'font-semibold',
                          isSelected ? type.textColor : 'text-slate-900'
                        )}>
                          {type.label}
                        </p>
                        {type.requiresInput && (
                          <p className="text-xs text-slate-500 mt-1">
                            Informe a quantidade de horas
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className={cn('p-1 rounded-full', type.color)}>
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input de horas para Hora Extra */}
            {selectedType === 'overtime' && (
              <div className="animate-in slide-in-from-top-2">
                <Input
                  label="Quantidade de Horas"
                  type="number"
                  placeholder="Ex: 2.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="0"
                  step="0.5"
                  required
                />
                <p className="text-xs text-slate-500 mt-2">
                  Digite a quantidade de horas extras trabalhadas
                </p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={onClose}
                className="flex-1 touch-target"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="flex-1 touch-target"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
