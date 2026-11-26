import Component from '@glimmer/component';

export interface SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationChainSignature {
  Args: {
    /** Dependency names from the declared parent down to the component. */
    links: string[];
  };
}

/** `parent → component`, with the vulnerable component emphasised last. */
export default class SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationChainComponent extends Component<SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationChainSignature> {
  get lastIndex() {
    return this.args.links.length - 1;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ComponentDetails::Vulnerabilities::DetailWrapper::Remediation::Chain': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationChainComponent;
    'sbom/component-details/vulnerabilities/detail-wrapper/remediation/chain': typeof SbomComponentDetailsVulnerabilitiesDetailWrapperRemediationChainComponent;
  }
}
