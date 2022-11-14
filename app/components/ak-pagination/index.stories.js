/* eslint-disable ember/no-get */
import { hbs } from 'ember-cli-htmlbars';
import faker from 'faker';

export default {
  title: 'AkPagination',
  component: 'ak-pagination',
  excludeStories: [],
};

const Template = (args) => {
  const actions = {
    onItemPerPageChange(event) {
      alert(`Page count has changed: ${event.target.value}`);
    },
    nextAction() {
      alert('Next action clicked!');
    },
    prevAction() {
      alert('Previous action clicked!');
    },
  };

  return {
    template: hbs`
    <div class="flex-row flex-row-gap-3 mt-1">
      <AkPagination
        @disableNext={{this.disableNext}}
        @nextAction={{this.nextAction}}
        @disablePrev={{this.disablePrev}}
        @prevAction={{this.prevAction}}
        @endItemIdx={{this.endItemIdx}}
        @startItemIdx={{this.startItemIdx}}
        @itemPerPageOptions={{this.itemPerPageOptions}}
        @onItemPerPageChange={{this.onItemPerPageChange}}
        @perPageTranslation={{this.perPageTranslation}}
        @tableItemLabel={{this.tableItemLabel}}
        @totalItems={{this.totalItems}}
        @nextBtnLabel={{this.nextBtnLabel}}
        @prevBtnLabel={{this.prevBtnLabel}}
      >
      </AkPagination>
    </div>
  `,
    context: { ...args, ...actions },
  };
};

export const Basic = Template.bind({});

Basic.args = {
  totalItems: 20,
  disablePrev: true,
  disableNext: false,
  startItemIdx: 1,
  endItemIdx: 2,
  itemPerPageOptions: [
    { value: 2, selected: true },
    { value: 4, selected: false },
    { value: 6, selected: false },
  ],
  limit: 2,
  offset: 0,
  prevBtnLabel: 'Previous',
  nextBtnLabel: 'Next',
  tableItemLabel: 'Projects',
  perPageTranslation: 'Records Per Page',
};

const CustomPaginationUITemplate = (args) => {
  args['tableData'] = args.totalPaginationData.slice(args.offset, args.limit);

  const actions = {
    onItemPerPageChange(value) {
      alert(`Page count has changed: ${JSON.stringify(value)}`);
    },
    nextAction() {
      alert('Next action clicked!');
    },
    prevAction() {
      alert('Previous action clicked!');
    },
  };

  return {
    template: hbs`
    <div class="flex-row flex-row-gap-3 mt-1">
      <AkPaginationProvider
        @results={{this.tableData}}
        @onItemPerPageChange={{this.onItemPerPageChange}}
        @totalItems={{this.totalCount}}
        @nextAction={{this.nextAction}}
        @prevAction={{this.prevAction}}
        @itemPerPageOptions={{this.itemPerPageOptions}}
        @defaultLimit={{this.limit}}
        @offset={{this.offset}}
        @tableItemLabel='Projects'
        @perPageTranslation='Records per page'
        as |pgc|
      > 
        <div class="flex-row flex-justify-space-between">
          <select
            name='recordPerPage'
            id='recordPerPage'
            {{on 'change' pgc.onItemPerPageChange}}
          >
            {{#each pgc.itemPerPageOptions as |item|}}
              <option
                selected={{item.selected}}
                value={{item.value}}
              >
                {{item.value}}
              </option>
            {{/each}}
          </select>
          <span class="flex-row flex-align-center ml-2">{{pgc.perPageTranslation}}</span>
          <div class="flex-row ml-6">
            <button
              class="button is-primary mr-1"
              {{on "click" pgc.prevAction}}
            >
              Previous
            </button>
            <button
              class="button is-primary"
              {{on "click" pgc.nextAction}}
            >
              Next
            </button>
          </div>
          <span class="flex-row flex-align-center ml-5">{{pgc.startItemIdx}} - {{pgc.endItemIdx}} of {{pgc.tableItemLabel}}</span>
        </div>
      </AkPaginationProvider>
    </div>
  `,
    context: { ...args, ...actions },
  };
};

export const CustomPaginationUI = CustomPaginationUITemplate.bind({});

CustomPaginationUI.args = {
  totalCount: 50,
  limit: 10,
  offset: 0,
  itemPerPageOptions: [10, 25, 50],
  totalPaginationData: Array.from({ length: 50 }, faker.lorem.slug),
};
