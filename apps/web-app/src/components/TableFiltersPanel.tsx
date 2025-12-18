import React from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Checkbox } from '~/components/ui/checkbox';
import { DatePickerWithRange } from '~/components/ui/date-range-picker';
import { X } from 'lucide-react';

export type FilterField =
  | { type: 'text'; name: string; label: string }
  | { type: 'select'; name: string; label: string; options: { value: string; label: string }[] }
  | { type: 'numberRange'; name: string; label: string }
  | { type: 'dateRange'; name: string; label: string }
  | { type: 'checkbox'; name: string; label: string };

type FilterValue = string | number | boolean | DateRange | { min?: number; max?: number } | undefined;

interface TableFiltersPanelProps {
  fields: FilterField[];
  values: Record<string, FilterValue>;
  onChange: (values: Record<string, FilterValue>) => void;
  onReset?: () => void;
}

export const TableFiltersPanel: React.FC<TableFiltersPanelProps> = ({ fields, values, onChange, onReset }) => {
  const handleChange = (name: string, value: FilterValue) => {
    onChange({ ...values, [name]: value });
  };

  const handleNumberRangeChange = (name: string, type: 'min' | 'max', value: string) => {
    const currentRange = values[name] || {};
    onChange({
      ...values,
      [name]: { ...currentRange, [type]: value === '' ? undefined : Number(value) },
    });
  };

  const handleDateRangeChange = (name: string, range: DateRange | undefined) => {
    // Convert DateRange to whatever the app expects, or keep as DateRange
    // AntD RangePicker usually returns [moment, moment].
    // Here we might need to adapt based on consumer.
    // Assuming consumer can handle { from: Date, to: Date } or similar.
    onChange({ ...values, [name]: range });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 mb-4">
      {fields.map((field) => {
        switch (field.type) {
          case 'text':
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-[150px]"
                />
              </div>
            );
          case 'select':
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Select
                  value={values[field.name] || 'all'}
                  onValueChange={(val) => handleChange(field.name, val === 'all' ? undefined : val)}
                >
                  <SelectTrigger className="w-[150px]" id={field.name}>
                    <SelectValue placeholder="Wybierz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    {field.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          case 'numberRange':
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <Label>{field.label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="od"
                    value={values[field.name]?.min ?? ''}
                    onChange={(e) => handleNumberRangeChange(field.name, 'min', e.target.value)}
                    className="w-[80px]"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="do"
                    value={values[field.name]?.max ?? ''}
                    onChange={(e) => handleNumberRangeChange(field.name, 'max', e.target.value)}
                    className="w-[80px]"
                  />
                </div>
              </div>
            );
          case 'dateRange':
            return (
              <div key={field.name} className="flex flex-col gap-1.5">
                <Label>{field.label}</Label>
                <DatePickerWithRange
                  date={values[field.name]}
                  onDateChange={(range) => handleDateRangeChange(field.name, range)}
                />
              </div>
            );
          case 'checkbox':
            return (
              <div key={field.name} className="flex items-center space-x-2 pb-2">
                <Checkbox
                  id={field.name}
                  checked={values[field.name]}
                  onCheckedChange={(checked) => handleChange(field.name, checked)}
                />
                <Label htmlFor={field.name}>{field.label}</Label>
              </div>
            );
          default:
            return null;
        }
      })}
      {onReset && (
        <Button variant="ghost" onClick={onReset} className="pb-2">
          <X className="mr-2 h-4 w-4" />
          Wyczyść filtry
        </Button>
      )}
    </div>
  );
};

export default TableFiltersPanel; 