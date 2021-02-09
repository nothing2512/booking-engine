'use strict'

class StoreUser {
  get rules() {
    return {
      username: 'required|string|unique:users|min:6',
      email: 'required|email|unique:users',
      password: 'required|min:8',
      name: 'required|string',
      date_of_birth: 'date',
      address: "string",
      location: 'object'
    }
  }
  get sanitizationRules() {
    return {
      username: 'trim',
      email: 'normalize_email'
    }
  }
  async fails(errorMessages) {
    return this.ctx.response.badRequest(errorMessages)
  }
}

module.exports = StoreUser
