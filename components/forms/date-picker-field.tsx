import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
    label: string;
    value?: Date;
    onChange: (date: Date | undefined) => void;
    required?: boolean;
    error?: string;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
}

export function DatePickerField({
    label,
    value,
    onChange,
    required = false,
    error,
    placeholder = "Pilih tanggal",
}: DatePickerFieldProps) {
    return (
        <FormField label={label} required={required} error={error}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground",
                            error && "border-destructive"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(value, "dd MMMM yyyy") : placeholder}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange}
                        captionLayout="dropdown"
                    />
                </PopoverContent>
            </Popover>
        </FormField>
    );
}
