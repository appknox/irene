import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export type UploadAppFileQueue = {
  files: {
    progress: number;
  }[];
};

export default class UploadAppService extends Service {
  @tracked
  systemFileQueue: UploadAppFileQueue | null = null;

  updateSystemFileQueue(queue: UploadAppFileQueue) {
    this.systemFileQueue = queue;
  }
}
