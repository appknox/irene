import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type UserModel from 'irene/models/user';

/**
 * Where the connection has got to.
 *
 * `awaiting_jira` is the gap between generating a secret here and the customer
 * saving it in Jira -- the step people forget, so it is shown explicitly rather
 * than lumped in with "not connected".
 */
type ConnectionStatus = 'not_connected' | 'awaiting_jira' | 'connected';

interface JiraSecurityStatusResponse {
  status: ConnectionStatus;
  connected_on: string | null;
  // Path of the app's setup page inside the customer's Jira site. Supplied by
  // the API because the Forge app and environment ids differ per deployment.
  configure_path: string | null;
}

interface JiraSecuritySecretResponse {
  secret: string;
}

export interface OrganizationIntegrationsJiraSecuritySignature {
  Args: {
    user: UserModel;
  };
}

// Jira Cloud sites are always on this domain. Checked before building a link
// the browser will follow, so a typo cannot send an admin somewhere unexpected.
const JIRA_SITE_PATTERN = /^[a-z0-9][a-z0-9-]*\.atlassian\.net$/i;

export default class OrganizationIntegrationsJiraSecurityComponent extends Component<OrganizationIntegrationsJiraSecuritySignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked status: ConnectionStatus = 'not_connected';
  @tracked connectedOn: string | null = null;
  @tracked configurePath: string | null = null;

  /**
   * Held in memory only, for the one render after generation. The API returns
   * the secret once and never reads it back, so navigating away loses it.
   */
  @tracked generatedSecret = '';
  @tracked jiraSite = '';
  @tracked siteTouched = false;

  @tracked drawerIsOpen = false;
  @tracked showRegenerateConfirm = false;
  @tracked showDisconnectConfirm = false;

  constructor(
    owner: unknown,
    args: OrganizationIntegrationsJiraSecuritySignature['Args']
  ) {
    super(owner, args);

    this.fetchStatus.perform();

    // The middle step of setup happens in Jira, in another tab. Nothing tells
    // this page when that finishes, so re-check on the way back rather than
    // leaving the admin looking at a stale "Waiting for Jira".
    window.addEventListener('focus', this.refreshOnReturn);
  }

  willDestroy() {
    super.willDestroy();

    window.removeEventListener('focus', this.refreshOnReturn);
  }

  @action refreshOnReturn() {
    if (this.drawerIsOpen && !this.fetchStatus.isRunning) {
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

  /**
   * Atlassian install link for the Appknox app, from deployment config.
   *
   * Empty on deployments that have not set one -- the setup UI then drops the
   * install step rather than linking nowhere.
   */
  get installUrl() {
    return ENV.jiraSecurityInstallUrl || '';
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

  get data() {
    return {
      id: 'JiraSecurity',
      title: this.intl.t('jiraSecurity.title'),
      description: this.intl.t('jiraSecurity.description'),
      logo: '../../../images/jira-icon.png',
      isIntegrated: this.isConnected,
    };
  }

  /** The site address with any scheme or path the admin pasted stripped off. */
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

  /**
   * Link straight to the app's setup page in the admin's own Jira site.
   *
   * Empty unless the site parses and the API supplied a path, so the button is
   * never offered when it would lead nowhere useful.
   */
  get configureUrl() {
    if (!this.isSiteValid || !this.configurePath) {
      return '';
    }

    return `https://${this.normalizedSite}${this.configurePath}`;
  }

  /**
   * Whether it is worth sending the admin to Jira yet.
   *
   * Requires a secret in hand as well as a usable link: the Jira page asks for
   * a value they would not have, so arriving without one is a dead end.
   */
  get canContinueToJira() {
    return this.configureUrl !== '' && this.generatedSecret !== '';
  }

  @action openDrawer() {
    this.drawerIsOpen = true;

    // Status may have changed in Jira since this component was built.
    this.fetchStatus.perform();
  }

  @action closeDrawer() {
    this.drawerIsOpen = false;
    this.showRegenerateConfirm = false;
    this.showDisconnectConfirm = false;
    // The secret is unrecoverable once dismissed; do not keep it around.
    this.generatedSecret = '';
  }

  @action updateJiraSite(event: Event) {
    this.jiraSite = (event.target as HTMLInputElement).value;
    this.siteTouched = true;
  }

  @action openRegenerateConfirm() {
    this.showRegenerateConfirm = true;
  }

  @action closeRegenerateConfirm() {
    this.showRegenerateConfirm = false;
  }

  @action openDisconnectConfirm() {
    this.showDisconnectConfirm = true;
  }

  @action closeDisconnectConfirm() {
    this.showDisconnectConfirm = false;
  }

  @action async copySecret() {
    try {
      await navigator.clipboard.writeText(this.generatedSecret);
    } catch {
      // A silent failure here is worse than it looks: the clipboard keeps its
      // previous contents, so the admin pastes something plausible into Jira
      // and gets an unexplained rejection. Say so instead.
      this.notify.error(this.intl.t('jiraSecurity.copyFailed'));

      return;
    }

    this.notify.success(this.intl.t('jiraSecurity.copied'));
  }

  @action openInstallPage() {
    if (!this.installUrl) {
      return;
    }

    window.open(this.installUrl, '_blank', 'noopener,noreferrer');
  }

  @action openConfigurePage() {
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

      // Regenerating stands the connection down until the new secret reaches
      // Jira, so reflect that rather than leaving a stale "connected".
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
