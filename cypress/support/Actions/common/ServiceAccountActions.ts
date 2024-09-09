import cyTranslate from '../../translations';

export default class ServiceAccountActions {
  /**
   * Delete service account which was created to test
   */
  deleteServiceAccount() {
    //click more button in service account page
    cy.findByTestId('serviceAccountDetails-moreOptionsBtn')
      .as('ViewSAMoreButton')
      .should('exist');

    cy.get('@ViewSAMoreButton').click();

    //click delete option in view more
    cy.findByText(cyTranslate('delete')).should('exist').click();

    //confirm delete in drawer
    cy.findByTestId('serviceAccount-confirmDrawer-confirmBtn')
      .as('SADeleteButton')
      .should('exist');

    cy.get('@SADeleteButton').click();
  }

  /**
   * Edit name in service account
   * @param text - string - text that needs to be entered
   * @param clear - boolean - should we clear before entering text
   * @param value - string - what is the value of input after enter of text
   */
  editNameInput(text: string, clear: boolean, value?: string) {
    cy.findByTestId('serviceAccountSection-accountOverview-nameInput')
      .as('SANameInput')
      .should('not.have.attr', 'disabled')
      .then(() => {
        if (clear) {
          cy.get('@SANameInput').clear();
        }
      })
      .then(() => {
        cy.get('@SANameInput').type(text, { delay: 0 });
      })
      .then(($input) => {
        expect($input.val()).to.equal(value ?? text);
      });
  }

  /**
   * Selects a type of project access by particular service account
   * @param type - string - For all or some are the two types
   */
  selectProjectType(type: string) {
    cy.findByTestId('serviceAccountSection-selectProject-projectAccessSelect')
      .find('[data-test-power-select]')
      .click();

    cy.findByText(type).should('exist').click();
  }

  /**
   * Saves serivce account
   */
  saveServiceAccount() {
    cy.findByTestId('serviceAccountCreate-saveButton')
      .as('SaveSAButton')
      .should('exist');

    cy.get('@SaveSAButton').click();
  }

  /**
   * Asserts the type of project by checking the value of project list container
   * @param value - string
   */
  assertProjectListContainerState(value: string) {
    cy.findByTestId('serviceAccountSection-selectProjectList-container').should(
      value
    );
  }

  /**
   * Clicks edit overview button
   */
  clickEditOverviewButton() {
    cy.findByTestId('serviceAccountSection-accountOverview-actionBtn')
      .as('EditOverviewButton')
      .should('exist');

    cy.get('@EditOverviewButton').click();
  }

  /**
   * Clicks update overview button
   */
  clickUpdateOverviewButton() {
    cy.findByTestId('serviceAccountSection-accountOverview-updateBtn')
      .as('UpdateOverviewButton')
      .should('exist');

    cy.get('@UpdateOverviewButton').click();
  }

  /**
   * Check Success Message after create, update, delete of service account
   * @param msg - string - Message shown for success in toast
   */
  checkSuccessMessage(msg: string) {
    cy.findByText(msg).should('exist');
  }
}
