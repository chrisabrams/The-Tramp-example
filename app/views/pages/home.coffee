DualView = loader 'views/base/dual_view'

module.exports = class HomeView extends DualView
  autoRender: yes
  container: '.layout-main'
  containerMethod: 'append'
  id: 'home-view'
  template: 'pages/home'

  listen:
    'addedToDOM': 'onAddedToDOM'

  onAddedToDOM: ->
