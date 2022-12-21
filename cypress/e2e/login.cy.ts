/// <reference types="Cypress" />
import { mergeWith } from 'lodash'
import type { User } from '../../src/app/services/bisTypes'
import { withOverwriteArray } from '../../src/utils/helpers'

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

const user: User = mergeWith({}, organizer, { roles: [] }, withOverwriteArray)

describe('login', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/auth/login/', { token: '1234567890abcdef' })
    cy.intercept('GET', '/api/auth/whoami/', {
      id: '0419781d-06ba-432b-8617-797ea14cf848',
    })
  })

  it('can sign in as organizer', () => {
    cy.intercept('GET', '/api/frontend/users/*', organizer)
    // go to the app
    cy.visit('/')
    // redirect to /login page
    cy.location('pathname').should('equal', '/login')
    // fill in email and password
    cy.get('input[name=email]').should('be.visible').type('asdf@example.com')
    cy.get('input[name=password]')
      .should('be.visible')
      .type('correcthorsebatterystaples')
    cy.get('[type=submit]').should('be.visible').click()
    // api request is sent
    // app redirects to home
    cy.location('pathname').should('equal', '/org')
    cy.contains('Organizátor')
  })

  it('can sign in as user', () => {
    cy.intercept('GET', '/api/frontend/users/*', user)
    // go to the app
    cy.visit('/')
    // redirect to /login page
    cy.location('pathname').should('equal', '/login')
    // fill in email and password
    cy.get('input[name=email]').should('be.visible').type('asdf@example.com')
    cy.get('input[name=password]')
      .should('be.visible')
      .type('correcthorsebatterystaples')
    cy.get('[type=submit]').should('be.visible').click()
    // api request is sent
    // app redirects to home
    cy.location('pathname').should('equal', '/')
    cy.contains('Uživatel')
  })
})
