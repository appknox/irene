import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { Changeset } from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import type { BufferedChangeset } from 'ember-changeset/types';
import type IntlService from 'ember-intl/services/intl';

import slackValidation from './validator';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type UserModel from 'irene/models/user';
import type { AjaxError } from 'irene/services/ajax';

type SlackIntegrationFields = {
  channelId: string;
};

type ChangesetBufferProps = BufferedChangeset &
  SlackIntegrationFields & {
    error: { [key in keyof SlackIntegrationFields]: boolean };
  };

type SlackCheckResponse = {
  channel_id: string;
  api_token: string;
};

type SlackRedirectResponse = {
  url: string;
};

export interface OrganizationIntegrationsSlackSignature {
  Args: {
    user: UserModel;
  };
}

export default class OrganizationIntegrationsSlackComponent extends Component<OrganizationIntegrationsSlackSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  tPleaseTryAgain: string;
  tSlackIntegrated: string;
  tSlackWillBeRevoked: string;
  tChannelSaved: string;
  changeset: ChangesetBufferProps;

  @tracked slackChannelId = '';
  @tracked slackPOJO: Record<string, unknown> = {};

  @tracked isSlackIntegrated = false;
  @tracked showRevokeSlackConfirmBox = false;
  @tracked integrationDrawerIsOpen = false;
  @tracked showEditButton = true;
  @tracked isEditing = false;

  constructor(
    owner: unknown,
    args: OrganizationIntegrationsSlackSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
    this.tSlackIntegrated = this.intl.t('slackIntegrated');
    this.tSlackWillBeRevoked = this.intl.t('slack.willBeRevoked');
    this.tChannelSaved = this.intl.t('slack.channelSaved');

    const slackPOJO = this.slackPOJO;

    this.changeset = Changeset(
      slackPOJO,
      lookupValidator(slackValidation),
      slackValidation
    ) as ChangesetBufferProps;

    this.checkSlackIntegration.perform();
  }

  get data() {
    return {
      id: 'Slack',
      title: this.intl.t('slack.title'),
      description: this.intl.t('slackIntegrationDesc'),
      logo: '../../../images/slack-icon.png',
      isIntegrated: this.isSlackIntegrated,
    };
  }

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected?.id,
      ENV.endpoints['integrateSlack'],
    ].join('/');
  }

  get isLoadingSlackData() {
    return this.checkSlackIntegration.isRunning;
  }

  get showIntegratedOrLoadingUI() {
    return (
      this.isLoadingSlackData || (this.isSlackIntegrated && !this.isEditing)
    );
  }

  @action
  openDrawer() {
    this.integrationDrawerIsOpen = true;
  }

  @action
  closeDrawer() {
    this.integrationDrawerIsOpen = false;
    this.isEditing = false;
    this.showEditButton = true;
  }

  @action
  resetSlackInputs() {
    this.slackChannelId = '';

    this.changeset.rollback();
  }

  @action
  handleEditClick() {
    this.showEditButton = false;
    this.isEditing = true;
  }

  @action
  onEditSave() {
    this.onEditSaveTask.perform(this.changeset);
  }

  @action
  confirmCallback() {
    this.revokeSlack.perform();
  }

  redirectAPI = task(async () => {
    return await this.ajax.request<SlackRedirectResponse>(
      `/api/organizations/${this.organization.selected?.id}/slack/redirect`
    );
  });

  checkSlackIntegration = task(async () => {
    try {
      const data = await this.ajax.request<SlackCheckResponse>(this.baseURL);

      this.isSlackIntegrated = !!data.api_token && !!data.channel_id;
      this.slackChannelId = data.channel_id;
      this.changeset.set('channelId', data.channel_id);
    } catch (err) {
      const error = err as AjaxError;

      if (error.status === 404) {
        this.isSlackIntegrated = false;
      }
    }
  });

  revokeSlack = task(async () => {
    try {
      await this.ajax.delete(this.baseURL);

      this.isSlackIntegrated = false;

      this.closeRevokeSlackConfirmBox();
      this.checkSlackIntegration.perform();
      this.resetSlackInputs();

      this.notify.success(this.tSlackWillBeRevoked);
    } catch (error) {
      this.notify.error(this.tPleaseTryAgain);
    }
  });

  integrateSlack = task(async (changeset) => {
    await changeset.validate();

    if (!changeset.isValid) {
      if (changeset?.errors?.[0]?.validation) {
        this.notify.error(changeset.errors[0].validation, ENV.notifications);
      }

      return;
    }

    const data = {
      channel_id: changeset.channelId,
    };

    triggerAnalytics(
      'feature',
      ENV.csb['integrateSlack'] as CsbAnalyticsFeatureData
    );

    try {
      await this.ajax.post(this.baseURL, { data });
      const d = await this.redirectAPI.perform();
      this.window.location.href = d.url;

      await this.checkSlackIntegration.perform();
    } catch (err) {
      this.notify.error(this.tPleaseTryAgain);
    }
  });

  onEditSaveTask = task(async (changeset) => {
    await changeset.validate();

    const data = {
      channel_id: changeset.channelId,
    };

    if (changeset.isValid) {
      try {
        await this.ajax.post(this.baseURL, { data });
        await this.checkSlackIntegration.perform();

        this.showEditButton = true;
        this.isEditing = false;
        this.notify.success(this.tChannelSaved);
      } catch (err) {
        const errMsg = this.tPleaseTryAgain;

        this.notify.error(errMsg);
        this.showEditButton = true;
        this.isEditing = false;
      }
    }
  });

  @action
  openRevokeSlackConfirmBox() {
    this.showRevokeSlackConfirmBox = true;
  }

  @action
  closeRevokeSlackConfirmBox() {
    this.showRevokeSlackConfirmBox = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::Slack': typeof OrganizationIntegrationsSlackComponent;
  }
}
