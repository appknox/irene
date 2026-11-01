import { service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';
import type {
  AkTreeProviderCheckExpandFuncType,
  AkTreeNodeFlattenedProps,
} from 'irene/components/ak-tree/provider';
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
    | 'scopeCli'
    | 'cliScopeAutoApproveNewNameSpaces'
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
  CLI = 'cli',
  CLI_AUTO_APPROVE_NEW_NAME_SPACES = 'cli-auto-approve-new-name-spaces',
}

export default class OrganizationServiceAccountSectionSelectScopeComponent extends Component<OrganizationServiceAccountSectionSelectScopeSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked isEditView = false;
  @tracked expanded: string[] = [ScopeNodeKey.PUBLIC_API];
  // AkTree::Provider only re-derives its internal checked state from
  // @treeData on mount (its change observer doesn't reliably refire for
  // these autotracked args), so a cascaded update — e.g. unchecking a
  // parent — can leave children showing a stale checked state even
  // though the underlying scope fields are correct. Bumping this forces
  // the tree to remount (see select-scope.hbs) and re-derive fresh.
  @tracked treeVersion = 0;

  // Derived straight from treeData/the model on every access, rather than
  // kept as separately-mutated state — see the treeVersion comment above
  // for why hand-syncing this against the tree's own bookkeeping is unsafe.
  get checked(): string[] {
    const keys: string[] = [];

    const collect = (
      nodes: { key: string; checked?: boolean; children?: unknown[] }[]
    ) => {
      nodes.forEach((node) => {
        if (node.checked) {
          keys.push(node.key);
        }

        if (Array.isArray(node.children)) {
          collect(node.children as typeof nodes);
        }
      });
    };

    collect(this.treeData);

    return keys;
  }

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
        checked: Boolean(
          this.args.serviceAccount?.scopePublicApiProjectRead &&
          this.args.serviceAccount?.scopePublicApiScanResultVa &&
          this.args.serviceAccount?.scopePublicApiUserRead &&
          this.args.serviceAccount?.scopePublicApiUserWrite &&
          this.args.serviceAccount?.scopePublicApiUploadApp &&
          this.args.serviceAccount?.scopeAutoApproveNewNameSpaces &&
          this.args.serviceAccount?.scopePublicApiTeamOperations
        ),
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
            checked: Boolean(
              this.args.serviceAccount?.scopePublicApiUserRead &&
              this.args.serviceAccount?.scopePublicApiUserWrite
            ),
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
            checked: Boolean(
              this.args.serviceAccount?.scopePublicApiUploadApp &&
              this.args.serviceAccount?.scopeAutoApproveNewNameSpaces
            ),
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
      {
        key: ScopeNodeKey.CLI,
        showCheckbox: this.isEditOrCreateView,
        checked:
          this.args.serviceAccount?.scopeCli ||
          this.args.serviceAccount?.cliScopeAutoApproveNewNameSpaces,
        children: [
          {
            key: ScopeNodeKey.CLI_AUTO_APPROVE_NEW_NAME_SPACES,
            showCheckbox: this.isEditOrCreateView,
            checked: this.args.serviceAccount?.cliScopeAutoApproveNewNameSpaces,
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
      [ScopeNodeKey.CLI]: {
        scopeKeys: ['scopeCli'],
        scopeLabel: this.intl.t('serviceAccountModule.scopes.cli.label'),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.cli.description'
        ),
      },
      [ScopeNodeKey.CLI_AUTO_APPROVE_NEW_NAME_SPACES]: {
        scopeKeys: ['cliScopeAutoApproveNewNameSpaces'],
        scopeLabel: this.intl.t(
          'serviceAccountModule.scopes.cli-auto-approve-new-name-spaces.label'
        ),
        scopeDescription: this.intl.t(
          'serviceAccountModule.scopes.cli-auto-approve-new-name-spaces.description'
        ),
        accessType: this.intl.t('write'),
      },
    };
  }

  @action
  handleShowEditView() {
    this.isEditView = true;
    this.treeVersion++;
  }

  @action
  handleCancelEditView() {
    this.isEditView = false;

    this.args.serviceAccount.rollbackAttributes();
    this.treeVersion++;
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

  // Shared cascade for a (parent, primary-access child, auto-approve child)
  // triple — used identically by the public API's Upload group and the
  // CLI group:
  //   1. Toggling the parent cascades to both children.
  //   2. Turning the primary-access child off also turns auto-approve off
  //      (auto-approve is meaningless without the access it approves for).
  //   3. Turning auto-approve on forces the parent and primary-access
  //      child on too (can't auto-approve without that access).
  @action
  applyAutoApproveCascade(
    node: AkTreeNodeFlattenedProps,
    parentKey: ScopeNodeKey,
    primaryChildKey: ScopeNodeKey,
    autoApproveKey: ScopeNodeKey
  ) {
    if (
      node.key !== parentKey &&
      node.key !== primaryChildKey &&
      node.key !== autoApproveKey
    ) {
      return;
    }

    if (node.key === parentKey) {
      [primaryChildKey, autoApproveKey].forEach((childKey) => {
        this.updateScopes(
          this.dataObjectForNode[childKey],
          Boolean(node.checked)
        );
      });
    }

    if (node.key === primaryChildKey && !node.checked) {
      this.updateScopes(this.dataObjectForNode[autoApproveKey], false);
    }

    if (node.key === autoApproveKey && node.checked) {
      this.updateScopes(this.dataObjectForNode[primaryChildKey], true);
    }
  }

  // CLI's own row doubles as its "access" leaf (no separate access child —
  // see select-scope for why: one row, expandable to reveal Auto Approve).
  // Checking/unchecking CLI cascades to its one child, same as the Upload
  // group's parent-check cascade; unchecking the child alone leaves CLI
  // untouched (independently toggleable), and checking the child alone
  // forces CLI on (can't auto-approve without access).
  @action
  applyCliAutoApproveCascade(node: AkTreeNodeFlattenedProps) {
    if (
      node.key !== ScopeNodeKey.CLI &&
      node.key !== ScopeNodeKey.CLI_AUTO_APPROVE_NEW_NAME_SPACES
    ) {
      return;
    }

    if (node.key === ScopeNodeKey.CLI) {
      this.updateScopes(
        this.dataObjectForNode[ScopeNodeKey.CLI_AUTO_APPROVE_NEW_NAME_SPACES],
        Boolean(node.checked)
      );
    }

    if (
      node.key === ScopeNodeKey.CLI_AUTO_APPROVE_NEW_NAME_SPACES &&
      node.checked
    ) {
      this.updateScopes(this.dataObjectForNode[ScopeNodeKey.CLI], true);
    }
  }

  @action
  onCheck(...args: Parameters<AkTreeProviderCheckExpandFuncType>) {
    const [, node] = args;
    const dataObject = this.dataObjectForNode[node.key] as
      NodeDataObject | undefined;

    // Update the node itself
    this.updateScopes(dataObject, Boolean(node.checked));

    this.applyAutoApproveCascade(
      node,
      ScopeNodeKey.UPLOAD,
      ScopeNodeKey.UPLOAD_APP,
      ScopeNodeKey.AUTO_APPROVE_NEW_NAME_SPACES
    );

    this.applyCliAutoApproveCascade(node);

    this.treeVersion++;
  }

  @action
  handleUpdateServiceAccount() {
    this.updateServiceAccount.perform();
  }

  updateServiceAccount = task(async () => {
    try {
      await this.args.serviceAccount.save();

      this.isEditView = false;
      this.treeVersion++;

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
