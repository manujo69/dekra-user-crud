import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DynamicFieldComponent } from '../dynamic-field/dynamic-field.component';
import { DynamicFormService } from '../../services/dynamic-form.service';
import { DEFAULT_FIELD_ORDER, FormSchema, JsonSchemaProperty } from '../../models/form-schema.model';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent<T> implements OnInit {
  @Input({ required: true }) schema!: FormSchema;
  @Input() submitLabel = 'Submit';
  @Input() showCancel = false;
  @Input() cancelLabel = 'Cancel';
  @Input() initialValues?: Partial<T>;

  @Output() formSubmit = new EventEmitter<T>();
  @Output() formCancel = new EventEmitter<void>();

  private formService = inject(DynamicFormService);

  formGroup!: FormGroup;
  fields: Array<{ key: string; property: JsonSchemaProperty }> = [];

  ngOnInit() {
    this.formGroup = this.formService.createFormFromSchema(this.schema);
    this.fields = this.getOrderedFields();

    if (this.initialValues) {
      this.formGroup.patchValue(this.initialValues);
    }
  }

  getControl(key: string): FormControl {
    return this.formGroup.get(key) as FormControl;
  }

  onSubmit() {
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value as T);
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
      .sort((a, b) =>
        (a.property.order ?? DEFAULT_FIELD_ORDER) -
        (b.property.order ?? DEFAULT_FIELD_ORDER)
      );
  }
}
