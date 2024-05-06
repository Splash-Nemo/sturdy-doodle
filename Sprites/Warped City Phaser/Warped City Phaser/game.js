/*
 * Warped City Demo Code
 * by  @ansimuz
 * Get more free assets and code like these at: www.pixelgameart.org
 * Visit my store for premium content at https://ansimuz.itch.io/
 * */
var game;
var player;
var gameWidth = 384;
var gameHeight = 224;
var bg_1;
var bg_2;
var bg_3;
var globalMap;
var jumpingFlag;
var crouchFlag = false;
var attackingflag;
var enemies_group;
var projectiles_group;
var shootingFlag;
var nextShot;
var hurtFlag;
var audioHurt;
var music;


window.onload = function() {
  game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, "");
  game.state.add('Boot', boot);
  game.state.add('Preload', preload);
  game.state.add('TitleScreen', titleScreen);
  game.state.add('GameOver', gameOver);
  game.state.add('PlayGame', playGame);
  //
  game.state.start('Boot');
}
var boot = function(game) {}
boot.prototype = {
  preload: function() {
    this.game.load.image('loading', 'assets/sprites/loading.png');
  },
  create: function() {
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.renderer.renderSession.roundPixels = true;
    this.game.state.start('Preload');
  }
}
var preload = function(game) {};
preload.prototype = {
  preload: function() {
    var loadingBar = this.add.sprite(game.width / 2, game.height / 2, 'loading');
    loadingBar.anchor.setTo(0.5);
    game.load.setPreloadSprite(loadingBar);
    // load title screen
    game.load.image('title', 'assets/sprites/title-screen.png');
    game.load.image('enter', 'assets/sprites/press-enter-text.png');
    game.load.image('credits', 'assets/sprites/credits-text.png');
    game.load.image('instructions', 'assets/sprites/instructions.png');
    game.load.image('game-over', 'assets/sprites/game-over.png');
    // environment
    game.load.image('bg-1', 'assets/environment/bg-1.png');
    game.load.image("bg-2", 'assets/environment/bg-2.png');
    game.load.image("bg-3", 'assets/environment/bg-3.png');
    // tileset
    game.load.image('tileset', 'assets/environment/tileset.png');
    game.load.tilemap('map', 'assets/maps/map.json', null, Phaser.Tilemap.TILED_JSON);
    // atlas sprite
    game.load.atlasJSONArray('atlas', 'assets/atlas/atlas.png', 'assets/atlas/atlas.json');
    // audio
    game.load.audio('music', ['assets/sounds/sci_fi_platformer02.ogg']);
    game.load.audio('attack', ['assets/sounds/beam.ogg']);
    game.load.audio('kill', ['assets/sounds/explosion.ogg']);
    game.load.audio('hurt', ['assets/sounds/hurt.ogg']);
  },
  create: function() {
  //this.game.state.start('PlayGame');
       this.game.state.start('TitleScreen');
  }
}
var titleScreen = function(game) {};
titleScreen.prototype = {
  create: function() {
    bg_1 = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'bg-1');
    bg_2 = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'bg-2');
    this.title = game.add.image(gameWidth / 2, 100, 'title');
    this.title.anchor.setTo(0.5);
    var credits = game.add.image(gameWidth / 2, game.height - 12, 'credits');
    credits.anchor.setTo(0.5);
    this.pressEnter = game.add.image(game.width / 2, game.height - 60, 'enter');
    this.pressEnter.anchor.setTo(0.5);
    game.time.events.loop(700, this.blinkText, this);
    var startKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    startKey.onDown.add(this.startGame, this);
    this.state = 1;
  },
  blinkText: function() {
    if (this.pressEnter.alpha) {
      this.pressEnter.alpha = 0;
    } else {
      this.pressEnter.alpha = 1;
    }
  },
  update: function() {
    bg_2.tilePosition.x -= 0.2;
  },
  startGame: function() {
    if (this.state == 1) {
      this.state = 2;
      this.title2 = game.add.image(game.width / 2, 40, 'instructions');
      this.title2.anchor.setTo(0.5, 0);
      this.title.destroy();
    } else {
      this.game.state.start('PlayGame');
    }
  }
}

var gameOver = function(game) {};
gameOver.prototype = {
  create: function() {
    bg_1 = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'bg-1');
    bg_2 = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'bg-2');
      this.title = game.add.image(game.width / 2, 90, 'game-over');
    this.title.anchor.setTo(0.5);
    var credits = game.add.image(gameWidth / 2, game.height - 12, 'credits');
    credits.anchor.setTo(0.5);
    this.pressEnter = game.add.image(game.width / 2, game.height - 60, 'enter');
    this.pressEnter.anchor.setTo(0.5);
    game.time.events.loop(700, this.blinkText, this);
    var startKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    startKey.onDown.add(this.startGame, this);
    this.state = 2;
  },
  blinkText: function() {
    if (this.pressEnter.alpha) {
      this.pressEnter.alpha = 0;
    } else {
      this.pressEnter.alpha = 1;
    }
  },
  update: function() {
    bg_2.tilePosition.x -= 0.2;
  },
  startGame: function() {
    if (this.state == 1) {
      this.state = 2;
      this.title2 = game.add.image(game.width / 2, 40, 'game-over');
      this.title2.anchor.setTo(0.5, 0);
      this.title.destroy();
    } else {
      this.game.state.start('PlayGame');
    }
  }
}


var playGame = function(game) {};
playGame.prototype = {
  create: function() {



    this.createBackgrounds();
    this.addVehicles();
    this.createTileMap();
    this.bindKeys();
    this.addDecorations();
    this.createPlayer(2, 24);
    // camera follow
    game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
    this.createGroups();
    this.populate();

  this.startAudios();
  },

  addDecorations: function() {
    //create decorations from objects from the map.json

    // create groups
    this.banner_coke_group = game.add.group();
    this.banner_big_group = game.add.group();
    this.banner_neon_group = game.add.group();
    this.banner_scroll_group = game.add.group();
    this.banner_side_group = game.add.group();
    this.banner_sushi_group = game.add.group();
    this.monitor_group = game.add.group();

    // coke
    globalMap.createFromObjects("Object Layer", 5, "atlas", 0, true, false, this.banner_coke_group);
    this.banner_coke_group.callAll("animations.add", "animations", "banner-coke", Phaser.Animation.generateFrameNames('banner-coke-', 1, 4, '', 0), 30, true);
    this.banner_coke_group.callAll("animations.play", "animations", "banner-coke");
    //big
    globalMap.createFromObjects("Object Layer", 6, "atlas", 0, true, false, this.banner_big_group);
    this.banner_big_group.callAll("animations.add", "animations", "banner-big", Phaser.Animation.generateFrameNames('banner-big-', 1, 4, '', 0), 30, true);
    this.banner_big_group.callAll("animations.play", "animations", "banner-big");
    // neon
    globalMap.createFromObjects("Object Layer", 7, "atlas", 0, true, false, this.banner_neon_group);
    this.banner_neon_group.callAll("animations.add", "animations", "banner-neon", Phaser.Animation.generateFrameNames('banner-neon-', 1, 4, '', 0), 30, true);
    this.banner_neon_group.callAll("animations.play", "animations", "banner-neon");
    // scroll
    globalMap.createFromObjects("Object Layer", 8, "atlas", 0, true, false, this.banner_scroll_group);
    this.banner_scroll_group.callAll("animations.add", "animations", "banner-scroll", Phaser.Animation.generateFrameNames('banner-scroll-', 1, 4, '', 0), 30, true);
    this.banner_scroll_group.callAll("animations.play", "animations", "banner-scroll");
    // side
    globalMap.createFromObjects("Object Layer", 9, "atlas", 0, true, false, this.banner_side_group);
    this.banner_side_group.callAll("animations.add", "animations", "banner-side", Phaser.Animation.generateFrameNames('banner-side-', 1, 4, '', 0), 30, true);
    this.banner_side_group.callAll("animations.play", "animations", "banner-side");
    // sushi
    globalMap.createFromObjects("Object Layer", 10, "atlas", 0, true, false, this.banner_sushi_group);
    this.banner_sushi_group.callAll("animations.add", "animations", "banner-sushi", Phaser.Animation.generateFrameNames('banner-sushi-', 1, 3, '', 0), 30, true);
    this.banner_sushi_group.callAll("animations.play", "animations", "banner-sushi");
    // monitor
    globalMap.createFromObjects("Object Layer", 11, "atlas", 0, true, false, this.monitor_group);
    this.monitor_group.callAll("animations.add", "animations", "monitor-group", Phaser.Animation.generateFrameNames('monitor-face-', 1, 4, '', 0), 10, true);
    this.monitor_group.callAll("animations.play", "animations", "monitor-group");
  },





  startAudios: function() {
    // audios
    this.audioKill = game.add.audio("kill");
    this.audioAttack = game.add.audio("attack");
    audioHurt = game.add.audio("hurt");

    // music
    music = game.add.audio('music');
    music.loop = true;
    music.play();
  },

  createGroups: function() {
    // projectiles groups
    projectiles_group = game.add.group();
    projectiles_group.enableBody = true;
    //enemies group
    enemies_group = game.add.group();
    enemies_group.enableBody = true;
  },
  populate: function() {

    //Drones
    this.addDrone(20, 9);
    this.addDrone(41, 12);
      this.addDrone(41, 7);
        this.addDrone(93, 6);

    //Turrets
    this.addTurret(3, 20);
    this.addTurret(22, 11);
    this.addTurret(40, 18);
    this.addTurret(77, 20);
    this.addTurret(104, 13);
  },
  shoot: function() {
    if (nextShot > game.time.now) {
      return;
    }
    nextShot = game.time.now + 600;



    var shot = new Shot(game, player.x, player.y - 4, player.scale.x);
    projectiles_group.add(shot);
    this.audioAttack.play();
  },

  addDrone: function(x, y) {
    var temp = new Drone(game, x, y);
    game.add.existing(temp);
    enemies_group.add(temp);
  },
  addTurret: function(x, y) {
    var temp = new Turret(game, x, y);
    game.add.existing(temp);
    enemies_group.add(temp);
  },

  bindKeys: function() {
    this.wasd = {
      jump: game.input.keyboard.addKey(Phaser.Keyboard.X),
      attack2: game.input.keyboard.addKey(Phaser.Keyboard.K),
      attack: game.input.keyboard.addKey(Phaser.Keyboard.C),

      left: game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
      right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
      crouch: game.input.keyboard.addKey(Phaser.Keyboard.DOWN),
      up: game.input.keyboard.addKey(Phaser.Keyboard.UP),
    }
    game.input.keyboard.addKeyCapture(
      [Phaser.Keyboard.C,
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.X
      ]
    );
  },
  createPlayer: function(x, y) {
    var temp = new Player(game, x, y);
    game.add.existing(temp);
  },


  addVehicles: function() {

    // top v
    this.v_red = game.add.sprite(3 * 16, 3 * 16, 'atlas', 'v-red');
    this.v_red.scale.x = -1;
    this.v_yellow = game.add.sprite(3 * 16, 6 * 16, 'atlas', 'v-yellow');
    this.v_yellow.scale.x = -1;
    this.v_truck = game.add.sprite(3 * 16, 7 * 16, 'atlas', 'v-truck');
    this.v_police = game.add.sprite(3 * 16, 1 * 16, 'atlas', 'v-police');

    // bottom v
    this.v_red2 = game.add.sprite(20 * 16, 26 * 16, 'atlas', 'v-red');
    this.v_red2.scale.x = -1;
    this.v_yellow2 = game.add.sprite(7 * 16, 20 * 16, 'atlas', 'v-yellow');
    this.v_yellow2.scale.x = -1;
    this.v_truck2 = game.add.sprite(30 * 16, 18 * 16, 'atlas', 'v-truck');
    this.v_police2 = game.add.sprite(11 * 16, 9 * 16, 'atlas', 'v-police');

  },





  createBackgrounds: function() {
    bg_1 = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'bg-1');
    bg_2 = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'bg-2');
    bg_3 = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'bg-3');
    //
    bg_1.fixedToCamera = true;
    bg_2.fixedToCamera = true;
    bg_3.fixedToCamera = true;
  },
  createTileMap: function() {
    // tiles
    globalMap = game.add.tilemap('map');
    globalMap.addTilesetImage('tileset');


    globalMap.setTileIndexCallback(3, this.triggerLadder, this);
    //
    this.layer = globalMap.createLayer('Main Layer');
    this.layer.resizeWorld();
    //
    //
    this.layer_collisions = globalMap.createLayer("Collisions Layer");
    this.layer_collisions.resizeWorld();
    // collisions
    globalMap.setCollision([1]);
    this.layer_collisions.visible = false;
    this.layer_collisions.debug = false;
    // one way collisions
    this.setTopCollisionTiles(2);


  },
  setTopCollisionTiles: function(tileIndex) {
    var x, y, tile;
    for (x = 0; x < globalMap.width; x++) {
      for (y = 1; y < globalMap.height; y++) {
        tile = globalMap.getTile(x, y);
        if (tile !== null) {
          if (tile.index == tileIndex) {
            tile.setCollision(false, false, true, false);
          }
        }
      }
    }
  },

  triggerLadder: function(obj) {

    if (obj.kind == "player" && this.wasd.up.isDown) {
      obj.onLadder = true;
    }
  },
  update: function() {


    //physics
    game.physics.arcade.collide(player, this.layer_collisions);
    game.physics.arcade.collide(enemies_group, this.layer_collisions);
    game.physics.arcade.collide(projectiles_group, this.layer_collisions, this.hitWall, null, this);
    //  //overlaps
    game.physics.arcade.overlap(enemies_group, projectiles_group, this.hitEnemy, null, this);
    game.physics.arcade.overlap(player, enemies_group, this.hurtPlayer, null, this);
    this.hurtFlagManager();
    this.movePlayer();
    this.parallaxBackground();
    //
    //
    // if end is reached display game over screen
    if (player.position.x > this.world.width - 100) {
      this.game.state.start('GameOver');
      music.stop();
    }


    // death form falling
    if (player.position.y > this.world.height + 100) {
      player.x = 2 * 16;
      player.y = 24 * 16;
    }



    this.moveVehicles();


    this.playerAnimations();
    this.debugGame();




  },

  moveVehicles: function() {
    var w = this.world.width;

    // reset vehicles positions
    if (this.v_red.x >= w + 200) {
      this.v_red.x = -200;
    } else {
      // move vehicles
      this.v_red.x += 7;
    }


    // reset vehicles positions
    if (this.v_yellow.x >= w + 200) {
      this.v_yellow.x = -200;
    } else {
      // move vehicles
      this.v_yellow.x += 9;
    }


    // reset vehicles positions
    if (this.v_police.x <= -200) {
      this.v_police.x = w + 200;
    } else {
      // move vehicles
      this.v_police.x -= 9;
    }


    // reset vehicles positions
    if (this.v_truck.x <= -600) {
      this.v_truck.x = w + 600;
    } else {
      // move vehicles
      this.v_truck.x -= 3;
    }


    // bottom vehicles

    if (this.v_red2.x >= w + 200) {
      this.v_red2.x = -200;
    } else {
      // move vehicles
      this.v_red2.x += 7;
    }


    // reset vehicles positions
    if (this.v_yellow2.x >= w + 200) {
      this.v_yellow2.x = -200;
    } else {
      // move vehicles
      this.v_yellow2.x += 9;
    }


    // reset vehicles positions
    if (this.v_police2.x <= -200) {
      this.v_police2.x = w + 200;
    } else {
      // move vehicles
      this.v_police2.x -= 9;
    }


    // reset vehicles positions
    if (this.v_truck2.x <= -600) {
      this.v_truck2.x = w + 600;
    } else {
      // move vehicles
      this.v_truck2.x -= 3;
    }
  },

  hitEnemy: function(enemy, shot) {
    var impact = new ShotImpact(game, shot.x, shot.y, shot.scale.x);
    game.add.existing(impact);

    var death = new EnemyDeath(game, enemy.x, enemy.y);
    game.add.existing(death);
    shot.kill();
   enemy.kill();
     this.audioKill.play();

  },
  hitWall: function(shot, wall) {

    var dir = (shot.scale.x == 1) ? 20 : -20;
    var impact = new ShotImpact(game, shot.x + dir, shot.y, shot.scale.x);
    game.add.existing(impact);
    shot.kill();
  },
  playerAnimations: function() {
    if (hurtFlag) {
      return;
    }

    if (jumpingFlag) {
      if (player.body.velocity.y > 0) {
        player.animations.play("fall");
      }
      return;
    }


    if (player.body.onFloor()) {
      if (player.body.velocity.x != 0) {
        if (shootingFlag) {
          player.animations.play("run-shoot");
        } else {
          player.animations.play("run");
        }
      } else {
        if (this.wasd.crouch.isDown) {
          player.animations.play("duck");
          isDuck = true;
        } else {
          player.animations.play("idle");
          isDuck = false;
          if (shootingFlag) {
            player.animations.play("shoot")
          } else {
            player.animations.play("idle");
          }
        }
      }
    } else {

    }
  },

  hurtPlayer: function() {
    if (hurtFlag) {
      return;
    }
    hurtFlag = true;
    player.animations.play('hurt');
    player.body.velocity.y = -100;
    player.body.velocity.x = (player.scale.x == 1) ? -60 : 60;
    audioHurt.play();
  },
  hurtFlagManager: function() {
    // reset hurt when touching ground
    if (hurtFlag && player.body.onFloor()) {
      hurtFlag = false;
    }
  },

  debugGame: function() {

    //  game.debug.body(player);
    //enemies_group.forEachAlive(this.renderGroup, this);
    //projectiles_group.forEachAlive(this.renderGroup, this);
  },
  parallaxBackground: function() {
    bg_2.tilePosition.x = this.layer.x * -.08;
    bg_3.tilePosition.x = this.layer.x * -.2;
  },
  movePlayer: function() {
    if (hurtFlag) {
      return;
    }

    // LADDER
    if (player.onLadder) {
      player.animations.play("climb");

      var velY = 90;
      if (this.wasd.crouch.isDown) {
        player.body.velocity.y = velY;
      } else if (this.wasd.up.isDown) {
        player.body.velocity.y = -velY;
      }

      //horizontal

      if (this.wasd.left.isDown) {

      } else {
        player.body.velocity.x = 0;

      }
      return;
    }




    var vel = 150;

    // reset jumpingflag
    if (player.body.onFloor()) {
      jumpingFlag = false;
    }


    if (this.wasd.left.isDown) {
      player.body.velocity.x = -vel;

      player.scale.x = -1;
    } else if (this.wasd.right.isDown) {
      player.body.velocity.x = vel;

      player.scale.x = 1;
    } else {
      player.body.velocity.x = 0;
      if (this.wasd.crouch.isDown) {

        if (!crouchFlag) {
          player.animations.play('crouch');
          crouchFlag = true;
        }
      }

    }
    // reset crouch state
    if (this.wasd.crouch.isUp) {
      crouchFlag = false;
    }
    // jump
    if (this.wasd.jump.isDown && player.body.onFloor()) {
      player.body.velocity.y = -170;
      player.animations.play('jump');
      jumpingFlag = true;
    }
    //shooting
    if (this.wasd.attack.isDown || this.wasd.attack2.isDown) {
      shootingFlag = true;
      this.shoot();
    } else {
      shootingFlag = false;
    }
  },
  renderGroup: function(member) {
    game.debug.body(member);
  }
}
// player entity
Player = function(game, x, y) {
  kind = "player";
  onLadder = false;
  x *= 16;
  y *= 16;
  this.initX = x;
  this.initY = y;
  Phaser.Sprite.call(this, game, x, y, "atlas", "idle-1");
  this.anchor.setTo(0.5);
  game.physics.arcade.enable(this);
  this.body.setSize(13, 46, 31, 21);
  this.body.gravity.y = 400;
  this.kind = "player";
  player = this;
  // add animations
  var animVel = 12;
  this.animations.add('idle', Phaser.Animation.generateFrameNames('idle-', 1, 4, '', 0), animVel - 4, true);
  this.animations.add('run', Phaser.Animation.generateFrameNames('run-', 1, 8, '', 0), animVel - 4, true);
  this.animations.add('run-shoot', Phaser.Animation.generateFrameNames('run-shoot-', 1, 8, '', 0), animVel - 4, true);
  this.animations.add('jump', Phaser.Animation.generateFrameNames('jump-', 1, 3, '', 0), animVel - 4, true);
  this.animations.add('climb', Phaser.Animation.generateFrameNames('climb-', 1, 6, '', 0), animVel - 4, true);
  this.animations.add('fall', ['jump-4'], animVel, true);
  this.animations.add('crouch', ['crouch'], animVel, true);
  this.animations.add('hurt', ['hurt'], animVel, true);
  this.animations.add('shoot', ['shoot'], animVel, true);
  this.animations.play('idle');
}
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function() {
  if (this.onLadder) {
    this.body.gravity.y = 0;
  } else {
    this.body.gravity.y = 300;
  }
  this.onLadder = false;

}
// enemies

// DRONE
Drone = function(game, x, y) {
  x *= 16;
  y *= 16;
  this.droneState = 0,
    // 0: going left,
    //1: turning right,
    //2: right,
    //3: turning left
    turningFlag = false,
    this.xDir = -1;
  this.speed = 80;
  this.velocity = 80;
  this.turnTimerTrigger = 100;
  this.turnTimer = this.turnTimerTrigger;
  Phaser.Sprite.call(this, game, x, y, 'atlas', 'drone-1');
  game.physics.arcade.enable(this);
  this.body.setSize(27, 24, 16, 18);
  this.anchor.setTo(0.5);
  this.animations.add('idle', ['drone-1'], 9, true);
  var anim = this.animations.add('turn', ['drone-2', 'drone-3'], 9, false);
  anim.onComplete.add(function() {
    //  console.log("DONE");
    if (this.droneState == 1) {
      this.droneState = 2;

    } else {
      this.droneState = 0;
    }
    this.animations.play('idle');

  }, this);
  this.animations.play('idle');
};
Drone.prototype = Object.create(Phaser.Sprite.prototype);
Drone.prototype.constructor = Drone;
Drone.prototype.update = function() {
  this.body.velocity.x = this.speed * this.xDir;
  // controller
  if (this.droneState == 0) {
    this.speed = this.velocity;
    this.scale.x = 1;
  } else if (this.droneState == 2) {
    this.speed = -this.velocity;
    this.scale.x = -1;
  }

  // turn around
  if (this.turnTimer <= 0) {

    if (this.droneState == 0) {
      this.droneState = 1; // right turn
      this.animations.play("turn");
      this.speed = 0;
    } else {
      this.droneState = 4; // left turn
      this.animations.play("turn");
      this.speed = 0;
    }

    this.turnTimer = this.turnTimerTrigger;


  } else {
    this.turnTimer--;
  }

  //console.log(  this.droneState );

};


// Turret
Turret = function(game, x, y) {
  x *= 16;
  y *= 16;
  Phaser.Sprite.call(this, game, x, y, 'atlas', 'turret-1');
  game.physics.arcade.enable(this);
  this.body.gravity.y = 400;
  this.anchor.setTo(0.5);
  this.animations.add('turn', ['turret-2', 'turret-3', 'turret-4', 'turret-5'], 9, true);
  this.animations.play('turn');
};
Turret.prototype = Object.create(Phaser.Sprite.prototype);
Turret.prototype.constructor = Turret;



// Misc
EnemyDeath = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'atlas', 'enemy-explosion-1');
  this.anchor.setTo(0.5);
  var anim = this.animations.add('death', Phaser.Animation.generateFrameNames('enemy-explosion-', 1, 6, '', 0), 16, false);
  this.animations.play('death');
  anim.onComplete.add(function() {
    this.destroy();
  }, this);
};


// shot

Shot = function(game, x, y, dir) {
  y = (crouchFlag) ? y + 10 : y - 8;
  x += (dir == 1) ? 20 : -10;


  Phaser.Sprite.call(this, game, x, y, "atlas", "shot-1");
  this.animations.add("shot", Phaser.Animation.generateFrameNames("shot-", 1, 3, '', 0), 20, true);
  this.animations.play("shot");
  game.physics.arcade.enable(this);
  this.body.velocity.x = 400 * dir;
  this.checkWorldBounds = true;

  this.scale.x = dir;
}
Shot.prototype = Object.create(Phaser.Sprite.prototype);
Shot.prototype.constructor = Shot;
Shot.prototype.update = function() {
  if (!this.inWorld) {
    this.destroy();
  }
}

// shot impact
ShotImpact = function(game, x, y, scale) {
  Phaser.Sprite.call(this, game, x, y, "atlas", "shot-hit-1");
  var anim = this.animations.add('impact', Phaser.Animation.generateFrameNames('shot-hit-', 1, 3, '', 0), 18, false);
  this.animations.play('impact');
  anim.onComplete.add(function() {
    this.kill();
  }, this);
  this.scale.x = scale;
}
ShotImpact.prototype = Object.create(Phaser.Sprite.prototype);
ShotImpact.prototype.constructor = ShotImpact;




EnemyDeath.prototype = Object.create(Phaser.Sprite.prototype);
EnemyDeath.prototype.constructor = EnemyDeath;
