DualView      = loader 'views/base/dual_view'

module.exports = class HeaderView extends DualView
  autoRender: yes
  container: 'body'
  containerMethod: 'prepend'
  id: 'header'
  tagName: 'header'
  template: 'layout/header'

  listen:
    'addedToDOM': 'onAddedToDOM'

  onAddedToDOM: ->
