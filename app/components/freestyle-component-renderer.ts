import Component from '@glimmer/component';

interface Signature {
  Args: {
    componentId: string;
  };
}

export default class FreestyleComponentRenderer extends Component<Signature> {}
