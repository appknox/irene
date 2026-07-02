import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { TrackedMap } from 'tracked-built-ins';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import {
  validateStep,
  type StepValidationError,
} from './steps-table/step-validation';

import {
  configForAction,
  type StepActionConfig,
} from './steps-table/step-actions';

import { ScenarioStepAction } from 'irene/models/scenario-step';
import parseError from 'irene/utils/parse-error';
import type ProjectModel from 'irene/models/project';
import type ScenarioUserRoleModel from 'irene/models/scenario-user-role';
import type ScenarioStepModel from 'irene/models/scenario-step';
import type ScenarioDetailModel from 'irene/models/scenario-detail';

// Login scenarios support at most three user roles, each with their own steps.
export const MAX_LOGIN_ROLES = 3;

interface ProjectSettingsDastAutomationScenarioViewV2Signature {
  Args: {
    project: ProjectModel | null;
    scenarioDetail: ScenarioDetailModel;
  };
}

export default class ProjectSettingsDastAutomationScenarioViewV2Component extends Component<ProjectSettingsDastAutomationScenarioViewV2Signature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked roles: ScenarioUserRoleModel[] = [];
  @tracked allSteps: ScenarioStepModel[] = [];
  @tracked addStepsAnchorRef: HTMLElement | null = null;

  @tracked stepErrors = new TrackedMap<
    ScenarioStepModel,
    StepValidationError
  >();

  constructor(
    owner: unknown,
    args: ProjectSettingsDastAutomationScenarioViewV2Signature['Args']
  ) {
    super(owner, args);

    this.roles = args.scenarioDetail.roles.slice();
    this.allSteps = args.scenarioDetail.steps.slice();
  }

  // ─── Args & UI state ────────────────────────────────────────────────────────

  get scenarioDetail() {
    return this.args.scenarioDetail;
  }

  get showEmptyContainer() {
    return (
      (this.scenarioDetail.isLoginType && this.roles.length === 0) ||
      (this.scenarioDetail.isOtherType && this.allSteps.length === 0)
    );
  }

  get canAddRole() {
    return (
      this.scenarioDetail.isLoginType && this.roles.length < MAX_LOGIN_ROLES
    );
  }

  // ─── Dirty tracking ─────────────────────────────────────────────────────────

  get addedRoles() {
    return this.roles.filter((r) => !r.id);
  }

  get renamedRoles() {
    return this.roles.filter((r) => r.id && r.hasDirtyAttributes);
  }

  get removedRoleIds() {
    const localIds = new Set(this.roles.filter((r) => r.id).map((r) => r.id));

    return this.scenarioDetail.roles
      .filter((r) => !localIds.has(r.id))
      .map((r) => r.id);
  }

  get rolesWithChangedSteps() {
    return this.roles.filter((role) =>
      this.roleStepsHaveChanged(role, this.stepsForRole(role))
    );
  }

  get hasScenarioStepsChanged() {
    if (this.allSteps.some((s) => s.hasDirtyAttributes)) {
      return true;
    }

    const localIds = new Set(
      this.allSteps.filter((s) => s.id).map((s) => s.id)
    );

    return this.scenarioDetail.steps.slice().some((s) => !localIds.has(s.id));
  }

  get hasUnsavedChanges() {
    if (this.scenarioDetail.get('hasDirtyAttributes')) {
      return true;
    }

    if (this.scenarioDetail.isLoginType) {
      return (
        this.addedRoles.length > 0 ||
        this.renamedRoles.length > 0 ||
        this.removedRoleIds.length > 0 ||
        this.rolesWithChangedSteps.length > 0
      );
    }

    return this.hasScenarioStepsChanged;
  }

  /**
   * A role's steps have changed if any local step is new/edited/reordered
   * (dirty) or if a persisted server step has been removed from the local
   * list (deletion).
   */
  @action
  roleStepsHaveChanged(
    role: ScenarioUserRoleModel,
    localSteps: ScenarioStepModel[]
  ) {
    if (localSteps.some((s) => s.hasDirtyAttributes)) {
      return true;
    }

    const localIds = new Set(localSteps.filter((s) => s.id).map((s) => s.id));

    return this.scenarioDetail.steps
      .filter((s) => s.belongsTo('role').value() === role)
      .some((s) => !localIds.has(s.id));
  }

  // ─── Popover & step queries ─────────────────────────────────────────────────

  @action closeAddStepsPopover() {
    this.addStepsAnchorRef = null;
  }

  @action openAddStepsPopoverAnchorRef(event: MouseEvent) {
    this.addStepsAnchorRef = event.currentTarget as HTMLElement;
  }

  @action stepsForRole(role: ScenarioUserRoleModel) {
    return this.allSteps.filter((step) => step.role.content === role);
  }

  @action handleStepsChange(
    role: ScenarioUserRoleModel | null,
    updatedSteps: ScenarioStepModel[]
  ) {
    if (!role) {
      this.allSteps = updatedSteps;

      return;
    }

    const otherSteps = this.allSteps.filter((s) => s.role.content !== role);
    this.allSteps = [...otherSteps, ...updatedSteps];
  }

  // ─── Record creation ────────────────────────────────────────────────────────

  @action
  createRole() {
    const role = this.store.createRecord('scenario-user-role', {
      name: `User Role #${this.roles.length + 1}`,
    });

    this.roles = [...this.roles, role];
    return role;
  }

  @action
  createStep(role: ScenarioUserRoleModel | null, config: StepActionConfig) {
    const roleSteps = this.allSteps.filter((s) => s.role.content === role);
    const roleStepCount = roleSteps.length;

    return this.store.createRecord('scenario-step', {
      role,
      order: roleStepCount + 1,
      action: config.action,
      identifier: '',
      value: config.defaultValue ?? '',
      isSecure: false,
      scenario: this.args.scenarioDetail,
    });
  }

  @action addRole() {
    if (!this.canAddRole) {
      return;
    }

    const role = this.createRole();
    const tapConfig = configForAction(ScenarioStepAction.TAP);

    if (tapConfig) {
      const step = this.createStep(role, tapConfig);
      this.allSteps = [...this.allSteps, step];
    }
  }

  @action addStep(config: StepActionConfig) {
    // Login steps must belong to a role — reuse the existing one, only
    // creating a role when none exists yet.
    const role = this.scenarioDetail.isLoginType
      ? (this.roles[0] ?? this.createRole())
      : null;

    const step = this.createStep(role, config);

    this.allSteps = [...this.allSteps, step];
    this.closeAddStepsPopover();
  }

  // ─── Validation errors ──────────────────────────────────────────────────────

  @action clearStepError(
    step: ScenarioStepModel,
    field?: 'identifier' | 'value'
  ) {
    const existing = this.stepErrors.get(step);

    if (!existing) {
      return;
    }

    if (!field) {
      this.stepErrors.delete(step);

      return;
    }

    const next: StepValidationError = { ...existing };

    delete next[field];

    if (!next.identifier && !next.value) {
      this.stepErrors.delete(step);
    } else {
      this.stepErrors.set(step, next);
    }
  }

  // ─── Payload builders ───────────────────────────────────────────────────────

  /**
   * Shared base shape — every step we send carries these fields. The two
   * wrappers below only differ in whether `role` is included (OTHER requires
   * `role: null`, the per-role endpoint omits it entirely).
   */
  @action
  getStepBase(step: ScenarioStepModel) {
    return {
      ...(step.id ? { id: step.id } : {}),
      order: step.order,
      action: step.action,
      identifier: step.identifier,
      value: step.value,
      is_secure: step.isSecure,
    };
  }

  @action
  buildScenarioStepsPayload() {
    return this.allSteps.map((step) => ({
      ...this.getStepBase(step),
      role: null,
    }));
  }

  @action
  buildRoleStepsPayload(steps: ScenarioStepModel[]) {
    return steps.map((step) => this.getStepBase(step));
  }

  // ─── Cancel ─────────────────────────────────────────────────────────────────

  @action
  cancelScenario() {
    for (const role of this.roles) {
      if (role.get('isNew')) {
        role.unloadRecord();
      }
    }

    for (const step of this.allSteps) {
      if (step.get('isNew')) {
        step.unloadRecord();
      }
    }

    for (const role of this.args.scenarioDetail.roles.slice()) {
      if (role.get('hasDirtyAttributes')) {
        role.rollbackAttributes();
      }
    }

    for (const step of this.args.scenarioDetail.steps.slice()) {
      if (step.get('hasDirtyAttributes')) {
        step.rollbackAttributes();
      }
    }

    this.roles = this.args.scenarioDetail.roles.slice();
    this.allSteps = this.args.scenarioDetail.steps.slice();
    this.stepErrors = new TrackedMap();
  }

  // ─── Unsaved role deletion ───────────────────────────────────────────────────
  @action
  deleteUnsavedRole(
    role: ScenarioUserRoleModel,
    roleSteps: ScenarioStepModel[]
  ) {
    for (const step of roleSteps) {
      if (step.get('isNew')) {
        step.unloadRecord();
      }
    }

    this.allSteps = this.allSteps.filter((s) => !roleSteps.includes(s));
    this.roles = this.roles.filter((r) => r !== role);

    role.unloadRecord();
  }

  // ─── Save flow ──────────────────────────────────────────────────────────────

  @action handleSaveClick() {
    const errors = new TrackedMap<ScenarioStepModel, StepValidationError>();

    for (const step of this.allSteps) {
      const err = validateStep(step);

      if (err) {
        errors.set(step, err);
      }
    }

    this.stepErrors = errors;

    if (errors.size > 0) {
      this.notify.error(
        this.intl.t('dastAutomation.validation.fixErrorsToSave')
      );

      return;
    }

    this.saveScenario.perform();
  }

  /**
   * Save flow for Login scenarios:
   *   a. Bulk-create any brand-new roles, resolving their server IDs by name.
   *   b. Rename any existing roles whose name was edited locally.
   *   c. For each role with changes, bulk-update its steps via the per-role
   *      endpoint. New roles always qualify (their seeded steps are dirty).
   */
  @action
  async saveLoginRolesAndSteps(projectId: string | number) {
    const roleIdLookup = new Map<ScenarioUserRoleModel, string | number>();

    for (const role of this.roles) {
      if (role.id) {
        roleIdLookup.set(role, role.id);
      }
    }

    // a. Bulk-create new roles, then resolve server IDs by case-insensitive
    //    name match.
    if (this.addedRoles.length > 0) {
      const created = await this.scenarioDetail.bulkCreateRoles(projectId, {
        roles: this.addedRoles.map((r) => ({ name: r.name })),
      });

      for (const localRole of this.addedRoles) {
        const serverRole = created.find(
          (s) => s.name.toLowerCase() === localRole.name.toLowerCase()
        );

        if (serverRole) {
          roleIdLookup.set(localRole, serverRole.id);
        }
      }
    }

    // b. Rename roles whose name was edited locally.
    for (const role of this.renamedRoles) {
      await this.scenarioDetail.updateRole(projectId, role.id, {
        name: role.name,
      });
    }

    // c. Bulk-update steps for each role that has changes.
    for (const role of this.rolesWithChangedSteps) {
      const roleId = roleIdLookup.get(role);

      if (!roleId) {
        continue;
      }

      const roleSteps = this.allSteps.filter(
        (s) => s.belongsTo('role').value() === role
      );

      await this.scenarioDetail.bulkUpdateRoleSteps(projectId, roleId, {
        steps: this.buildRoleStepsPayload(roleSteps),
      });
    }
  }

  private extractStepMessages(detail: unknown): string[] {
    if (!detail || typeof detail !== 'object') {
      return [];
    }

    return Object.values(detail)
      .map((value) => (Array.isArray(value) ? value[0] : value))
      .filter((value) => typeof value === 'string' && value.length > 0);
  }

  getFirstBulkStepCreationError(err: AdapterError): string | null {
    const errors = err.errors ?? [];

    return (
      errors
        .flatMap((error) => this.extractStepMessages(error.detail))
        .slice(0, 1)[0] ?? null
    );
  }

  saveScenario = task(async () => {
    const projectId = this.args.project?.id;

    // Early return if there are no unsaved changes or no project ID.
    if (!projectId || !this.hasUnsavedChanges) {
      return;
    }

    try {
      // Persist roles and steps. Model methods push their responses into
      // the store, so scenarioDetail.roles/.steps are already fresh by
      // the time we re-source local arrays below.
      if (this.scenarioDetail.isLoginType) {
        await this.saveLoginRolesAndSteps(projectId);
      } else if (this.hasScenarioStepsChanged) {
        const steps = this.buildScenarioStepsPayload();
        await this.scenarioDetail.bulkUpdateSteps(projectId, { steps });
      }

      // Re-source local arrays from the now-fresh store state (updated by the adapter).
      this.roles = this.scenarioDetail.roles.slice();
      this.allSteps = this.scenarioDetail.steps.slice();
      this.stepErrors = new TrackedMap();

      this.notify.success(this.intl.t('dastAutomation.scenarioUpdated'));
    } catch (err) {
      const error = err as AdapterError;

      const message =
        this.getFirstBulkStepCreationError(error) ??
        parseError(error, this.intl.t('somethingWentWrong'));

      this.notify.error(message);
    }
  });

  deleteRole = task(async (role: ScenarioUserRoleModel) => {
    const roleSteps = this.allSteps.filter((s) => s.role.content === role);

    // Delete step errors for the role.
    for (const step of roleSteps) {
      this.stepErrors.delete(step);
    }

    // If the role is unsaved, delete it locally and return.
    if (role.get('isNew')) {
      this.deleteUnsavedRole(role, roleSteps);

      return;
    }

    try {
      const projectId = String(this.args.project?.id);
      await this.scenarioDetail.deleteRole(projectId, role.id);

      // Reload the scenario detail; pushes a fresh roles/steps payload into the store.
      await this.store.queryRecord('scenario-detail', {
        id: this.scenarioDetail.id,
        projectId,
      });

      this.roles = this.scenarioDetail.roles.slice();
      this.allSteps = this.scenarioDetail.steps.slice();

      this.notify.success(this.intl.t('dastAutomation.roleDeleted'));
    } catch (err) {
      this.notify.error(parseError(err, this.intl.t('somethingWentWrong')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2': typeof ProjectSettingsDastAutomationScenarioViewV2Component;
  }
}
