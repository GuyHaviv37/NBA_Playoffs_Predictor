const mongoose = require('mongoose');

const bracketSchema = new mongoose.Schema({
    isAdminBracket : {type: Boolean , default : false},
    score : {type : Number, default : 0},
    potentialScore : {type : Number, default : 550},
    createdAt : {type : Date ,default : Date.now},
    lastUpdated : {type : Date, default : Date.now},
    rank : {type : String, default : 'N/A'},
    // createdAt : {type: Date, default : Date.now},
    // lastUpdated : {type: Date, default : Date.now}
    bracketName : String,
    winner : String,
    owner : {
        id: {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username : String
    },
    predictions : {
        playin : String,
        'east-fr-1': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'east-fr-2': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'east-fr-3': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'east-fr-4': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'west-fr-1': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'west-fr-2': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'west-fr-3': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'west-fr-4': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'east-sf-1': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'east-sf-2': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'west-sf-1': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'west-sf-2': {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'east-cf-1' : {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'west-cf-1' : {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        },
        'all-finals-1' : {
            winningTeam : String,
            winningScore : Number,
            losingTeam : String,
            losingScore : Number
        }
    }
}); 

module.exports = mongoose.model('Bracket',bracketSchema);