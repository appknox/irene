import { Factory, trait } from 'miragejs';
import { faker } from '@faker-js/faker';
import ENUMS from 'irene/enums';

export default Factory.extend({
  analiser_version: 1,
  cvss_version: 3,
  cvss_base() {
    return faker.number.float({ min: 1.0, max: 9.9, fractionDigits: 1 });
  },
  cvss_vector: 'CVSS:3.0/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H',

  attack_vector() {
    return faker.helpers.arrayElement(ENUMS.ATTACK_VECTOR.BASE_VALUES);
  },

  attack_complexity() {
    return faker.helpers.arrayElement(ENUMS.ATTACK_COMPLEXITY.BASE_VALUES);
  },

  privileges_required() {
    return faker.helpers.arrayElement(ENUMS.PRIVILEGES_REQUIRED.BASE_VALUES);
  },

  user_interaction() {
    return faker.helpers.arrayElement(ENUMS.USER_INTERACTION.BASE_VALUES);
  },

  scope() {
    return faker.helpers.arrayElement(ENUMS.SCOPE.BASE_VALUES);
  },

  confidentiality_impact() {
    return faker.helpers.arrayElement(ENUMS.CONFIDENTIALITY_IMPACT.BASE_VALUES);
  },

  integrity_impact() {
    return faker.helpers.arrayElement(ENUMS.INTEGRITY_IMPACT.BASE_VALUES);
  },

  availability_impact() {
    return faker.helpers.arrayElement(ENUMS.AVAILABILITY_IMPACT.BASE_VALUES);
  },

  risk() {
    return faker.helpers.arrayElement(ENUMS.RISK.BASE_VALUES);
  },

  overridden_risk() {
    return faker.helpers.arrayElement([null, 1, 2, 3, 4]);
  },

  status() {
    return faker.helpers.arrayElement(ENUMS.ANALYSIS_STATUS.BASE_VALUES);
  },

  overridden_risk_comment() {
    return faker.lorem.sentence(3);
  },

  overridden_risk_to_profile() {
    return faker.datatype.boolean();
  },

  computed_risk() {
    return this.risk;
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

  withOwasp: trait({
    afterCreate(model, server) {
      model.update({
        owasp: server.createList('owasp', 2).map((it) => it.id),
      });
    },
  }),

  withOwaspMobile2024: trait({
    afterCreate(model, server) {
      model.update({
        owaspmobile2024: server
          .createList('owaspmobile2024', 2)
          .map((it) => it.id),
      });
    },
  }),

  withOwaspApi2023: trait({
    afterCreate(model, server) {
      model.update({
        owaspapi2023: server.createList('owaspapi2023', 2).map((it) => it.id),
      });
    },
  }),

  withCwe: trait({
    afterCreate(model, server) {
      model.update({
        cwe: server.createList('cwe', 2).map((it) => it.id),
      });
    },
  }),

  withAsvs: trait({
    afterCreate(model, server) {
      model.update({
        asvs: server.createList('asvs', 2).map((it) => it.id),
      });
    },
  }),

  withMasvs: trait({
    afterCreate(model, server) {
      model.update({
        masvs: server.createList('masvs', 2).map((it) => it.id),
      });
    },
  }),

  withMstg: trait({
    afterCreate(model, server) {
      model.update({
        mstg: server.createList('mstg', 2).map((it) => it.id),
      });
    },
  }),

  withPcidss: trait({
    afterCreate(model, server) {
      model.update({
        pcidss: server.createList('pcidss', 2).map((it) => it.id),
      });
    },
  }),

  withHipaa: trait({
    afterCreate(model, server) {
      model.update({
        hipaa: server.createList('hipaa', 2).map((it) => it.id),
      });
    },
  }),

  withGdpr: trait({
    afterCreate(model, server) {
      model.update({
        gdpr: server.createList('gdpr', 2).map((it) => it.id),
      });
    },
  }),

  withNistsp80053: trait({
    afterCreate(model, server) {
      model.update({
        nistsp80053: server.createList('nistsp80053', 2).map((it) => it.id),
      });
    },
  }),

  withNistsp800171: trait({
    afterCreate(model, server) {
      model.update({
        nistsp800171: server.createList('nistsp800171', 2).map((it) => it.id),
      });
    },
  }),

  withSama: trait({
    afterCreate(model, server) {
      model.update({
        sama: server.createList('sama', 2).map((it) => it.id),
      });
    },
  }),

  withAllRegulatory: trait({
    afterCreate(model, server) {
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
