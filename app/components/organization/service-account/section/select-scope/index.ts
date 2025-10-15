import { service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';
import type { AkTreeProviderCheckExpandFuncType } from 'irene/components/ak-tree/provider';
import parseError from 'irene/utils/parse-error';

export interface OrganizationServiceAccountSectionSelectScopeSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
    renderType?: 'view' | 'create';
  };
}

interface NodeDataObject {
  scopeKeys: (
    | 'scopePublicApiProjectRead'
    | 'scopePublicApiScanResultVa'
    | 'scopePublicApiUserRead'
    | 'scopePublicApiUserWrite'
    | 'scopePublicApiUploadApp'
    | 'scopePublicApiTeamOperations'
    | 'scopeAutoApproveNewNameSpaces'
  )[];
  scopeLabel?: string;
  scopeDescription?: string;
  accessType?: string;
}

enum ScopeNodeKey {
  PUBLIC_API = 'public-api',
  PROJECTS_READ = 'projects-read',
  SCAN_RESULTS_VA_READ = 'scan-results-va-read',
  USER = 'user',
  USER_READ = 'user-read',
  USER_WRITE = 'user-write',
  UPLOAD = 'upload',
  UPLOAD_APP = 'upload-app',
  AUTO_APPROVE_NEW_NAME_SPACES = 'auto-approve-new-name-spaces',
  TEAM_OPERATIONS = 'team-operations',
}

export default class OrganizationServiceAccountSectionSelectScopeComponent extends Component<OrganizationServiceAccountSectionSelectScopeSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked isEditView = false;
  @tracked expanded: string[] = [ScopeNodeKey.PUBLIC_API];
  @tracked checked: string[] = [];

  get renderType() {
    return this.args.renderType || 'view';
  }

  get isEditOrCreateView() {
    return this.isEditView || this.renderType === 'create';
  }

  get showHeaderAction() {
    return this.renderType === 'view' && !this.isEditView;
  }

  get treeData() {
    return A([
      {
        key: ScopeNodeKey.PUBLIC_API,
        label: this.intl.t('serviceAccountModule.scopes.public-api.label'),
        showCheckbox: this.isEditOrCreateView,
        children: [
          {
            key: ScopeNodeKey.PROJECTS_READ,
            showCheckbox: this.isEditOrCreateView,
            checked: this.args.serviceAccount?.scopePublicApiProjectRead,
          },
          {
            key: ScopeNodeKey.SCAN_RESULTS_VA_READ,
            showCheckbox: this.isEditOrCreateView,
            checked: this.args.serviceAccount?.scopePublicApiScanResultVa,
          },
          {
            key: ScopeNodeKey.USER,
            label: this.intl.t('serviceAccountModule.scopes.user.label'),
            showCheckbox: this.isEditOrCreateView,
            children: [
              {
                key: ScopeNodeKey.USER_READ,
                showCheckbox: this.isEditOrCreateView,
                checked: this.args.serviceAccount?.scopePublicApiUserRead,
              },
              {
                key: ScopeNodeKey.USER_WRITE,
                showCheckbox: this.isEditOrCreateView,
                checked: this.args.serviceAccount?.scopePublicApiUserWrite,
              },
            ],
          },
          {
            key: ScopeNodeKey.UPLOAD,
            label: this.intl.t('serviceAccountModule.scopes.upload-app.label'),
            showCheckbox: this.isEditOrCreateView,
            children: [
              {
                key: ScopeNodeKey.UPLOAD_APP,
                showCheckbox: this.isEditOrCreateView,
                checked:
                  this.args.serviceAccount?.scopePublicApiUploadApp ||
                  this.args.serviceAccount?.scopeAutoApproveNewNameSpaces,
              },
              {
                key: ScopeNodeKey.AUTO_APPROVE_NEW_NAME_SPACES,
                showCheckbox: this.isEditOrCreateView,
                checked:
                  this.args.serviceAccount?.scopeAutoApproveNewNameSpaces,
              },
            ],
          },
          {
            key: ScopeNodeKey.TEAM_OPERATIONS,
            showCheckbox: this.isEditOrCreateView,
            checked: this.args.serviceAccount?.scopePublicApiTeamOperations,
          },
        ],
      },
    ]);
  }

  get dataObjectForNode(): Record<string, NodeDataObject> {
    return {
      [ScopeNodeKey.PUBLIC_API]: {
        scopeKeys: [
          'scopePublicApiProjectRead',
          'scopePublicApiScanResultVa',
          'scopePublicApiUserRead',
          'scopePublicApiUserWrite',
          'scopePublicApiUploadApp',
          'scopePublicApiTeamOperations',
          'scopeAutoApproveNewNameSpaces',
        ],
      },
      [ScopeNodeKey.PROJECTS_READ]: {
        scopeKeys: ['scopePublicApiProjectRead'],
        scopeLabel: this.intl.t('serviceAccountModule.scopes.projects.label'),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.projects.readDescription'
        ),
        accessType: this.intl.t('read'),
      },
      [ScopeNodeKey.SCAN_RESULTS_VA_READ]: {
        scopeKeys: ['scopePublicApiScanResultVa'],
        scopeLabel: this.intl.t(
          'serviceAccountModule.scopes.scan-results-va.label'
        ),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.scan-results-va.readDescription'
        ),
        accessType: this.intl.t('read'),
      },
      [ScopeNodeKey.USER]: {
        scopeKeys: ['scopePublicApiUserRead', 'scopePublicApiUserWrite'],
      },
      [ScopeNodeKey.USER_READ]: {
        scopeKeys: ['scopePublicApiUserRead'],
        scopeLabel: this.intl.t('serviceAccountModule.scopes.user.read'),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.user.readDescription'
        ),
        accessType: this.intl.t('read'),
      },
      [ScopeNodeKey.USER_WRITE]: {
        scopeKeys: ['scopePublicApiUserWrite'],
        scopeLabel: this.intl.t('serviceAccountModule.scopes.user.write'),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.user.writeDescription'
        ),
        accessType: this.intl.t('write'),
      },
      [ScopeNodeKey.UPLOAD_APP]: {
        scopeKeys: ['scopePublicApiUploadApp'],
        scopeLabel: this.intl.t('serviceAccountModule.scopes.upload-app.label'),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.upload-app.writeDescription'
        ),
        accessType: this.intl.t('write'),
      },
      [ScopeNodeKey.AUTO_APPROVE_NEW_NAME_SPACES]: {
        scopeKeys: ['scopeAutoApproveNewNameSpaces'],
        scopeLabel: this.intl.t(
          'serviceAccountModule.scopes.auto-approve-new-name-spaces.label'
        ),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.auto-approve-new-name-spaces.writeDescription'
        ),
        accessType: this.intl.t('write'),
      },
      [ScopeNodeKey.TEAM_OPERATIONS]: {
        scopeKeys: ['scopePublicApiTeamOperations'],
        scopeLabel: this.intl.t(
          'serviceAccountModule.scopes.team-operations.label'
        ),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.team-operations.description'
        ),
        accessType: `${this.intl.t('read')}, ${this.intl.t('write')}`,
      },
    };
  }

  @action
  handleShowEditView() {
    this.isEditView = true;
  }

  @action
  handleCancelEditView() {
    this.isEditView = false;

    this.args.serviceAccount.rollbackAttributes();
  }

  @action
  onExpand(...args: Parameters<AkTreeProviderCheckExpandFuncType>) {
    const [expanded] = args;

    this.expanded = expanded;
  }

  @action
  updateScopes(obj: NodeDataObject | undefined, checked: boolean) {
    obj?.scopeKeys?.forEach((key) => {
      this.args.serviceAccount.set(key, checked);
    });
  }

  // Special handling for Upload and Auto Approve scopes
  @action
  onCheck(...args: Parameters<AkTreeProviderCheckExpandFuncType>) {
    const [checked, node] = args;
    const dataObject = this.dataObjectForNode[node.key] as
      | NodeDataObject
      | undefined;

    this.checked = checked;

    // Update the node itself
    this.updateScopes(dataObject, Boolean(node.checked));

    if (
      node.key === ScopeNodeKey.UPLOAD ||
      node.key === ScopeNodeKey.UPLOAD_APP ||
      node.key === ScopeNodeKey.AUTO_APPROVE_NEW_NAME_SPACES
    ) {
      // Case 1: UPLOAD toggled → children follow
      if (node.key === ScopeNodeKey.UPLOAD) {
        [
          ScopeNodeKey.UPLOAD_APP,
          ScopeNodeKey.AUTO_APPROVE_NEW_NAME_SPACES,
        ].forEach((childKey) => {
          const childObj = this.dataObjectForNode[childKey];
          this.updateScopes(childObj, Boolean(node.checked));

          if (node.checked) {
            if (!this.checked.includes(childKey)) {
              this.checked = [...this.checked, childKey];
            }
          } else {
            this.checked = this.checked.filter((k) => k !== childKey);
          }
        });
      }

      // Case 2: UPLOAD_APP off → AUTO_APPROVE off
      if (node.key === ScopeNodeKey.UPLOAD_APP && !node.checked) {
        const autoApproveObj =
          this.dataObjectForNode[ScopeNodeKey.AUTO_APPROVE_NEW_NAME_SPACES];
        this.updateScopes(autoApproveObj, false);

        this.checked = this.checked.filter(
          (k) => k !== ScopeNodeKey.AUTO_APPROVE_NEW_NAME_SPACES
        );
      }

      // Case 3: AUTO_APPROVE on → force UPLOAD + UPLOAD_APP
      if (
        node.key === ScopeNodeKey.AUTO_APPROVE_NEW_NAME_SPACES &&
        node.checked
      ) {
        const uploadObj = this.dataObjectForNode[ScopeNodeKey.UPLOAD_APP];
        this.updateScopes(uploadObj, true);

        [ScopeNodeKey.UPLOAD, ScopeNodeKey.UPLOAD_APP].forEach(
          (requiredKey) => {
            if (!this.checked.includes(requiredKey)) {
              this.checked = [...this.checked, requiredKey];
            }
          }
        );
      }
    }
  }

  @action
  handleUpdateServiceAccount() {
    this.updateServiceAccount.perform();
  }

  updateServiceAccount = task(async () => {
    try {
      await this.args.serviceAccount.save();

      this.isEditView = false;

      this.notify.success(this.intl.t('serviceAccountModule.editSuccessMsg'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Section::SelectScope': typeof OrganizationServiceAccountSectionSelectScopeComponent;
  }
}
