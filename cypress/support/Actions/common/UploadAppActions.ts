import APP_TRANSLATIONS from '../../translations';

export default class UploadAppActions {
  uploadAppStatusLoader = 'uploadAppStatus-loader' as const;

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
      const submissionPopoverIsOpen =
        $body.find(this.submissionsPopoverSelector).length >= 1;

      // First check if modal popover is open and close it
      // This step is useful in a scenario where you're unsure if the upload app modal is open
      if (!submissionPopoverIsOpen) {
        // Click on upload app progress bar to open modal
        cy.findByTestId(this.uploadAppStatusLoader).click({ force: true });
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
}
