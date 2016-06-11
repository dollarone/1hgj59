var PlatfomerGame = PlatformerGame || {};

//title screen
PlatformerGame.Game = function(){};

PlatformerGame.Game.prototype = {
    create: function() {

        //  A simple background for our game
        this.game.add.sprite(0, 0, 'sky');

        this.player = this.game.add.sprite(this.game.world.width/2, this.game.world.height-16, 'paddle');

        this.player.frame = 1; 

        //  We need to enable physics on the player
        this.game.physics.arcade.enable(this.player);
        //this.game.camera.setSize(this.game.world.width, this.game.world.height);

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.body.allowGravity = false;
        this.player.body.immovable = true;
        this.player.anchor.setTo(0.5);
        this.player.body.collideWorldBounds = true;


        this.ball = this.game.add.sprite(this.game.world.width/2, this.game.world.height-32, 'ball');
        this.ball.anchor.setTo(0.5);
        this.game.physics.arcade.enable(this.ball);
        //this.game.camera.follow(this.player);

        //  Our two animations, walking left and right.
        //this.player.animations.add('left', [4, 5], 10, true);
        //this.player.animations.add('right', [4, 5], 10, true);

        //  Finally some stars to collect
        this.stars = this.game.add.group();

        //  We will enable physics for any star that is created in this group
        this.stars.enableBody = true;
        this.score = 0;
        this.saveColour = this.game.rnd.integerInRange(0,4);
        this.remains = 0;

        //  Here we'll create 12 of them evenly spaced apart
        for (var j = 1; j <= 3; j++) {
            for (var i = 0; i < 10; i++)
            {
                //  Create a star inside of the 'stars' group
                var star = this.stars.create(64+ 4+i * 66, 64+(j*34), 'colours');

                //  Let gravity do its thing
                star.body.gravity.y = 0;
                star.frame = this.game.rnd.integerInRange(0, 4);
                if (star.frame === this.saveColour) {
                    this.score++;
                }
                else {
                    this.remains++;
                }
                //  This just gives each star a slightly random bounce value
                //star.body.bounce.y = 0.7 + Math.random() * 0.2;
            }
        }
        this.music = this.game.add.audio('music');
        this.music.loop = true;
        this.timeout = 0;
        this.balltimeout = 0;
        this.dead = false;
//        this.music.play();


        this.COLOURS = ["blue", "red", "green", "yellow", "purple"];
        
        //  The score
        this.scoreText = this.game.add.text(16, 16, "Destroy blocks except the " + this.COLOURS[this.saveColour] + ' ones.   Score: ' + this.score, { fontSize: '32px', fill: '#000' });
        

        //  Our controls.
        this.cursors = this.game.input.keyboard.createCursorKeys();
        
        this.timer = 0;
        this.rKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
        this.rKey.onDown.add(this.reset, this);
        this.showDebug = false; 
        this.startBall();
        this.gameover = false;

    },


    reset: function() {
        this.state.restart();
    },

    startBall: function() {
        this.ball.body.velocity.x = this.game.rnd.integerInRange(-50,50);
        this.ball.body.velocity.y = this.game.rnd.integerInRange(-250,-150);
        this.ball.x = this.player.x;
        this.ball.y = this.player.y-16;
        this.dead = false;

    },
    update: function() {
        if (this.gameover) {
            return;
        }
        this.timer++;
        //  Collide the player and the stars with the platforms
        //this.game.physics.arcade.collide(this.player, this.stars);
        //this.game.physics.arcade.collide(this.stars, this.blockedLayer);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.game.physics.arcade.overlap(this.ball, this.stars, this.collectStar, null, this);
        this.game.physics.arcade.overlap(this.ball, this.player, this.paddle, null, this);

        //  Reset the players velocity (movement)
        this.player.body.velocity.x = 0;

        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -300;

        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = 300;

        }
        

        if (this.ball.y > this.game.world.height) {
            this.death();
        }
        if (this.timeout == 0) {
            if (this.ball.y < 8) {
                this.ball.body.velocity.y *= -1;
                this.timeout = 5;
            }

            if (this.ball.x > (this.game.world.width-8)) {
                this.ball.body.velocity.x *= -1;
                this.timeout = 5;
            }
            else if (this.ball.x < 8) {
                this.ball.body.velocity.x *= -1;
                this.timeout = 5;
            }
        }
        else if (this.timeout > 0) {
            this.timeout--;
        }

        if (this.balltimeout == 1) {
            this.balltimeout--;
            this.startBall();

        }
        else if (this.balltimeout > 1) {
            this.balltimeout--;
        }

        if (this.remains == 0) {
            this.win();
        }

        if (this.score == 0) {
            this.lose();
        }


    },
    lose: function() {

        this.scoresText = this.game.add.text(320, 316, 'You lose!', { fontSize: '32px', fill: '#000' });
//        this.game.paused = true;
        this.gameover= true;
        this.ball.body.velocity.y=0;
        this.ball.body.velocity.x=0;
        this.player.body.velocity.x=0;
    },


    win: function() {

        this.scoresText = this.game.add.text(280, 316, 'You win! Score: ' + this.score, { fontSize: '32px', fill: '#000' });
//        this.game.paused = true;
        this.gameover = true;
        this.ball.body.velocity.y=0;
        this.ball.body.velocity.x=0;
        this.player.body.velocity.x=0;

    },

    death: function() {
        // -1 life
        // countdown
        //display dETH
        //this.player.x = result[0].x;
        //this.player.y = result[0].y;
        //this.player.frame = 1; 
        if (this.balltimeout == 0 && !this.dead) {
            this.balltimeout = 50;
            this.dead = true;
        }

    },

    paddle : function(ball, player) {
        this.ball.body.velocity.y *= -1;
        this.ball.body.velocity.y -= 5;
        this.ball.body.velocity.x = (this.ball.x - this.player.x) * 10;

    },

    collectStar : function(ball, star) {
        if (this.timeout == 0) {
            if (star.alive) {
                if (ball.body.touching.down || ball.body.touching.up) {
                    this.ball.body.velocity.y *= -1;
                }
                else {
                    this.ball.body.velocity.x *= -1;
                
                }
               
                this.timeout = 2;
            }
            // Removes the star from the screen
            


            //  Add and update the score
            if (star.frame === this.saveColour) {
                this.score--;
            }
            else {
                this.remains--;
            }
            star.kill();
            
            this.scoreText.text = "Destroy blocks except the " + this.COLOURS[this.saveColour] + ' ones.   Score: ' + this.score;
        }
    },


    render: function() {

        if (this.showDebug) {
            
            this.game.debug.body(this.player);
        }
    },

};
