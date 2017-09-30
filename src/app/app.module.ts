import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import {
  NB_AUTH_TOKEN_WRAPPER_TOKEN,
  NbAuthJWTToken,
  NbAuthModule,
  NbDummyAuthProvider,
  NbEmailPassAuthProvider,
  NbAuthJWTInterceptor,
} from './common/auth';

import {
  NbActionsModule,
  NbCardModule,
  NbLayoutModule,
  NbMenuItem,
  NbMenuModule,
  NbRouteTabsetModule,
  NbSearchModule,
  NbSidebarModule,
  NbTabsetModule,
  NbThemeModule,
  NbUserModule,
} from './common/theme';


import { AppComponent } from './app.component';
import {routes} from "./app.routes";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes, { useHash: true }),
    NbThemeModule.forRoot({ name: 'default' }),
    NbCardModule,
    NbLayoutModule,
    NbAuthModule.forRoot({
      forms: {
        login: {
          redirectDelay: 3000,
        },
      },
      providers: {
        //
        // email: {
        //   service: NbDummyAuthProvider,
        //   config: {
        //     alwaysFail: true,
        //     delay: 1000,
        //   },
        // },
        email: {
          service: NbEmailPassAuthProvider,
          config: {
            login: {
              endpoint: 'http://localhost:3000/api/auth/login',
            },
            register: {
              endpoint: 'http://localhost:3000/api/auth/register',
            },
            logout: {
              endpoint: 'http://localhost:3000/api/auth/logout',
              redirect: {
                success: '/auth/login',
                failure: '/auth/login',
              },
            },
            requestPass: {
              endpoint: 'http://localhost:3000/api/auth/request-pass',
              redirect: {
                success: '/auth/reset-password',
              },
            },
            resetPass: {
              endpoint: 'http://localhost:3000/api/auth/reset-pass',
              redirect: {
                success: '/auth/login',
              },
            },
          },
        },
      },
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
