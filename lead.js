
var tbl_leaderboard = document.getElementById('leaderboard');

var purse_percentages;
var leaderboard;

// fetch from the pgatour website...
function fetchLeaderboard(){
    var xhttp = new XMLHttpRequest();

    xhttp.overrideMimeType("application/json");
    console.log("About to send the request...");

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200){
            console.log('Hey, I found the file...');

            console.log(JSON.parse(this.responseText));
            //makeLeaderboard(JSON.parse(this.responseText));

            leaderboard = new Leaderboard(JSON.parse(this.responseText));
        }
    }

    xhttp.open("GET", 'https://statdata.pgatour.com/r/011/2018/leaderboard-v2mini.json');
    xhttp.send(null);
}


function fetchPurseBreakdown(){
    var xhttp = new XMLHttpRequest();

    console.log("Requesting the purse....");

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200){
            console.log('Hey, I got the purse info');

            // .map(Number) converts the array of String to Number
            purse_percentages = this.responseText.split('\n').map(Number); 

            // placeholder to make position 1 map to index 1 (instead of 0)
            purse_percentages.unshift(-1);
            console.log(purse_percentages);

            fetchLeaderboard();
        }
    }

    xhttp.open("GET", 'payouts2.csv');
    xhttp.send(null);   
}


fetchPurseBreakdown();
fetchLeaderboard();

class Leaderboard {

    constructor(json){
        this.purse = 11000000;
        this.table = document.createElement('table');

        this.positions = {};
        this.leaderboard = [];

        var players = json["leaderboard"]["players"];

        for(var i=0; i < players.length; i++){
            var player = players[i];

            if (player["status"] == "active"){
                var playerinfo = player["player_bio"];
                var pos = Number(player["current_position"].replace("T", ""));
    
                // add all players to leaderboard on screen (even if amateur)
                this.addTableRow(player);
    
                // exclude amateur from our leaderboard for money calculations
                if (!playerinfo["is_amateur"]){

                    // player is a copy of the original data
                    //this.leaderboard = [pos, player, score, 0];
                    this.leaderboard.push({"pos": pos, "player": player, "total": player["total"], "money": 0});
                    console.log(player);                
                }
            }
        }

        this.display();
    }

    setPurseBreakdown(purse_breakdown){
        this.purse_breakdown = purse_breakdown;
    }


    addTableRow(player){
        var playerinfo = player["player_bio"]

        var row = this.table.insertRow(-1);
        var cell;
    
        cell = row.insertCell(0).innerHTML = player["current_position"];
        cell = row.insertCell(1).innerHTML = playerinfo["first_name"] + " " + playerinfo["last_name"];
        cell = row.insertCell(2);
    
        cell.innerHTML = player["total"];
        cell.setAttribute("contenteditable", true);
        
        cell = row.insertCell(3).innerHTML = player["thru"];
    }

    // the table on the screen points to this leaderboard's table
    display(){
        tbl_leaderboard = this.table;
    }
}


/*

positions = dict((pos, []) for (pos, name) in leaderboard)

for pos, player in leaderboard:
    positions[pos].append(player) 
    
for pos, players in positions.iteritems():
    total_money = sum(purse_breakdown[pos:pos+len(players)])

    print pos, total_money / len(players) * purse / 100, len(players)
*/
