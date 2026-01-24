import { cn } from '../../utils/cn';

export const Input = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-2.5 border border-slate-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'transition-all duration-200',
          'placeholder:text-slate-400',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
