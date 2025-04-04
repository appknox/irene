// @ts-expect-error "trait" prop missing from miragejs
import { Factory, ModelInstance, Server, trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export const ANALYSIS_FACTORY_DEF = {
  analiser_version: 1,
  cvss_version: 3,
  cvss_base: 10.0,
  cvss_vector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',

  cvss_metrics_humanized: () => [
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
  overridden_risk: faker.helpers.arrayElement([null, 1, 2, 3, 4]),
  status: faker.helpers.arrayElement(ENUMS.ANALYSIS.VALUES),
  created_on: faker.date.past(),
  updated_on: faker.date.past(),

  risk() {
    return faker.helpers.arrayElement(ENUMS.RISK.VALUES);
  },

  computed_risk() {
    return faker.helpers.arrayElement(ENUMS.RISK.VALUES);
  },

  findings() {
    const desc = [];
    const uuid = faker.string.uuid();

    for (let i = 0; i < 3; i++) {
      desc.push({
        title: faker.lorem.sentence(),
        description: `/var/mobile/Containers/Data/Application/${uuid}/${faker.system.fileName()}`,
      });
    }

    return desc;
  },
};

export default Factory.extend({
  ...ANALYSIS_FACTORY_DEF,
  withOwasp: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        owasp: server.createList('owasp', 2).map((it) => it.id),
      });
    },
  }),

  withOwaspMobile2024: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        owaspmobile2024: server
          .createList('owaspmobile2024', 2)
          .map((it) => it.id),
      });
    },
  }),

  withOwaspApi2023: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        owaspapi2023: server.createList('owaspapi2023', 2).map((it) => it.id),
      });
    },
  }),

  withCwe: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        cwe: server.createList('cwe', 2).map((it) => it.id),
      });
    },
  }),

  withAsvs: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        asvs: server.createList('asvs', 2).map((it) => it.id),
      });
    },
  }),

  withMasvs: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        masvs: server.createList('masvs', 2).map((it) => it.id),
      });
    },
  }),

  withMstg: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        mstg: server.createList('mstg', 2).map((it) => it.id),
      });
    },
  }),

  withPcidss: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        pcidss: server.createList('pcidss', 2).map((it) => it.id),
      });
    },
  }),

  withPcidss4: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        pcidss4: server.createList('pcidss4', 2).map((it) => it.id),
      });
    },
  }),

  withHipaa: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        hipaa: server.createList('hipaa', 2).map((it) => it.id),
      });
    },
  }),

  withGdpr: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        gdpr: server.createList('gdpr', 2).map((it) => it.id),
      });
    },
  }),

  withNistsp80053: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        nistsp80053: server.createList('nistsp80053', 2).map((it) => it.id),
      });
    },
  }),

  withNistsp800171: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        nistsp800171: server.createList('nistsp800171', 2).map((it) => it.id),
      });
    },
  }),

  withSama: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        sama: server.createList('sama', 2).map((it) => it.id),
      });
    },
  }),

  withAllRegulatory: trait({
    afterCreate(model: ModelInstance, server: Server) {
      model.update({
        owasp: server.createList('owasp', 2).map((it) => it.id),
        owaspmobile2024: server
          .createList('owaspmobile2024', 2)
          .map((it) => it.id),
        owaspapi2023: server.createList('owaspapi2023', 2).map((it) => it.id),
        cwe: server.createList('cwe', 2).map((it) => it.id),
        asvs: server.createList('asvs', 2).map((it) => it.id),
        masvs: server.createList('masvs', 2).map((it) => it.id),
        mstg: server.createList('mstg', 2).map((it) => it.id),
        pcidss: server.createList('pcidss', 2).map((it) => it.id),
        hipaa: server.createList('hipaa', 2).map((it) => it.id),
        gdpr: server.createList('gdpr', 2).map((it) => it.id),
        nistsp80053: server.createList('nistsp80053', 2).map((it) => it.id),
        nistsp800171: server.createList('nistsp800171', 2).map((it) => it.id),
        sama: server.createList('sama', 2).map((it) => it.id),
      });
    },
  }),
});
