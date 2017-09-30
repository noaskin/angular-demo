/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Injectable, Optional, Inject, Injector } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

import { NbAbstractAuthProvider } from '../providers/abstract-auth.provider';
import { NbAuthSimpleToken, NbTokenService } from './token.service';
import { NB_AUTH_PROVIDERS_TOKEN } from '../auth.options';

export class NbAuthResult {

  protected token: any;
  protected errors: string[] = [];
  protected messages: string[] = [];

  // TODO pass arguments in options object 在选项对象中传递参数
  constructor(protected success: boolean,
    protected response?: any,
    protected redirect?: any,
    errors?: any,
    messages?: any,
    token?: NbAuthSimpleToken) {

    this.errors = this.errors.concat([errors]);
    if (errors instanceof Array) {
      this.errors = errors;
    }

    this.messages = this.messages.concat([messages]);
    if (messages instanceof Array) {
      this.messages = messages;
    }

    this.token = token;
  }

  getResponse(): any {
    return this.response;
  }

  getTokenValue(): any {
    return this.token;
  }

  replaceToken(token: NbAuthSimpleToken): any {
    this.token = token
  }

  getRedirect(): any {
    return this.redirect;
  }

  getErrors(): string[] {
    return this.errors.filter(val => !!val);
  }

  getMessages(): string[] {
    return this.messages.filter(val => !!val);
  }

  isSuccess(): boolean {
    return this.success;
  }

  isFailure(): boolean {
    return !this.success;
  }
}

@Injectable()
export class NbAuthService {

  constructor(protected tokenService: NbTokenService,
              protected injector: Injector,
              @Optional() @Inject(NB_AUTH_PROVIDERS_TOKEN) protected providers = {}) {
  }

  /**
   * Retrieves current authenticated token stored 检索当前验证令牌的存储情况
   * @returns {Observable<any>}
   */
  getToken(): Observable<NbAuthSimpleToken> {
    return this.tokenService.get();
  }

  /**
   * Returns true if auth token is presented in the token storage 如果令牌存储中存在auth令牌，则返回true
   * // TODO: check exp date for JWT token 检查Json web token的过期时间
   * @returns {Observable<any>}
   */
  isAuthenticated(): Observable<any> {
    return this.getToken().map(token => token && token.getValue());
  }

  /**
   * 返回令牌流
   * @returns {Observable<any>}
   */
  onTokenChange(): Observable<NbAuthSimpleToken> {
    return this.tokenService.tokenChange();
  }

  /**
   * 返回认证状态流
   *  // TODO: check exp date for JWT token 检查Json web token的过期时间
   * @returns {Observable<any>}
   */
  onAuthenticationChange(): Observable<boolean> {
    return this.onTokenChange().map(token => !!token);
  }

  /**
   * Authenticates with the selected provider 与所选提供商进行身份验证
   * Stores received token in the token storage 持久化授权
   *
   * Example:
   * authenticate('email', {email: 'email@example.com', password: 'test'})
   *
   * @param provider
   * @param data
   * @returns {Observable<NbAuthResult>}
   */
  authenticate(provider: string, data?: any): Observable<NbAuthResult> {
    return this.getProvider(provider).authenticate(data)
      .switchMap((result: NbAuthResult) => {
        if (result.isSuccess() && result.getTokenValue()) {
          return this.tokenService.set(result.getTokenValue())
            .switchMap(_ => this.tokenService.get())
            .map(token => {
              result.replaceToken(token);
              return result;
            });
        }

        return Observable.of(result);
      });
  }

  /**
   * Registers with the selected provider 向后端服务提交注册请求
   * Stores received token in the token storage 持久化授权
   *
   * Example:
   * register('email', {email: 'email@example.com', name: 'Some Name', password: 'test'})
   *
   * @param provider
   * @param data
   * @returns {Observable<NbAuthResult>}
   */
  register(provider: string, data?: any): Observable<NbAuthResult> {
    return this.getProvider(provider).register(data)
      .switchMap((result: NbAuthResult) => {
        if (result.isSuccess() && result.getTokenValue()) {
          return this.tokenService.set(result.getTokenValue())
            .switchMap(_ => this.tokenService.get())
            .map(token => {
              result.replaceToken(token);
              return result;
            });
        }

        return Observable.of(result);
      });
  }

  /**
   * Sign outs with the selected provider 登出
   * Removes token from the token storage 从token空间中移除token
   *
   * Example:
   * logout('email')
   *
   * @param provider
   * @returns {Observable<NbAuthResult>}
   */
  logout(provider: string): Observable<NbAuthResult> {
    return this.getProvider(provider).logout()
      .do((result: NbAuthResult) => {
        if (result.isSuccess()) {
          this.tokenService.clear().subscribe(() => { });
        }
      });
  }

  /**
   * Sends forgot password request to the selected provider 发送忘记密码请求
   *
   * Example:
   * requestPassword('email', {email: 'email@example.com'})
   *
   * @param provider
   * @param data
   * @returns {Observable<NbAuthResult>}
   */
  requestPassword(provider: string, data?: any): Observable<NbAuthResult> {
    return this.getProvider(provider).requestPassword(data);
  }

  /**
   * Tries to reset password with the selected provider 尝试重置密码
   *
   * Example:
   * resetPassword('email', {newPassword: 'test'})
   *
   * @param provider
   * @param data
   * @returns {Observable<NbAuthResult>}
   */
  resetPassword(provider: string, data?: any): Observable<NbAuthResult> {
    return this.getProvider(provider).resetPassword(data);
  }

  /**
   * 获取服务方
   * @param provider
   * @returns {T}
   */
  getProvider(provider: string): NbAbstractAuthProvider {
    if (!this.providers[provider]) {
      throw new TypeError(`Nb auth provider '${provider}' is not registered`);
    }

    return this.injector.get(this.providers[provider].service);
  }
}
