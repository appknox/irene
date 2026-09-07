import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type FileModel from 'irene/models/file';
import type LoggerService from 'irene/services/logger';

export interface FileDetailsSeverityLevelSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsSeverityLevelComponent extends Component<FileDetailsSeverityLevelSignature> {
  @service declare logger: LoggerService;

  @tracked hasHealthScore = false;

  constructor(owner: unknown, args: FileDetailsSeverityLevelSignature['Args']) {
    super(owner, args);
    this.loadHealthScore.perform();
  }

  loadHealthScore = task(async () => {
    try {
      const audit = await waitForPromise(
        this.args.file.fetchFileHealthScoreAudit()
      );

      this.hasHealthScore = audit?.currentScore?.score != null;
    } catch (error) {
      this.logger.error(
        `Failed to fetch health score for severity level - ${this.args.file?.id}`,
        error
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::SeverityLevel': typeof FileDetailsSeverityLevelComponent;
    'file-details/severity-level': typeof FileDetailsSeverityLevelComponent;
  }
}
