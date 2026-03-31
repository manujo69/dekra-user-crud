import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { FormSchema, JsonSchemaProperty } from '../models/form-schema.model';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  /**
   * Builds a FormGroup based on a JSON schema
   */
  createFormFromSchema(schema: FormSchema): FormGroup {
    const controls: { [key: string]: FormControl } = {};

    Object.keys(schema.properties).forEach(key => {
      const prop = schema.properties[key];
      const validators = this.getValidators(prop, schema.required?.includes(key));

      controls[key] = new FormControl(prop.default ?? null, validators);
    });

    return new FormGroup(controls);
  }

  /**
   * Builds validators from a property
   */
  private getValidators(prop: JsonSchemaProperty, isRequired?: boolean): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (isRequired) validators.push(Validators.required);
    if (prop.minLength) validators.push(Validators.minLength(prop.minLength));
    if (prop.maxLength) validators.push(Validators.maxLength(prop.maxLength));
    if (prop.minimum !== undefined) validators.push(Validators.min(prop.minimum));
    if (prop.maximum !== undefined) validators.push(Validators.max(prop.maximum));
    if (prop.pattern) validators.push(Validators.pattern(prop.pattern));
    if (prop.format === 'email') validators.push(Validators.email);

    return validators;
  }
}
