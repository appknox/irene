import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';

export type ConnectionStatus = 'not_connected' | 'awaiting_jira' | 'connected';

interface JiraSecurityStatusResponse {
  status: ConnectionStatus;
  connected_on: string | null;
  configure_path: string | null;
}

interface JiraSecuritySecretResponse {
  secret: string;
}

export interface OrganizationIntegrationsJiraSecuritySignature {
  Args: {
    onStatusChange?: (status: ConnectionStatus) => void;
  };
}

const COPIED_FEEDBACK_MS = 2000;

const JIRA_SITE_PATTERN = /^[a-z0-9][a-z0-9-]*\.atlassian\.net$/i;

export default class OrganizationIntegrationsJiraSecurityComponent extends Component<OrganizationIntegrationsJiraSecuritySignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked status: ConnectionStatus = 'not_connected';
  @tracked connectedOn: string | null = null;
  @tracked configurePath: string | null = null;
  @tracked generatedSecret = '';
  @tracked secretCopied = false;
  @tracked jiraSite = '';
  @tracked siteTouched = false;
  @tracked showRegenerateConfirm = false;
  @tracked showDisconnectConfirm = false;

  copiedTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    owner: unknown,
    args: OrganizationIntegrationsJiraSecuritySignature['Args']
  ) {
    super(owner, args);

    this.fetchStatus.perform();

    window.addEventListener('focus', this.refreshOnReturn);
  }

  willDestroy() {
    super.willDestroy();

    window.removeEventListener('focus', this.refreshOnReturn);
    this.clearCopiedTimer();
  }

  clearCopiedTimer() {
    if (this.copiedTimer) {
      clearTimeout(this.copiedTimer);

      this.copiedTimer = null;
    }
  }

  @action refreshOnReturn() {
    if (!this.fetchStatus.isRunning) {
      this.fetchStatus.perform();
    }
  }

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected?.id,
      ENV.endpoints['integrateJiraSecurity'],
    ].join('/');
  }

  get installUrl() {
    return ENV.jiraSecurityInstallUrl || '';
  }

  get connectedOnLabel() {
    return this.connectedOn
      ? dayjs(this.connectedOn).format('MMM DD, YYYY, hh:mm A')
      : '';
  }

  get isConnected() {
    return this.status === 'connected';
  }

  get isAwaitingJira() {
    return this.status === 'awaiting_jira';
  }

  get isLoading() {
    return this.fetchStatus.isRunning;
  }

  get headline() {
    return this.isConnected
      ? this.intl.t('jiraSecurity.headlineConnected')
      : this.intl.t('jiraSecurity.headlineWaiting');
  }

  get statusColor() {
    const colors: Record<ConnectionStatus, 'success' | 'warn' | 'default'> = {
      connected: 'success',
      awaiting_jira: 'warn',
      not_connected: 'default',
    };

    return colors[this.status];
  }

  get showInstallStep() {
    return !this.isConnected && Boolean(this.installUrl);
  }

  get siteStepNumber() {
    return this.showInstallStep ? 2 : 1;
  }

  get secretStepNumber() {
    return this.siteStepNumber + 1;
  }

  get canGenerateSecret() {
    return this.isSiteValid;
  }

  get statusLabel() {
    const labels: Record<ConnectionStatus, string> = {
      connected: this.intl.t('jiraSecurity.connected'),
      awaiting_jira: this.intl.t('jiraSecurity.awaitingJira'),
      not_connected: this.intl.t('jiraSecurity.notConnected'),
    };

    return labels[this.status];
  }

  get helpText() {
    const help: Record<ConnectionStatus, string> = {
      connected: this.intl.t('jiraSecurity.connectedHelp'),
      awaiting_jira: this.intl.t('jiraSecurity.awaitingHelp'),
      not_connected: this.intl.t('jiraSecurity.notConnectedHelp'),
    };

    return help[this.status];
  }

  get normalizedSite() {
    return this.jiraSite
      .trim()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '');
  }

  get isSiteValid() {
    return JIRA_SITE_PATTERN.test(this.normalizedSite);
  }

  get showSiteError() {
    return this.siteTouched && this.jiraSite !== '' && !this.isSiteValid;
  }

  get configureUrl() {
    if (!this.isSiteValid || !this.configurePath) {
      return '';
    }

    return `https://${this.normalizedSite}${this.configurePath}`;
  }

  get canContinueToJira() {
    return this.configureUrl !== '' && this.generatedSecret !== '';
  }

  @action
  updateJiraSite(event: Event) {
    this.jiraSite = (event.target as HTMLInputElement).value;
    this.siteTouched = true;
  }

  @action
  openRegenerateConfirm() {
    this.showRegenerateConfirm = true;
  }

  @action
  closeRegenerateConfirm() {
    this.showRegenerateConfirm = false;
  }

  @action
  openDisconnectConfirm() {
    this.showDisconnectConfirm = true;
  }

  @action closeDisconnectConfirm() {
    this.showDisconnectConfirm = false;
  }

  @action
  async copySecret() {
    try {
      await navigator.clipboard.writeText(this.generatedSecret);
    } catch {
      this.notify.error(this.intl.t('jiraSecurity.copyFailed'));

      return;
    }

    this.notify.success(this.intl.t('jiraSecurity.copied'));

    this.secretCopied = true;
    this.clearCopiedTimer();

    this.copiedTimer = setTimeout(() => {
      this.secretCopied = false;
      this.copiedTimer = null;
    }, COPIED_FEEDBACK_MS);
  }

  @action
  openInstallPage() {
    if (!this.installUrl) {
      return;
    }

    window.open(this.installUrl, '_blank', 'noopener,noreferrer');
  }

  @action
  openConfigurePage() {
    if (!this.canContinueToJira) {
      return;
    }

    window.open(this.configureUrl, '_blank', 'noopener,noreferrer');
  }

  fetchStatus = task(async () => {
    try {
      const data = await this.ajax.request<JiraSecurityStatusResponse>(
        this.baseURL
      );

      this.status = data.status;
      this.connectedOn = data.connected_on;
      this.configurePath = data.configure_path;

      if (this.isConnected) {
        this.generatedSecret = '';
      }

      this.args.onStatusChange?.(this.status);
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  generateSecret = task(async () => {
    try {
      const data = await this.ajax.post<JiraSecuritySecretResponse>(
        this.baseURL
      );

      this.generatedSecret = data.secret;
      this.showRegenerateConfirm = false;

      await this.fetchStatus.perform();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  disconnect = task(async () => {
    try {
      await this.ajax.delete(this.baseURL);

      this.showDisconnectConfirm = false;
      this.generatedSecret = '';

      await this.fetchStatus.perform();
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::JiraSecurity': typeof OrganizationIntegrationsJiraSecurityComponent;
  }
}
