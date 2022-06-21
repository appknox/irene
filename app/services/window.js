import Service from '@ember/service';

export default class WindowService extends Service {
  locationAssign(url) {
    window.location.assign(url);
    return url;
  }
}
