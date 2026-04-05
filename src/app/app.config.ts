import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { UserRepository } from './user/domain/user.repository';
import { UserMockRepository } from './user/infrastructure/repositories/user-mock.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: UserRepository,
      useClass: UserMockRepository,
    },
  ],
};
