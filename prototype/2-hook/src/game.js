Game = {
  // This defines our grid's size and the size of each of its tiles
  view: {
    width: 400,
    height: 600,
  },

  start: function() {
    Crafty.init(Game.view.width, Game.view.height);
    loadImages(['images/background.jpg'], function() {

      // y: 0, -1200, -2400, ...
      Crafty.e('Background').bind('ViewportScroll', function() {
        this.y = 0 - (Math.round(Crafty.viewport.y / (2 * Game.view.height)) * (2 * Game.view.height));
      });

      // y: -600, -1800, -4000, ...
      Crafty.e('Background').bind('ViewportScroll', function() {
        var oldY = this.y;
        this.y = -Game.view.height - (Math.round((Crafty.viewport.y - Game.view.height) / (2 * Game.view.height)) * (2 * Game.view.height));
      });

      var player = Crafty.e('Player').move(150, 350);

      // Starting asteroid
      Crafty.e('Asteroid').size(64, 24).move(150, 400).velocity(0, 0);
      for (var i = 1; i < extern('asteroids'); i++) {
        Crafty.e('Asteroid');
      }

      //Crafty.e('Destruction');

      // Left wall
      Crafty.e('Actor, Wall').size(1, Game.view.height).move(1, 0)
        .bind('ViewportScroll', function() {
        this.y = -Crafty.viewport.y;
      });
      // Right wall
      Crafty.e('Actor, Wall').size(1, Game.view.height).move(Game.view.width, 0)
        .bind('ViewportScroll', function() {
          this.y = -Crafty.viewport.y;
        });

      Crafty.e('AsteroidManager');

      Crafty.e('Actor, Text').textFont({ size: '18px' })
        .bind('EnterFrame', function() {
          this.move(0, -Crafty.viewport.y);
          if (Crafty('Player') != null && Crafty('Player').points != null) {
            this.text(Crafty('Player').points + " points");
          }
      });

      Crafty.e('Actor, Text').textFont({ size: '14px' })
        .bind('EnterFrame', function() {
          this.move(Game.view.width - 100, -Crafty.viewport.y);
          if (Crafty('Player') != null && Crafty('Player').points != null) {
            this.text("Altitude: " + Math.round(Crafty.viewport.y));
          }
      });

      Crafty.e('Actor').bind('EnterFrame', function() {
        if (!window.mouseDown) {
          Crafty('Player').grappling = false;
        } else {
          Crafty('Player').grappling = true;
        }
      });

      Crafty.viewport.follow(player);
    });
  }
}

window.addEventListener('load', Game.start);

Crafty.c('Background', {
  init: function() {
    this.requires('Actor, Image').size(Game.view.width, Game.view.height)
      .image('images/background.jpg', 'repeat-y');
  }
});

Crafty.c('Player', {
  init: function() {
    var self = this;
    this.points = 0;

    this.requires('Actor, Keyboard, Gravity')
      .size(32, 32)
      .color('white')
      .controllable()
      .collideWith('Asteroid', function(a) {
        // this._vy is 0 when we're standing still on an asteroid
        // it's not reliable, but keyboard input is.
        if (self._velocity.y == 0 && !self.isDown('W')) {
          self.onAsteroid = a.obj;
        }

        if (self.y > a.obj.y // Player is under. Or possibly beside, too.
           && self._velocity.y == 0) { // vY is always zero when bumping the
           // asteroid from below or standing on it. Not when you slide past it.
           self._velocity.y = extern('asteroid_knockback');
        }
      })
      .collideWith('Wall')
      .gravity()
      .bind("EnterFrame", function(frameData) {
        // Velocity when holding UP/W
        // https://github.com/craftyjs/Crafty/issues/903#issuecomment-101486265
        if (this.isDown("W") || this.isDown("UP_ARROW")) {
          this.vy = Math.max(-7, this._vy - 0.5); // apply upward velocity gradually to cap
          this.onAsteroid = null;
        }

        // Mining when holding space
        if (this.isDown('SPACE') && this.onAsteroid != null && this.onAsteroid.health > 0) {
          this.onAsteroid.health -= 1;
          this.points += 1;
          if (this.onAsteroid.health == 0) {
            this.points += 10;
            this.onAsteroid.color('#222222');
          }
          console.log(this.onAsteroid.health);
        }

        if (this.targetAsteroid != null && this.grappling == true) {
          var xDir = this.targetAsteroid.x + (this.targetAsteroid.w / 2) - this.x;
          var yDir = this.targetAsteroid.y + (this.targetAsteroid.h / 2) - this.y;

          xDir = xDir > 0 ? 1 : -1;
          yDir = yDir > 0 ? 1 : -1;

          grapple_speed = extern('grapple_speed');
          this.x += xDir * grapple_speed;
          this.y += yDir * grapple_speed;
        }
      }
    );
  }
});

Crafty.c('Asteroid', {
  init: function() {
    var self = this;
    this.requires('Actor');
    this.regenerate();

    // When you fall off the bottom of the screen, reappear at the top.
    this.bind('EnterFrame', function() {
      if (this.y >= -(Crafty.viewport.y - Crafty.viewport.height)) {
        this.regenerate();
      }
    });

    // Prevent overlap
    this.collide('Asteroid', function(a) {
      self.regenerate();
    });

    this.mouseOver(function() {
      self.color('#88bbff');
    });

    this.mouseOut(function() {
      self.color("#888888");
    });

    this.mouseDown(function(e) {
      Crafty('Player').targetAsteroid = self;
      console.log("Target is " + self);
    });
  },

  regenerate: function() {
    this.color('#888888')
    .size(randomBetween(24, 64), randomBetween(24, 64))
    // x: somewhere on-screen
    // Y: above the top of the screen (hence -100), up to ~600px up.
    .move(randomBetween(0, Game.view.width - 64), -Crafty.viewport.y  - randomBetween(0, 2 * Game.view.height));

    // Smallest (24x24) has 15 health (~0.5s to mine)
    // Largest (64x64) has 30 health (~1s to mine)
    // Try to map linearly the size from [576, 4096] to the range [0.5, 1.25]
    // This formula is flawed. Oh well.
    this.health = 0.5 + (this.w * this.h) / (64*64) * (1.25 - 0.5);
    this.health = Math.round(30 * this.health);
  }
});

Crafty.c('Destruction', {
  init: function() {
      this.requires('Actor')
        .color('red')
        .size(Game.view.width, 64)
        .move(0, Game.view.height)
        .bind('EnterFrame', function() {
          this.y -= extern('destruction_speed');
        })
        .collide('Player', function() {
          gameOver();
        });
  }
});

function gameOver() {
  var points = Crafty('Player').points;
  Crafty('Player').destroy();
  Crafty.e('Actor, Text')
    .text(points + " points!")
    .textFont({ size: '72px', color: 'white' })
    .move(16, -Crafty.viewport.y + 200);
}
