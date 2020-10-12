const express = require('express'),
Bracket = require('../models/bracket'),
router = express.Router();

router.get('/',async (req,res)=>{
    const brackets = await Bracket.find({});
    const noAdminBrackets = brackets.filter(bracket => !(bracket.isAdminBracket));
    noAdminBrackets.sort((a,b)=>{
        return b.score - a.score;
    });
    res.render('landingpage',{brackets : noAdminBrackets});
})

router.get('/leaderboard',async (req,res)=>{
    const brackets = await Bracket.find({});
    const noAdminBrackets = brackets.filter(bracket => !(bracket.isAdminBracket));
    //sort brackets by score
    noAdminBrackets.sort((a,b)=>{
        return b.score - a.score;
    });
    res.render('leaderboard/index',{brackets : noAdminBrackets});
});

router.get('/faq',(req,res)=>{
    res.render('faq')
})

router.get("*", (req, res) => {
    res.send("404 Page Not Found");
})

module.exports = router;