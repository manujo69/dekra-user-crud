export type JsonSchemaType = 'string' | 'number' | 'boolean' | 'integer';

export type JsonSchemaFormat =
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'date'
  | 'date-time';

export type WidgetType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'radio'
  | 'date';

export interface JsonSchemaProperty {
  type: JsonSchemaType;
  title?: string;
  description?: string;
  default?: any;

  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: JsonSchemaFormat;

  minimum?: number;
  maximum?: number;
  multipleOf?: number;

  enum?: any[];
  enumNames?: string[];

  widget?: WidgetType;
  placeholder?: string;

  errorMessage?: {
    [key: string]: string;
  };

  order?: number;
}

export interface FormSchema {
  type: 'object';
  properties: {
    [key: string]: JsonSchemaProperty;
  };
  required?: string[];
  title?: string;
  description?: string;
}
