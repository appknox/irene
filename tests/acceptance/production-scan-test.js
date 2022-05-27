// import Service from '@ember/service';
// import { setupApplicationTest } from 'ember-qunit';
// import { module } from 'qunit';

// class OrganizationStub extends Service {
//   selected = {
//     id: 1,
//   };
// }

// class SessionStub extends Service {
//   token = '';
//   lastUsername = '';
//   lastPassword = '';
//   lastOtp = '';
//   lastAuthenticator = '';

//   get data() {
//     return {
//       authenticated: {
//         b64token: this.token,
//       },
//     };
//   }

//   authenticate(authenticator, username, password, otp) {
//     this.lastAuthenticator = authenticator;
//     this.lastUsername = username;
//     this.lastPassword = password;
//     this.lastOtp = otp;
//     return this.authenticateTestHook();
//   }

//   authenticateTestHook() {}
// }

// module('Acceptance | production scan', function (hooks) {
//   setupApplicationTest(hooks);

//   hooks.beforeEach(async function () {
//     this.owner.register('service:session', SessionStub);
//     this.owner.register('service:organization', OrganizationStub);
//     await this.owner.lookup('route:authenticated/production-scan');
//   });

// });
