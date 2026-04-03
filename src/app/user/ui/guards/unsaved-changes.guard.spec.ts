import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { unsavedChangesGuard, HasUnsavedChanges } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  let dialog: jasmine.SpyObj<MatDialog>;
  let afterClosedSubject: Subject<boolean | undefined>;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  const runGuard = (component: HasUnsavedChanges) =>
    TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(component, mockRoute, mockState, mockState),
    );

  beforeEach(() => {
    afterClosedSubject = new Subject<boolean | undefined>();
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    dialog.open.and.returnValue({
      afterClosed: () => afterClosedSubject.asObservable(),
    } as MatDialogRef<unknown>);

    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: dialog }],
    });
  });

  it('should return true immediately when form is not dirty', () => {
    const result = runGuard({ isDirty: () => false });

    expect(result).toBeTrue();
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should open confirm dialog when form is dirty', () => {
    runGuard({ isDirty: () => true });

    expect(dialog.open).toHaveBeenCalledOnceWith(
      jasmine.anything(),
      jasmine.objectContaining({
        data: jasmine.objectContaining({ confirmLabel: 'Leave' }),
      }),
    );
  });

  it('should return true when the user confirms leaving', (done: DoneFn) => {
    const result$ = runGuard({ isDirty: () => true }) as Observable<boolean>;

    result$.subscribe(result => {
      expect(result).toBeTrue();
      done();
    });

    afterClosedSubject.next(true);
    afterClosedSubject.complete();
  });

  it('should return false when the user dismisses the dialog', (done: DoneFn) => {
    const result$ = runGuard({ isDirty: () => true }) as Observable<boolean>;

    result$.subscribe(result => {
      expect(result).toBeFalse();
      done();
    });

    afterClosedSubject.next(undefined);
    afterClosedSubject.complete();
  });

  it('should return false when the user clicks Cancel in the dialog', (done: DoneFn) => {
    const result$ = runGuard({ isDirty: () => true }) as Observable<boolean>;

    result$.subscribe(result => {
      expect(result).toBeFalse();
      done();
    });

    afterClosedSubject.next(false);
    afterClosedSubject.complete();
  });
});
