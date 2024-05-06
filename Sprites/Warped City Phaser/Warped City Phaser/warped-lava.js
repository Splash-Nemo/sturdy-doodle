/*
 * Warped Lava Demo Code
 * @copyright 2017 Ansimuz
 * Visit my store for premium content at https://ansimuz.itch.io/
 * */

var game;
var player;
var background;
var middleground;
var gameWidth = 240;
var gameHeight = 176;
var globalMap;
var projectiles;
var enemies;
var items;
var props;
var hurtFlag;
var shootingFlag;
var jumpingFlag;
var nextShot;
var isDuck;

window.onload = function(){
    game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, "");
    game.state.add('Boot', boot);
    game.state.add('Preload', preload);
    game.state.add('TitleScreen',titleScreen);
    game.state.add('PlayGame', playGame);
    //
    game.state.start("Boot");
}

var boot = function(game){

};
boot.prototype = {
    preload: function(){
        game.load.image("loading", "assets/sprites/loading.png");
    },
    create: function(){
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.renderer.renderSession.roundPixels = true;
        game.state.start("Preload");
    }
}

var preload = function(game){

};
preload.prototype = {
    preload: function(){
        var loadingBar = this.add.sprite(game.width / 2, game.height/2, "loading");
        loadingBar.anchor.setTo(0.5);
        game.load.setPreloadSprite(loadingBar);
        // load title screen
        game.load.image("title", "assets/sprites/title-screen.png");
        game.load.image("enter", "assets/sprites/press-enter-text.png");
        game.load.image("credits", "assets/sprites/credits-text.png");
        game.load.image("instructions", "assets/sprites/instructions.png");
        // environment
        game.load.image("background", "assets/environment/background.png");
        game.load.image("middleground", "assets/environment/middleground.png");
        // tileset
        game.load.image("tileset", "assets/environment/tileset.png");
        game.load.tilemap("map","assets/maps/map.json", null, Phaser.Tilemap.TILED_JSON);
        // atlas
        game.load.atlasJSONArray("atlas", "assets/atlas/atlas.png", "assets/atlas/atlas.json");
        game.load.atlasJSONArray("atlas-props", "assets/atlas/atlas-props.png", "assets/atlas/atlas-props.json");
        // sound
        game.load.audio("music", ["assets/sound/sci_fi_platformer01.ogg", "assets/sound/sci_fi_platformer01.mp3"]);
        game.load.audio("pickup", ["assets/sound/pickup.ogg", "assets/sound/pickup.mp3"]);
        game.load.audio("beam", ["assets/sound/beam.ogg", "assets/sound/beam.mp3"]);
    },
    create: function(){
        game.state.start("TitleScreen");
        //game.state.start("PlayGame");
    }
}

var titleScreen = function(game){

};
titleScreen.prototype = {
    create: function(){
        background = game.add.tileSprite(0,0, gameWidth,gameHeight,'background');
        middleground = game.add.tileSprite(0,0, gameWidth, gameHeight, 'middleground');

        this.title = game.add.image(gameWidth / 2, 80, 'title' );
        this.title.anchor.setTo(0.5);
        var credits = game.add.image(gameWidth/2, gameHeight - 12, 'credits');
        credits.anchor.setTo(0.5);
        this.pressEnter = game.add.image(game.width/2, gameHeight - 45, 'enter');
        this.pressEnter.anchor.setTo(0.5);

        var startKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        startKey.onDown.add(this.startGame, this );

        game.time.events.loop(700, this.blinkText, this);

        this.state = 1;
    },
    startGame: function(){
        if(this.state == 1){
            this.state = 2;
            this.title2 = game.add.image(gameWidth/2, 40, 'instructions');
            this.title2.anchor.setTo(0.5, 0);
            this.title.destroy();
        }else{
            this.game.state.start("PlayGame");
        }
    },
    blinkText: function(){
        if(this.pressEnter.alpha){
            this.pressEnter.alpha = 0;
        }else{
            this.pressEnter.alpha = 1;
        }
    },
    update: function(){
        background.tilePosition.x  -= 0.05;
        middleground.tilePosition.x -= 0.2;
    }
};

var playGame = function(game){

};
playGame.prototype = {
    create: function(){
        this.createBackgrounds();
        this.createTilemap();
        this.createPlayer(3,2);
        game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
        this.bindKeys();
        this.createGroups();
        this.populate();
        this.decorWorld();
        // audios
        this.audioPickup = game.add.audio("pickup");
        this.audioBeam = game.add.audio("beam");
        // music
        this.music = game.add.audio('music');
        this.music.loop = true;
        this.music.play();
    },

    createBackgrounds: function(){
        background = game.add.tileSprite(0,0, gameWidth, gameHeight, "background");
        middleground = game.add.tileSprite(0,0, gameWidth, gameHeight, "middleground");
        background.fixedToCamera = true;
        middleground.fixedToCamera = true;
    },

    createTilemap: function(){
        globalMap = game.add.tilemap("map");
        globalMap.addTilesetImage("tileset");
        this.layer = globalMap.createLayer("Tile Layer 1");
        this.layer.resizeWorld();
        // collisions
        globalMap.setCollision([31, 273, 274, 306,307,309,63,65,67,396,397,341,343,371,373,201,173,174,203,204,207,69]);
        // set some tiles one way collision
        this.setTopCollisionTiles(11);
        this.setTopCollisionTiles(12);
        this.setTopCollisionTiles(13);
        this.setTopCollisionTiles(14);
        this.setTopCollisionTiles(15);
        this.setTopCollisionTiles(16);
        this.setTopCollisionTiles(17);
        this.setTopCollisionTiles(289);
        this.setTopCollisionTiles(17);
        this.setTopCollisionTiles(132);
        this.setTopCollisionTiles(133);
        this.setTopCollisionTiles(86);
        this.setTopCollisionTiles(88);
        this.setTopCollisionTiles(146);
        this.setTopCollisionTiles(148);
        this.setTopCollisionTiles(266);
        this.setTopCollisionTiles(267);
        this.setTopCollisionTiles(268);
        this.setTopCollisionTiles(269);
    },

    setTopCollisionTiles: function (tileIndex) {
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

    createGroups: function(){
        // groups
        projectiles = game.add.group();
        projectiles.enableBody = true;
        //enemies
        enemies = game.add.group();
        enemies.enableBody = true;
        //items
        items = game.add.group();
        items.enableBody = true;
    },

    populate: function(){

        //place enemies

        this.addWorm(48, 1, true);

        this.addBomb(24, 19, 100);
        this.addBomb(17, 18, 80);

        this.addLizzard(29, 7);
        this.addLizzard(46, 22);

        this.addFlyer(27, 18, 20);
        this.addFlyer(4, 22, 20);

        // items

        this.createTerminal(26,3);

        this.createTank(16,4);

        this.createHeart(58,5);

        this.createOrb(32,15);

        this.createSensor(2,24);
    },

    decorWorld: function () {
        this.addProp(4,0, 'rock-column');
        this.addProp(48,0, 'stalactite');
        this.addProp(12,16, 'pipe');
        this.addProp(13,24, 'geyzer');


        // create lava blocks
        for(var i = 0; i <= 10; i++){
            this.createLava(19 + i,26);
        }


    },

    addProp: function(x,y,item){
        game.add.image(x * 16,y * 16,'atlas-props', item);
    },

    addLizzard: function(x,y, upsidedown){
        var temp = new Lizzard(game, x, y);
        game.add.existing(temp);
        enemies.add(temp);
    },

    addWorm: function(x,y, upsidedown){
        var temp = new Worm(game, x, y, upsidedown);
        game.add.existing(temp);
        enemies.add(temp);
    },

    addFlyer: function(x,y, distance){
        var temp = new Flyer(game, x, y, distance);
        game.add.existing(temp);
        enemies.add(temp);
    },

    addBomb: function(x,y, distance){
        var temp = new Bomb(game, x, y, distance);
        game.add.existing(temp);
        enemies.add(temp);
    },

    // items

    createTerminal: function(x,y){
        x *= 16;
        y *= 16;
        var temp = game.add.sprite(x, y, 'atlas', 'terminal-1');
        temp.anchor.setTo(0.5);
        game.physics.arcade.enable(temp);
        //add animations
        temp.animations.add('idle', Phaser.Animation.generateFrameNames('terminal-', 1, 4, '', 0), 12, true);
        temp.animations.play('idle');

        items.add(temp);
    },

    createTank: function(x,y){
        x *= 16;
        y *= 16;
        var temp = game.add.sprite(x, y, 'atlas', 'tank-1');
        temp.anchor.setTo(0.5);
        game.physics.arcade.enable(temp);
        //add animations
        temp.animations.add('idle', Phaser.Animation.generateFrameNames('tank-', 1, 4, '', 0), 12, true);
        temp.animations.play('idle');

        items.add(temp);
    },

    createOrb: function(x,y){
        x *= 16;
        y *= 16;
        var temp = game.add.sprite(x, y, 'atlas', 'orb-1');
        temp.anchor.setTo(0.5);
        game.physics.arcade.enable(temp);
        //add animations
        temp.animations.add('idle', Phaser.Animation.generateFrameNames('orb-', 1, 6, '', 0), 20, true);
        temp.animations.play('idle');

        items.add(temp);
    },


    createSensor: function(x,y){
        x *= 16;
        y *= 16;
        var temp = game.add.sprite(x, y, 'atlas', 'sensor-1');
        temp.anchor.setTo(0.5);
        game.physics.arcade.enable(temp);
        //add animations
        temp.animations.add('idle', Phaser.Animation.generateFrameNames('sensor-', 1, 4, '', 0), 17, true);
        temp.animations.play('idle');

        items.add(temp);
    },


    createHeart: function(x,y){
        x *= 16;
        y *= 16;
        var temp = game.add.sprite(x, y, 'atlas', 'heart-1');
        temp.anchor.setTo(0.5);
        game.physics.arcade.enable(temp);
        //add animations
        temp.animations.add('idle', Phaser.Animation.generateFrameNames('heart-', 1, 4, '', 0), 12, true);
        temp.animations.play('idle');

        items.add(temp);
    },

    createLava: function(x,y){
        x *= 16;
        y *= 16;
        var temp = game.add.sprite(x, y, 'atlas-props', 'lava-block-1');

        //add animations
        temp.animations.add('idle', Phaser.Animation.generateFrameNames('lava-block-', 1, 4, '', 0), 11, true);
        temp.animations.play('idle');


    },

    createPlayer: function(x,y){
        x *= 16;
        y *= 16;

        player = game.add.sprite(x,y,'atlas', 'player-idle-1');
        player.anchor.setTo(0.5);
        game.physics.arcade.enable(player);
        player.body.gravity.y = 500;
        player.body.setSize(17,31,15,18);
        //animations
        var s = 10;
        player.animations.add('idle', Phaser.Animation.generateFrameNames('player-idle-', 1, 4, '', 0), s - 4, true);
        player.animations.add('run', Phaser.Animation.generateFrameNames('player-run-', 1, 8, '', 0), s + 1, true);
        player.animations.add('run-fire', Phaser.Animation.generateFrameNames('player-run-fire-', 1, 8, '', 0), s + 1, true);
        player.animations.add('duck', ['player-crouch'], s, true);
        player.animations.add('fire', ['player-fire'], s, true);
        player.animations.add('jump', Phaser.Animation.generateFrameNames('player-jump-', 1, 2, '', 0), s, false);
        player.animations.add('fall', ['player-jump-3'], s, true);
        player.animations.add('hurt', Phaser.Animation.generateFrameNames('player-hurt-', 1, 2, '', 0), s, false);
    },

    bindKeys: function(){
        this.wasd = {
           // jump: game.input.keyboard.addKey(Phaser.Keyboard.Q), //dvorak
           // fire: game.input.keyboard.addKey(Phaser.Keyboard.J), // dvorak
            jump: game.input.keyboard.addKey(Phaser.Keyboard.X),
            fire: game.input.keyboard.addKey(Phaser.Keyboard.C),
            left: game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
            right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
            down: game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        }
        game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.DOWN
        ]);
    },

    update: function(){
        game.physics.arcade.collide(player, this.layer);
        game.physics.arcade.collide(enemies, this.layer);
        game.physics.arcade.collide(projectiles, this.layer, this.hitWall, null, this);
        //
        game.physics.arcade.overlap(enemies, projectiles, this.shotImpact, null, this );
        game.physics.arcade.overlap(player, enemies, this.hurtPlayer, null, this);
        game.physics.arcade.overlap(player, items, this.pickItem, null, this);
        //
        this.movePlayer();
        this.playerAnimations();
        this.hurtFlagManager();
        this.parallaxBg();
        //this.debugGame();
    },

    pickItem: function (player, item) {
        this.audioPickup.play();
        item.kill();
    },

    parallaxBg: function(){
        background.tilePosition.x = this.layer.x * -0.2;
        middleground.tilePosition.x = this.layer.x * -0.5;
    },

    hitWall: function(shot, wall){
        shot.kill();
        var dir = (shot.scale.x == 1) ? 20 : -20;
        var impact = new ShotImpact(game, shot.x +  dir, shot.y, shot.scale.x);
        game.add.existing(impact);
    },

    hurtFlagManager: function(){
        if(hurtFlag && player.body.onFloor()){
            this.resetHurt();
        }
    },

    resetHurt: function(){
        hurtFlag = false;
    },

    movePlayer: function(){
        if (hurtFlag) {
            return;
        }

        // reset jumpingflag
        if (player.body.onFloor()) {
            jumpingFlag = false;
        }



        var speed = 100;
        if(this.wasd.left.isDown){
            player.body.velocity.x = -speed;
            player.scale.x = -1;
        }else if(this.wasd.right.isDown){
            player.body.velocity.x = speed;
            player.scale.x = 1;
        }else{
            player.body.velocity.x = 0;
        }
        //jump
        if(this.wasd.jump.isDown && player.body.onFloor()){
            player.body.velocity.y = -280;
            jumpingFlag = true;
            player.animations.play("jump");
        }
        //shooting
        if(this.wasd.fire.isDown){
            shootingFlag = true;
            this.shoot();
        }else{
            shootingFlag = false;
        }
    },

    playerAnimations: function(){
        if(hurtFlag){
            return;
        }

        if(jumpingFlag){
            if(player.body.velocity.y > 0){
                player.animations.play("fall");
            }
            return;
        }

        if(player.body.onFloor()){
            if(player.body.velocity.x != 0){
                if(shootingFlag){
                    player.animations.play("run-fire");
                }else{
                    player.animations.play("run");
                }
            }else{
                if(this.wasd.down.isDown){
                    player.animations.play("duck");
                    isDuck = true;
                }else{
                    player.animations.play("idle");
                    isDuck = false;
                    if(shootingFlag){
                        player.animations.play("fire")
                    }else{
                        player.animations.play("idle");
                    }
                }
            }
        }else{

        }
    },

    shoot: function(){
        if(nextShot > game.time.now){
            return;
        }
        nextShot = game.time.now + 600;
        var shot = new Shot(game, player.x, player.y, player.scale.x);
        projectiles.add(shot);
        this.audioBeam.play();
    },

    shotImpact: function(enemy, shot){
        var impact = new ShotImpact(game, shot.x , shot.y, shot.scale.x );
        game.add.existing(impact);
        shot.kill();
        enemy.health--;
    },

    hurtPlayer: function(player, enemy){
        if(hurtFlag){
            return;
        }
        hurtFlag = true;
        player.animations.play("hurt");
        player.body.velocity.y = -150;
        player.body.velocity.x = (player.scale.x == 1) ? -100 : 100;
        if(enemy.kind == "bomb"){
            enemy.health = 0;
        }

    },

    debugGame: function () {
        //game.debug.spriteInfo(this.player, 30, 30);

        game.debug.body(player);
        projectiles.forEachAlive(this.renderGroup, this);
        enemies.forEachAlive(this.renderGroup, this);
        items.forEachAlive(this.renderGroup, this);

    },

    renderGroup: function (member) {
        game.debug.body(member);
    }
};

// shot

Shot = function(game,x,y,dir){
    y = (isDuck) ? y + 1 : y - 8;
    x += (dir == 1) ? -0 : 0;


    Phaser.Sprite.call(this, game, x, y, "atlas", "beam-1");
    this.animations.add("shot", Phaser.Animation.generateFrameNames("beam-", 1,4, '',0),20,true);
    this.animations.play("shot");
    game.physics.arcade.enable(this);
    this.body.velocity.x = 220 * dir;
    this.body.setSize(10, 8, 27, 5);
    this.checkWorldBounds = true;

    this.scale.x = dir;
}
Shot.prototype = Object.create(Phaser.Sprite.prototype);
Shot.prototype.constructor = Shot;
Shot.prototype.update = function(){
    if(!this.inWorld){
        this.destroy();
    }
}

// shot impact
ShotImpact = function(game, x, y, scale){
    Phaser.Sprite.call(this, game, x, y, "atlas", "beam-impact-1");
    var anim = this.animations.add('impact', Phaser.Animation.generateFrameNames('beam-impact-', 1, 3, '', 0), 18, false);
    this.animations.play('impact');
    anim.onComplete.add(function () {
        this.kill();
    }, this);
    this.scale.x = scale;
}
ShotImpact.prototype = Object.create(Phaser.Sprite.prototype);
ShotImpact.prototype.constructor = ShotImpact;


// Lizzard

Lizzard = function(game,x, y){
    x *= 16;
    y *= 16;
    this.health = 6;
    Phaser.Sprite.call(this, game, x, y, "atlas", "lizzard-1");
    this.animations.add('walk', Phaser.Animation.generateFrameNames('lizzard-', 1, 9, '', 0), 10, true);
    this.animations.play("walk");
    this.anchor.setTo(0.5);
    game.physics.arcade.enable(this);
    this.body.setSize(20, 34, 20, 21);
    this.body.gravity.y = 500;
    this.body.velocity.x = 20;
    this.body.bounce.x = 1;
}
Lizzard.prototype = Object.create(Phaser.Sprite.prototype);
Lizzard.prototype.constructor = Lizzard;
Lizzard.prototype.update = function(){
    if(this.body.velocity.x < 0){
        this.scale.x = -1;
    }else{
        this.scale.x = 1;
    }
    if(this.health <= 0){
        var death = new EnemyDeath(game, this.x, this.y);
        game.add.existing(death);
        this.destroy();
    }
}

// worm

Worm = function(game, x,y, upsidedown){
    x *= 16;
    y *= 16;
    this.health = 3;
    Phaser.Sprite.call(this, game, x, y, "atlas", "worm-1");
    this.animations.add('crawl', Phaser.Animation.generateFrameNames('worm-', 1, 4, '', 0), 10, true);
    this.animations.play("crawl");
    this.anchor.setTo(0.5);
    game.physics.arcade.enable(this);
    this.body.setSize(33,14,6,11);
    this.body.gravity.y = (upsidedown) ? -500 : 500;
    this.body.velocity.x = 60;
    this.body.bounce.x = 1;
    this.scale.y = (upsidedown) ? -1 : 1;
}
Worm.prototype = Object.create(Phaser.Sprite.prototype);
Worm.prototype.constructor = Worm;
Worm.prototype.update = function(){
    if(this.body.velocity.x < 0){
        this.scale.x = 1;
    }else{
        this.scale.x = -1;
    }

    // drop worm
    if(player.x > this.x){
        this.body.gravity.y = 500;
        this.scale.y = 1;
    }
    if(this.health <= 0){
        var death = new EnemyDeath(game, this.x, this.y);
        game.add.existing(death);
        this.destroy();
    }
}

// flying serpent

Flyer = function(game, x, y, distance){
    x *= 16;
    y *= 16;
    this.health = 3;
    Phaser.Sprite.call(this, game, x, y, "atlas", "flying-snake-1");
    game.physics.arcade.enable(this);
    this.anchor.setTo(0.5);
    this.body.setSize(47, 18, 8, 21);
    this.animations.add('fly', Phaser.Animation.generateFrameNames('flying-snake-', 1, 6, '', 0), 15, true);
    this.animations.play('fly');
    //
    var Tween = game.add.tween(this).to({
       y: y + 10 }, 300, Phaser.Easing.Linear.None, true, 0, -1
    );
    Tween.yoyo(true);
    //
    this.body.velocity.x = 60;

    this.xInit = this.x;
    this.distance = distance;

}
Flyer.prototype = Object.create(Phaser.Sprite.prototype);
Flyer.prototype.constructor = Flyer;
Flyer.prototype.update = function(){
    //

    // turn around
    if(this.x > this.xInit + this.distance && this.body.velocity.x > 0){
        this.body.velocity.x = -60;
    }else if(this.x < this.xInit - this.distance && this.body.velocity.x < 0){
        this.body.velocity.x = 60;
    }
    // flip
    if(this.body.velocity.x < 0){
        this.scale.x = 1;
    }else{
        this.scale.x = -1;
    }
    //
    if(this.health <= 0){
        var death = new EnemyDeath(game, this.x, this.y);
        game.add.existing(death);
        this.destroy();
    }
}

// Bomb

Bomb = function(game, x, y, distance){
    x *= 16;
    y *= 16;
    this.health = 1;
    this.kind = "bomb";
    Phaser.Sprite.call(this, game, x, y, "atlas", "bomb-1");
    game.physics.arcade.enable(this);
    this.anchor.setTo(0.5);
    this.animations.add('fly', Phaser.Animation.generateFrameNames('bomb-', 1, 4, '', 0), 15, true);
    this.animations.play('fly');
    //
    var Tween = game.add.tween(this).to({
            y: y + distance }, distance * 10, Phaser.Easing.Linear.None, true, 0, -1
    );
    Tween.yoyo(true);


}
Bomb.prototype = Object.create(Phaser.Sprite.prototype);
Bomb.prototype.constructor = Bomb;
Bomb.prototype.update = function(){
    //
    if(this.health <= 0){
        var death = new EnemyDeath(game, this.x, this.y);
        game.add.existing(death);
        this.destroy();
    }
}



// enemy death

EnemyDeath = function(game, x,y){
    Phaser.Sprite.call(this, game, x, y, "atlas", "enemy-death-1");
    this.anchor.setTo(0.5);
    var anim = this.animations.add("death", Phaser.Animation.generateFrameNames("enemy-death-", 1, 5, '', 0), 18, false );
    this.animations.play("death");
    anim.onComplete.add(function(){
        this.kill(); }, this
    );
}

EnemyDeath.prototype =  Object.create(Phaser.Sprite.prototype);
EnemyDeath.prototype.constructor = EnemyDeath;

















