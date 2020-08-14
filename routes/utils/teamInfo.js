class Team{
    constructor(teamName,teamRecord,teamImg){
        this.teamName = teamName;
        this.teamRecord = teamRecord;
        this.teamImg = teamImg;
    }
}

const teamInfo = {
    MIL : new Team('Milwaukee Bucks','56-16','https://101placeonline.com/assets/team/basketball_3410.png'),
    TOR : new Team('Toronto Raptors','52-19','https://101placeonline.com/assets/team/basketball_3433.png'),
    BOS : new Team('Boston Celtics','48-23','https://101placeonline.com/assets/team/basketball_3422.png'),
    MIA : new Team('Miami Heat','44-28','https://101placeonline.com/assets/team/basketball_3435.png'),
    IND : new Team('Indiana Pacers','44-28','https://101placeonline.com/assets/team/basketball_3419.png'),
    PHI : new Team('Philadelphia 76ers','42-30','https://101placeonline.com/assets/team/basketball_3420.png'),
    BKN : new Team('Brooklyn Nets','35-36','https://101placeonline.com/assets/team/basketball_3436.png'),
    ORL : new Team('Orlando Magic','32-40','https://101placeonline.com/assets/team/basketball_3437.png'),
    LAL : new Team('Los Angeles Lakers','52-18','https://101placeonline.com/assets/team/basketball_3427.png'),
    LAC : new Team('Los Angeles Clippers','48-23','https://101placeonline.com/assets/team/basketball_3425.png'),
    DEN : new Team('Denver Nuggers','46-26','https://101placeonline.com/assets/team/basketball_3417.png'),
    HOU : new Team('Houston Rockets','44-27','https://101placeonline.com/assets/team/basketball_3412.png'),
    UTA : new Team('Utah Jazz','43-28','https://101placeonline.com/assets/team/basketball_3434.png'),
    OKC : new Team('Oklahoma City Thunder','44-27','https://101placeonline.com/assets/team/basketball_3418.png'),
    DAL : new Team('Dallas Mavericks','43-31','https://101placeonline.com/assets/team/basketball_3411.png'),
    MEM : new Team('Memphis Grizzlies','33-39','https://101placeonline.com/assets/team/basketball_3415.png'),
    POR : new Team('Portland Trailblazers','34-39','https://101placeonline.com/assets/team/basketball_3414.png'),
    PHX : new Team('Phoenix Suns','33-39','https://101placeonline.com/assets/team/basketball_3416.png'),
    NA : new Team('','','')
}

module.exports = {
    teamInfo,
    abbrvTrans : {
        'Milwaukee Bucks' : 'MIL',
        'Toronto Raptors' : 'TOR',
        'Boston Celtics' : 'BOS',
        'Miami Heat' : 'MIA',
        'Indiana Pacers' : 'IND',
        'Philadelphia 76ers' : 'PHI',
        'Brooklyn Nets' : 'BKN',
        'Orlando Magic' : 'ORL',
        'Los Angeles Lakers' : 'LAL',
        'Los Angeles Clippers' : 'LAC',
        'Denver Nuggers' : 'DEN',
        'Houston Rockets' : 'HOU',
        'Utah Jazz' : 'UTA',
        'Oklahoma City Thunder' : 'OKC',
        'Dallas Mavericks' : 'DAL',
        'Memphis Grizzlies' : 'MEM',
        'Portland Trailblazers' : 'POR',
        'Phoenix Suns' : 'PHX'
    }
}