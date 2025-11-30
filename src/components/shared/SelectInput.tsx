import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SelectInputProps {
  label?: string;
  placeholder?: string;
  options: string[];
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const SelectInput = ({ label, placeholder, options, value, onValueChange, error, disabled }: SelectInputProps) => {
  return (
    <div className="space-y-2">
      {label && <Label className="text-foreground">{label}</Label>}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
