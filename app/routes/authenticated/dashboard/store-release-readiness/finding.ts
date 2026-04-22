import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';

import { ScrollToTop } from 'irene/utils/scroll-to-top';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type StoreReleaseReadinessFindingModel from 'irene/models/store-release-readiness-finding';

import type { StoreReleaseReadinessCardData } from 'irene/components/store-release-readiness/release-card';
import type {
  AssessmentPolicyRow,
  AssessmentPolicyRowStatus,
} from 'irene/components/store-release-readiness/scan-results';

function findingPassedToStatus(
  passed: boolean | null
): AssessmentPolicyRowStatus {
  if (passed === true) {
    return 'passed';
  }
  if (passed === false) {
    return 'failed';
  }

  return 'untested';
}

function policyRowFromFinding(
  f: StoreReleaseReadinessFindingModel
): AssessmentPolicyRow {
  return {
    id: String(f.id),
    categoryLabel: f.category,
    titleLabel: f.title,
    status: findingPassedToStatus(f.passed),
  };
}

function breadcrumbCardStub(releaseId: string): StoreReleaseReadinessCardData {
  return {
    id: releaseId,
    title: '',
    appName: '',
    packageName: '',
    releaseDate: '-',
    version: '-',
    versionCode: '-',
    lastScannedOn: '-',
    platform: 'android',
    riskProfile: 'pending',
    analysisStatus: 'not_started',
    summaryFailed: 0,
    summaryBlocker: 0,
    summaryWarning: 0,
    summaryPassed: 0,
    summaryUntested: 0,
    summaryLoading: false,
    summaryPassedRowLoading: false,
    summaryUntestedRowLoading: false,
  };
}

export default class AuthenticatedDashboardStoreReleaseReadinessFindingRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare router: RouterService;
  @service declare store: Store;

  async model(params: { release_id: string; finding_id: string }): Promise<{
    item: StoreReleaseReadinessCardData;
    policy: AssessmentPolicyRow | undefined;
    finding: StoreReleaseReadinessFindingModel | undefined;
    releaseId: string;
  }> {
    const { release_id, finding_id } = params;
    const item = breadcrumbCardStub(release_id);

    try {
      const finding = (await this.store.findRecord(
        'store-release-readiness-finding',
        finding_id,
        { reload: true }
      )) as StoreReleaseReadinessFindingModel;

      return {
        item,
        policy: policyRowFromFinding(finding),
        finding,
        releaseId: release_id,
      };
    } catch {
      return {
        item,
        policy: undefined,
        finding: undefined,
        releaseId: release_id,
      };
    }
  }

  redirect(model: {
    item: StoreReleaseReadinessCardData;
    policy: AssessmentPolicyRow | undefined;
    finding: StoreReleaseReadinessFindingModel | undefined;
    releaseId: string;
  }) {
    if (!model.policy || !model.finding) {
      this.router.transitionTo(
        'authenticated.dashboard.store-release-readiness.scan-results',
        model.releaseId
      );
    }
  }
}
