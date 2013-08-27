Chaplin  = loader 'chaplin'

FooterView = loader 'views/layout/footer'
HeaderView = loader 'views/layout/header'

module.exports = class Layout extends Chaplin.Layout

  initialize: ->

    if typeof window is 'object'
      super

    @header = new HeaderView

    @footer = new FooterView

    @
