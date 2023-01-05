import type { Location } from '../../src/app/services/bisTypes'

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

// go to next step
const next = () =>
  cy.get('button[aria-label="Go to next step"]').should('be.visible').click()

const submit = () =>
  cy.get('[type=submit]:contains(Uložit)').first().should('be.visible').click()

describe('create event', () => {
  // stub api endpoints before each request
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', pathname: '/api/categories/qualification_categories/' },
      { fixture: 'qualificationCategories' },
    )
    cy.intercept('POST', '/api/auth/login/', { token: '1234567890abcdef' })
    cy.intercept('GET', '/api/auth/whoami/', {
      id: '0419781d-06ba-432b-8617-797ea14cf848',
    })
    cy.intercept(
      { method: 'GET', path: /\/api\/frontend\/users\/[a-zA-Z0-9-]+\// },
      { fixture: 'organizerWithoutQualifications' },
    )
  })

  // sign in before each request
  beforeEach(() => {
    // https://xkcd.com/936/
    cy.login('asdf@example.com', 'correcthorsebatterystaple')
  })


  it('shows a gray "NOVA AKCE" button that is disabled', () => {
    cy.visit('/org/')
    cy.location('pathname').should('equal', '/org/')

    // check color of the button
    cy.get('a[id=createEvent]')
      .should('have.css', 'background-color')
      .and('eq', 'rgb(244, 248, 250)')
    cy.get('a[id=createEvent]')
      .should('have.css', 'pointer-events')
      .and('eq', 'none')
  })

  it("can't fill form and send data to create a new event", () => {
    cy.visit('/org/akce/vytvorit')
    cy.location('pathname').should('equal', '/org/akce/vytvorit')

    // check that error message was shown
    cy.contains('Nemáš dostatečná práva k TODO text organizátorskému přístupu')
  })

  it("can't clone an event", () => {
    cy.visit('/org/akce/vytvorit?klonovat=1000')

    // check that error message was shown
    cy.contains('Nemáš dostatečná práva k TODO text organizátorskému přístupu')
  })
})
