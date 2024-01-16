import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { Queue } from 'ember-file-upload/queue';

export default class UploadAppService extends Service {
  @tracked
  systemFileQueue: Queue | null = null;

  updateSystemFileQueue(queue: Queue | null) {
    this.systemFileQueue = queue;
  }
}
