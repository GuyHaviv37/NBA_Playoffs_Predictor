const {check} = require('express-validator');

module.exports = {
    requireEmail : check('email').trim().normalizeEmail().isEmail(),
    requireUsername : check('username').trim().isLength({min: 3, max: 30}),
    requirePassword : check('password').trim().isLength({min:6}),
    requirePasswordConfirmation : check('passwordConfirmation').trim()
    .custom( (passwordConfirmation,{req})=>{
        if(req.body.password !== passwordConfirmation){
            throw new Error('Password and Password Confirmation do not match')
        }
        return true;
    })
}