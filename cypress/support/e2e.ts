// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// @see error 2306 https://github.com/microsoft/TypeScript/blob/3fcd1b51a1e6b16d007b368229af03455c7d5794/src/compiler/diagnosticMessages.json#L1635
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import registerCypressGrep from '@cypress/grep/src/support';
import { configure } from '@testing-library/cypress';
import { mirageServer } from './Mirage';

configure({ testIdAttribute: 'data-test-cy' });

// Important for filtering tests to run
// READ MORE: https://github.com/cypress-io/cypress/tree/develop/npm/grep
registerCypressGrep();

// Starts mirage server before each tests is run
beforeEach(() => {
  mirageServer.createServer();
});

// Shuts down mirage server for all tests after running
afterEach(() => {
  mirageServer.shutdown();
});
