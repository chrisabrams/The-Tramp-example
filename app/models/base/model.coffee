_        = loader 'underscore'
Chaplin  = loader 'chaplin'

module.exports = class Model extends Chaplin.Model
  defaults: {}

  initialize: (options) ->

    @options = _.extend {}, @defaults, _.omit(options, ['collection', 'model'])

    super
