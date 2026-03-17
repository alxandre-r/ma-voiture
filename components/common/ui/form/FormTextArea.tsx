import { cn } from '@/lib/utils/utils';

import { INPUT_CLASS } from './inputStyles';

export function FormTextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(INPUT_CLASS, 'resize-none', className)} {...props} />;
}
