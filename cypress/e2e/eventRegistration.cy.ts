describe('Standard event registration form', () => {
  context('not signed in', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', pathname: '/api/web/events/2000/' },
        { fixture: 'webEvent' },
      )
    })

    it('should show form with personal data and questions', () => {
      cy.visit('/akce/2000/prihlasit')

      // fill personal data
      cy.get('[name=first_name]').type('GivenName')
      cy.get('[name=last_name]').type('FamilyName')
      cy.get('[name=birthday-day]').type('12')
      cy.get('[name=birthday-month]').type('05')
      cy.get('[name=birthday-year]').type('1995')
      cy.get('[name=phone]').type('601001002')
      cy.get('[name=email]').type('test@example.com')
      cy.get('[name=note]').type('note')

      // fill questionnaire
      cy.get('[name="answers.0.answer"]').type('answer first question')
      cy.get('[name="answers.1.answer"]').check('Option 2')
      cy.get('[name="answers.1.answer"]').check('Option 1')

      cy.get('[name="answers.2.answer"]').check('Option 3')
      cy.get('[name="answers.2.answer"]').check('Option 1')
      cy.get('[name="answers.3.answer"]').type('answer to last question')

      // intercept api call and submit
      cy.intercept(
        {
          method: 'POST',
          pathname: '/api/frontend/events/2000/registration/applications/',
        },
        { statusCode: 200 },
      ).as('createApplication')

      cy.get('button').contains('Odeslat').click()

      // check request body
      cy.wait('@createApplication')
        .its('request.body')
        .should('deep.equal', {
          answers: [
            {
              answer: 'answer first question',
              question: 4,
            },
            {
              answer: 'Option 1',
              question: 3,
            },
            {
              answer: 'Option 1, Option 3',
              question: 5,
            },
            {
              answer: 'answer to last question',
              question: 6,
            },
          ],
          close_person: null,
          first_name: 'GivenName',
          last_name: 'FamilyName',
          phone: '601001002',
          email: 'test@example.com',
          note: 'note',
          birthday: '1995-05-12',
          address: null,
          state: 'pending',
        })

      // check that we switched to final page
      cy.get('body').should('contain', 'Hotovo')
    })
  })
})
