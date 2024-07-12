import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import ConfigurationService from './configuration';

export default class DevicefarmService extends Service {
  @service declare session: any;
  @service declare ajax: any;
  @service declare configuration: ConfigurationService;

  pingEndpoint = '/devicefarm/ping';
  websockifyEndpoint = '/websockify';

  get devicefarmURL(): string {
    if (
      this.session.isAuthenticated &&
      this.configuration.dashboardData.devicefarmURL
    ) {
      return this.configuration.dashboardData.devicefarmURL;
    }

    return this.configuration.serverData.devicefarmURL;
  }

  async testPing() {
    const pingUrl = new URL(this.pingEndpoint, this.urlbase).href;
    const pingContent = await this.ajax.request(pingUrl);

    return pingContent['ping'] === 'pong';
  }

  get urlbase() {
    try {
      const base = new URL('/', this.devicefarmURL).href;
      return base;
    } catch {
      // empty catch;
    }

    try {
      const API_HOST = ENV.host;
      const base = new URL('/', API_HOST).href;
      return base;
    } catch {
      // empty catch;
    }

    const base = new URL('/', window.location.href).href;
    return base;
  }

  getTokenizedWSURL(token: string) {
    if (!token) {
      throw new Error('Token cannot be empty');
    }

    const tokenizedPath = `${this.websockifyEndpoint}?token=${token}`;
    const devicefarmURL = new URL(tokenizedPath, this.urlbase);

    devicefarmURL.protocol = devicefarmURL.protocol.replace('http', 'ws');

    return devicefarmURL.href;
  }
}
