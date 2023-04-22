const express = require('express');

const { handleErrors } = require('./middlewares');

const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const { 
    requireEmail,
    requirePassword, 
    requirePasswordConfirmation,
    requireEmailExists,
    requireValidPasswordForUser    
} = require('./validator');

const router = express.Router();

// route handler
router.get('/signup',(req,res)=>{
    res.send(signupTemplate({req}));
});


// to save user details
router.post('/signup', 
    [
    requireEmail,
    requirePassword,
    requirePasswordConfirmation
    ],
    handleErrors(signupTemplate),
async(req,res) => {
    // will be invoked before we have full access to request body, as 
    // this runs on the url request received

    const {email, password } = req.body;

    // Create a user in our user repo to represent this person
    const user = await usersRepo.create({email, password});

    // Store the id of that user inside the users cookie
    req.session.userId = user.id; //added by cookie session

    res.redirect('/admin/products');
});

router.get('/signout', (req,res)=>{
    req.session=null;
    res.send('You are logged out');
});

router.get('/signin',(req,res)=>{
    res.send(signinTemplate({}));
});

//post request handler
router.post('/signin',[
    requireEmailExists
    ,requireValidPasswordForUser],
    handleErrors(signinTemplate), 
async(req,res) => {
    
    const{email} = req.body;

    const user = await usersRepo.getOneBy({email});

    req.session.userId = user.id;

    res.redirect('/admin/products');

});

module.exports = router;