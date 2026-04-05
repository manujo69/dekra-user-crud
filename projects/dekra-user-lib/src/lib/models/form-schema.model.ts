// According to JSON Schema specification: https://json-schema.org/draft/2020-12/json-schema-validation.html
export type JsonSchemaType = 'string' | 'number' | 'boolean' | 'integer';

export type JsonSchemaFormat = 'email' | 'password' | 'tel' | 'url' | 'date' | 'date-time';

export type WidgetType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'radio' | 'datepicker';

export type FieldValue = string | number | boolean | null;

export interface JsonSchemaProperty {
  type: JsonSchemaType;
  title?: string;
  description?: string;
  default?: FieldValue;

  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: JsonSchemaFormat;

  minimum?: number;
  maximum?: number;
  multipleOf?: number;

  enum?: FieldValue[];
  enumNames?: string[];

  widget?: WidgetType;
  placeholder?: string;

  errorMessage?: Record<string, string>;

  order?: number;
}

export interface FormSchema {
  type: 'object';
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
  title?: string;
  description?: string;
}

export const DEFAULT_FIELD_ORDER = 999;
