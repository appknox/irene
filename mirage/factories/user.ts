import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

export const USER_FACTORY_DEF = {
  id(i: number) {
    return i + 1;
  },

  uuid: 'bdbef1ee-65bf-4b28-b724-5a61e818b7ce',
  username: faker.person.firstName(),
  'first-name': faker.person.firstName(),
  'last-name': faker.person.lastName(),
  lang: 'en',
  'socket-id': 'e9da7077-6ca2-4c0c-a6e5-76f4a9fb24be',
  email: faker.internet.email(),
  'mfa-secret': 'CRZ4ISZZG6Z5EPBO',
  'mfa-method': 0,
  namespaces: () => [],
  'billing-hidden': faker.datatype.boolean(),
  'devknox-expiry': faker.date.future(),
  'project-count': faker.number.int(1000),
  'any-namespace': faker.datatype.boolean(),
  'is-trial': faker.datatype.boolean(),
  'intercom-hash':
    '5bfda34bb23a8d0e6fb1df6a741124a79a26cdff954c951d7b772d9bc28f885c',
  'crisp-hash':
    '662b72521f5ae389e23bfcbad9c45910167e576f93f865cf8edb5e895fa08a38',
  'can-disable-mfa': faker.datatype.boolean(),
};

export default Factory.extend(USER_FACTORY_DEF);
