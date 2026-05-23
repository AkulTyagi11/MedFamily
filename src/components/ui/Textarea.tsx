import { forwardRef, type TextareaHTMLAttributes } from 'react';
import Input from '@/components/ui/Input';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  return <Input ref={ref} multiline {...props} />;
});

export default Textarea;
