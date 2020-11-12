import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';


export default class DevicefarmService extends Service {
  @service ajax;
  pingEndpoint = "/devicefarm/ping";
  websockifyEndpoint = "/websockify";

  async testPing() {
    const pingUrl =  new URL(this.pingEndpoint, this.urlbase).href;
    const pingContent = await this.ajax.request(pingUrl);
    return pingContent["ping"] === "pong";
  }

  get urlbase() {
    let base = new URL("/", window.location.href).href;
    try {
      base = new URL("/", ENV.devicefarmHost).href;
    } catch {
      // empty catch;
    }
    return base;
  }

  getTokenizedWSURL (token) {
    if(!token) {
      throw new Error("Token cannot be empty");
    }

    const tokenizedPath = `${this.websockifyEndpoint}?token=${token}`
    const devicefarmURL = new URL(tokenizedPath, this.urlbase);
    devicefarmURL.protocol = devicefarmURL.protocol.replace('http', 'ws')
    return devicefarmURL.href;
  }
}
