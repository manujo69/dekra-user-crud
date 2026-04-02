import { TestBed } from '@angular/core/testing';
import { DynamicFormService } from './dynamic-form.service';
import { FormSchema } from '../models/form-schema.model';

describe('DynamicFormService', () => {
  let service: DynamicFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createFormFromSchema', () => {
    it('should create a FormGroup with one control per property', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          username: { type: 'string' },
          age: { type: 'number' },
        },
      };

      const form = service.createFormFromSchema(schema);

      expect(form.contains('username')).toBeTrue();
      expect(form.contains('age')).toBeTrue();
    });

    it('should apply the default value to the control', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          role: { type: 'string', default: 'user' },
        },
      };

      const form = service.createFormFromSchema(schema);

      expect(form.get('role')?.value).toBe('user');
    });

    it('should set null when no default value is provided', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };

      const form = service.createFormFromSchema(schema);

      expect(form.get('name')?.value).toBeNull();
    });

    it('should apply required validator for fields in the required array', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: { email: { type: 'string' } },
        required: ['email'],
      };

      const form = service.createFormFromSchema(schema);
      form.get('email')?.setValue('');

      expect(form.get('email')?.hasError('required')).toBeTrue();
    });

    it('should NOT apply required validator for fields not in the required array', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: { nickname: { type: 'string' } },
      };

      const form = service.createFormFromSchema(schema);
      form.get('nickname')?.setValue('');

      expect(form.get('nickname')?.hasError('required')).toBeFalse();
    });

    it('should apply minLength validator', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: { password: { type: 'string', minLength: 8 } },
      };

      const form = service.createFormFromSchema(schema);
      form.get('password')?.setValue('abc');

      expect(form.get('password')?.hasError('minlength')).toBeTrue();
    });

    it('should apply maxLength validator', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: { username: { type: 'string', maxLength: 10 } },
      };

      const form = service.createFormFromSchema(schema);
      form.get('username')?.setValue('thisistoolong');

      expect(form.get('username')?.hasError('maxlength')).toBeTrue();
    });

    it('should apply min validator', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: { age: { type: 'number', minimum: 18 } },
      };

      const form = service.createFormFromSchema(schema);
      form.get('age')?.setValue(16);

      expect(form.get('age')?.hasError('min')).toBeTrue();
    });

    it('should apply max validator', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: { age: { type: 'number', maximum: 99 } },
      };

      const form = service.createFormFromSchema(schema);
      form.get('age')?.setValue(100);

      expect(form.get('age')?.hasError('max')).toBeTrue();
    });

    it('should apply pattern validator', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: { phone: { type: 'string', pattern: '^[0-9]+$' } },
      };

      const form = service.createFormFromSchema(schema);
      form.get('phone')?.setValue('abc123');

      expect(form.get('phone')?.hasError('pattern')).toBeTrue();
    });

    it('should apply email validator when format is email', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: { email: { type: 'string', format: 'email' } },
      };

      const form = service.createFormFromSchema(schema);
      form.get('email')?.setValue('not-an-email');

      expect(form.get('email')?.hasError('email')).toBeTrue();
    });

    it('should be valid when all values satisfy their validators', () => {
      const schema: FormSchema = {
        type: 'object',
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 20 },
          age: { type: 'number', minimum: 18, maximum: 99 },
        },
        required: ['username'],
      };

      const form = service.createFormFromSchema(schema);
      form.get('username')?.setValue('john');
      form.get('age')?.setValue(25);

      expect(form.valid).toBeTrue();
    });
  });
});
