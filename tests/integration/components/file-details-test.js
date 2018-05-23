import ENUMS from 'irene/enums';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('file-details', 'Integration | Component | file details', {
  unit: true
});

test('tapping button fires an external action', function(assert) {
  var component = this.subject();
  component.set("file",
    {
      sortedAnalyses: [
        {
          id: 1,
          hasType: false
        },
        {
          id: 2,
          hasType: false
        },
        {
          id: 3,
          hasType: false
        }
      ]
    });
  assert.deepEqual(component.get("analyses"), [{"hasType": false,"id": 1},{"hasType": false,"id": 2},{"hasType": false,"id": 3}] , "Analyses");
  assert.deepEqual(component.get("filteredAnalysis"), [{"hasType": false,"id": 1},{"hasType": false,"id": 2},{"hasType": false,"id": 3}] , "Extra Query Strings");
  component.set("file",
    {
      sortedAnalyses: [
        {
          id: 1,
          hasType() {
            return true;
          }
        },
        {
          id: 2,
          hasType() {
            return true;
          }
        },
        {
          id: 3,
          hasType() {
            return true;
          }
        }
      ]
    });
  component.set("vulnerabilityType", ENUMS.VULNERABILITY_TYPE.STATIC);
  assert.ok(component.get("filteredAnalysis"));
  component.send("filterVulnerabilityType");

  // component.set("sortImpactAscending", false);
  component.send("sortImpact");
  component.set("sortImpactAscending", true);

  component.send("sortImpact");
});
