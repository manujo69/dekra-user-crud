import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent>>;

  function configureTestBed(data: ConfirmDialogData): void {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    });

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('injection', () => {
    it('should create and inject data', () => {
      configureTestBed({ title: 'Delete', message: 'Are you sure?' });
      expect(component).toBeTruthy();
      expect(component.data.title).toBe('Delete');
      expect(component.data.message).toBe('Are you sure?');
    });

    it('should inject the dialogRef', () => {
      configureTestBed({ title: 'Delete', message: 'Are you sure?' });
      expect(component.dialogRef).toBeTruthy();
    });
  });

  describe('data binding', () => {
    it('should render title and message', () => {
      configureTestBed({ title: 'Remove item', message: 'This cannot be undone.' });
      const el: HTMLElement = fixture.nativeElement;

      expect(el.textContent).toContain('Remove item');
      expect(el.textContent).toContain('This cannot be undone.');
    });

    it('should render confirmLabel when provided', () => {
      configureTestBed({ title: 'Delete', message: 'Sure?', confirmLabel: 'Delete now' });
      const el: HTMLElement = fixture.nativeElement;

      expect(el.textContent).toContain('Delete now');
    });

    it('should fall back to "Confirm" when confirmLabel is omitted', () => {
      configureTestBed({ title: 'Delete', message: 'Sure?' });
      const el: HTMLElement = fixture.nativeElement;

      expect(el.textContent).toContain('Confirm');
    });
  });
});
