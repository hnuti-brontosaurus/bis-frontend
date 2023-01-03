describe('Close event - evidence and participants', () => {
  // sign in before each test
  beforeEach(() => {
    cy.interceptLogin()
    cy.login('asdf@example.com', 'correcthorsebatterystaple')
  })

  describe('import of simple participants list from xls', () => {
    // stub the api calls to fetch event (it should be one day event)
    beforeEach(() => {
      cy.interceptFullEvent()
      // intercept also downloading photos and receipts
      cy.intercept(
        { method: 'GET', pathname: '/api/frontend/events/*/record/photos/' },
        { results: [] },
      )
      cy.intercept(
        { method: 'GET', pathname: '/api/frontend/events/*/finance/receipts/' },
        { results: [] },
      )
    })

    it('should load xls data to participants list form', () => {
      cy.visit('/org/akce/1000/uzavrit')

      cy.get('label:contains(Mám jen jméno + příjmení + email)')
        .should('be.visible')
        .click()
      cy.get('label:contains(Importovat seznam)')
        .should('be.visible')
        .selectFile('cypress/e2e/simple-participants.xlsx')
    })
  })
})
