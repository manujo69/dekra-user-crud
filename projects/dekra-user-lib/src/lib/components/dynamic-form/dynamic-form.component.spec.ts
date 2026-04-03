import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicFormComponent } from './dynamic-form.component';
import { FormSchema } from '../../models/form-schema.model';

describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent<unknown>;
  let fixture: ComponentFixture<DynamicFormComponent<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormComponent<unknown>);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getOrderedFields', () => {
    it('should sort fields by their order property', () => {
      component.schema = {
        type: 'object',
        properties: {
          last: { type: 'string', order: 3 },
          first: { type: 'string', order: 1 },
          middle: { type: 'string', order: 2 },
        },
      };
      component.ngOnInit();

      expect(component.fields[0].key).toBe('first');
      expect(component.fields[1].key).toBe('middle');
      expect(component.fields[2].key).toBe('last');
    });

    it('Case 1: should place fields without order after those with order (defaults to 999)', () => {
      component.schema = {
        type: 'object',
        properties: {
          noOrder: { type: 'string' },
          first: { type: 'string', order: 1 },
        },
      };
      component.ngOnInit();

      expect(component.fields[0].key).toBe('first');
      expect(component.fields[1].key).toBe('noOrder');
    });

    it('Case 2: should place fields without order after those with order (defaults to 999)', () => {
      component.schema = {
        type: 'object',
        properties: {
          nth: { type: 'string', order: 333 },
          noOrder1: { type: 'string' },
          noOrder2: { type: 'string' },
        },
      };
      component.ngOnInit();

      expect(component.fields[0].key).toBe('nth');
      expect(component.fields[1].key).toBe('noOrder1');
      expect(component.fields[2].key).toBe('noOrder2');
    });
  });

  describe('submit button disabled state', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    };

    beforeEach(() => {
      component.schema = schema;
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should be disabled when the form is pristine (no changes yet)', () => {
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');

      expect(button.disabled).toBeTrue();
    });

    it('should be enabled when the form is dirty and valid', () => {
      component.formGroup.markAsDirty();
      fixture.detectChanges();

      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');

      expect(button.disabled).toBeFalse();
    });
  });

  describe('onSubmit', () => {
    const schema: FormSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    };

    beforeEach(() => {
      component.schema = schema;
      component.ngOnInit();
    });

    it('should not emit formSubmit when the form is invalid', () => {
      const emitSpy = spyOn(component.formSubmit, 'emit');

      component.onSubmit();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should mark all controls as touched when the form is invalid', () => {
      component.onSubmit();

      expect(component.formGroup.get('name')?.touched).toBeTrue();
    });

    it('should emit formSubmit with the form values when the form is valid', () => {
      const emitSpy = spyOn(component.formSubmit, 'emit');
      component.formGroup.get('name')?.setValue('John');

      component.onSubmit();

      expect(emitSpy).toHaveBeenCalledWith({ name: 'John' });
    });
  });
});
