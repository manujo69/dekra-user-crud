import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DynamicFieldComponent } from './dynamic-field.component';
import { JsonSchemaProperty } from '../../models/form-schema.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

describe('DynamicFieldComponent', () => {
  let component: DynamicFieldComponent;
  let fixture: ComponentFixture<DynamicFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      teardown: { destroyAfterEach: true },
      imports: [
        DynamicFieldComponent,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
      ],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFieldComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getInputType', () => {
    it('should return "email" when format is email', () => {
      component.config = { type: 'string', format: 'email' };
      expect(component.getInputType()).toBe('email');
    });

    it('should return "password" when format is password', () => {
      component.config = { type: 'string', format: 'password' };
      expect(component.getInputType()).toBe('password');
    });

    it('should return "tel" when format is tel', () => {
      component.config = { type: 'string', format: 'tel' };
      expect(component.getInputType()).toBe('tel');
    });

    it('should return "date" when format is date', () => {
      component.config = { type: 'string', format: 'date' };
      expect(component.getInputType()).toBe('date');
    });

    it('should return "number" when type is number', () => {
      component.config = { type: 'number' };
      expect(component.getInputType()).toBe('number');
    });

    it('should return "number" when type is integer', () => {
      component.config = { type: 'integer' };
      expect(component.getInputType()).toBe('number');
    });

    it('should return "text" for a plain string with no format', () => {
      component.config = { type: 'string' };
      expect(component.getInputType()).toBe('text');
    });
  });

  describe('getErrorMessage', () => {
    const config: JsonSchemaProperty = { type: 'string' };

    it('should return empty string when there are no errors', () => {
      component.config = config;
      component.control = new FormControl('valid');
      expect(component.getErrorMessage()).toBe('');
    });

    it('should return "This field is required" for required error', () => {
      component.config = config;
      component.control = new FormControl('', Validators.required);
      component.control.markAsTouched();
      expect(component.getErrorMessage()).toBe('This field is required');
    });

    it('should return "Invalid email address" for email error', () => {
      component.config = { type: 'string', format: 'email' };
      component.control = new FormControl('bad-email', Validators.email);
      expect(component.getErrorMessage()).toBe('Invalid email address');
    });

    it('should return minlength message with required length', () => {
      component.config = config;
      component.control = new FormControl('ab', Validators.minLength(5));
      expect(component.getErrorMessage()).toBe('Minimum 5 characters');
    });

    it('should return maxlength message with required length', () => {
      component.config = config;
      component.control = new FormControl('toolongvalue', Validators.maxLength(5));
      expect(component.getErrorMessage()).toBe('Maximum 5 characters');
    });

    it('should return min message with minimum value', () => {
      component.config = { type: 'number' };
      component.control = new FormControl(5, Validators.min(18));
      expect(component.getErrorMessage()).toBe('Minimum value is 18');
    });

    it('should return max message with maximum value', () => {
      component.config = { type: 'number' };
      component.control = new FormControl(150, Validators.max(99));
      expect(component.getErrorMessage()).toBe('Maximum value is 99');
    });

    it('should return "Invalid format" for pattern error', () => {
      component.config = config;
      component.control = new FormControl('abc', Validators.pattern('^[0-9]+$'));
      expect(component.getErrorMessage()).toBe('Invalid format');
    });

    it('should return "Invalid value" for an unknown error key', () => {
      component.config = config;
      component.control = new FormControl(null);
      component.control.setErrors({ customError: true });
      expect(component.getErrorMessage()).toBe('Invalid value');
    });

    it('should return the custom errorMessage when configured', () => {
      component.config = {
        type: 'string',
        errorMessage: { required: 'Este campo es obligatorio' },
      };
      component.control = new FormControl('', Validators.required);
      expect(component.getErrorMessage()).toBe('Este campo es obligatorio');
    });
  });
});
