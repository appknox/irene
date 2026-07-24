import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SbomComponentModel from 'irene/models/sbom-component';

interface DrawerField {
  label: string;
  value: string | null;
  isLink?: boolean;
}

export interface AiBomComponentDrawerSignature {
  Element: HTMLDivElement;
  Args: {
    component: SbomComponentModel | null;
    open: boolean;
    onClose: () => void;
  };
}

export default class AiBomComponentDrawerComponent extends Component<AiBomComponentDrawerSignature> {
  @service declare intl: IntlService;

  get componentName() {
    return this.args.component?.name || '-';
  }

  // Delegates to the model's aiTypeLabel rather than keeping a second,
  // independent artifact-class-to-label map here -- this field and the
  // AI-BOM table's "Component Type" column must always show the exact
  // same bucketed label (see sbom-component.ts#aiTypeLabel).
  get componentType() {
    return this.args.component?.aiTypeLabel ?? '-';
  }

  get foundInValue() {
    if (!this.args.component?.hasFoundLocations) {
      return null;
    }

    const locations = this.args.component.evidenceLocations;
    if (locations.length === 1) {
      return locations[0];
    }
    return `${locations[0]} (+${locations.length - 1} more)`;
  }

  get foundInTooltip() {
    if (!this.args.component?.hasFoundLocations) {
      return null;
    }

    const locations = this.args.component.evidenceLocations;
    return locations.length > 1 ? locations.join('\n') : null;
  }

  get referenceLink() {
    const link = this.args.component?.primaryLink;
    return link && link !== '-' ? link : null;
  }

  get familyValue() {
    const family = this.args.component?.aiFamily;
    return family && family !== '-' ? family : null;
  }

  // Component Type now shows one bucketed "Supporting Artifact" label for
  // tokenizer/config/supporting -- AI Role only adds real information for
  // those three (the specific kind within that bucket). For every other
  // artifact class, Role would just restate Type in different words, so
  // it's hidden there.
  get isSupportingArtifactSubtype() {
    const artifactClass = this.args.component?.aiArtifactClass;
    return (
      artifactClass === 'tokenizer' ||
      artifactClass === 'config' ||
      artifactClass === 'supporting'
    );
  }

  get aiRoleLabel() {
    if (!this.isSupportingArtifactSubtype) {
      return null;
    }

    const key = this.args.component?.aiDisplayLabelKey;
    return key ? this.intl.t(key) : null;
  }

  // Falls back to aiModelCategory (for "model", where it's more specific
  // than the generic fallback -- e.g. "Image Classification" vs "General AI
  // Model"), then to aiPurposeFallback (enola's deterministic purpose-per-
  // artifact-class mapping, covering every other class: secret, tokenizer,
  // config, supporting, cloud_endpoint, platform_managed_ai, library).
  // Only used when the backend's ai_purpose is empty -- covers components
  // scanned before purpose-emission existed in the pipeline.
  get purposeValue() {
    return (
      this.args.component?.aiPurpose ||
      this.args.component?.aiModelCategory ||
      this.args.component?.aiPurposeFallback ||
      null
    );
  }

  get associatedModelValue() {
    return this.args.component?.aiAssociatedModelPath || null;
  }

  get drawerFields(): DrawerField[] {
    return [
      {
        label: this.intl.t('sbomModule.componentType'),
        value: this.componentType,
      },
      {
        label: this.intl.t('sbomModule.foundInLocations'),
        value: this.foundInValue,
      },
      {
        label: this.intl.t('sbomModule.referenceLink'),
        value: this.referenceLink,
        isLink: true,
      },
      {
        label: this.intl.t('sbomModule.aiFamilyColumn'),
        value: this.familyValue,
      },
      {
        label: this.intl.t('sbomModule.aiRoleColumn'),
        value: this.aiRoleLabel,
      },
      {
        label: this.intl.t('sbomModule.aiPurposeColumn'),
        value: this.purposeValue,
      },
      {
        label: this.intl.t('sbomModule.aiAssociatedModel'),
        value: this.associatedModelValue,
      },
    ].filter((field) => field.value !== null) as DrawerField[];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ScanDetails::AiBomComponentDrawer': typeof AiBomComponentDrawerComponent;
  }
}
