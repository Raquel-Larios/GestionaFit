export interface FormField{
    type: 'text' | 'email' | 'password' | 'select' | 'nested';
    name: string;
    label: string;
    options?: { value: any; label: string }[]; 
    subFields?: FormField[]; 
    validators?: {
        required?: boolean;
        titlecase?: boolean;
        pattern?: string;
        minlength?: number;
    }
    value?: any;
}