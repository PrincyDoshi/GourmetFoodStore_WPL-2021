var express = require('express');
const jsSHA = require("jssha");

var router = express.Router();
var monk = require('monk');
var parser = require('body-parser');
var urlencodedParser = parser.urlencoded({ extended: false });
///
var app = express.Router();
var passport = require('passport');
var Account = require('../models/account');
const { use } = require('passport');


var db = monk('localhost:27017/GoumetFoodStore');

var products = db.get('Products');
var cart = db.get('CartProducts');
var orderHistory = db.get('OrderHistory');

router.get('/', function (req, res) {
  res.redirect('/login');
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', urlencodedParser, passport.authenticate('local'), function (req, res) {
  res.redirect('/home');
});

router.get('/signup', function (req, res) {
  res.render('signup', {});
});

router.post('/signup', function (req, res) {
  console.log("rece body : ", req.body)
  Account.register(new Account({ username: req.body.email, address: req.body.address, phone: req.body.phone, fullName: req.body.fullName, isAdmin: "false", email: req.body.email }), req.body.password, function (err, account) {
    if (err) {
      console.log("failed to create new account", err);
      res.send(false);
      console.log("Response"+res);
    }
    else
    {
      passport.authenticate(urlencodedParser, 'local')(req, res, function () {
        res.send(true);
      });
    }
  });
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/login');
});

router.post('/addToCart/:productID', function (req, res) {

  products.findOne({ _id: req.params.productID }, function (err, prod) {
    if (err) throw err;
    var qntyAvail="true";
    
    if(parseInt(prod.availableQnty)< parseInt(req.body.Quantity))
    {
      qntyAvail="false";
    }
    if(qntyAvail=="true")
    {
      var newItem = {
        productID: req.params.productID,
        image: prod.image,
        quantity: req.body.Quantity,
        ProdName: prod.prodName,
        price: prod.price,
        max: prod.availableQnty
      }

      cart.findOne({ userid: req.user._id }, function (err, userCart) {
        if (err) {
          console.log("error in findone", err);
          throw err;
        }
        if (userCart == undefined) {
          var arr = [];
          arr.push(newItem);
          var newCart = {
            userid: req.user._id,
            items: arr
          }
          cart.insert(newCart, function (error) {
            if (error) {
              console.log("error in insert", error);
              throw error;
            }

            res.redirect('/home');
          });
        }

        else {
          var initialCart = userCart.items;
          var isItemPresent = false;
          var oldQnty = 0;

          for (var i = 0; i < initialCart.length; i++) {
            if (newItem.productID == initialCart[i].productID) {
              console.log("Item already present in cart");
              isItemPresent = true;
            }
          }
          if (isItemPresent == false) {
            initialCart.push(newItem);


            cart.update({ _id: userCart._id }, {
              $set: {
                userid: req.user._id,
                items: initialCart
              }
            }, function (err) {
              if (err) throw err;
              res.redirect('/home');
            });
          }
          else
          {
            res.redirect('/home');

          }
        }
      });
    }
    else{
      console.log(prod.prodName+"Not in Stock");
    }
  });
});

router.get('/home', function (req, res) {
  var user = req.user;
  products.find({ isDeleted: false }, function (err, products) {
    if (err) throw err;
    res.render('home', { user: req.user, result: products });

  });
  
});


router.get('/cart', function (req, res) {
  var user = req.user;
  var itemsInCart = [];
  var total = 0;


  cart.findOne({ userid: req.user._id }, function (err, userCart) {
    if (err) throw err;

    if (userCart != undefined) {
      userCart.items.forEach(function (item) {
        total = total + (item.quantity * item.price);
      });

      res.render('cart', { user: req.user, items: userCart.items, totalCost: total });
    } else {
      res.render('cart', {user: req.user, items: [], totalCost: 0 });
    }
  });
});


router.get('/detailedView/:productId', function (req, res) {
  products.findOne({ _id: req.params.productId }, function (err, product) {
    if (err) throw err;
    res.render('detailedView', { product: product, user: req.user });
  });
})

router.get('/edit/:productId', function (req, res) {

  products.findOne({ _id: req.params.productId }, function (err, product) {
    if (err) throw err;

    res.render('edit', { product: product });
  });

});

router.post('/edit/:productId', function(req, res) {
  var img = req.body.image;
  var og;
  products.findOne({ _id: req.params.productId }, function (err, product) {
    if (err) throw err;
    og = product.image;
    products.update({_id : req.params.productId}, {
      $set:{
        prodName: req.body.prodName,
        availableQnty: req.body.availableQnty,
        price: req.body.price,
        calories: req.body.calories,
        image: img==""? og : img,
        description: req.body.description   
    }
  }, function(err) {
    if (err) throw err;

    res.redirect('/home');
  })
  });
})

router.get('/delete/:productId', function (req, res) {
  products.findOne({ _id: req.params.productId }, function (err, product) {
    if (err) throw err;

    products.update({ _id: req.params.productId }, {
      $set: {
        ...product,
        isDeleted: true
      }
    }, function (err) {
      if (err) throw err;

      res.redirect('/home');
    });
  });
});

router.post('/search', function (req, res) {
  console.log("INSIDE SEARCH ROUTE", req.body);
  console.log("user is :", req.user)
  var title = req.body.Search;
  var categories = req.body.Categories;
  products.find({}, function (err, productsList) {
    if (err) throw err;
    var filter = productsList.filter(product => {
      if (product.prodName.toLowerCase().includes(title.toLowerCase()) && product.isDeleted == false) {
        return product;
      }
    });
    if (req.body.Categories != undefined) {
      filter = filter.filter(product => {
        if (product.category == categories) {
          return product
        }
      })
    }
    console.log("filter is :", filter)
    if (filter.length==0){
      res.render('home', { user: req.user, result: [] });
    } else {
      res.render('home', { user: req.user, result: filter });
    }
  });
});

router.get('/add', function (req, res) {
  res.render('add');
});

router.post('/add', function (req, res) {

  var cap = {
    ...req.body,
    isDeleted: false
  };
  console.log("cap obj: ", cap)

  products.insert(cap, function (err) {
    if (err) throw err;
    res.redirect('/home');
  })

});

router.get('/orders', function (req, res) {
  orderHistory.find({ userid: req.user._id }, function (err, list) {
    if (err) {
      console.log(err)
      throw err;
    }
    console.log("list is ", list)

    res.render('orders', { result: list })
  });
});

router.get('/removeCart/:productID', function (req, res) {

  cart.findOne({ userid: req.user._id }, function (err, cartInfo) {
    if (err) throw err;

    var list = cartInfo.items;

    list = list.filter(item => {
      if (item.productID != req.params.productID) {
        return item
      }
    });

    cart.update({ _id: cartInfo._id }, {
      $set: {
        userid: req.user._id,
        items: list
      }
    }, function (err) {
      if (err) throw err;

      res.redirect('/cart');
    });


  });
});


router.post('/updateCart/:productID', function (req, res) {

  console.log("request body is : ", req.body)
  console.log("request param is : ", req.params.productID)
  cart.findOne({ userid: req.user._id }, function(err, cartInfo) {
    if (err) throw err;
    
    var list = cartInfo.items;
    console.log(list);
    for(var i=0;i<list.length;i++)
    {
      if(list[i].productID == req.params.productID)
      {
        list[i].quantity=req.body.quantity;
        console.log("updated list : ", list)
        console.log(list._id);
        cart.update({_id: cartInfo._id},{
          $set:{
            userid: req.user._id,
            items: list
          }},function (err){
            if(err) throw err;
            res.redirect('/cart');
          });
      }
    }
  });
});

router.get('/orderHistory',function(req,res){
  console.log("order history route found")
  
  orderHistory.find({userid: req.user._id}, function(err, list){
   if (err) {
    console.log(err);
    throw err; 
  }
  console.log(list);
  res.render('orderhistory', {results: list});
});
});

router.get('/checkout', function (req, res) {
  cart.findOne({ userid: req.user._id }, function (err, userCart) {
    if (err) throw err;

    var itemsInCart = userCart.items
    var newArr = itemsInCart.filter(item => {
      return item.ProdName
    })
    var today = new Date();

    var order = {
      userid: req.user._id,
      items: newArr,
      date: today.getDate() + "/" + today.getMonth() + "/" + today.getFullYear()
    }
    orderHistory.insert(order, function (er) {
      if (er) throw er;

      itemsInCart.filter(item =>{
        products.findOne({_id: item.productID},function(err1,prod){
          if(parseInt(prod.availableQnty)>= parseInt(item.quantity))
          {
            var qnty=parseInt(prod.availableQnty)-parseInt(item.quantity);
            products.update({_id: item.productID},{
              $set:{
                availableQnty: qnty
              }}) 
          }
        });
      });
    });
    cart.remove({ _id: userCart._id }, function (error) {
      if (error) throw error;

      res.render('thankyou');
    });
  });
});

module.exports = router;
