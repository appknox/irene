import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type SkThirdPartyAppModel from 'irene/models/sk-third-party-app';
import type { SkThirdPartyAppFinding } from 'irene/models/sk-third-party-app';
import type { AkChipColor } from 'irene/components/ak-chip';
import type { AkIconColorVariant } from 'irene/components/ak-icon';

interface Signature {
  Args: {
    app: SkThirdPartyAppModel;
  };
}

export interface FindingGroup {
  id: string;
  label: string;
  description: string | null;
  findings: SkThirdPartyAppFinding[];
  potentialRiskCount: number;
}

const CATEGORY_DESCRIPTION_KEYS = new Map<string, string>([
  [
    'sensitive_capabilities',
    'storeknox.thirdPartyFinding.categoryDescriptions.sensitiveCapabilities',
  ],
  [
    'device_manipulation',
    'storeknox.thirdPartyFinding.categoryDescriptions.deviceManipulation',
  ],
  [
    'monitoring_indicators',
    'storeknox.thirdPartyFinding.categoryDescriptions.monitoringIndicators',
  ],
  [
    'control_bypass',
    'storeknox.thirdPartyFinding.categoryDescriptions.controlBypass',
  ],
  [
    'suspicious_indicators',
    'storeknox.thirdPartyFinding.categoryDescriptions.suspiciousIndicators',
  ],
]);

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info'] as const;

type SeverityKey = (typeof SEVERITY_ORDER)[number];

const POTENTIAL_RISK_ICON = 'fluent:shield-error-24-regular';
const NO_RISK_ICON = 'fluent:shield-task-24-regular';

function toSeverityKey(raw: string): SeverityKey {
  const lower = raw.toLowerCase();
  return (SEVERITY_ORDER as readonly string[]).includes(lower)
    ? (lower as SeverityKey)
    : 'info';
}

function humanizeCategory(category: string) {
  return category
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export interface RiskCountChip {
  label: string;
  count: number;
  color: AkChipColor;
}

export default class StoreknoxThirdPartyScansAppDetailsTechnicalDetailsComponent extends Component<Signature> {
  @service declare intl: IntlService;

  get riskCounts(): RiskCountChip[] {
    const findings = this.args.app?.findings ?? [];

    const potentialRisks = findings.filter((f) => f.is_potential_risk).length;

    return [
      {
        label: this.intl.t('storeknox.thirdPartyFinding.potentialRisks'),
        count: potentialRisks,
        color: 'error',
      },
      {
        label: this.intl.t('storeknox.thirdPartyFinding.noRisksDetected'),
        count: findings.length - potentialRisks,
        color: 'success',
      },
    ];
  }

  get findingGroupIds() {
    return this.findingGroups.map((g) => g.id);
  }

  get findingGroups(): FindingGroup[] {
    const findings = this.args.app?.findings ?? [];
    const grouped = new Map<string, SkThirdPartyAppFinding[]>();

    for (const finding of findings) {
      const key = (finding.category ?? 'others').toLowerCase();

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key)!.push(finding);
    }

    return [...grouped.entries()].map(([category, categoryFindings]) => ({
      id: category,
      label: humanizeCategory(category),
      description: this.categoryDescription(category),
      findings: categoryFindings.sort(
        (a, b) =>
          SEVERITY_ORDER.indexOf(toSeverityKey(a.severity ?? 'info')) -
          SEVERITY_ORDER.indexOf(toSeverityKey(b.severity ?? 'info'))
      ),
      potentialRiskCount: categoryFindings.filter((f) => f.is_potential_risk)
        .length,
    }));
  }

  categoryDescription(category: string) {
    const key = CATEGORY_DESCRIPTION_KEYS.get(
      category.toLowerCase().replace(/[\s-]+/g, '_')
    );

    return key ? this.intl.t(key) : null;
  }

  riskChipLabel = (finding: SkThirdPartyAppFinding) => {
    return finding.is_potential_risk
      ? this.intl.t('storeknox.thirdPartyFinding.potentialRisk')
      : this.intl.t('storeknox.thirdPartyFinding.noRiskDetected');
  };

  riskChipColor = (finding: SkThirdPartyAppFinding): AkChipColor => {
    return finding.is_potential_risk ? 'error' : 'success';
  };

  riskIcon(finding: SkThirdPartyAppFinding) {
    return finding.is_potential_risk ? POTENTIAL_RISK_ICON : NO_RISK_ICON;
  }

  riskIconColor(finding: SkThirdPartyAppFinding): AkIconColorVariant {
    return finding.is_potential_risk ? 'error' : 'success';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::ThirdPartyScans::AppDetails::TechnicalDetails': typeof StoreknoxThirdPartyScansAppDetailsTechnicalDetailsComponent;
  }
}
