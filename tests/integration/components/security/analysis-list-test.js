import Service from '@ember/service';
import { click, fillIn, find, findAll, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { selectChoose } from 'ember-power-select/test-support';
import { Response } from 'miragejs';

import { analysisRiskStatus } from 'irene/helpers/analysis-risk-status';
import { riskText } from 'irene/helpers/risk-text';
import ENUMS from 'irene/enums';
import styles from 'irene/components/ak-select/index.scss';

const serializeForJsonApi = (payload, type) => ({
  data: {
    attributes: payload,
    id: payload.id,
    type,
  },
});

const getAnalysisRiskLabel = (risk, status, isOverridden) => {
  return analysisRiskStatus([
    risk,
    status ?? ENUMS.ANALYSIS.COMPLETED,
    Boolean(isOverridden),
  ]).label;
};

const analysisStatusTextMap = {
  [ENUMS.ANALYSIS_STATUS.ERROR]: 'Errored',
  [ENUMS.ANALYSIS_STATUS.WAITING]: 'Not started',
  [ENUMS.ANALYSIS_STATUS.RUNNING]: 'Scanning',
  [ENUMS.ANALYSIS_STATUS.COMPLETED]: 'Completed',
  [ENUMS.ANALYSIS_STATUS.UNKNOWN]: 'Unknown',
};

const vulnerabilityTypeTextMap = () => ({
  [ENUMS.VULNERABILITY_TYPE.UNKNOWN]: t('allScans'),
  [ENUMS.VULNERABILITY_TYPE.STATIC]: t('static'),
  [ENUMS.VULNERABILITY_TYPE.DYNAMIC]: t('dynamic'),
  [ENUMS.VULNERABILITY_TYPE.MANUAL]: t('manual'),
  [ENUMS.VULNERABILITY_TYPE.API]: t('api'),
});

const assertAnalysisRowDetails = (assert, sa) => {
  const analyisRowElement = find(
    `[data-test-securityAnalysisListTable-rowId='${sa.id}']`
  );

  const analysisRiskText = getAnalysisRiskLabel(sa.risk);
  const analysisStatus = sa.status;
  const vulnName = sa.vulnerability.get('name');
  const vulnScanTypes = sa.vulnerability.get('types');

  assert
    .dom(
      '[data-test-securityAnalysisListTable-analysisName]',
      analyisRowElement
    )
    .exists()
    .containsText(vulnName)
    .hasAttribute('href', `/security/analysis/${sa.id}`);

  assert
    .dom(
      '[data-test-securityAnalysisListTable-analysisRisk]',
      analyisRowElement
    )
    .exists()
    .containsText(analysisRiskText);

  if (sa.overriddenRisk !== null) {
    const analysisOverriddenRiskText = getAnalysisRiskLabel(sa.overriddenRisk);

    assert
      .dom(
        '[data-test-securityAnalysisListTable-analysisOverriddenIcon]',
        analyisRowElement
      )
      .exists();

    assert
      .dom(
        '[data-test-securityAnalysisListTable-analysisOverriddenRisk]',
        analyisRowElement
      )
      .exists()
      .containsText(analysisOverriddenRiskText);

    vulnScanTypes.forEach((type) => {
      assert
        .dom(
          '[data-test-securityAnalysisListTable-scanTypes]',
          analyisRowElement
        )
        .exists()
        .containsText(vulnerabilityTypeTextMap()[String(type)]);
    });

    assert
      .dom(
        '[data-test-securityAnalysisListTable-analysisStatus]',
        analyisRowElement
      )
      .exists()
      .containsText(analysisStatusTextMap[String(analysisStatus)]);

    assert
      .dom(
        '[data-test-securityAnalysisListTable-markAsPassedIconBtn]',
        analyisRowElement
      )
      .exists();

    assert
      .dom(
        '[data-test-securityAnalysisListTable-markAsPassedIcon]',
        analyisRowElement
      )
      .exists();
  }
};

const AkSelectClasses = {
  dropdown: styles['ak-select-dropdown'],
  trigger: styles['ak-select-trigger'],
  triggerError: styles['ak-select-trigger-error'],
};

// Services
class WindowStub extends Service {
  url = null;
  target = null;

  open(url, target) {
    this.url = url;
    this.target = target;
  }
}

class NotificationsStub extends Service {
  errorMsg = null;
  successMsg = null;

  error(msg) {
    this.errorMsg = msg;
  }

  success(msg) {
    this.successMsg = msg;
  }
}

// Test body
module('Integration | Component | security/analysis-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en');

  hooks.beforeEach(async function () {
    // Services
    this.owner.register('service:browser/window', WindowStub);
    this.owner.register('service:notifications', NotificationsStub);

    const window = this.owner.lookup('service:browser/window');
    const store = this.owner.lookup('service:store');

    // Server Mocks
    this.server.get('/hudson-api/projects/:id', (schema, req) => {
      return schema['security/projects'].find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/hudson-api/files/:id', (schema, req) => {
      return schema['security/files'].find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/hudson-api/projects', () => {
      return new Response(200);
    });

    this.server.get('/hudson-api/analyses/:id', (schema, req) => {
      return schema['security/analyses'].find(`${req.params.id}`)?.toJSON();
    });

    this.server.get('/vulnerabilities', (schema) => {
      return {
        data: schema.vulnerabilities.all().models.map((model) => ({
          attributes: model,
          id: model.id,
          relationships: {},
          type: 'vulnerabilities',
        })),
      };
    });

    // Models
    const secProj = this.server.create('security/project', {
      id: 1,
      is_manual_scan_available: true,
    });

    const secFile = this.server.create('security/file', {
      id: 1,
      project: secProj.id,
      analyses: [1, 2],
    });

    const secFileModel = store.push(
      store.normalize('security/file', secFile.toJSON())
    );

    // Creates vulnerabilities and maps them to individual analysis
    const secAnalyses = [1, 2].map((id) => {
      const vulnerability = this.server.create('vulnerability', id);

      const vulnerabilityModel = store.push(
        store.normalize(
          'vulnerability',
          serializeForJsonApi(vulnerability.toJSON(), 'vulnerabilities').data
        )
      );

      return store.push(
        store.normalize(
          'security/analysis',
          this.server.create('security/analysis', {
            id,
            vulnerability: vulnerabilityModel.id,
            file: secFileModel.id,
          })
        )
      );
    });

    this.setProperties({ secFileModel, secProj, window, store, secAnalyses });
  });

  test('it renders analysis list', async function (assert) {
    assert.expect();

    await render(hbs`<Security::AnalysisList @file={{this.secFileModel}} />`);

    assert.dom('[data-test-securityAnalysisList-header-container]').exists();

    assert
      .dom('[data-test-securityAnalysisList-header-description]')
      .exists()
      .containsText('List of Analyses')
      .containsText(
        'Here you can view the list of all vulnerabilities associated with this file'
      );

    assert.dom('[data-test-securityAnalysisList-table-container]').exists();

    const renderedAnalysisItems = findAll(
      '[data-test-securityAnalysisListTable-row]'
    );

    assert.strictEqual(
      this.secAnalyses.length,
      renderedAnalysisItems.length,
      'Renders the correct number of analysis items'
    );

    // Sanity check for rendered items
    this.secAnalyses.forEach((sa) => assertAnalysisRowDetails(assert, sa));
  });

  test('it filters analysis list', async function (assert) {
    assert.expect();

    const analysesToSearchFor = this.secAnalyses[0];
    const vulnName = analysesToSearchFor.vulnerability.get('name');

    await render(hbs`<Security::AnalysisList @file={{this.secFileModel}} />`);

    assert.dom('[data-test-securityAnalysisList-header-container]').exists();
    assert.dom('[data-test-securityAnalysisList-table-container]').exists();

    let renderedAnalysisItems = findAll(
      '[data-test-securityAnalysisListTable-row]'
    );

    assert.strictEqual(
      this.secAnalyses.length,
      renderedAnalysisItems.length,
      'Renders the correct number of analysis items'
    );

    // CHECK FOR SEARCH FILTERING
    const vulnNameSearchTextFieldSelector =
      '[data-test-securityAnalysisListTable-vulnNameSearchTextField]';

    // Search for a vulnerability
    await fillIn(vulnNameSearchTextFieldSelector, vulnName);

    renderedAnalysisItems = findAll(
      '[data-test-securityAnalysisListTable-row]'
    );

    assert.strictEqual(
      renderedAnalysisItems.length,
      1,
      'It renders only analyses matching the query'
    );

    assertAnalysisRowDetails(assert, analysesToSearchFor);

    // reset search field
    await fillIn(vulnNameSearchTextFieldSelector, '');

    renderedAnalysisItems = findAll(
      '[data-test-securityAnalysisListTable-row]'
    );

    assert.strictEqual(this.secAnalyses.length, renderedAnalysisItems.length);

    // CHECK FOR SCAN TYPE FILTER
    const scanTypeSelectTrigger = `[data-test-securityAnalysisListTable-scanTypeSelect] .${AkSelectClasses.trigger}`;

    // open scan type select
    await click(scanTypeSelectTrigger);

    // Check default selected - "All Scans"
    const scanTypeSelectOptions = findAll('.ember-power-select-option');

    const defaultSelectedOption =
      vulnerabilityTypeTextMap()[ENUMS.VULNERABILITY_TYPE.UNKNOWN];

    assert
      .dom('[data-test-securityAnalysisListTable-selectedScanType]')
      .exists()
      .containsText(defaultSelectedOption);

    assert
      .dom(scanTypeSelectOptions[0])
      .hasAria('selected', 'true')
      .hasText(defaultSelectedOption);

    // Select a vulnerability type from one of the analysis on the table
    const vulnTypeToFilter = analysesToSearchFor.vulnerability.get('types')[0];

    await selectChoose(
      scanTypeSelectTrigger,
      vulnerabilityTypeTextMap()[vulnTypeToFilter]
    );

    // Assert the type is selected correctly
    assert
      .dom('[data-test-securityAnalysisListTable-selectedScanType]')
      .containsText(vulnerabilityTypeTextMap()[vulnTypeToFilter]);

    // Assert the table is filtered accordingly correctly
    const filteredAnalysisModelsCount = this.secAnalyses.filter((sa) =>
      sa.vulnerability.get('types').includes(vulnTypeToFilter)
    );

    renderedAnalysisItems = findAll(
      '[data-test-securityAnalysisListTable-row]'
    );

    assert.strictEqual(
      filteredAnalysisModelsCount.length,
      renderedAnalysisItems.length
    );

    // Sanity check for filtered items
    filteredAnalysisModelsCount.forEach((sa) =>
      assertAnalysisRowDetails(assert, sa)
    );
  });

  test('it marks an analysis as passed', async function (assert) {
    assert.expect(13);

    const selectedAnalysis = this.secAnalyses[0];

    this.server.put('/hudson-api/analyses/:id', (schema, req) => {
      const reqBody = JSON.parse(req.requestBody);
      const id = req.params.id;

      assert.strictEqual(selectedAnalysis.id, id);

      return schema['security/analyses']
        .find(id)
        .update({ ...reqBody, overridden_risk: null })
        .toJSON();
    });

    await render(hbs`<Security::AnalysisList @file={{this.secFileModel}} />`);

    assert.dom('[data-test-securityAnalysisList-header-container]').exists();
    assert.dom('[data-test-securityAnalysisList-table-container]').exists();

    const renderedAnalysisItems = findAll(
      '[data-test-securityAnalysisListTable-row]'
    );

    assert.strictEqual(
      this.secAnalyses.length,
      renderedAnalysisItems.length,
      'Renders the correct number of analysis items'
    );

    let selectedAnalysisElement = find(
      `[data-test-securityAnalysisListTable-rowId='${selectedAnalysis.id}']`
    );

    assert
      .dom(
        '[data-test-securityAnalysisListTable-markAsPassedIconBtn]',
        selectedAnalysisElement
      )
      .exists();

    await click(
      selectedAnalysisElement?.querySelector(
        '[data-test-securityAnalysisListTable-markAsPassedIconBtn]'
      )
    );

    assert
      .dom('[data-test-ak-modal-header]')
      .exists()
      .containsText('Are you sure you want to mark this analysis as passed?');

    const modalDescriptionText = `ID ${selectedAnalysis.id} - ${selectedAnalysis.vulnerability.get('name')} (current risk: ${riskText([selectedAnalysis.risk])})`;

    assert
      .dom('[data-test-confirmbox-description]')
      .exists()
      .containsText(modalDescriptionText);

    await click('[data-test-confirmbox-confirmbtn]');

    // query again in case of reorder of rows
    selectedAnalysisElement = find(
      `[data-test-securityAnalysisListTable-rowId='${selectedAnalysis.id}']`
    );

    assert
      .dom(
        '[data-test-securityAnalysisListTable-analysisRisk]',
        selectedAnalysisElement
      )
      .exists()
      .containsText(getAnalysisRiskLabel(selectedAnalysis.risk));

    assert.strictEqual(getAnalysisRiskLabel(selectedAnalysis.risk), 'Passed');

    const notify = this.owner.lookup('service:notifications');

    assert.strictEqual(
      notify.successMsg,
      `Analysis ${selectedAnalysis.id} marked as passed`
    );
  });

  test.each(
    'it purges API analysis',
    [true, false],
    async function (assert, fail) {
      this.server.post(
        '/hudson-api/files/:id/purge_api',
        () =>
          new Response(
            fail ? 400 : 200,
            {},
            fail ? { detail: 'error text' } : {}
          )
      );

      await render(hbs`<Security::AnalysisList @file={{this.secFileModel}} />`);

      assert.dom('[data-test-securityAnalysisList-header-container]').exists();
      assert.dom('[data-test-securityAnalysisList-table-container]').exists();

      await click(
        '[data-test-securityAnalysisList-header-purgeAPIModalTriggerBtn]'
      );

      assert
        .dom('[data-test-ak-modal-header]')
        .exists()
        .containsText('Are you sure of Purging API Analyses');

      await click('[data-test-confirmbox-confirmbtn]');

      const notify = this.owner.lookup('service:notifications');

      if (fail) {
        assert.strictEqual(notify.errorMsg, 'error text');
      } else {
        assert.strictEqual(
          notify.successMsg,
          'Successfully Purged the Analysis'
        );
      }
    }
  );

  test.each(
    'it adds an analysis to list',
    [true, false],
    async function (assert, fail) {
      const NEW_RECORD_ID = 100;

      // Add a new vulnerability to the list
      const newVulnerability = this.server.create('vulnerability', {
        id: NEW_RECORD_ID,
        name: 'New Vulnability Name',
      });

      // Push the new vulnerability to the store
      this.store.push(
        this.store.normalize(
          'vulnerability',
          serializeForJsonApi(newVulnerability.toJSON(), 'vulnerabilities').data
        )
      );

      this.server.post('/hudson-api/analyses', (schema, req) => {
        const newAnalysisDetails = JSON.parse(req.requestBody);
        let newAnalysis = null;

        if (!fail) {
          newAnalysis = schema['security/analyses'].create({
            ...newAnalysisDetails,
            id: NEW_RECORD_ID,
            risk: ENUMS.RISK.UNKNOWN,
            status: ENUMS.ANALYSIS_STATUS.WAITING,
          });

          const file = schema['security/files'].find(newAnalysis.file);

          file.analyses.push(newAnalysis.id);
          file.save();
        }

        return new Response(
          fail ? 400 : 200,
          {},
          fail
            ? { analysis: ['Error adding analysis'] }
            : { ...newAnalysis.toJSON() }
        );
      });

      await render(hbs`<Security::AnalysisList @file={{this.secFileModel}} />`);

      assert.dom('[data-test-securityAnalysisList-header-container]').exists();
      assert.dom('[data-test-securityAnalysisList-table-container]').exists();

      // Open analysis add modal
      await click(
        '[data-test-securityAnalysisList-header-addAnalysisModalTriggerBtn]'
      );

      assert
        .dom('[data-test-ak-modal-header]')
        .exists()
        .hasText('Add Analysis');

      assert
        .dom('[data-test-securityAnalysisList-addAnalysisModal-header]')
        .containsText('Vulnerability')
        .containsText('Selected vulnerability will be added to list');

      assert
        .dom('[data-test-securityAnalysisList-addAnalysisModal-saveBtn]')
        .exists()
        .containsText('Add Analysis')
        .isDisabled();

      const vulnerabilitySelectTrigger = `[data-test-securityAnalysisList-addAnalysisModal-vulnerabilitySelect] .${AkSelectClasses.trigger}`;

      // open vulnerability select options
      await click(vulnerabilitySelectTrigger);

      await selectChoose(
        '.add-analysis-vulnerability-class',
        `${newVulnerability.id} - ${newVulnerability.name}`
      );

      assert
        .dom('[data-test-securityAnalysisList-addAnalysisModal-saveBtn]')
        .isNotDisabled();

      // Save new analysis
      await click('[data-test-securityAnalysisList-addAnalysisModal-saveBtn]');

      const notify = this.owner.lookup('service:notifications');

      const renderedAnalysisItems = findAll(
        '[data-test-securityAnalysisListTable-row]'
      );

      if (fail) {
        assert.strictEqual(notify.errorMsg, 'Error adding analysis');

        // Checkes the number of analysis has remain unchanged
        assert.strictEqual(
          this.secAnalyses.length,
          renderedAnalysisItems.length,
          'Renders only existing analysis list'
        );
      } else {
        assert.strictEqual(notify.successMsg, 'Analysis Added Successfully');

        // Checks the number of analysis has increased by 1
        assert.strictEqual(
          this.secAnalyses.length + 1,
          renderedAnalysisItems.length,
          'Renders existing analysis list and new addition'
        );

        // Sanity check for newly added analysis
        const newAnalysisModel = this.store.push(
          this.store.normalize(
            'security/analysis',
            this.server.db['security/analyses'].find(NEW_RECORD_ID)
          )
        );

        assertAnalysisRowDetails(assert, newAnalysisModel);
      }
    }
  );
});
