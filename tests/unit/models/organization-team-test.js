import Ember from 'ember';
import localeConfig from 'ember-i18n/config/en';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('organization-team', 'Unit | Model | organization team', {
  needs: [
    'model:organization-team',
    'model:user',
    'model:collaboration',
    'model:organization',
    'service:i18n',
    'locale:en/translations',
    'locale:en/config',
    'util:i18n/missing-message',
    'util:i18n/compile-template',
    'config:environment'
  ],
  beforeEach() {
    // set the locale and the config
    Ember.getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('locale:en/config', localeConfig);
  }
});

test('it exists', function(assert) {
  const team = this.subject();
  Ember.run(function() {
    assert.equal(team.get('isDefaultTeam'), false, "Default Team");

    team.set('membersCount', 2);
    assert.equal(team.get('totalMembers'), "2 members", "Many Members");
    team.set('membersCount', 1);
    assert.equal(team.get('totalMembers'), "1 member", "1 Members");

    team.set('projectsCount', 2);
    assert.equal(team.get('totalProjects'), "2 projects", "Many Projects1t");
    team.set('projectsCount', 1);
    assert.equal(team.get('totalProjects'), "1 project", " 1 Project");

    team.set('members', "yash");
    assert.deepEqual(team.get('teamMembers'), ["yash"], "Members");
  });
});
