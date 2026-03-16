import { cn } from '@/lib/utils/utils';

import { INPUT_CLASS } from './inputStyles';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function FormSelect({ className, children, ...props }: Props) {
  return (
    <select className={cn(INPUT_CLASS, 'cursor-pointer', className)} {...props}>
      {children}
    </select>
  );
}
