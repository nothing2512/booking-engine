'use strict'

class StoreAdmin {
  get rules() {
    return {
      username: 'required|string|unique:admins|min:6',
      email: 'required|email|unique:admins',
      password: 'required|min:8',
      name: 'required|string',
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

module.exports = StoreAdmin
