import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type ProjectModel from 'irene/models/project';
import type ServiceAccountModel from 'irene/models/service-account';
import parseError from 'irene/utils/parse-error';

export default class ServiceAccountService extends Service {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked selectedProjectsForCreate: Record<string, ProjectModel> = {};

  @tracked tempSecretAccessKey: string | null = null;

  addProjectToServiceAccount = task(
    { enqueue: true, maxConcurrency: 3 },
    async (project: ProjectModel, serviceAccount: ServiceAccountModel) => {
      try {
        await serviceAccount.addProject(Number(project.id));
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

        return true;
      }
    }
  );
}
