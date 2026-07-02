# CSS Refactor Skill

## Description

This skill helps refactor a template SCSS code to improve maintainability, performance, and consistency.

## When to Use

- Refactoring SCSS files for components according to code project standards

## Prerequisites

- Access to the component folder with SCSS file, template code, and component class.
- Understanding of the component template, styling, and component class.

## Process

### 1. Convert margin and padding units to relative units

- Identify all margin and padding declarations in scss file.
- Using 14px as 1em convert all px units of margin and padding to em units. 1em = 14px.
- If margin and paddings are in rem units, convert those also to em units. 1rem = 1em

### 2. Convert variable bridges hardcoded property values to project theme values.

- Read the component scss declarations and identify all hardcoded colors, border-radius, box-shadow, background-color.
- Once identified and only if any such hardcoded values exist, check the "app/styles/\_theme.scss" theme file to see if there are exact value or color declarations existing in the theme file.
- If no matching values found in "app/styles/\_theme.scss", let's create specific case values or colors like we have done for the powered-by-ai/chip example. Keep the variable name short in this case.
- For border-radius if the exact value doesn't exist in "app/styles/\_theme.scss", let's not create special case variables for it. Instead convert from px to em unit if value is 7px or more. Leave as-is if in percentage unit.
- If there is a matching color or variable or once we have added for specific cases, let's create a variable bridge section (if unavialable) and add bridge variables for those values or colors in "app/styles/\_component-variables.scss" inside of the body tag.
- DO NOT add the variables inside of the .theme-light or .theme-dark class. See the example below of how this looks like.

  // variables for path-to-component
  --path-to-component-element-name-property: var(--name-of-variable-in-theme-file);

- How to read the example

  > path-to-component - refers to the relative path to the component from the app/components folder (e.g. ai-reporting/turn-on-settings). Only create a new section if it doesn't already exist.
  > --path-to-component-element-name-property - refers to the variable bridge name (e.g. --ai-reporting-turn-on-settings-footer-box-shadow). Made up of the folder structure (e.g. --ai-reporting-turn-on-settings) of the scss file relative to the app/components folder
  > followed by the semantic name (e.g. footer) of the element, and then what property the bridge is for (e.g. box-shadow).
  > --name-of-variable-in-theme-file: refers to the color name in the theme file.

- Once the bridge variable is created in "app/styles/\_component-variables.scss" we can update the hardcoded property values in component's scss file with it.
- If it is used in multiple places, then we should update all instances with the bridge variable created.

### 3. Convert css variable names not conforming to component folder structure in scss file

- This is for bridged variable names that may have been copied from another templates scss declaration.
- First thing to do is identify all such variables in the scss file.
- Confirm if we have already created a styles section for this component in "app/styles/\_component-variables.scss". Refer to step 2.5 above.
- If not, let's create one.
- Once created or if already existing, let use create new bridge variables for these copied variables.
  - First find if the copied variable names exist already in the "app/styles/\_component-variables.scss" file.
  - Copy the bridged variable names as is and follow the next steps.
- Add the same variable name as the copied variables and their corresponding theme values. Refer to step 2.6 above.
- Once added to the styles section, rename the variable names only in this section based on step 2.7 above. LEAVE the theme values the same.
- Once the names have been updated, head back to the scss file and update the copied variables to match what was renamed in the previous step.
