import { cn } from '@/lib/utils/utils';

import { INPUT_CLASS } from './inputStyles';

export function FormDate({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="date" className={cn(INPUT_CLASS, className)} {...props} />;
}
