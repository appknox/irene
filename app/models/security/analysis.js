import DS from 'ember-data';

export default DS.Model.extend({
  findings: DS.attr(),
  risk: DS.attr('number'),
  status: DS.attr('number'),
  attackVector: DS.attr('string'),
  attackComplexity: DS.attr('string'),
  privilegesRequired: DS.attr('string'),
  userInteraction: DS.attr('string'),
  scope: DS.attr('string'),
  confidentialityImpact: DS.attr('string'),
  integrityImpact: DS.attr('string'),
  availabilityImpact: DS.attr('string'),
  cvssBase: DS.attr('string'),
  cvssVector: DS.attr('string'),
  cvssVersion: DS.attr('string'),
  analiserVersion: DS.attr('number'),
  overriddenRisk: DS.attr('number'),
  overriddenRiskToProfile: DS.attr('boolean'),
  vulnerability: DS.belongsTo('vulnerability'),
  owasps: DS.hasMany('owasp', {inverse:'security/analysis'}),
  // pcidss: DS.hasMany('pcidss', {inverse:'analysis'}),
  // file: DS.belongsTo('file', {inverse: 'analyses'}),
  // attachments: DS.hasMany('attachment')
});
