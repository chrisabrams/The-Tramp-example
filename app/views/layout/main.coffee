mediator = loader 'mediator'
DualView = loader 'views/base/dual_view'

module.exports = class IndexView extends DualView
  autoRender: yes
  container: '#page-container'
  containerMethod: 'append'
  id: 'index-view'
  layout: false
  #template: 'layout/main'

  initialize: (options = {}) ->
    if options?.layout
      @template = 'layout/main'

    super
