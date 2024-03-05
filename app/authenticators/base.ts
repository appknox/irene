// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';

import ENV from 'irene/config/environment';
import OidcService from 'irene/services/oidc';

export interface LoginSuccessDataProps {
  token: string;
  user_id: number;
  b64token?: string;
}

export interface IreneLastTransitionInfoProps {
  sessionKey?: number;
  url: string;
}

const b64EncodeUnicode = (str: string) =>
  btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1: string) => {
      return String.fromCharCode(Number(`0x${p1}`));
    })
  );

const getB64Token = (userId: number, token: string) =>
  b64EncodeUnicode(`${userId}:${token}`);

export const processData = (data: LoginSuccessDataProps) => {
  data.b64token = getB64Token(data.user_id, data.token);
  return data;
};

export default class BaseAuthenticator extends Base {
  @service declare ajax: any;
  @service declare session: any;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare oidc: OidcService;

  restoreLastTransition(userId: number) {
    const redirected = this.oidc.checkForOidcTokenAndRedirect();

    // Don't redirect if OIDC redirect is successful
    if (redirected) {
      return;
    }

    const transInfo = this.window.sessionStorage.getItem('_lastTransitionInfo');

    const { sessionKey, url }: IreneLastTransitionInfoProps = transInfo
      ? JSON.parse(transInfo)
      : {};

    // Don't navigate to last transition if a different account is logged in
    if (sessionKey && sessionKey !== userId) {
      return;
    }

    if (url) {
      this.window.location.href = url;
    }
  }

  async restore(data: LoginSuccessDataProps) {
    const url = ENV['ember-simple-auth']['checkEndPoint'];

    await this.ajax.post(url, {
      data: {},
      headers: {
        Authorization: `Basic ${data.b64token}`,
      },
    });

    return data;
  }

  async invalidate() {
    const url = ENV['ember-simple-auth']['logoutEndPoint'];

    await this.ajax.post(url);

    location.reload();
  }
}
