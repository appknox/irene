import { hbs } from 'ember-cli-htmlbars';

export default {
  title: 'AkIconButton',
  component: 'ak-icon-button',
  excludeStories: ['actionsData'],
};

export const actionsData = {};

const Template = (args) => ({
  template: hbs`
    <AkTypography @color="textSecondary" @gutterBottom={{true}}>Experiment with me</AkTypography>
    
    <AkIconButton 
        @type={{this.type}}
        @size={{this.size}}
        disabled={{this.disabled}}>
        <AkIcon @color={{this.color}} @iconName="close" />
    </AkIconButton>

    <AkIconButton 
        @type={{this.type}}
        @variant="outlined"
        @size={{this.size}}
        disabled={{this.disabled}}>
        <AkIcon @color={{this.color}} @iconName="refresh" />
    </AkIconButton>
  `,
  context: args,
});

export const Default = Template.bind({});

Default.args = {
  type: 'button',
  size: 'medium',
  color: '',
  disabled: false,
};

const VariantTemplate = (args) => ({
  template: hbs`
        <AkIconButton>
            <AkIcon @iconName="delete" />
        </AkIconButton>

        <AkIconButton @variant="outlined">
            <AkIcon @iconName="refresh" />
        </AkIconButton>
    `,
  context: args,
});

export const Variants = VariantTemplate.bind({});

Variants.args = {};

const SizesTemplate = (args) => ({
  template: hbs`
    <div class="flex-row">
        <div>
            <AkTypography @color="textSecondary" @gutterBottom={{true}}>Default</AkTypography>

            <AkIconButton @size="small">
                <AkIcon @iconName="delete" />
            </AkIconButton>
            
            <AkIconButton>
                <AkIcon @iconName="delete" />
            </AkIconButton>
        </div>

        <div class="ml-4">
            <AkTypography @color="textSecondary" @gutterBottom={{true}}>Outlined</AkTypography>

            <AkIconButton @variant="outlined" @size="small">
                <AkIcon @iconName="delete" />
            </AkIconButton>
            
            <AkIconButton @variant="outlined">
                <AkIcon @iconName="delete" />
            </AkIconButton>
        </div>
    </div>
    `,
  context: args,
});

export const Sizes = SizesTemplate.bind({});

Sizes.args = {};

const DisabledTemplate = (args) => ({
  template: hbs`
        <AkIconButton disabled={{true}}>
            <AkIcon @iconName="delete" />
        </AkIconButton>

        <AkIconButton disabled={{true}} @variant="outlined">
            <AkIcon @iconName="refresh" />
        </AkIconButton>
    `,
  context: args,
});

export const Disabled = DisabledTemplate.bind({});

Disabled.args = {};

const ColorsTemplate = (args) => ({
  template: hbs`
        <div class="flex-row">
            <div>
                <AkTypography @color="textSecondary" @gutterBottom={{true}}>Default</AkTypography>
        
                <AkIconButton>
                    <AkIcon @iconName="refresh" />
                </AkIconButton>

                <AkIconButton>
                    <AkIcon @color="success" @iconName="done" />
                </AkIconButton>

                <AkIconButton>
                    <AkIcon @color="error" @iconName="delete" />
                </AkIconButton>
            </div>

            <div class="ml-4">
                <AkTypography @color="textSecondary" @gutterBottom={{true}}>Outlined</AkTypography>
        
                <AkIconButton @variant="outlined">
                    <AkIcon @iconName="refresh" />
                </AkIconButton>

                <AkIconButton @variant="outlined">
                    <AkIcon @color="success" @iconName="done" />
                </AkIconButton>

                <AkIconButton @variant="outlined" @color="danger">
                    <AkIcon @color="error" @iconName="delete" />
                </AkIconButton>
            </div>
        </div>
    `,
  context: args,
});

export const Colors = ColorsTemplate.bind({});

Colors.args = {};
