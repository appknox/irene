import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkBreadcrumbs',
  component: 'ak-breadcrumbs',
  excludeStories: [],
};

const Template = (args) => ({
  template: hbs`
    <AkBreadcrumbs::Container class='breadcrumbs'>
      {{#each this.items as |item|}}
        <AkBreadcrumbs::Item @route={{item.route}} @replace={{item.replace}} @separator={{item.separator}} >{{item.label}}</AkBreadcrumbs::Item>
      {{/each}}
    </AkBreadcrumbs::Container>
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  items: [
    { replace: false, route: '', label: 'Parent Route', separator: '/' },
    { replace: false, route: '', label: 'Child 1', separator: '-' },
    { replace: false, route: '', label: 'Child 1.1' },
  ],
};
