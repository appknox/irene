import { test, moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('settings-split', 'Integration | Component | settings split', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs("{{settings-split}}"));

  assert.equal(this.$().text().trim(), 'GeneralSecurityDeveloper SettingsNamespaceYou can add a new namespace below  no namespace+ Add NamespaceAdd NamespaceAdd NamespaceLanguageSelect the preferred language belowEnglish日本語JIRA IntegrationIntegrate JIRAAre you sure you want to revoke JIRA Integration?CancelOkGitHub IntegrationIntegrate GitHubAre you sure you want to revoke Github Integration?CancelOk');
});
