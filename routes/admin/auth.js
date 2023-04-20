const express = require('express');
const { check, validationResult } = require('express-validator');

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
async(req,res) => {
    // will be invoked before we have full access to request body, as 
    // this runs on the url request received
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.send(signupTemplate({ req, errors}));
    }

    const {email, password, passwordConfirmation} = req.body;

    // Create a user in our user repo to represent this person
    const user = await usersRepo.create({email, password});

    // Store the id of that user inside the users cookie
    req.session.userId = user.id; //added by cookie session

    res.send('Account created!!!');
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
    ,requireValidPasswordForUser
], async(req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.send(signinTemplate({ errors }));
    }

    const{email} = req.body;

    const user = await usersRepo.getOneBy({email});

    req.session.userId = user.id;

    res.send('You are signed in!!');

});

module.exports = router;