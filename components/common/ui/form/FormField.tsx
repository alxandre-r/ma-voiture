import Icon from '@/components/common/ui/Icon';

interface FormFieldProps {
  label: string;
  icon?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({ label, icon, required, hint, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {icon && <Icon name={icon} size={14} className="inline mr-1" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
