/**
 * Created by Sundar on 5/8/16.
 */
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var UserController=require('./controllers/UserController');
var ProductController=require('./controllers/ProductController');

module.exports = function (app) {
  app.all('/', function (req, res) {
    var __dirname='./public/pages/';
      res.sendFile('login.html', { root: __dirname });
    });

    app.get('/playGround', function (req,res) {
        var __dirname='./public/pages/';
        res.sendFile('index.html', { root: __dirname });
    });

    //Product routes
    app.post('/product',ProductController.save);
    app.get('/product/:id',ProductController.fetch);
    app.get('/products',ProductController.list);
    app.get('/product/:id/image',ProductController.fetchProductImg);
    app.put('/product/:id',ProductController.update);
    app.delete('/product/:id',ProductController.remove);
    app.put('/product/:id/ProductImg',multipartyMiddleware,ProductController.changeProfileImage);
    app.delete('/product/:id/ProductImg',multipartyMiddleware,ProductController.removeProductImg);
};