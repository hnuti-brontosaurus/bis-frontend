import * as newUserExample from '../fixtures/newUser.json'

describe('Close event - evidence and participants', () => {
  // sign in before each test
  beforeEach(() => {
    cy.interceptLogin()
    cy.login('asdf@example.com', 'correcthorsebatterystaple')
  })

  // stub the api calls to fetch event (it is one day event)
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
    // intercept also categories needed for UserForm
    cy.intercept(
      { method: 'GET', pathname: '/api/categories/regions/' },
      { fixture: 'regions' },
    )
    cy.intercept(
      { method: 'GET', pathname: '/api/categories/sex_categories/' },
      { fixture: 'sexes' },
    )
    cy.intercept(
      {
        method: 'GET',
        pathname: '/api/categories/health_insurance_companies/',
      },
      { fixture: 'healthInsuranceCompanies' },
    )
  })

  describe('import of simple participants list from xls', () => {
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

  describe('Add non-existent user as participant', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'POST', pathname: '/api/frontend/users' },
        { fixture: 'newUser' },
      ).as('createUser')
      cy.intercept(
        { method: 'PATCH', pathname: '/api/frontend/events/1000/' },
        {},
      ).as('updateEvent')
    })

    it('should open a modal, receive data of new user, and save them as a participant', () => {
      cy.visit('/org/akce/1000/uzavrit')
      cy.get('label:contains(Mám všechny informace)')
        .should('be.visible')
        .click()
      cy.get('button:contains(Přidat nového účastníka)')
        .should('be.visible')
        .click()

      // we should be able to see a form waiting for user data

      cy.get('input[name=first_name]').should('be.visible').type('first_name')
      cy.get('input[name=last_name]').should('be.visible').type('last_name')
      cy.get('[placeholder=DD]').should('be.visible').type('01')
      cy.get('[placeholder=MM]').should('be.visible').type('01')
      cy.get('[placeholder=RRRR]').should('be.visible').type('1950')
      cy.get('[name=email]').type('test@example.com')
      cy.get('[name=address\\.street]').type('abc')
      cy.get('[name=address\\.city]').type('de')
      cy.get('[name=address\\.zip_code]').type('10000')
      cy.get('[name=address\\.region]').select(3)

      cy.get('[type=submit]:contains(Potvrdit)').click()

      // we should call create user with proper data
      cy.wait('@createUser')
        .its('request.body')
        .should('deep.equal', {
          first_name: 'first_name',
          last_name: 'last_name',
          nickname: '',
          birth_name: '',
          sex: null,
          health_insurance_company: null,
          health_issues: '',
          email: 'test@example.com',
          birthday: '1950-01-01',
          address: { street: 'abc', city: 'de', zip_code: '10000', region: 3 },
          contact_address: null,
          close_person: null,
          donor: null,
          offers: null,
          phone: '',
        })

      // and we should call update event with proper data
      cy.wait('@updateEvent')
        .its('request.body')
        .should('deep.equal', { record: { participants: [newUserExample.id] } })
    })
  })
})
