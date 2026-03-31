// projects/dekra-user-lib/src/lib/components/dynamic-form/dynamic-form.component.ts

import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';
import { DynamicFormService } from '../../services/dynamic-form.service';
import { FormSchema, JsonSchemaProperty } from '../../models/form-schema.model';

@Component({
  selector: 'dul-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    DynamicFieldComponent
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush  // ← AÑADIDO
})
export class DynamicFormComponent implements OnInit {
  @Input({ required: true }) schema!: FormSchema;
  @Input() submitLabel = 'Submit';
  @Input() showCancel = false;
  @Input() cancelLabel = 'Cancel';

  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  private formService = inject(DynamicFormService);

  formGroup!: FormGroup;
  fields: Array<{ key: string; property: JsonSchemaProperty }> = [];

  ngOnInit() {
    this.formGroup = this.formService.createFormFromSchema(this.schema);
    this.fields = this.getOrderedFields();
  }

  getControl(key: string) {
    return this.formGroup.get(key) as FormControl;
  }

  onSubmit() {
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value);
    } else {
      this.formGroup.markAllAsTouched();
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  private getOrderedFields() {
    const props = this.schema.properties;

    return Object.keys(props)
      .map(key => ({ key, property: props[key] }))
      .sort((a, b) => {
        const orderA = a.property.order ?? 999;
        const orderB = b.property.order ?? 999;
        return orderA - orderB;
      });
  }
}
