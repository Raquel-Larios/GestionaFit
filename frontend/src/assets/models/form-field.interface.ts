export interface FormField{
    type: 'text' | 'number' | 'link' | 'email' | 'password' | 'select' | 'nested';
    name: string;
    label: string;
    min?: number;
    max?: number;
    step?: number;
    options?: { value: any; label: string }[]; 
    subFields?: FormField[]; 
    visibility?: {
        readonly?: boolean;
    }
    validators?: {
        required?: boolean;
        pattern?: string;
        minlength?: number;
    }
    value?: any;
}