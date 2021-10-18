import { Factory } from 'ember-cli-mirage';
import faker from 'faker';

export default Factory.extend({
  entityId() {
    return faker.internet.url() + '/saml2?idpid=' + faker.random.word;
  },
  ssoServiceUrl() {
    return (
      faker.internet.url() + '/saml2/idp?idpid=' + faker.datatype.hexaDecimal()
    );
  },
  createdOn: faker.date.past(),
  certificate() {
    return {
      expires_on: faker.date.soon(),
      fingerprint_sha1: faker.git.shortSha(),
      fingerprint_sha256: faker.git.commitSha(),
      issued_on: faker.date.past(),
      issuer: faker.company.companyName(),
    };
  },
});
