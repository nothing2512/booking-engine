'use strict'

class LoginWithUsername {
  get rules() {
    return {
      username: 'required_without_any:email',
      password: 'required'
    }
  }
  async fails(errorMessages) {
    return this.ctx.response.badRequest(errorMessages)
  }
}

module.exports = LoginWithUsername
