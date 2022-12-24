import type { Location, User } from '../../src/app/services/bisTypes'

const organizer: User = {
  id: '0419781d-06ba-432b-8617-797ea14cf848',
  roles: [
    {
      id: 1,
      name: 'asdf',
      slug: 'organizer',
    },
  ],
  first_name: 'FirstName',
  last_name: 'LastName',
  nickname: 'Nickname',
  display_name: 'Nickname (FirstName LastName)',
} as User

const searchUsers = new Array(47).fill('').map((val, i) => ({
  _search_id: String(i),
  first_name: `FirstName${i}`,
  last_name: `LastName${i}`,
  nickname: `Nickname${i}`,
  display_name: `Displayname${i}`,
}))

const locations: Location[] = new Array(35)
  .fill('')
  .map((val, i) => ({
    id: i,
    name: `Location ${i}`,
    gps_location: {
      type: 'Point',
      coordinates: [12 + Math.random() * 7, 49 + Math.random() * 2],
    },
  }))
  .flat() as Location[]

describe('create event', () => {
  // stub api endpoints before each request
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login/', { token: '1234567890abcdef' })
    cy.intercept('GET', '/api/auth/whoami/', {
      id: '0419781d-06ba-432b-8617-797ea14cf848',
    })
    cy.intercept(
      { method: 'GET', path: /\/api\/frontend\/users\/[a-zA-Z0-9-]+\// },
      organizer,
    )
  })

  // sign in before each request
  beforeEach(() => {
    // https://xkcd.com/936/
    cy.login('asdf@example.com', 'correcthorsebatterystaple')
  })

  // stub more api endpoints
  beforeEach(() => {
    cy.intercept('GET', '/api/categories/event_categories/', {
      results: [
        { id: 1, slug: 'a', name: 'Aaaaa' },
        { id: 2, slug: 'b', name: 'bbbbbb' },
        { id: 3, slug: 'c', name: 'ccccc' },
        { id: 4, slug: 'd', name: 'DDddDDdd' },
      ],
    })
    cy.intercept('GET', '/api/categories/event_group_categories/', {
      results: [
        { id: 3, slug: 'camp', name: 'Camp' },
        { id: 2, slug: 'weekend_event', name: 'Weekend Event' },
        { id: 1, slug: 'other', name: 'Other' },
      ],
    })
    cy.intercept('GET', '/api/categories/event_program_categories/', {
      results: [
        { id: 1, slug: 'a', name: 'aa' },
        { id: 2, slug: 'b', name: 'bb' },
        { id: 3, slug: 'c', name: 'cc' },
        { id: 4, slug: 'd', name: 'dd' },
        { id: 5, slug: 'e', name: 'ee' },
        { id: 6, slug: 'f', name: 'ff' },
      ],
    })
    cy.intercept('GET', '/api/categories/event_intended_for_categories/', {
      results: [
        { id: 1, slug: 'a', name: 'aa' },
        { id: 2, slug: 'b', name: 'bb' },
        { id: 3, slug: 'c', name: 'cc' },
        { id: 4, slug: 'd', name: 'dd' },
        { id: 5, slug: 'e', name: 'ee' },
      ],
    })
    cy.intercept('GET', '/api/categories/diet_categories/', {
      results: [],
    })
    cy.intercept('GET', '/api/web/administration_units/*', {
      results: [
        {
          id: 1,
          name: 'Aeiou',
          category: { id: 1, name: 'ZC', slug: 'zc' },
        },
      ],
    })
    cy.intercept('GET', '/api/categories/qualification_categories/*', {
      results: [],
    })
    cy.intercept('GET', '/api/frontend/locations/\\?*', { results: locations })
    cy.intercept('GET', '/api/frontend/search_users/?search=*', req => {
      req.reply({
        results: searchUsers
          .filter(user =>
            (
              user.display_name +
              user.first_name +
              user.last_name +
              user.nickname
            )
              .toLowerCase()
              .includes((req.query.search as string).toLowerCase()),
          )
          .slice(5),
      })
    })
    cy.intercept(
      { method: 'GET', pathname: '/api/frontend/users/' },
      { results: [] },
    )
  })

  // go to next step
  const next = () => {
    cy.get('button[aria-label="Go to next step"]').should('be.visible').click()
  }

  it('can fill form and send data to create a new event', () => {
    cy.visit('/org/akce/vytvorit')
    cy.location('pathname').should('equal', '/org/akce/vytvorit')
    // first page
    cy.get('label[for=other]').should('be.visible').click()

    next()

    cy.get('input[name=name]').should('be.visible').type('Event Name III')
    cy.get('input[name=start]').should('be.visible').type('2023-01-15')
    cy.get('input[name=start_time]').should('be.visible').type('15:31')
    cy.get('input[name=end]').should('be.visible').type('2023-01-17')
    cy.get('[name=category]').should('be.visible').select(2)
    cy.get('[name=program]').should('be.visible').select('bb')
    cy.get('#react-select-3-input')
      .should('be.visible')
      .click()
      .type('{downArrow}{enter}')

    next()

    cy.get('input[name=intended_for]').should('be.visible').check('3')

    next()

    cy.get('#react-select-5-input')
      .should('be.visible')
      .click()
      .type('Location 3')
      .wait(2000)
      .type('{downArrow}{downArrow}{enter}')

    next()

    cy.get('[name="propagation.is_shown_on_web"]')
      .should('be.visible')
      .check('true')

    cy.get('[name=registrationMethod]').should('be.visible').check('none')

    next()

    cy.get('[name="propagation.cost"]').should('be.visible').type('10/100/1000')
    cy.get('[name="propagation.minimum_age"]').should('be.visible').type('12')
    cy.get('[name="propagation.maximum_age"]').should('be.visible').type('120')

    next()

    cy.get('#propagation\\.invitation_text_introduction')
      .should('be.visible')
      .type('intro')
    cy.get('#propagation\\.invitation_text_practical_information')
      .should('be.visible')
      .type('practical information')

    cy.get('[name=main_image\\.image]')
      .parent()
      .should('be.visible')
      .selectFile('cypress/e2e/image.png')
    cy.get('[name=images\\.0\\.image]')
      .parent()
      .should('be.visible')
      .selectFile('cypress/e2e/image.png')
    cy.get('[name=images\\.1\\.image]')
      .parent()
      .should('be.visible')
      .selectFile('cypress/e2e/image.png')
    cy.get('[name=images\\.2\\.image]')
      .parent()
      .should('be.visible')
      .selectFile('cypress/e2e/image.png')

    next()

    cy.get('#react-select-7-input')
      .should('be.visible')
      .click()
      .type('displayname2')
      .wait(2000)
      .type('{downArrow}{downArrow}{downArrow}{enter}')

    cy.get('[placeholder=DD]').should('be.visible').type('29')
    cy.get('[placeholder=MM]').should('be.visible').type('02')
    cy.get('[placeholder=RRRR]').should('be.visible').type('2000')
    cy.intercept('POST', '/api/frontend/get_unknown_user/', {
      id: '1345',
      first_name: 'FirstName',
      last_name: 'LastName',
      nickname: 'Nickname',
      _search_id: '27',
      display_name: 'Found User',
      birthday: '2000-01-01',
      qualifications: [],
    })
    cy.get('[type=submit]').contains('Pokračuj').should('be.visible').click()

    cy.get('[name=contactPersonIsMainOrganizer]').should('be.visible').check()

    cy.intercept('POST', '/api/frontend/events/', req => {
      expect(req.body).to.have.property('name')
      // TODO add a bit more detailed test here
      req.reply({ id: 1 })
    }).as('createEvent')

    cy.intercept('POST', '/api/frontend/events/1/propagation/images/', {})
    cy.intercept('POST', '/api/frontend/events/1/questionnaire/questions/', {})

    cy.get('[type=submit]').should('be.visible').click()

    // test that event was saved
    cy.wait('@createEvent')

    // test that we got redirected to the event page
    cy.location('pathname').should('equal', '/org/akce/1')
  })

  it('shows validation errors', () => {
    // go to form
    cy.visit('/org/akce/vytvorit')
    cy.location('pathname').should('equal', '/org/akce/vytvorit')
    // submit form without filling data in
    cy.get('[type=submit]').should('be.visible').click()
    // still in the form
    cy.location('pathname').should('equal', '/org/akce/vytvorit')
    // check that error message was shown
    cy.contains('Opravte, prosím, chyby ve validaci')
  })
})
