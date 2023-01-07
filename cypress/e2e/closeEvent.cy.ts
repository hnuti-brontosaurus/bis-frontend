import * as participantsExample from '../fixtures/eventParticipants.json'
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

  describe('Full participant list', () => {
    beforeEach(() => {
      // make sure we have a few participants to show
      cy.intercept(
        {
          method: 'GET',
          pathname: '/api/frontend/events/1000/record/participants/',
        },
        { fixture: 'eventParticipants' },
      )

      // intercept the updates of participants
      cy.intercept(
        { method: 'PATCH', pathname: '/api/frontend/events/1000/' },
        {},
      ).as('updateEvent')
    })

    describe('Adding non-existent user as participant', () => {
      beforeEach(() => {
        cy.intercept(
          { method: 'POST', pathname: '/api/frontend/users' },
          { fixture: 'newUser' },
        ).as('createUser')
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
            address: {
              street: 'abc',
              city: 'de',
              zip_code: '10000',
              region: 3,
            },
            contact_address: null,
            close_person: null,
            donor: null,
            offers: null,
            phone: '',
          })

        // and we should call update event with proper data
        cy.wait('@updateEvent')
          .its('request.body')
          .should('deep.equal', {
            record: {
              participants: [
                ...participantsExample.results.map(p => p.id),
                newUserExample.id,
              ],
              contacts: [],
              number_of_participants: null,
              number_of_participants_under_26: null,
            },
          })
      })
    })

    it('[when clicking remove] should ask for confirmation and remove participant', () => {
      // go to participants page
      cy.visit('/org/akce/1000/uzavrit')
      cy.get('label:contains(Mám všechny informace)')
        .should('be.visible')
        .click()

      // click delete
      cy.get('button[aria-label="Smazat účastníka Jana Novak"]').click()

      // confirmation modal should open
      cy.contains(
        'Opravdu chcete smazat účastnici/účastníka Jana Novak z akce Event Name?',
      )

      // click Confirm (should be a danger button)
      cy.get('button[class*=danger]:contains(Ano)').click()

      // check that a proper request was sent to api
      cy.wait('@updateEvent')
        .its('request.body.record.participants')
        .should('contain', '11111111-1111-1111-1111-111111111111')
        .should('not.contain', '00000000-1111-2222-3333-444444444444')
    })

    it('[when clicking update] should open user edit form, and save after editing', () => {
      // go to participants page
      cy.visit('/org/akce/1000/uzavrit')
      cy.get('label:contains(Mám všechny informace)')
        .should('be.visible')
        .click()

      // click update participant
      cy.get('button[aria-label="Upravit účastníka Jana Novak"]').click()

      // a form with pre-filled participant's data should open
      cy.contains('Úprava dat účastnice/účastníka Jana Novak')
      cy.get('[name="last_name"]').should('have.value', 'Novak')

      // let's edit some data
      cy.get('[name="first_name"]')
        .should('have.value', 'Jana')
        .clear()
        .type('Dana')

      cy.get('[name=address\\.street]').clear().type('NewStreetName 42')
      cy.get('[name=address\\.city]').clear().type('NewTown')
      cy.get('[name=address\\.zip_code]').clear().type('12345')
      cy.get('[name=address\\.region]').select(5)
      cy.get('[name=health_insurance_company]').select(4)

      // intercept the updates of user
      cy.intercept(
        { method: 'PATCH', pathname: '/api/frontend/users/*/' },
        {},
      ).as('updateUser')
      // submit
      cy.get('[type=submit]:contains(Potvrdit)').click()

      // a proper request should be sent to update user
      cy.wait('@updateUser').then(a => {
        expect(a.request.body).to.deep.include({
          first_name: 'Dana',
          address: {
            street: 'NewStreetName 42',
            city: 'NewTown',
            zip_code: '12345',
            region: 5,
          },
          health_insurance_company: 4,
        })
        expect(a.request.url).to.contain(
          '/api/frontend/users/00000000-1111-2222-3333-444444444444',
        )
        expect(a.request.method).to.equal('PATCH')
      })
    })
  })
})
