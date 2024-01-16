import { hbs } from 'ember-cli-htmlbars';
import { faker } from '@faker-js/faker';

export default {
  title: 'AkTable',
  component: 'ak-table',
  excludeStories: ['actionsData'],
};

export const actionsData = {};

const rows = Array.from(new Array(8)).map(() => {
  const data = {};

  data.id = faker.number.int();
  data.name = faker.person.firstName();
  data.gender = faker.person.gender(true);

  data.age = faker.number.int({ min: 18, max: 50 });

  data.nationality = faker.location.country();

  return data;
});

const columns = [
  { name: 'Name', valuePath: 'name' },
  { name: 'Gender', valuePath: 'gender' },
  { name: 'Age', valuePath: 'age' },
  { name: 'Nationality', valuePath: 'nationality' },
];

const Template = (args) => ({
  template: hbs`
    <AkTable @dense={{this.dense}} @headerColor={{this.headerColor}} @borderColor={{this.borderColor}} @hoverable={{this.hoverable}} as |t|>
        <t.head @columns={{this.columns}} as |h|>
          <h.row as |r|>
            <r.cell as |column|>
              {{column.name}}
            </r.cell>
          </h.row>
        </t.head>
        <t.body @rows={{this.rows}} as |b|>
          <b.row as |r|>
              <r.cell as |value|>{{value}}</r.cell>
          </b.row>
        </t.body>
    </AkTable>
  `,
  context: { ...args, rows, columns },
});

export const Default = Template.bind({});

Default.args = {
  dense: false,
  borderColor: 'light',
  hoverable: false,
  headerColor: 'neutral',
};

const FullBorderedTemplate = (args) => ({
  template: hbs`
    <AkTable @dense={{this.dense}} @headerColor={{this.headerColor}} @variant="full-bordered" @borderColor={{this.borderColor}} as |t|>
        <t.head @columns={{this.columns}} as |h|>
          <h.row as |r|>
            <r.cell as |column|>
              {{column.name}}
            </r.cell>
          </h.row>
        </t.head>
        <t.body @rows={{this.rows}} as |b|>
          <b.row as |r|>
              <r.cell as |value|>{{value}}</r.cell>
          </b.row>
        </t.body>
    </AkTable>
  `,
  context: { ...args, rows, columns },
});

export const FullBordered = FullBorderedTemplate.bind({});

FullBordered.args = {
  dense: false,
  borderColor: 'light',
  headerColor: 'neutral',
};
