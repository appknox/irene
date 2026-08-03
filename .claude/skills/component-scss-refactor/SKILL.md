# Component CSS Refactor Skill

## Description

This skill creates correctly-named component variables in `_component-variables.scss` for variables in a component's SCSS file that use incorrect or borrowed variable names (e.g. copied from another component), and updates the SCSS file to use the new variables.

## When to Use

- A component's SCSS file uses CSS variables whose names don't match the component's folder structure (e.g. borrowed from a sibling or parent component).
- You need to introduce properly-prefixed variables for a component in `app/styles/_component-variables.scss`.

## Prerequisites

- Access to the component's SCSS file.
- Access to `app/styles/_component-variables.scss`.

## Process

### 1. Identify incorrectly-named variables and hardcoded values in the component SCSS file

- Read the component's SCSS file.
- Find all `var(--...)` references whose prefix does not match the component's folder path relative to `app/components/`. This includes **global theme variables** (e.g. `var(--border-radius)`, `var(--background-main)`) used directly in the SCSS file — every CSS variable reference must go through a component-prefixed bridge variable.
- Also find any hardcoded property values (colors, background-color, border-color, box-shadow, border-radius) that are not already using a variable.
- Note the variable name or hardcoded value and which CSS property it is used for.

### 2. Resolve values for borrowed variables and hardcoded values

- For **borrowed variables** (from another component's section in `_component-variables.scss`): search `app/styles/_component-variables.scss` for each borrowed variable name and record the underlying theme value it resolves to (e.g. `var(--background-light)`). This will become the value of the new correctly-named variable.
- For **global theme variables** used directly (e.g. `var(--border-radius)`, `var(--background-main)`): use the global theme variable itself as the value of the new component variable (e.g. `--my-component-btn-border-radius: var(--border-radius);`).
- For **hardcoded values**: search `app/styles/_theme.scss` to see if an exact match already exists.
  - If a match exists, use that theme variable as the value of the new component variable.
  - If no match exists, add a new numbered special-case variable to `app/styles/_theme.scss` (e.g. `--box-shadow-15: 0px 2px 4px -1px rgba(0, 0, 0, 0.06);`), then reference that theme variable as the value of the new component variable (e.g. `--my-component-box-shadow: var(--box-shadow-15);`). Do NOT copy the raw value into `_component-variables.scss`.
  - Exception: for `border-radius`, if an exact theme variable match exists (e.g. `--border-radius-4: 4px`), create a bridge variable pointing to it just like any other hardcoded value. If no match exists, do not add a new theme variable — leave it as a hardcoded value, or convert to `em` if 7px or more.

### 3. Derive the correct variable name prefix

- The prefix is derived from the component's folder path relative to `app/components/`, with `/` replaced by `-`.
- Example: `app/components/storeknox/fake-apps/details-header/skeleton/index.scss` → prefix `--storeknox-fake-apps-details-header-skeleton`.

### 4. Create new variable names

- For each borrowed variable, create a new variable name using:
  `--<folder-path-prefix>-<semantic-element-name>-<css-property>`
- Example: `--storeknox-fake-apps-details-header-skeleton-background-color`
- Choose semantic element names that describe what the variable is styling (e.g. `title-container`, `app-info`, `background`).

### 5. Skeleton loaders — reuse the emulated component's variables

If the component is a skeleton loader (its path contains `skeleton` or `skeleton-loader`) that visually emulates another component, **do not create new bridge variables** for it. Instead, use the bridge variables of the component it emulates directly in the skeleton's SCSS file.

- Identify the emulated component — usually the sibling or parent component whose layout the skeleton mirrors (e.g. a `skeleton-loader` inside `navigation-graph/` emulates `navigation-graph` and its `nav-panel`).
- Reference those components' bridge variables (e.g. `--file-details-dynamic-scan-navigation-graph-background-main`) in place of any global theme variables in the skeleton's SCSS.
- Skip creating a `// variables for …/skeleton-loader` section in `_component-variables.scss` entirely.

### 6. Add the new variables to `_component-variables.scss`

- Check if a section for this component already exists in `app/styles/_component-variables.scss`.
  - Search for `// variables for <folder-path>` (e.g. `// variables for storeknox/fake-apps/details-header/skeleton`).
- If no section exists, add one in a logical position — after the nearest parent or sibling component's section.
- Format:

  ```scss
  // variables for storeknox/fake-apps/details-header/skeleton
  --storeknox-fake-apps-details-header-skeleton-background-color: var(
    --background-light
  );
  --storeknox-fake-apps-details-header-skeleton-title-container-border-color: var(
    --border-color-1
  );
  --storeknox-fake-apps-details-header-skeleton-app-info-bg-color: var(
    --background-main
  );
  ```

- The values must be copied exactly from the resolved values of the borrowed variables (step 2). Do NOT use the borrowed variable as the value — use the underlying theme value.

### 7. Update the component SCSS file

- Replace each borrowed variable reference and hardcoded value with the newly created component variable.
- Remove any TODO comments that prompted this work.
- Convert any hardcoded `px` padding values to `em` using base `14px = 1em`. Round to 5 decimal places (e.g. `10px` → `0.71429em`, `17px` → `1.21429em`, `3px 7px` → `0.21429em 0.5em`).
- Do not change any other properties or structure.
