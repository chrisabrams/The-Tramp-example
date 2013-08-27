_       = loader 'underscore'
Chaplin = loader 'chaplin'

module.exports = class Collection extends Chaplin.Collection
  defaults: {}

  initialize: (options) ->

    @options = _.extend {}, @options, @defaults, _.omit(options, ['collection', 'model'])

    super
