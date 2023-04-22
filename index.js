const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const authRouter = require('./routes/admin/auth');
const adminProductsRouter = require('./routes/admin/products');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

const app = express(); // all different things our app can do

app.use(express.static('public'));

//middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    keys: ['jdsbjcvdsjcvsd'] // encryption key to encode cookie so that user cannot change it
}));

app.use(authRouter);
app.use(productsRouter);
app.use(adminProductsRouter);
app.use(cartsRouter);
// to listen incoming traffic coming from browser
app.listen(3000, ()=> {
    console.log("Listening");
});

// middleware for printing data from request body
// const bodyParser = (req, res, next) => {

//     if(req.method === 'POST'){
//          // this req is similar to event listener
//     req.on('data', data=>{
//         const parsed = data.toString('utf8').split('&');
//         // for extracting form data from request body 
//         const formData={};
//         for(let pair of parsed){
//             const [key, value] = pair.split('=');
//             formData[key]=value;
//         }
//         req.body = formData;
//         next();
//     });
//     }else{
//         next();
//     }
// };
