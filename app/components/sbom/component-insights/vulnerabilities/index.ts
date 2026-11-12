import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type LoggerService from 'irene/services/logger';
import type SbomComponentModel from 'irene/models/sbom-component';
import type SbomVulnerabilityAuditModel from 'irene/models/sbom-vulnerability-audit';
import { VulnerabilitySeverity } from 'irene/models/sbom-vulnerability';
import * as semver from 'semver';

export interface SbomComponentInsightsVulnerabilitiesSignature {
  Element: HTMLElement;
  Args: {
    sbomComponent: SbomComponentModel;
    /** `vulnerabilityId` (or its CVE from `sourceUrl`) of the vulnerability to show. */
    selectedId?: string | null;
    /** Called with the `vulnerabilityId` of the vulnerability the pager moved to. */
    onSelect: (displayId: string) => void;
  };
}

/** CVE id named in an advisory `sourceUrl`, if any. */
function cveFromSourceUrl(url?: string | null) {
  const cve = /CVE-\d{4}-\d{4,}/i.exec(url ?? '');

  return cve ? cve[0].toUpperCase() : null;
}

/** Page size of the first request; a second one fetches the remainder. */
const FIRST_PAGE_LIMIT = 100;

/** Upper bound on how many vulnerabilities the pager loads. */
const MAX_VULNERABILITIES = 500;

/**
 * Vulnerabilities section of the insights page: a pager over every
 * vulnerability of the component, rendering the shared detail panel for the
 * selected one.
 */
export default class SbomComponentInsightsVulnerabilitiesComponent extends Component<SbomComponentInsightsVulnerabilitiesSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare logger: LoggerService;

  @tracked audits: SbomVulnerabilityAuditModel[] = [];
  @tracked loadFailed = false;

  constructor(
    owner: unknown,
    args: SbomComponentInsightsVulnerabilitiesSignature['Args']
  ) {
    super(owner, args);

    this.fetchVulnerabilities.perform();
  }

  get total() {
    return this.audits.length;
  }

  get hasNoVulnerabilities() {
    return this.total === 0;
  }

  /** Matches `selectedId` case-insensitively; missing or unknown is first. */
  get currentIndex() {
    const wanted = this.args.selectedId?.trim().toLowerCase();

    if (!wanted) {
      return 0;
    }

    const index = this.audits.findIndex(
      (audit) =>
        audit.sbVulnerability?.vulnerabilityId?.toLowerCase() === wanted ||
        cveFromSourceUrl(audit.sbVulnerability?.sourceUrl)?.toLowerCase() ===
          wanted
    );

    return index === -1 ? 0 : index;
  }

  get current() {
    return this.audits[this.currentIndex];
  }

  get reachability() {
    return this.current?.reachability ?? null;
  }

  /**
   * Label for the id link: the CVE id when known (the id itself, or a CVE
   * found in the advisory `sourceUrl`; the API exposes no alias list),
   * otherwise the id as stored (e.g. GHSA-*).
   */
  get displayId() {
    const vulnerability = this.current?.sbVulnerability;
    const id = vulnerability?.vulnerabilityId ?? '';

    if (/^CVE-/i.test(id)) {
      return id;
    }

    return cveFromSourceUrl(vulnerability?.sourceUrl) ?? id;
  }

  /**
   * Exact advisory page: `sourceUrl` when it names a specific advisory path,
   * else built from a GHSA or CVE id. A bare list page is never linked.
   */
  get advisoryUrl() {
    const url = this.current?.sbVulnerability?.sourceUrl;

    if (url) {
      try {
        const { protocol, pathname } = new URL(url);
        const isHttp = protocol === 'https:' || protocol === 'http:';
        const isSpecific = /(GHSA-|CVE-)/i.test(pathname);

        if (isHttp && isSpecific) {
          return url;
        }
      } catch {
        // fall through to the id based URL
      }
    }

    const id = this.current?.sbVulnerability?.vulnerabilityId ?? '';

    if (/^GHSA(-[0-9a-z]{4}){3}$/i.test(id)) {
      return `https://github.com/advisories/${id}`;
    }

    if (/^CVE-\d{4}-\d{4,}$/i.test(id)) {
      return `https://nvd.nist.gov/vuln/detail/${id}`;
    }

    return null;
  }

  /** Names GitHub only when the advisory really comes from there. */
  get advisoryTooltip() {
    const isGithub = /^https?:\/\/(www\.)?github\.com\//i.test(
      this.advisoryUrl ?? ''
    );

    return this.intl.t(
      isGithub
        ? 'sbomModule.componentInsights.openGithubAdvisory'
        : 'sbomModule.componentInsights.openAdvisory'
    );
  }

  /** "High · CVSS 7.5"; the score is left out when severity is unknown. */
  get severityText() {
    const vulnerability = this.current?.sbVulnerability;

    if (!vulnerability) {
      return '';
    }

    const parts = [vulnerability.severityDisplayValue];

    if (
      vulnerability.severity !== VulnerabilitySeverity.UNKNOWN &&
      vulnerability.score
    ) {
      parts.push(
        this.intl.t('sbomModule.componentInsights.cvss', {
          score: vulnerability.score,
        })
      );
    }

    return parts.join(' · ');
  }

  /** "This component is outdated: 2.9.1 → 2.17.0." when a newer one exists. */
  get outdatedText() {
    const { cleanVersion, cleanLatestVersion } = this.args.sbomComponent;

    if (
      !semver.valid(cleanVersion) ||
      !semver.valid(cleanLatestVersion) ||
      !semver.lt(cleanVersion, cleanLatestVersion)
    ) {
      return null;
    }

    return this.intl.t('sbomModule.componentInsights.outdated', {
      current: cleanVersion,
      latest: cleanLatestVersion,
    });
  }

  @action
  handlePagerChange(index: number) {
    const displayId = this.audits[index]?.sbVulnerability?.vulnerabilityId;

    if (displayId) {
      this.args.onSelect(displayId);
    }
  }

  @action
  retry() {
    this.fetchVulnerabilities.perform();
  }

  fetchVulnerabilities = task(async () => {
    this.loadFailed = false;

    try {
      const sbomComponentId = this.args.sbomComponent.id;

      const response = await this.store.query('sbom-vulnerability-audit', {
        limit: FIRST_PAGE_LIMIT,
        offset: 0,
        sbomComponentId,
      });

      const count = (response as unknown as { meta?: { count?: number } }).meta
        ?.count;

      // Pager must cover every vulnerability, so fetch the remainder at once.
      const firstPage = response.slice();
      const wanted = Math.min(count ?? 0, MAX_VULNERABILITIES);

      if (wanted > firstPage.length) {
        const rest = await this.store.query('sbom-vulnerability-audit', {
          limit: wanted - firstPage.length,
          offset: firstPage.length,
          sbomComponentId,
        });

        this.audits = [...firstPage, ...rest.slice()];
      } else {
        this.audits = firstPage;
      }
    } catch (error) {
      this.logger.debug('Could not load component vulnerabilities:', error);
      this.loadFailed = true;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentInsights::Vulnerabilities': typeof SbomComponentInsightsVulnerabilitiesComponent;
    'sbom/component-insights/vulnerabilities': typeof SbomComponentInsightsVulnerabilitiesComponent;
  }
}
