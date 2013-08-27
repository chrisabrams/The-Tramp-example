Chaplin = loader 'chaplin'
View    = loader 'views/base/view'

module.exports = class CollectionView extends Chaplin.CollectionView

  getTemplateFunction: View::getTemplateFunction
