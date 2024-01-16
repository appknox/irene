import { click, render } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import styles from 'irene/components/partner/client-uploads-stat-chart/index.scss';
import { module, test } from 'qunit';

module(
  'Integration | Component | partner/client-uploads-stat-chart',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    hooks.beforeEach(async function () {
      await this.server.createList('organization', 2);
      await this.owner.lookup('service:organization').load();
    });

    test('it should show proper title', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            view_analytics: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      this.set('title', 'All');
      await render(
        hbs`<Partner::ClientUploadsStatChart @title={{this.title}}/>`
      );

      assert
        .dom(`[data-test-chart='title']`)
        .hasText(`All t:uploadStatistics:()`);
    });

    test('it should have date picker with default range selected', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            view_analytics: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      await render(hbs`<Partner::ClientUploadsStatChart/>`);
      assert.dom(`[data-test-chart='date-range-picker']`).exists();
      assert
        .dom(`[data-test-chart='start-date']`)
        .hasText(`${dayjs().subtract(1, 'month').format('DD MMM YYYY')}`);
      assert
        .dom(`[data-test-chart='end-date']`)
        .hasText(`${dayjs().format('DD MMM YYYY')}`);
    });

    test('it should handle active filter option', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            view_analytics: true,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      await render(hbs`<Partner::ClientUploadsStatChart/>`);

      const filterOptions = [
        { buttonSelectorText: 'day', intlVariable: '' },
        { buttonSelectorText: 'week', intlVariable: '' },
        { buttonSelectorText: 'month', intlVariable: '' },
      ];

      assert.strictEqual(
        this.element.querySelectorAll(
          `[data-test-chart='filter-options'] button`
        ).length,
        3,
        'should have three filter options'
      );

      filterOptions.forEach((option, seq) => {
        assert
          .dom(`[data-test-chart='filter-btns-${seq}']`)
          .hasText(`t:${option.buttonSelectorText}:(${option.intlVariable})`);
      });

      assert
        .dom(`[data-test-chart='filter-btns-0']`)
        .hasClass(styles['active'], 'Default selected to day option');

      await click(
        this.element.querySelector(`[data-test-chart='filter-btns-2']`)
      );

      assert
        .dom(`[data-test-chart='filter-btns-0']`)
        .doesNotHaveClass(
          styles['active'],
          'day option should not have active class'
        );

      assert
        .dom(`[data-test-chart='filter-btns-2']`)
        .hasClass(styles['active'], 'month option should have active class');
    });

    test('it should not render container if privilege is not set', async function (assert) {
      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            view_analytics: false,
          },
        };
      });
      await this.owner.lookup('service:partner').load();
      await render(hbs`<Partner::ClientUploadsStatChart/>`);

      assert.dom(`[data-test-chart='upload-stat-chart']`).doesNotExist();
    });

    test('it should check if the datetime getting passed in the api is timezoned correctly in the partners analytics chart', async function (assert) {
      let chart_analytics_request;

      this.server.get('v2/partners/:id', (_, req) => {
        return {
          id: req.params.id,
          access: {
            view_analytics: true,
          },
        };
      });

      this.server.get('v2/partners/:id/analytics', (_, req) => {
        chart_analytics_request = req;
        return {
          id: req.params.id,
          upload_timeline: [
            {
              created_on_date: '2022-04-11',
              upload_count: 2,
            },
          ],
        };
      });

      await this.owner.lookup('service:partner').load();

      // The default values of the start and end dates to be set in the ClientUploadsStatChart Component
      this.set('startDate', dayjs().subtract(1, 'months'));
      this.set('endDate', dayjs());

      await render(hbs`
        <Partner::ClientUploadsStatChart 
          @title='Clients Overall'
          @targetModel='partner/analytic' 
        />
      `);

      assert.dom(`[data-test-chart='date-range-picker']`).exists();

      assert
        .dom(`[data-test-chart='start-date']`)
        .hasText(`${this.startDate.format('DD MMM YYYY')}`);
      assert
        .dom(`[data-test-chart='end-date']`)
        .hasText(`${this.endDate.format('DD MMM YYYY')}`);

      await click(
        this.element.querySelector(`[data-test-chart='filter-btns-2']`)
      );

      // Get mocked request from pretender initiated by the click of the filter button
      const chart_analytics_request_params =
        chart_analytics_request.queryParams;
      const { start_timestamp, end_timestamp } = chart_analytics_request_params;

      assert.strictEqual(
        dayjs(start_timestamp).format(),
        this.startDate.format(), // default unformatted selected start_date of date range picker in ClientUploadsStatChart
        "Element [data-test-chart='start-date'] value is equal to the start_date in chart data request URL params"
      );

      assert.strictEqual(
        dayjs(end_timestamp).format(),
        this.endDate.format(), // default unformatted selected end_date of date range picker in ClientUploadsStatChart
        "Element [data-test-chart='end-date'] value is equal to the end_date in chart data request URL params"
      );
    });
  }
);
