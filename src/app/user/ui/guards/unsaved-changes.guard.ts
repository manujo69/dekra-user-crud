import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';

export interface HasUnsavedChanges {
  isDirty(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = component => {
  if (!component.isDirty()) {
    return true;
  }

  return inject(MatDialog)
    .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      data: {
        title: 'Unsaved changes',
        message: 'You have unsaved changes. If you leave, they will be lost.',
        confirmLabel: 'Leave',
      },
    })
    .afterClosed()
    .pipe(map(result => result === true));
};
