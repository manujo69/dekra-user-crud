// projects/dekra-user-lib/src/lib/components/dynamic-field/dynamic-field.component.ts

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { JsonSchemaProperty } from '../../models/form-schema.model';

@Component({
  selector: 'dul-dynamic-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './dynamic-field.component.html',
  styleUrl: './dynamic-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFieldComponent {
  @Input({ required: true }) config!: JsonSchemaProperty;
  @Input({ required: true }) control!: FormControl;

  getInputType(): string {
    if (this.config.format === 'email') return 'email';
    if (this.config.format === 'password') return 'password';
    if (this.config.format === 'tel') return 'tel';
    if (this.config.format === 'date') return 'date';
    if (this.config.type === 'number' || this.config.type === 'integer') return 'number';

    return 'text';
  }

  getErrorMessage(): string {
    if (!this.control.errors) return '';

    const errorKey = Object.keys(this.control.errors)[0];

    if (this.config.errorMessage?.[errorKey]) {
      return this.config.errorMessage[errorKey];
    }

    const errorMap: Record<string, string> = {
      required: 'This field is required',
      email: 'Invalid email address',
      minlength: `Minimum ${this.control.errors['minlength']?.requiredLength} characters`,
      maxlength: `Maximum ${this.control.errors['maxlength']?.requiredLength} characters`,
      min: `Minimum value is ${this.control.errors['min']?.min}`,
      max: `Maximum value is ${this.control.errors['max']?.max}`,
      pattern: 'Invalid format',
    };

    return errorMap[errorKey] || 'Invalid value';
  }
}
