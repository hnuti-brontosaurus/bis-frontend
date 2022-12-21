import type { User } from '../../src/app/services/bisTypes'

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
} as User

describe('create event', () => {
  // stub api endpoints before each request
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login/', { token: '1234567890abcdef' })
    cy.intercept('GET', '/api/auth/whoami/', {
      id: '0419781d-06ba-432b-8617-797ea14cf848',
    })
    cy.intercept('GET', '/api/frontend/users/*', organizer)
  })

  // sign in before each request
  beforeEach(() => {
    cy.login('asdf@example.com', 'correcthorsebatterystaples')
  })

  it('can create a new event', () => {
    cy.visit('/org/akce/vytvorit')
    cy.location('pathname').should('equal', '/org/akce/vytvorit')
  })
})
