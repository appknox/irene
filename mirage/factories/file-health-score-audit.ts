import { faker } from '@faker-js/faker';
import { Factory } from 'miragejs';

const getRandomInteger = () => faker.number.int({ min: 0, max: 100 });

export const buildAuditTrailEntry = (id: number, knoxiqRan = false) => ({
  id,
  score: getRandomInteger(),
  previous_score: getRandomInteger(),
  score_change: faker.number.int({ min: -10, max: 10 }),
  score_type: 'severity_based',
  status: faker.helpers.arrayElement([
    'very_poor',
    'poor',
    'fair',
    'good',
    'excellent',
  ]),
  trend: faker.helpers.arrayElement(['improved', 'declined', 'stable']),
  event_type: faker.helpers.arrayElement([
    'sast_completed',
    'dast_completed',
    'api_completed',
    'manual_completed',
  ]),
  event_description: faker.lorem.sentence(),
  calculated_at: faker.date.recent().toISOString(),
  coverage_ceiling: getRandomInteger(),
  coverage_level: faker.helpers.arrayElement(['NONE', 'PARTIAL', 'FULL']),
  completed_scans: ['sast'],
  pending_scans: ['dast', 'api', 'manual'],
  critical_count: getRandomInteger(),
  high_count: getRandomInteger(),
  medium_count: getRandomInteger(),
  low_count: getRandomInteger(),
  ignored_count: 0,
  critical_risk: faker.number.float({ min: 0, max: 100 }),
  high_risk: faker.number.float({ min: 0, max: 100 }),
  medium_risk: faker.number.float({ min: 0, max: 100 }),
  low_risk: faker.number.float({ min: 0, max: 100 }),
  accepted_risk_cap: null,
  knoxiq_enabled: false,
  knoxiq_ran: knoxiqRan,
  severity_overrides_count: 0,
});

export const FILE_HEALTH_SCORE_AUDIT_FACTORY_DEF = {
  id(i: number) {
    return i + 1;
  },

  audit_trail() {
    return [buildAuditTrailEntry(1), buildAuditTrailEntry(2, true)];
  },

  current_score() {
    return {
      knoxiq_enabled: false,
      score: getRandomInteger(),
      score_type: 'severity_based',
      status: 'very_poor',
    };
  },
};

export default Factory.extend(FILE_HEALTH_SCORE_AUDIT_FACTORY_DEF);
