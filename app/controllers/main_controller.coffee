Controller      = loader 'controllers/base/controller'

IndexView       = loader 'views/layout/main'
HomeView        = loader 'views/pages/home'

module.exports  = class MainController extends Controller

  index: (params) ->

    @view = new IndexView({layout: true})
    @view.subview('home', new HomeView)

    @
