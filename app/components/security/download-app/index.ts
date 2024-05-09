import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';

export default class SecurityDownloadAppComponent extends Component {
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked fileNumber = '';

  get isDownloadingApp() {
    return this.triggerAppDownload.isRunning;
  }

  @action downloadApp() {
    this.triggerAppDownload.perform();
  }

  triggerAppDownload = task(async () => {
    const fileId = this.fileNumber;

    try {
      const url = [ENV.endpoints['apps'], fileId].join('/');

      const data = (await this.ajax.request(url, {
        namespace: 'api/hudson-api',
      })) as { url: string };

      this.window.open(data.url, '_blank');
    } catch (err) {
      this.notify.error(parseError(err));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::DownloadApp': typeof SecurityDownloadAppComponent;
  }
}
