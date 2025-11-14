import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField } from "@/components/ui/form-field";

interface GenderSelectFieldProps {
    value?: "male" | "female";
    onChange: (value: "male" | "female") => void;
    required?: boolean;
    error?: string;
}

export function GenderSelectField({
    value,
    onChange,
    required = false,
    error,
}: GenderSelectFieldProps) {
    return (
        <FormField label="Jenis Kelamin" required={required} error={error}>
            <RadioGroup
                onValueChange={onChange}
                value={value}
                className="flex gap-6"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer font-normal">
                        Laki-laki
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer font-normal">
                        Perempuan
                    </Label>
                </div>
            </RadioGroup>
        </FormField>
    );
}
