import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  id(i) {
    return i + 1;
  },

  uuid: 'bdbef1ee-65bf-4b28-b724-5a61e818b7ce',
  username: faker.name.firstName(),
  'first-name': faker.name.firstName(),
  'last-name': faker.name.lastName(),
  lang: 'en',
  'socket-id': 'e9da7077-6ca2-4c0c-a6e5-76f4a9fb24be',
  email: faker.internet.email(),
  'mfa-secret': 'CRZ4ISZZG6Z5EPBO',
  'mfa-method': 0,
  namespaces: () => [],
  'billing-hidden': faker.datatype.boolean(),
  'devknox-expiry': faker.date.future(),
  'project-count': faker.datatype.number(1000),
  'any-namespace': faker.datatype.boolean(),
  'is-trial': faker.datatype.boolean(),
  'intercom-hash':
    '5bfda34bb23a8d0e6fb1df6a741124a79a26cdff954c951d7b772d9bc28f885c',
  'crisp-hash':
    '662b72521f5ae389e23bfcbad9c45910167e576f93f865cf8edb5e895fa08a38',
  'can-disable-mfa': faker.datatype.boolean(),
});
