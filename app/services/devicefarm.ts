import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ConfigurationService from './configuration';

export default class DevicefarmService extends Service {
  @service declare ajax: any;
  @service declare configuration: ConfigurationService;

  pingEndpoint = '/devicefarm/ping';
  websockifyEndpoint = '/websockify';

  get devicefarmURL(): string {
    return this.configuration.serverData.devicefarmURL;
  }

  async testPing() {
    const pingUrl = new URL(this.pingEndpoint, this.urlbase).href;
    const pingContent = await this.ajax.request(pingUrl);

    return pingContent['ping'] === 'pong';
  }

  get urlbase() {
    let base = new URL('/', window.location.href).href;

    try {
      base = new URL('/', this.devicefarmURL).href;
    } catch {
      // empty catch;
    }

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
