import faker from 'faker';
import Base from './base';

export default Base.extend({
  name: faker.company.companyName(),
  userCount: faker.random.number(),
  teamCount: faker.random.number(),
  invitationCount: faker.random.number(),
  projects_count: faker.random.number(),
  features() {
    return {
      sso: false,
      dynamicscan_automation: true,
      partner_dashboard: false,
      app_monitoring: false,
      manualscan: false,
      sbom: false,
    };
  },
});
