import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export const SECURITY_VALIDATED_FINDING_FACTORY_DEF = {
  finding_id() {
    return faker.string.uuid();
  },

  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),

  validation() {
    return {
      verdict: 'valid',
      is_valid: true,
      confidence: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      confidence_label: faker.helpers.arrayElement(['HIGH', 'MEDIUM', 'LOW']),
      finding_summary: faker.lorem.sentence(),
      evidence: [faker.lorem.sentence(), faker.lorem.sentence()],
      reasoning: faker.lorem.paragraph(),
      false_positive_indicators: [],
      is_third_party: false,
      library_origin: null,
    };
  },

  // A finding the AI wrote keeps its steps as plain strings; one a human has
  // saved comes back as {heading, body}.
  remediation() {
    return {
      remediation: faker.lorem.paragraph(),
      steps: [faker.lorem.sentence()],
      code_examples: [],
      references: null,
      source: null,
    };
  },

  poc() {
    return {
      poc_title: faker.lorem.words(3),
      verification_steps: [
        {
          step_number: 1,
          title: faker.lorem.words(2),
          command: faker.lorem.words(4),
          expected_result: faker.lorem.sentence(),
        },
      ],
      expected_evidence: [faker.lorem.sentence()],
      source: null,
    };
  },

  developer_prompt: faker.lorem.sentence(),

  exploitability() {
    return {
      score: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }),
      exploitability_likelihood: faker.helpers.arrayElement([
        'High',
        'Medium',
        'Low',
      ]),
      signals: {},
      signal_reasoning: {},
      exploitability_analysis: {
        summary: faker.lorem.paragraph(),
        evidence: [],
      },
      attack_scenario: [],
      references: [],
      ai_model_used: faker.lorem.word(),
      ai_fallback_used: false,
    };
  },
};

export default Factory.extend(SECURITY_VALIDATED_FINDING_FACTORY_DEF);
