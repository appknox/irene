# Component Mapping: Ember → Material-UI

This document tracks the exact mapping from Ember `ak-*` components to Material-UI components with custom branding.

## Design Tokens

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| **Primary** | `#ff4d3f` | Main brand color (coral/red) |
| Primary Dark | `#e23123` | Hover states, emphasis |
| Primary Light | `rgba(254, 77, 63, 0.2)` | Backgrounds, highlights |
| Primary 10% | `rgba(254, 77, 63, 0.1)` | Subtle backgrounds |
| **Secondary** | `#424651` | Dark navy |
| **Success** | `#2db421` | Green for positive actions |
| Success Light | `#e9f5ed` | Success backgrounds |
| **Error** | `#d72f2f` | Error states |
| Error Light | `#ffd1d4` | Error backgrounds |
| **Warning** | `#ffd52e` | Warning states |
| Warning Dark | `#a5872d` | Warning emphasis |
| Warning Light | `#fff7d7` | Warning backgrounds |
| **Info** | `#087edb` | Information states |
| Info Dark | `#0052cc` | Info emphasis |
| Info Light | `#deebff` | Info backgrounds |

### Typography

| Property | Value |
|----------|-------|
| Font Family | 'Open Sans', sans-serif |
| Base Font Size | 14px |
| Font Weight Light | 300 |
| Font Weight Regular | 400 |
| Font Weight Medium | 600 |
| Font Weight Bold | 700 |

### Spacing & Layout

| Property | Value |
|----------|-------|
| Border Radius | 2px |
| Border Color (light) | `#e9e9e9` |
| Border Color (standard) | `#c4c4c4` |

### Z-Index Layers

| Layer | Z-Index |
|-------|---------|
| App Bar | 1100 |
| Drawer | 1200 |
| Modal | 1300 |
| Snackbar | 1400 |
| Tooltip | 1500 |

## Component Mapping Reference

### Core Components

#### ak-button → MUI Button

**Variants:**
- `ak-button` default → `<Button variant="contained" color="primary">`
- `ak-button` outlined → `<Button variant="outlined">`
- `ak-button` text → `<Button variant="text">`

**Colors:**
- `color="primary"` → Primary brand color (#ff4d3f)
- `color="secondary"` → Secondary color (#424651)
- `color="success"` → Success color (#2db421)
- `color="error"` → Error color (#d72f2f)

**Sizes:**
- `size="small"` → Small button
- `size="medium"` → Default size
- `size="large"` → Large button

**Props mapping:**
```typescript
// Ember: <AkButton @variant="primary" @onClick={{this.handleClick}}>
// React: <Button variant="contained" color="primary" onClick={handleClick}>
```

#### ak-text-field → MUI TextField

**Variants:**
- `ak-text-field` → `<TextField variant="outlined">`

**Props mapping:**
```typescript
// Ember: <AkTextField @label="Email" @type="email" @value={{this.email}} />
// React: <TextField label="Email" type="email" value={email} onChange={...} />
```

**State:**
- `disabled` prop → Disabled state
- `error` prop → Error state with helper text
- `helperText` → Helper/error text below field

#### ak-checkbox → MUI Checkbox

**Props mapping:**
```typescript
// Ember: <AkCheckbox @checked={{this.isChecked}} @onChange={{this.toggle}} />
// React: <Checkbox checked={isChecked} onChange={toggle} />
```

**States:**
- `checked={true}` → Checked
- `checked={false}` → Unchecked
- `indeterminate={true}` → Indeterminate state
- `disabled={true}` → Disabled

#### ak-toggle → MUI Switch

**Props mapping:**
```typescript
// Ember: <AkToggle @checked={{this.enabled}} @onChange={{this.handleToggle}} />
// React: <Switch checked={enabled} onChange={handleToggle} />
```

**Colors:**
- Checked: Success color (#2db421)
- Unchecked: Grey (#d9d9d9)

#### ak-radio → MUI Radio + RadioGroup

**Props mapping:**
```typescript
// Ember: <AkRadio @value="option1" @checked={{eq this.selected "option1"}} />
// React: <Radio value="option1" checked={selected === 'option1'} />
```

#### ak-select → MUI Select

**Props mapping:**
```typescript
// Ember: <AkSelect @options={{this.options}} @selected={{this.value}} />
// React: <Select value={value} onChange={...}>
//          <MenuItem value="opt1">Option 1</MenuItem>
//        </Select>
```

#### ak-chip → MUI Chip

**Props mapping:**
```typescript
// Ember: <AkChip @label="Status" @color="primary" @onDelete={{this.remove}} />
// React: <Chip label="Status" color="primary" onDelete={remove} />
```

**Special severity colors:**
- Critical: `#d72f2f`
- High: `#f98746`
- Medium: `#fad34a`
- Low: `#46cef9`
- Info: `#2141b4`
- Passed: `#2db421`

#### ak-modal → MUI Modal + Dialog

**Props mapping:**
```typescript
// Ember: <AkModal @isOpen={{this.showModal}} @onClose={{this.closeModal}} />
// React: <Dialog open={showModal} onClose={closeModal}>...</Dialog>
```

#### ak-drawer → MUI Drawer

**Props mapping:**
```typescript
// Ember: <AkDrawer @isOpen={{this.open}} @anchor="right" />
// React: <Drawer open={open} anchor="right">...</Drawer>
```

#### ak-tooltip → MUI Tooltip

**Props mapping:**
```typescript
// Ember: <AkTooltip @text="Help text">...</AkTooltip>
// React: <Tooltip title="Help text">...</Tooltip>
```

#### ak-typography → MUI Typography

**Variants:**
- `h1` through `h6` → Heading variants
- `body1`, `body2` → Body text
- `caption` → Small text
- `overline` → Overline text

#### ak-icon → MUI Icons (@mui/icons-material)

**Usage:**
```typescript
// Import specific icons
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';
// Use: <CheckCircle color="success" />
```

#### ak-icon-button → MUI IconButton

**Props mapping:**
```typescript
// Ember: <AkIconButton @icon="close" @onClick={{this.close}} />
// React: <IconButton onClick={close}><Close /></IconButton>
```

#### ak-link → MUI Link

**Props mapping:**
```typescript
// Ember: <AkLink @href="/path" @color="primary">Link</AkLink>
// React: <Link href="/path" color="primary">Link</Link>
```

#### ak-divider → MUI Divider

**Props mapping:**
```typescript
// Ember: <AkDivider />
// React: <Divider />
```

#### ak-stack → MUI Stack

**Props mapping:**
```typescript
// Ember: <AkStack @direction="row" @spacing={{2}}>
// React: <Stack direction="row" spacing={2}>
```

#### ak-loader → MUI CircularProgress / LinearProgress

**Props mapping:**
```typescript
// Ember: <AkLoader @variant="circular" @color="primary" />
// React: <CircularProgress color="primary" />
//        <LinearProgress color="primary" />
```

#### ak-skeleton → MUI Skeleton

**Props mapping:**
```typescript
// Ember: <AkSkeleton @variant="rectangular" @height={{100}} />
// React: <Skeleton variant="rectangular" height={100} />
```

### Data Display Components

#### ak-table → MUI Table / TanStack Table

**Decision:** Use TanStack Table v8 with MUI styling for complex tables

**Props mapping:**
```typescript
// Ember: <AkTable @data={{this.rows}} @columns={{this.columns}} />
// React: Use TanStack Table with MUI styled components
```

#### ak-list → MUI List

**Props mapping:**
```typescript
// Ember: <AkList>{{#each items}}...</AkList>
// React: <List>{items.map(item => <ListItem>...)}</List>
```

#### ak-accordion → MUI Accordion

**Props mapping:**
```typescript
// Ember: <AkAccordion @expanded={{this.isOpen}}>
// React: <Accordion expanded={isOpen}>
```

#### ak-tabs → MUI Tabs

**Props mapping:**
```typescript
// Ember: <AkTabs @selected={{this.activeTab}}>
// React: <Tabs value={activeTab} onChange={...}>
```

#### ak-card → MUI Card

**Props mapping:**
```typescript
// Ember: <AkCard>
// React: <Card>
```

### Complex Components

#### ak-tree / ak-checkbox-tree → MUI TreeView (to be added)

**Installation needed:**
```bash
pnpm add @mui/x-tree-view
```

**Props mapping:**
```typescript
// Ember: <AkTree @nodes={{this.treeData}} />
// React: <TreeView>...</TreeView>
```

#### ak-pagination → MUI Pagination

**Props mapping:**
```typescript
// Ember: <AkPagination @page={{this.page}} @count={{this.totalPages}} />
// React: <Pagination page={page} count={totalPages} onChange={...} />
```

#### ak-autocomplete → MUI Autocomplete

**Props mapping:**
```typescript
// Ember: <AkAutocomplete @options={{this.opts}} @selected={{this.value}} />
// React: <Autocomplete options={opts} value={value} renderInput={...} />
```

#### ak-chart → Recharts or ECharts for React

**Current:** Using `echarts-for-react`

**Props mapping:**
```typescript
// Ember: <AkChart @type="bar" @data={{this.chartData}} />
// React: <ReactECharts option={chartOptions} />
```

## State Management Patterns

### Component State

**Ember pattern:**
```typescript
// Ember component
export default class AkButton extends Component {
  @tracked isLoading = false;
  
  @action
  handleClick() {
    this.isLoading = true;
    // ...
  }
}
```

**React pattern:**
```typescript
// React component
function Button() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = () => {
    setIsLoading(true);
    // ...
  };
}
```

### Event Handling

**Ember:**
```handlebars
<AkButton @onClick={{this.handleClick}}>
```

**React:**
```tsx
<Button onClick={handleClick}>
```

### Conditional Rendering

**Ember:**
```handlebars
{{#if this.isVisible}}
  <AkButton>Click</AkButton>
{{/if}}
```

**React:**
```tsx
{isVisible && <Button>Click</Button>}
```

## Color Usage Examples

### Status Colors in Components

```tsx
// Critical/Error
<Chip label="Critical" sx={{ bgcolor: '#d72f2f', color: 'white' }} />

// High risk
<Chip label="High" sx={{ bgcolor: '#f98746', color: 'white' }} />

// Medium risk
<Chip label="Medium" sx={{ bgcolor: '#fad34a', color: '#171717' }} />

// Low risk
<Chip label="Low" sx={{ bgcolor: '#46cef9', color: 'white' }} />

// Success/Passed
<Chip label="Passed" sx={{ bgcolor: '#2db421', color: 'white' }} />
```

### Platform Colors

```tsx
// Android
<Chip icon={<Android />} label="Android" sx={{ bgcolor: '#33a852', color: 'white' }} />

// iOS
<Chip icon={<Apple />} label="iOS" sx={{ bgcolor: '#8d9096', color: 'white' }} />
```

## Implementation Checklist

When implementing a feature from Ember:

- [ ] Identify all `ak-*` components used
- [ ] Map to equivalent MUI components
- [ ] Apply exact colors from theme
- [ ] Match spacing and layout
- [ ] Implement same prop interface
- [ ] Handle all component states (hover, active, disabled, loading)
- [ ] Add same validation rules
- [ ] Test all interactive states
- [ ] Visual comparison with Ember version
- [ ] Update this document with any custom patterns

## Testing Component Parity

```tsx
// Test that colors match
expect(button).toHaveStyle({ backgroundColor: '#ff4d3f' });

// Test that props work correctly
expect(button).toBeDisabled();

// Test that events fire
await userEvent.click(button);
expect(handleClick).toHaveBeenCalled();
```

## Next Steps

1. ✅ Theme configured with exact brand colors
2. ✅ Login page demo created
3. 🔄 Test in browser at http://localhost:4200
4. 📋 Build actual login functionality
5. 📋 Implement remaining features phase by phase
6. 📋 Document any custom component patterns discovered

## Notes

- MUI components are customized via `theme.components` in `src/theme/index.ts`
- Additional customization via `sx` prop for one-off styles
- All colors match Ember theme exactly (verified against `app/styles/_theme.scss`)
- Typography uses same font family (Open Sans) and weights
