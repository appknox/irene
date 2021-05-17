# Irene

[![CircleCI](https://circleci.com/gh/appknox/irene.svg?style=shield&circle-token=6c82b8d9cddf223dd01f7bffea864d19f0935107)](https://circleci.com/gh/appknox/irene)
[![codecov](https://codecov.io/gh/appknox/irene/branch/develop/graph/badge.svg?token=9spv62CzBb)](https://codecov.io/gh/appknox/irene)


I am SHERlocked. Irene is the front-end dashboards for Sherlock (Vulnerability Scanner) & Mycroft (API Server) that we wrote here at [@appknox](https://github.com/appknox).

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone git@github.com:appknox/irene.git`
* `cd irene`
* `npm install`
* `ember serve`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

To deploy you should have `aws-cli` installed and logged in.

#### Staging

* `ember deploy staging`
* Activate the deployed code: `ember deploy:activate staging --revision=<revision>`

#### Production

* make sure you have `.env` file to deploy it to production
* `ember deploy production`
* Activate the deployed code: `ember deploy:activate production --revision=<revision>`

#### Roll-Back

* List all the deploy revisions `ember deploy:list production --verbose`
* Activate the specific revision `ember deploy:activate production --revision=<revision> --verbose`

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)


## License


Copyright © 2017 by Appknox

Irene code is open source under the  AGPL v3 license (see LICENSE.txt), but the name ‘Appknox’ and the distinctive appearance of the site are not part of the open source code.

Logo, images and other intellectual property are not released under open source and you should change them if you want to setup your own site.

The code is open to establish trust and transparency on how it works and to allow contributions.

Appknox is a business, and like any business has trade secrets, intellectual property and competition.

To have your contributions merged back into the master repository, you must agree to assign copyright to Appknox and must assert that you have the right to make this assignment.
