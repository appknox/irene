import { hbs } from 'ember-cli-htmlbars';
import { action, computed } from '@ember/object';
import { faker } from '@faker-js/faker';

function onItemPerPageChange(args) {
  this.set('limit', args.limit);
  this.set('offset', args.offset);
}

function nextAction(args) {
  this.set('limit', args.limit);
  this.set('offset', args.offset);
}

function prevAction(args) {
  this.set('limit', args.limit);
  this.set('offset', args.offset);
}

const paginationCommonArgs = {
  prevBtnLabel: 'Previous',
  nextBtnLabel: 'Next',
  tableItemLabel: 'Projects',
  perPageTranslation: 'Items Per Page',
  paginationSelectOptionsVertPosition: 'below',
  limit: 5,
  offset: 0,
  itemPerPageOptions: [5, 10, 15],
  totalCount: 50,
  totalPaginationData: Array.from({ length: 50 }, faker.lorem.slug),
  tableData: computed('limit', 'offset', 'totalPaginationData', function () {
    return this.totalPaginationData.slice(
      this.offset,
      this.limit + this.offset
    );
  }),
  onItemPerPageChange: action(onItemPerPageChange),
  nextAction: action(nextAction),
  prevAction: action(prevAction),
};

export default {
  title: 'AkPagination',
  component: 'ak-pagination',
  excludeStories: [],
};

const Template = (args) => {
  return {
    template: hbs`
    <div class="flex-column mt-1 p-2">
      <AkPaginationProvider
        @results={{this.tableData}}
        @onItemPerPageChange={{this.onItemPerPageChange}}
        @totalItems={{this.totalCount}}
        @nextAction={{this.nextAction}}
        @prevAction={{this.prevAction}}
        @itemPerPageOptions={{this.itemPerPageOptions}}
        @defaultLimit={{this.limit}}
        @offset={{this.offset}}
        as |pgc|
      > 
        <AkPagination
          @disableNext={{pgc.disableNext}}
          @nextAction={{pgc.nextAction}}
          @disablePrev={{pgc.disablePrev}}
          @prevAction={{pgc.prevAction}}
          @endItemIdx={{pgc.endItemIdx}}
          @startItemIdx={{pgc.startItemIdx}}
          @itemPerPageOptions={{pgc.itemPerPageOptions}}
          @onItemPerPageChange={{pgc.onItemPerPageChange}}
          @selectedOption={{pgc.selectedOption}}
          @perPageTranslation={{this.perPageTranslation}}
          @tableItemLabel={{this.tableItemLabel}}
          @totalItems={{pgc.totalItems}}
          @nextBtnLabel={{this.nextBtnLabel}}
          @prevBtnLabel={{this.prevBtnLabel}}
          @paginationSelectOptionsVertPosition={{this.paginationSelectOptionsVertPosition}}
          {{style marginBottom="15px"}}
        >
        </AkPagination>

        {{#each pgc.currentPageResults as |item idx|}}
          <span class="flex-column">{{add idx pgc.startItemIdx}} - {{item}}</span>
        {{/each}}
      </AkPaginationProvider>
    </div>
  `,
    context: { ...args },
  };
};

export const Basic = Template.bind({});

Basic.args = paginationCommonArgs;

const CompactPaginationTemplate = (args) => {
  return {
    template: hbs`
    <div class="flex-column mt-1 p-2">
      <AkPaginationProvider
        @results={{this.tableData}}
        @onItemPerPageChange={{this.onItemPerPageChange}}
        @totalItems={{this.totalCount}}
        @nextAction={{this.nextAction}}
        @prevAction={{this.prevAction}}
        @itemPerPageOptions={{this.itemPerPageOptions}}
        @defaultLimit={{this.limit}}
        @offset={{this.offset}}
        as |pgc|
      > 
        <AkPagination
          @disableNext={{pgc.disableNext}}
          @nextAction={{pgc.nextAction}}
          @disablePrev={{pgc.disablePrev}}
          @prevAction={{pgc.prevAction}}
          @endItemIdx={{pgc.endItemIdx}}
          @startItemIdx={{pgc.startItemIdx}}
          @itemPerPageOptions={{pgc.itemPerPageOptions}}
          @onItemPerPageChange={{pgc.onItemPerPageChange}}
          @selectedOption={{pgc.selectedOption}}
          @perPageTranslation={{this.perPageTranslation}}
          @tableItemLabel={{this.tableItemLabel}}
          @totalItems={{pgc.totalItems}}
          @nextBtnLabel={{this.nextBtnLabel}}
          @prevBtnLabel={{this.prevBtnLabel}}
          @variant={{this.variant}}
          @paginationSelectOptionsVertPosition={{this.paginationSelectOptionsVertPosition}}
          {{style marginBottom="15px"}}
        >
        </AkPagination>

        {{#each pgc.currentPageResults as |item idx|}}
          <span class="flex-column">{{add idx pgc.startItemIdx}} - {{item}}</span>
        {{/each}}
      </AkPaginationProvider>
    </div>
  `,
    context: { ...args },
  };
};

export const CompactPagination = CompactPaginationTemplate.bind({});

CompactPagination.args = {
  ...paginationCommonArgs,
  variant: 'compact',
};

const CustomPaginationUITemplate = (args) => {
  return {
    template: hbs`
    <div class="flex-column mt-1">
      <AkPaginationProvider
        @results={{this.tableData}}
        @onItemPerPageChange={{this.onItemPerPageChange}}
        @totalItems={{this.totalCount}}
        @nextAction={{this.nextAction}}
        @prevAction={{this.prevAction}}
        @itemPerPageOptions={{this.itemPerPageOptions}}
        @defaultLimit={{this.limit}}
        @offset={{this.offset}}
        as |pgc|
      > 
        <div class="flex-row flex-justify-space-between mb-3 w-6/12">
          <AkSelect
            @onChange={{pgc.onItemPerPageChange}}
            @options={{pgc.itemPerPageOptions}}
            @selected={{pgc.selectedOption}}
            @renderInPlace={{true}}
            @verticalPosition='below'
            @triggerClass={{this.selectTriggerClass}}
            {{style width="50px"}}
            as |aks|
          >
            {{aks.label}}
          </AkSelect>
          <span class="flex-row flex-align-center ml-2">{{pgc.perPageTranslation}}</span>
          <div class="flex-row ml-6">
            <button
              disabled={{pgc.disablePrev}}
              class="mr-1"
              type="button"
              {{on "click" pgc.prevAction}}
            >
              Previous
            </button>
            <button
              disabled={{pgc.disableNext}}
              type="button"
              {{on "click" pgc.nextAction}}
            >
              Next
            </button>
          </div>
          <span class="flex-row flex-align-center ml-5">{{pgc.startItemIdx}} - {{pgc.endItemIdx}} of {{pgc.totalItems}} Items</span>
        </div>

        {{#each pgc.currentPageResults as |item idx|}}
          <span class="flex-column">{{add idx pgc.startItemIdx}} - {{item}}</span>
        {{/each}}
      </AkPaginationProvider>
    </div>
  `,
    context: { ...args },
  };
};

export const CustomPaginationUI = CustomPaginationUITemplate.bind({});

CustomPaginationUI.args = paginationCommonArgs;
