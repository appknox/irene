import Component from '@glimmer/component';

interface AkTableFreestyleDemoSignature {
  Args: {
    variant?: string;
  };
}

const ROWS = [
  { id: 1, name: 'Alice', gender: 'Female', age: 28, nationality: 'USA' },
  { id: 2, name: 'Bob', gender: 'Male', age: 35, nationality: 'UK' },
  { id: 3, name: 'Carol', gender: 'Female', age: 42, nationality: 'Canada' },
];

const COLUMNS = [
  { name: 'Name', valuePath: 'name' },
  { name: 'Gender', valuePath: 'gender' },
  { name: 'Age', valuePath: 'age' },
  { name: 'Nationality', valuePath: 'nationality' },
];

export default class AkTableFreestyleDemoComponent extends Component<AkTableFreestyleDemoSignature> {
  rows = ROWS;
  columns = COLUMNS;
}
