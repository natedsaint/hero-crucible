var heroPath = './node_modules/hero-starter/',
    Game = require(heroPath + 'game_logic/Game.js'),
    fs = require('fs');

var randomIndex = function(maxExcl) {
  return Math.floor(Math.random(Date.now()) * maxExcl);
};

var Crucible = function(opts) {
  var options = opts || {};

  this.type = options.type || 'full';
};

Crucible.prototype.configs = {
  full: {
    size: 12,
    friends: 12, // includes you
    enemies: 12,
    turns: 1250
  }
};

Crucible.prototype.pour = function(molds) {
  var config = this.configs[this.type];

  this.pourLogo();
  this.config = config;

  this.helpers = require('./lib/basic_helpers.js');
  this.moves = require('./lib/moves.js');
  this.myHeroMove = require(heroPath + 'hero.js');
  this.myHeroHelpers = require(heroPath + 'helpers.js');

  if (this.type === "full") {
    this.game = this.createGameFromMap(this.getRandomMap());
  } else {
    this.game = new Game(config.size);
  }

  this.game.maxTurn = this.config.turns;

  this.addHeroes();
  this.solidify();
};

Crucible.prototype.solidify = function() {
  var turnsToPlay = this.config.turns,
      hero,
      direction;

  for (var i=0; i<turnsToPlay; i++) {
    if (this.game.ended) {
      break;
    } 

    hero = this.game.activeHero;
    if (hero.name === "myHero") {
      if (!this.myHero) {
        this.myHero = hero;
        this.myHero.undecidedCount = 0;
      }
      direction = this.myHeroMove(this.game, this.myHeroHelpers);

      if (direction === undefined) {
        this.myHero.undecidedCount++;
      }

    } else if (typeof this.moves[hero.name] === 'function') {
      direction = this.moves[hero.name](this.game, this.helpers);
    }
    this.game.handleHeroTurn(direction);
  }

  this.reportResult();

};

Crucible.prototype.reportResult = function() {
  var teamState = (this.game.winningTeam) ? "LOST =( " : "WON! =D",
      hero = this.myHero,
      heroFace;

  if (hero.health > 80) {
    heroFace = "^_^";
  } else if (hero.health > 60) {
    heroFace = "*_*";
  } else if (hero.health > 40) {
    heroFace = "0_0";
  } else if (hero.health > 20) {
    heroFace = "-_-";
  } else {
    heroFace = "x_x";
  }

  console.log("  your team " + teamState);
  console.log("  team diamonds: (you/enemy) ", this.game.totalTeamDiamonds);
  console.log("  your team kills: " + this.getTeamKills(0));
  console.log("  enemy team kills: " + this.getTeamKills(1));

  console.log("  your stats: ");
  console.log("   *Ending Health:" +  hero.health + ' (' + heroFace + ')');
  console.log("   *Last Active Turn:" + hero.lastActiveTurn);
  console.log("   *Heroes You Killed:", hero.heroesKilled);
  console.log("   *Graves robbed", hero.gravesRobbed);
  console.log("   *Health recovered", hero.healthRecovered);
  console.log("   *Health given", hero.healthGiven);
  console.log("   *Your diamonds", hero.diamondsEarned);
  console.log("   *Your mines captured", hero.minesCaptured);
  console.log("   *Times undecided", hero.undecidedCount);
  console.log("    Last turn: ", this.game.maxTurn);
};

Crucible.prototype.getTeamKills = function(team) {
  var teamArray = this.game.teams[team],
      kills = 0;
  for (var i=0; i<teamArray.length; i++) {
    kills += teamArray[i].heroesKilled.length;
  }
  return kills;
};

Crucible.prototype.addHeroes = function() {
  var totalCreeps = this.config.friends + this.config.enemies,
      currentTeam = 1,
      allStrats = [],
      currentStrat,
      countCheck;
  
  // add you first
  while(!this.game.addHero(randomIndex(this.config.size), randomIndex(this.config.size),'myHero',0)) {
    // use while loop to keep trying until you've been placed
  }

  for (var name in this.moves) {
    allStrats.push(name);
  }

  while(totalCreeps--) {
    countCheck = (currentTeam) ? this.config.enemies : this.config.friends;
    if (this.game.teams[currentTeam].length >= countCheck) {
      currentTeam = (currentTeam) ? 0 : 1;
      continue;
    }
    currentStrat = allStrats[randomIndex(allStrats.length)];
    while(!this.game.addHero(randomIndex(this.config.size), randomIndex(this.config.size),currentStrat,currentTeam)) {
      // use while loop to keep trying until a person is placed.
    }
    currentTeam = (currentTeam) ? 0 : 1;
  }

  console.warn(this.game.teams[0].length,this.game.teams[1].length);
};

Crucible.prototype.getRandomMap = function() {
  var mapIndex = Math.floor(Math.random() * 8),
      maps = [
         'balanced',
         'bloodDiamond',
         'diamondsEverywhere',
         'oasis',
         'smiley',
         'splitDownTheMiddle',
         'theColosseum',
         'trappedInTheMiddle'
      ];
  console.log("                           === Map used is : [" + maps[mapIndex] + "] ===");
  return './maps/' + maps[mapIndex] + '.txt';
};

//Creates a board from the map in the given file path
Crucible.prototype.createGameFromMap = function(mapFilePath){
  var buffer = fs.readFileSync(mapFilePath);
  var map = buffer.toString('utf8');
  map = map.split('\n');
  for (var i = 0; i < map.length; i++){
    map[i] = map[i].split('|');
  }
  var game = new Game(map.length);
  for (var j = 0; j < map.length; j++){
    for (var k = 0; k < map.length; k++){
      if (map[j][k] === 'DM'){
        game.addDiamondMine(j,k);
      } else if (map[j][k] === 'HW'){
        game.addHealthWell(j,k);
      } else if (map[j][k] === 'IM'){
        game.addImpassable(j,k);
      }
    }
  }
  return game;
};

Crucible.prototype.pourLogo = function() {
  var message = fs.readFileSync('./logo.txt').toString('utf8');
  console.log("\n\n                    === Melting down your hero and pouring them into the ===");
  console.log(message);
  console.log("\n\n");
};

module.exports = Crucible;
