import { Factory } from 'ember-cli-mirage';
import faker from 'faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  analiserVersion: 1,
  cvssVersion: 3,
  cvssBase: 10.0,
  cvssVector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',
  cvssMetricsHumanized: [
    { key: 'Attack Vector', value: 'Network' },
    { key: 'Attack Complexity', value: 'Low' },
    { key: 'Privileges Required', value: 'None' },
    { key: 'User Interaction', value: 'Not Required' },
    { key: 'Scope', value: 'Changed' },
    { key: 'Confidentiality Impact', value: 'High' },
    { key: 'Integrity Impact', value: 'High' },
    { key: 'Availability Impact', value: 'High' },
  ],
  isIgnored: faker.datatype.boolean(),
  overridenRisk: faker.random.arrayElement([null, 1, 2, 3, 4]),
  risk: faker.random.arrayElement(ENUMS.RISK.VALUES),
  computedRisk: faker.random.arrayElement(ENUMS.RISK.VALUES),
  status: faker.random.arrayElement(ENUMS.ANALYSIS.VALUES),
  createdOn: faker.date.past(),
  updatedOn: faker.date.past(),

  findings() {
    var desc = [];
    const uuid = faker.datatype.uuid();
    for (var i = 0; i < 3; i++) {
      desc.push({
        title: faker.lorem.sentence(),
        description: `/var/mobile/Containers/Data/Application/${uuid}/${faker.system.fileName()}`,
      });
    }
    return desc;
  },

  isRisky() {
    return ![ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN].includes(this.computedRisk);
  },

  afterCreate(model, server) {
    model.update({
      owasp: server.createList('owasp', 2),
      cwe: server.createList('cwe', 2),
      asvs: server.createList('asvs', 2),
      mstg: server.createList('mstg', 2),
      pcidss: server.createList('pcidss', 2),
      hipaa: server.createList('hipaa', 2),
      gdpr: server.createList('gdpr', 2),
    });
  },
});
