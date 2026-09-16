import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

import {
  SECURITY_ANALYSIS_FINDING_CONFIDENCE,
  SECURITY_ANALYSIS_FINDING_LIKELIHOOD,
} from 'irene/models/security/analysis-finding';

function buildStep(stepNumber: number) {
  return {
    step_number: stepNumber,
    heading: faker.lorem.words(3),
    body: `<p>${faker.lorem.sentence()}</p>`,
  };
}

export const SECURITY_ANALYSIS_FINDING_FACTORY_DEF = {
  finding_id() {
    return faker.string.uuid();
  },

  validation() {
    return {
      confidence_label: faker.helpers.arrayElement([
        ...SECURITY_ANALYSIS_FINDING_CONFIDENCE,
      ]),
      finding_summary: faker.lorem.sentence(),
      evidence: `<ul><li>${faker.lorem.sentence()}</li><li>${faker.lorem.sentence()}</li></ul>`,
      reasoning: `<p>${faker.lorem.paragraph()}</p>`,
    };
  },

  remediation() {
    return { steps: [buildStep(1)] };
  },

  poc() {
    return { steps: [buildStep(1), buildStep(2)] };
  },

  exploitability() {
    return {
      exploitability_likelihood: faker.helpers.arrayElement([
        ...SECURITY_ANALYSIS_FINDING_LIKELIHOOD,
      ]),
      exploitability_analysis: { body: `<p>${faker.lorem.paragraph()}</p>` },
    };
  },
};

export default Factory.extend(SECURITY_ANALYSIS_FINDING_FACTORY_DEF);
