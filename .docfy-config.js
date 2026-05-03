const path = require('path');

module.exports = {
  sources: [
    {
      root: path.join(__dirname, 'docs'),
      pattern: '**/*.md',
      urlPrefix: 'docs',
    },
  ],
  /**
   * Must be truthy so @docfy/ember-cli does not inject `repository` from package.json
   * (that enables Edit this page/demo URLs). Omit `url` so Docfy never builds edit links.
   */
  repository: {},
};
