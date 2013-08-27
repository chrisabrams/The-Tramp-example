Chaplin  = loader 'chaplin'

module.exports = class View extends Chaplin.View

  # Precompiled templates function initializer.
  getTemplateFunction: ->
    @_cachedTemplateFunction ||= loader("templates/#{@template}") if @template
