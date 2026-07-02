import ENUMS from 'irene/enums';
import { faker } from '@faker-js/faker';
import { setupFileModelEndpoints } from 'irene/tests/helpers/file-model-utils';

export const KNOXIQ_SCAN_STATUS_RESPONSE = {
  sast_status: ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
  dast_status: ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
};

export const KNOXIQ_CARD_ACCENT_CSS_VAR = {
  legacy: 'knoxiq-card-accent-legacy',
  pending: 'knoxiq-card-accent-pending',
  done: 'knoxiq-card-accent-completed',
};

export function setupKnoxiqScanStatusMirage(server, statuses = {}) {
  server.get('/knoxiq/file/:fileId/knoxiq_scan/status', (_, req) => ({
    id: req.params.fileId,
    sast_status: statuses.sast ?? ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
    dast_status: statuses.dast ?? ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
  }));
}

export function setupKnoxiqFileDetailsMirage(server, options = {}) {
  const fileEndpoints = setupFileModelEndpoints(server);

  setupKnoxiqMirageEndpoints(server);
  setupKnoxiqScanStatusMirage(server, options.scanStatuses);
  setupFileExploitabilityMirageEndpoint(server, options.exploitability);

  return fileEndpoints;
}

export function setupFileExploitabilityMirageEndpoint(server, attrs = {}) {
  server.get('/v3/files/:id/exploitability', (_, req) => {
    return {
      id: req.params.id,
      exploitability_count_high: faker.number.int({ min: 1, max: 9 }),
      exploitability_count_medium: faker.number.int({ min: 1, max: 9 }),
      exploitability_count_low: faker.number.int({ min: 1, max: 9 }),
      exploitability_count_passed: faker.number.int({ min: 0, max: 3 }),
      exploitability_count_unknown: faker.number.int({ min: 0, max: 3 }),
      ...attrs,
    };
  });
}

export function setupKnoxiqMirageEndpoints(server) {
  server.get('/knoxiq/file/:fileId/knoxiq_scan/status', () => {
    return KNOXIQ_SCAN_STATUS_RESPONSE;
  });

  server.post('/knoxiq/file/:fileId/knoxiq_scan', () => {
    return {};
  });

  server.get('/knoxiq/analyses/:analysisId/findings', (schema) => {
    const findings = schema.knoxiqValidatedFindings
      .all()
      .models.map((model) => model.attrs);

    return {
      count: findings.length,
      next: null,
      previous: null,
      results: findings,
    };
  });
}

export function enableKnoxiqForTests(context, options = {}) {
  const organizationService = context.owner.lookup('service:organization');
  const { knoxiq = true, automated = false } = options;

  organizationService.selected?.set('aiFeatures', {
    ...(organizationService.selected?.aiFeatures ?? {}),
    knoxiq,
  });

  if (context.file) {
    context.file.knoxiqStatus =
      options.knoxiqStatus ?? ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED;
    context.file.isKnoxiqAutomated = automated;
  }
}

export function disableKnoxiqForTests(context) {
  enableKnoxiqForTests(context, {
    knoxiq: false,
    knoxiqStatus: ENUMS.KNOXIQ_SCAN_STATUS.LEGACY,
  });
}

export function knoxiqScanStatuses(overrides = {}) {
  return {
    [ENUMS.KNOXIQ_SCAN_TYPE.SAST]:
      overrides.sast ?? ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED,
    [ENUMS.KNOXIQ_SCAN_TYPE.DAST_MANUAL]:
      overrides.dast ?? ENUMS.KNOXIQ_SCAN_STATUS.NOT_TRIGGERED,
  };
}

export function pushAnalysisForKnoxiq(server, store, attrs = {}) {
  const aeisScore = faker.number.float({ min: 1, max: 10, fractionDigits: 1 });

  const analysis = server.create('analysis', {
    file: '1',
    status: ENUMS.ANALYSIS_STATUS.COMPLETED,
    exploitability: {
      score: aeisScore,
      exploitability_likelihood: 'high',
      signals: {
        network_access: true,
        user_interaction: false,
        privileges_required: true,
      },
      signal_reasoning: {
        network_access: faker.lorem.sentence(),
        user_interaction: faker.lorem.sentence(),
        privileges_required: faker.lorem.sentence(),
      },
      exploitability_analysis: {
        summary: faker.lorem.paragraph(),
        evidence: [faker.lorem.sentence()],
      },
      attack_scenario: [faker.lorem.sentence()],
      references: [],
      ai_model_used: faker.lorem.word(),
      ai_fallback_used: false,
    },
    cvss_base: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }),
    cvss_version: 3.1,
    cvss_vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    cvss_metrics_humanized: [
      { key: 'Attack Vector', value: 'Network' },
      { key: 'Attack Complexity', value: 'Low' },
    ],
    ...attrs,
  });

  return store.push(store.normalize('analysis', analysis.toJSON()));
}

export function pushAnalysisOverviewForKnoxiq(server, store, attrs = {}) {
  const record = server.create('analysis-overview', {
    file: '1',
    exploitability_likelihood: faker.helpers.arrayElement(
      ENUMS.KNOXIQ_EXPLOITABILITY.BASE_VALUES
    ),
    ...attrs,
  });

  return store.push(store.normalize('analysis-overview', record.toJSON()));
}

export function createKnoxiqValidatedFindings(server, count = 2) {
  return Array.from({ length: count }, (_, index) => {
    const position = index + 1;

    return server.create('knoxiq-validated-finding', {
      finding_id: `finding-${position}`,
      validation: {
        verdict: 'valid',
        is_valid: true,
        confidence: 0.9,
        confidence_label: 'HIGH',
        finding_summary: `Finding ${position} summary text`,
        evidence: [`Evidence line for finding ${position}`],
        reasoning: `Reasoning text for finding ${position}`,
        false_positive_indicators: [],
        is_third_party: false,
        library_origin: null,
      },
      remediation: {
        remediation: `Remediation detail for finding ${position}`,
        steps: [`Remediation step for finding ${position}`],
        code_examples: [],
        references: null,
        source: null,
      },
      poc: {
        poc_title: `PoC title ${position}`,
        verification_steps: [
          {
            step_number: 1,
            title: 'Verify exploit',
            command: 'curl http://example.com',
            expected_result: 'Vulnerability confirmed',
          },
        ],
        expected_evidence: [`PoC evidence for finding ${position}`],
        source: null,
      },
      developer_prompt: `Developer prompt for finding ${position}`,
      exploitability: {
        score: 8,
        exploitability_likelihood: 'high',
        signals: {
          network_access: true,
          user_interaction: false,
        },
        signal_reasoning: {
          network_access: 'Network is reachable',
          user_interaction: 'No user interaction required',
        },
        exploitability_analysis: {
          summary: `Exploitability summary for finding ${position}`,
          evidence: [`Exploitability evidence ${position}`],
        },
        attack_scenario: [`Attack scenario for finding ${position}`],
        references: [],
        ai_model_used: 'test-model',
        ai_fallback_used: false,
      },
    });
  });
}
