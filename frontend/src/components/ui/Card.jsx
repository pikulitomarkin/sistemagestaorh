import { cn } from '../../utils/cn';

export const Card = ({ 
  children, 
  className = '', 
  padding = 'md',
  ...props 
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-slate-200',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
