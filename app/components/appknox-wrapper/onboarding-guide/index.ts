import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { runTask } from 'ember-lifeline';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

interface AppknoxWrapperOnboardingGuideSignature {
  Args: {
    onClose: () => void;
  };
}

interface GuideItem {
  id: string;
  title: string;
  url: string;
}

export default class AppknoxWrapperOnboardingGuide extends Component<AppknoxWrapperOnboardingGuideSignature> {
  @service declare intl: IntlService;

  @tracked activeGuide;
  @tracked mountIFrame = true;

  constructor(
    owner: unknown,
    args: AppknoxWrapperOnboardingGuideSignature['Args']
  ) {
    super(owner, args);

    this.activeGuide = this.guidesList[0]?.guides[0];
  }

  get selectedGuideUrl(): string | null {
    return this.activeGuide?.url || null;
  }

  get selectedGuideId(): string | null {
    return this.activeGuide?.id || null;
  }

  get guidesList() {
    return [
      {
        category: this.intl.t('onboardingGuideModule.VA'),
        guides: [
          {
            id: 'va-guide',
            title: this.intl.t('onboardingGuideModule.initiateVA'),
            url: 'https://appknox.portal.trainn.co/share/bEK4jmKvG16y1lqH9b9sPA/embed?mode=interactive',
          },
          {
            id: 'scan-results-guide',
            title: this.intl.t('onboardingGuideModule.viewReports'),
            url: 'https://appknox.portal.trainn.co/share/gKJQU8gka8sX3ZLJD80CWg/embed?mode=interactive',
          },
          {
            id: 'invitation-guide',
            title: this.intl.t('inviteUsers'),
            url: 'https://appknox.portal.trainn.co/share/bXBvltZ53ZpWxvrrhrqkbA/embed?mode=interactive',
          },
          {
            id: 'creating-teams-guide',
            title: this.intl.t('onboardingGuideModule.createTeams'),
            url: 'https://appknox.portal.trainn.co/share/01VQVnUV64rjHIBsx6tzqQ/embed?mode=interactive',
          },
          {
            id: 'upload-access-guide',
            title: this.intl.t('onboardingGuideModule.uploadAccess'),
            url: 'https://appknox.portal.trainn.co/share/FPsW0wVu5g6NtAZzHjrNrA/embed?mode=interactive',
          },
        ],
      },
      {
        category: this.intl.t('SBOM'),
        guides: [
          {
            id: 'sbom-guide',
            title: this.intl.t('onboardingGuideModule.generateSBOM'),
            url: 'https://appknox.portal.trainn.co/share/mMfpJY5qpu0czTtC4TKdtQ/embed?mode=interactive',
          },
        ],
      },
      {
        category: this.intl.t('appMonitoring'),
        guides: [
          {
            id: 'store-monitoring-guide',
            title: this.intl.t('onboardingGuideModule.detectDrift'),
            url: 'https://appknox.portal.trainn.co/share/OD1MLnAzsox4W5RphQhwnQ/embed?mode=interactive',
          },
        ],
      },
    ];
  }

  @action
  setActiveGuide(guide: GuideItem) {
    this.mountIFrame = false;
    this.activeGuide = guide;

    this.handleIframeInsertion();
  }

  @action
  handleIframeInsertion() {
    runTask(this, () => {
      this.mountIFrame = true;
    });
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppknoxWrapper::OnboardingGuide': typeof AppknoxWrapperOnboardingGuide;
  }
}
