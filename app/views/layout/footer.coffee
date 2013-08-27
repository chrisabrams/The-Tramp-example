DualView      = loader 'views/base/dual_view'

module.exports = class FooterView extends DualView
  autoRender: yes
  container: 'body'
  containerMethod: 'append'
  id: 'footer'
  tagName: 'footer'
  template: 'layout/footer'
