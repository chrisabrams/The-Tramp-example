DualApplication = loader 'the-tramp/application'

module.exports = class Application extends DualApplication

  title: 'The Tramp Example'

  templateHelpers: [
    'templates/helpers/common'
  ]
