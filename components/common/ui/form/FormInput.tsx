import { cn } from '@/lib/utils/utils';

import { INPUT_CLASS } from './inputStyles';


export function FormInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(INPUT_CLASS, className)} {...props} />;
}
