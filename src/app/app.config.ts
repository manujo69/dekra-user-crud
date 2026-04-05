import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { environment } from '@env/environment';
import { UserRepository } from './user/domain/user.repository';
import { UserMockRepository } from './user/infrastructure/mock-repository/user-mock.repository';
import { UserHttpRepository } from './user/infrastructure/http-repository/user-http.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      // Single point where the repository implementation is swapped.
      // To use the real API, set useMock: false in the environment file.
      provide: UserRepository,
      useClass: environment.useMock ? UserMockRepository : UserHttpRepository,
    },
  ],
};
