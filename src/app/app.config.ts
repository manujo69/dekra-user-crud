import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { UserRepository } from './user/domain/ports/user.repository';
import { UserMockRepository } from './user/infrastructure/repositories/user-mock.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
     {
      provide: UserRepository,
      useClass: UserMockRepository
    }
  ]
};
