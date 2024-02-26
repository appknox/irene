import APP_TRANSLATIONS from '../../translations';
import { MirageFactoryDefProps } from '../../Mirage';

export default class UploadAppActions {
  submissionsPopoverSelector =
    '[data-test-cy="upload-app-submissions-popover"]' as const;

  /**
   * Closes upload app modal in a scenario where it is open by default
   */
  closeUploadAppModalIfOpen() {
    return cy.get('body').then(($body) => {
      if ($body.find(this.submissionsPopoverSelector).length >= 1) {
        cy.get(this.submissionsPopoverSelector).first().click();
      }
    });
  }

  /**
   *  Opens upload app modal
   */
  openUploadAppModal() {
    return cy.get('body').then(($body) => {
      if ($body.find(this.submissionsPopoverSelector).length >= 1) {
        // First check if modal popover is open and close it
        // This step is useful in a scenario where you're unsure if the upload app modal is open
        cy.get(this.submissionsPopoverSelector).first().click();

        // Click on upload app progress bar to open modal
        cy.get('[role="progressbar"]').first().click();
      }
    });
  }

  /**
   * Selects a file from a fixture
   * @param fileFixtureAlias - string
   */
  selectAppViaSystem(fileFixtureAlias: string) {
    this.closeUploadAppModalIfOpen();

    return cy
      .findByRole('button', {
        name: new RegExp(APP_TRANSLATIONS.uploadApp, 'i'),
      })
      .then((el) => {
        cy.wrap(el.find('input')).should('exist').selectFile(fileFixtureAlias);
      });
  }

  /**
   * Waits for project list to resolve. This is usually on the third project list API call
   * @param projectListAlias - string
   */
  waitForProjectListRefresh(projectListAlias: string, timeout = 60000) {
    return cy
      .wait([projectListAlias, projectListAlias, projectListAlias], {
        timeout,
      })
      .then(([int1, int2, int3]) => {
        const projectList = {
          ...int1?.response?.body,
          ...int2?.response?.body,
          ...int3?.response?.body,
        } as {
          results: Array<MirageFactoryDefProps['project']>;
        };

        return projectList;
      });
  }
}
