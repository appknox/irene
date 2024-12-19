import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkDatePicker',
  component: 'ak-date-picker',
  excludeStories: [],
};

const commonArgs = {
  dayClass: '',
  startOfWeek: 0,
  weekdayFormat: 'min',
  showDaysAround: true,
  minDate: null,
  maxDate: null,
  disabledDates: [],
  quickSelectTitle: '',
};

function onSelectCollection(collection) {
  this.set('selected', collection.date);
}

function onSelectRange(range) {
  this.set('selected', range.date);
}

function onSelectDay(day) {
  this.set('selected', day?.date);
}

const AkDatePickerTemplate = (args) => {
  return {
    template: hbs`
        <AkDatePicker 
          @dayClass={{this.dayClass}}
          @startOfWeek={{this.startOfWeek}}
          @weekdayFormat={{this.weekdayFormat}}
          @showDaysAround={{this.showDaysAround}}
          @minDate={{this.minDate}}
          @maxDate={{this.maxDate}}
          @disabledDates={{this.disabledDates}}
          @multiple={{this.multiple}}
          @range={{this.range}}
          @minRange={{this.minRange}}
          @maxRange={{this.maxRange}}
          @maxLength={{this.maxLength}}
          @proximitySelection={{this.proximitySelection}}
          @selected={{this.selected}}
          @onSelect={{this.onSelect}} 
          @quickSelectOptions={{this.quickSelectOptions}}
        >
          <AkButton>
              Open date picker
          </AkButton>
        </AkDatePicker>

        <div class='p-2'>
          <AkTypography>
            {{#if this.range}}
              start: {{this.selected.start}}, end: {{this.selected.end}}
            {{else if this.multiple}}
              selected dates:

              <ol class='px-2 py-1'>
                {{#each this.selected as |d|}}
                  <li>{{d}}</li>
                {{/each}}
              </ol>
            {{else}}
              selected date: {{this.selected}}
            {{/if}}
          </AkTypography>
        </div>
    `,
    context: args,
  };
};

export const Basic = AkDatePickerTemplate.bind({});

Basic.args = {
  ...commonArgs,
  selected: new Date(),
  onSelect: action(onSelectDay),
  quickSelectOptions: ['clear'],
};

export const RangeSelection = AkDatePickerTemplate.bind({});

RangeSelection.args = {
  ...commonArgs,
  range: true,
  minRange: 1,
  maxRange: Infinity,
  proximitySelection: false,
  selected: null,
  onSelect: action(onSelectRange),
  quickSelectOptions: ['last7Days', 'last3Months', 'lastYear'],
};

export const MultipleSelection = AkDatePickerTemplate.bind({});

MultipleSelection.args = {
  ...commonArgs,
  multiple: true,
  maxLength: 10,
  selected: null,
  onSelect: action(onSelectCollection),
  quickSelectOptions: ['today'],
};
