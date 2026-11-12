import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';
import {
  isReachableOrPotentialFinding,
  reachabilityWitnessPathItems,
} from 'irene/utils/sbom-reachability';
import {
  RemediationEcosystem,
  type RemediationEcosystemValue,
  appCallerIndex,
  applicableFixVersion,
  coordinateFromBomRef,
  ecosystemFromBomRef,
  gradleConstraintSnippet,
  gradleDeclaredLine,
  gradleDirectSnippet,
  gradleInsightCommand,
  highestVersion,
  isPatchRelease,
  mavenCentralUrl,
  mavenGroup,
  npmDirectCommand,
  npmOverridesSnippet,
  parentCoordinate,
  podfileSnippet,
  releaseLine,
  upgradeCoverage,
  versionCatalogAlias,
} from 'irene/utils/sbom-remediation';

export interface SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationSignature {
  Args: {
    sbomVulnerabilityAudit: SbomVulnerabilityAuditModel;
    sbomComponent?: SbomComponentModel | null;
    /** Every vulnerability of the component, for the shared upgrade. */
    componentAudits?: SbomVulnerabilityAuditModel[] | null;
    /** Called when an eligible finding renders, to load the full list lazily. */
    onNeedAllAudits?: () => void;
  };
}

/** Where each ecosystem declares a direct dependency. */
const FIND_KEYS: Record<RemediationEcosystemValue, string> = {
  [RemediationEcosystem.MAVEN]: 'sbomModule.remediation.find.maven',
  [RemediationEcosystem.NPM]: 'sbomModule.remediation.find.npm',
  [RemediationEcosystem.COCOAPODS]: 'sbomModule.remediation.find.cocoapods',
  [RemediationEcosystem.OTHER]: 'sbomModule.remediation.find.other',
};

interface RetestRow {
  entry: string;
  caller: string | null;
  advisories: string[];
}

function advisoryIdOf(audit: SbomVulnerabilityAuditModel): string {
  return audit.sbVulnerability?.get?.('vulnerabilityId') ?? '';
}

/** First unaffected version of one finding, from its advisory ranges. */
function auditFixVersion(
  audit: SbomVulnerabilityAuditModel,
  current: string | null
): string | null {
  const fixes = (audit.parsedVersions ?? [])
    .map((parsed) =>
      parsed.version_range
        ? audit.humanizedVersionRange(parsed.version_range)?.fixedRange
        : null
    )
    .filter(Boolean) as string[];

  return applicableFixVersion(fixes, current);
}

/** Entry and app caller of a reachable finding's witness, in short form. */
function retestRoute(
  audit: SbomVulnerabilityAuditModel,
  libraryPackage: string | null
): { entry: string; caller: string | null } | null {
  if (!isReachableOrPotentialFinding(audit.reachability)) {
    return null;
  }

  const frames = reachabilityWitnessPathItems(audit.reachability);
  const [entry] = frames;

  if (!entry) {
    return null;
  }

  const callerIndex = appCallerIndex(frames, libraryPackage);

  return {
    entry: entry.shortDisplay,
    caller:
      callerIndex === null ? null : (frames[callerIndex]?.shortDisplay ?? null),
  };
}

export default class SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationComponent extends Component<SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationSignature> {
  /** The whole section starts collapsed to its one-line summary. */
  @tracked isExpanded = false;

  /** The long Android Studio walkthrough inside step 1. */
  @tracked showDetailedSteps = false;

  bodyId = `sbom-remediation-body-${guidFor(this)}`;
  substepsId = `sbom-remediation-substeps-${guidFor(this)}`;

  constructor(
    owner: unknown,
    args: SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationSignature['Args']
  ) {
    super(owner, args);

    if (this.isEligible) {
      this.args.onNeedAllAudits?.();
    }
  }

  @action
  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  @action
  toggleDetailedSteps() {
    this.showDetailedSteps = !this.showDetailedSteps;
  }

  get reachability() {
    return this.args.sbomVulnerabilityAudit.reachability;
  }

  /**
   * Remediation is only offered where the finding is believed to matter:
   * Reachable or Potentially reachable, judged like the verdict chip.
   */
  get isEligible() {
    return isReachableOrPotentialFinding(this.reachability);
  }

  /** The first unaffected version for this finding alone. */
  get ownFixVersion() {
    return auditFixVersion(
      this.args.sbomVulnerabilityAudit,
      this.currentVersion
    );
  }

  /**
   * Every vulnerability of the component, when the list passed them down;
   * otherwise just this one. Used for the single upgrade and for retest.
   */
  get componentAudits() {
    const audit = this.args.sbomVulnerabilityAudit;
    const audits = this.args.componentAudits ?? [];

    return audits.includes(audit) ? audits : [audit, ...audits];
  }

  get coverage() {
    return upgradeCoverage(
      this.componentAudits.map((a) => auditFixVersion(a, this.currentVersion))
    );
  }

  /**
   * One version that fixes everything with a known fix. Without a fix for
   * this finding there is nothing to bump to, so the section is withheld
   * rather than guessing at the component's latest release.
   */
  get fixVersion() {
    if (!this.ownFixVersion) {
      return null;
    }

    return highestVersion([this.coverage.version, this.ownFixVersion]);
  }

  /** "Also fixes" context, when the shared upgrade goes past this fix. */
  get showOwnFixNote() {
    return Boolean(
      this.ownFixVersion && this.ownFixVersion !== this.fixVersion
    );
  }

  get coverageKey() {
    const { fixedCount, total } = this.coverage;

    if (total <= 1) {
      return 'sbomModule.remediation.coverage.single';
    }

    return fixedCount === total
      ? 'sbomModule.remediation.coverage.all'
      : 'sbomModule.remediation.coverage.partial';
  }

  get upgradeVersionUrl() {
    return this.isMaven
      ? mavenCentralUrl(this.coordinate, this.fixVersion)
      : null;
  }

  get shouldShow() {
    return Boolean(
      this.isEligible && this.fixVersion && this.component && this.componentName
    );
  }

  /** Step 1's one-sentence answer to "where is it declared". */
  get findKey() {
    if (this.isTransitive) {
      return 'sbomModule.remediation.find.transitive';
    }

    return FIND_KEYS[this.ecosystem];
  }

  /**
   * The Android Studio walkthrough only exists for gradle builds, and needs
   * a real coordinate and something to search the build file for.
   */
  get hasDetailedSteps() {
    return Boolean(this.isMaven && this.coordinate && this.searchTarget);
  }

  /** A snippet needs a real coordinate; one without would be made up. */
  get hasUpgradeSnippet() {
    return Boolean(this.coordinate);
  }

  get component() {
    return this.args.sbomComponent ?? null;
  }

  get componentName() {
    return this.component?.name ?? '';
  }

  get currentVersion() {
    return this.component?.version ? this.component.cleanVersion : null;
  }

  get coordinate() {
    return coordinateFromBomRef(this.component?.bomRef);
  }

  get ecosystem() {
    return ecosystemFromBomRef(this.component?.bomRef);
  }

  get isMaven() {
    return this.ecosystem === RemediationEcosystem.MAVEN;
  }

  get isNpm() {
    return this.ecosystem === RemediationEcosystem.NPM;
  }

  get isCocoapods() {
    return this.ecosystem === RemediationEcosystem.COCOAPODS;
  }

  get isGeneric() {
    return this.ecosystem === RemediationEcosystem.OTHER;
  }

  get isTransitive() {
    return Boolean(this.component?.isDependency && this.parentName);
  }

  get parentName() {
    return this.component?.via || null;
  }

  get parentVersion() {
    return this.component?.viaVersion || null;
  }

  get parentCoordinate() {
    return parentCoordinate(this.parentName, this.ecosystem);
  }

  get advisoryId() {
    return advisoryIdOf(this.args.sbomVulnerabilityAudit);
  }

  /** Advisories fixed by the upgrade, for the gradle `because`. */
  get fixedAdvisoryIds() {
    const ids = this.componentAudits
      .filter((a) => auditFixVersion(a, this.currentVersion))
      .map(advisoryIdOf)
      .filter(Boolean);

    return ids.length ? ids.join(', ') : this.advisoryId;
  }

  /** The parent's artifact name, which is what the build file spells. */
  get parentArtifact() {
    return this.parentName?.split(/[/:]/).pop() ?? null;
  }

  /** What to search the build file for: the parent for transitives. */
  get searchTarget() {
    return this.isTransitive ? this.parentArtifact : this.componentName;
  }

  get catalogAlias() {
    return versionCatalogAlias(this.searchTarget);
  }

  get importPackage() {
    return mavenGroup(this.coordinate) ?? this.componentName;
  }

  /** `app → parent → component`, the chain shown for transitive findings. */
  get dependencyChain() {
    return [this.parentName as string, this.componentName].filter(
      Boolean
    ) as string[];
  }

  get isPatchBump() {
    return isPatchRelease(this.currentVersion, this.fixVersion);
  }

  get fixReleaseLine() {
    return releaseLine(this.fixVersion);
  }

  get declaredLine() {
    return gradleDeclaredLine(
      this.parentCoordinate ?? this.coordinate,
      this.isTransitive ? this.parentVersion : this.currentVersion
    );
  }

  get insightCommand() {
    return gradleInsightCommand(this.coordinate);
  }

  get upgradeSnippet() {
    const fix = this.fixVersion as string;

    if (this.isNpm) {
      return this.isTransitive
        ? npmOverridesSnippet(this.coordinate, fix)
        : npmDirectCommand(this.coordinate, fix);
    }

    if (this.isCocoapods) {
      return podfileSnippet(this.coordinate, fix);
    }

    return this.isTransitive
      ? gradleConstraintSnippet(this.coordinate, fix, this.fixedAdvisoryIds)
      : gradleDirectSnippet(this.coordinate, fix);
  }

  get upgradeFileLabel() {
    if (this.isNpm) {
      return 'package.json';
    }

    if (this.isCocoapods) {
      return 'Podfile';
    }

    return 'app/build.gradle.kts';
  }

  /**
   * Entry points worth exercising after the bump, from the witnesses of the
   * component's reachable findings. Each row runs entry → app caller → lib,
   * and findings sharing an entry and caller are grouped into one row.
   */
  get retestRows() {
    const libraryPackage = this.isMaven ? mavenGroup(this.coordinate) : null;
    const rows = new Map<string, RetestRow>();

    for (const audit of this.componentAudits) {
      const route = retestRoute(audit, libraryPackage);

      if (!route) {
        continue;
      }

      const key = `${route.entry}|${route.caller ?? ''}`;
      const row = rows.get(key) ?? { ...route, advisories: [] };

      row.advisories.push(advisoryIdOf(audit));
      rows.set(key, row);
    }

    return [...rows.values()].map((row) => ({
      ...row,
      advisories: row.advisories.filter(Boolean).join(', '),
    }));
  }

  get libraryLabel() {
    return [this.componentName, this.currentVersion].filter(Boolean).join(' ');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Remediation': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationComponent;
    'sbom/component-details/vulnerabilities/detail-wrapper/remediation': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationComponent;
  }
}
