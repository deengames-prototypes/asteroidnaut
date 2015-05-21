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
        this.y = 0 - (Math.round(Crafty.viewport.y / 1200) * 1200);
      });

      // y: -600, -1800, -4000, ...
      Crafty.e('Background').bind('ViewportScroll', function() {
        var oldY = this.y;
        this.y = -600 - (Math.round((Crafty.viewport.y - 600) / 1200) * 1200);
      });

      var player = Crafty.e('Player').move(150, 350);

      // Starting asteroid
      Crafty.e('Asteroid').size(64, 24).move(150, 400).velocity(0, 0);

      Crafty.e('Destruction');

      // Left wall
      Crafty.e('Actor, Wall').size(1, 600).move(1, 0)
        .bind('ViewportScroll', function() {
        this.y = -Crafty.viewport.y;
      });
      // Right wall
      Crafty.e('Actor, Wall').size(1, 600).move(400, 0)
        .bind('ViewportScroll', function() {
          this.y = -Crafty.viewport.y;
        });

      Crafty.e('Spawner').spawn('Asteroid').between(extern('asteroid_spawn_min'), extern('asteroid_spawn_max'));

      Crafty.viewport.follow(player);
    });
  }
}

window.addEventListener('load', Game.start);

Crafty.c('Background', {
  init: function() {
    this.requires('Actor, Image').size(400, 600)
      .image('images/background.jpg', 'repeat-y');
  }
});

Crafty.c('Player', {
  init: function() {
    var self = this;

    this.requires('Actor, Keyboard, Gravity')
      .size(32, 32)
      .color('white')
      .controllable()
      .collide('Destruction', function() {
        gameOver();
      })
      .collideWith('Asteroid', function(x) {
        // this._vy is 0 when we're standing still on an asteroid
        // it's not reliable, but keyboard input is.
        if (self._velocity.y == 0 && !self.isDown('W')) {
          self.onAsteroid = x.obj;
        }
      })
      .collideWith('Wall')
      .gravity()
      // https://github.com/craftyjs/Crafty/issues/903#issuecomment-101486265
      .bind("EnterFrame", function(frameData) {
        if (this.isDown("W")) {
          this.vy = Math.max(-5, this._vy - 2.5); // apply upward velocity gradually to cap
          this.onAsteroid = null;
        }

        if (this.isDown('SPACE') && this.onAsteroid != null && this.onAsteroid.health > 0) {
          this.onAsteroid.health -= 1;
          if (this.onAsteroid.health == 0) {
            this.onAsteroid.color('#222222');
          }
          console.log(this.onAsteroid.health);
        }
      })
  }
});

Crafty.c('Asteroid', {
  init: function() {
    this.requires('Actor')
      .color('#888888')
      .size(randomBetween(24, 64), randomBetween(24, 64))
      // x: somewhere on-screen
      // Y: above the top of the screen (hence -100), up to ~600px up.
      .move(randomBetween(0, 400 - 64), -Crafty.viewport.y - randomBetween(100, 600));

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
        .size(400, 64)
        .move(0, 600 - 64)
        .bind('EnterFrame', function() {
          this.y -= extern('destruction_speed');
        })
  }
});

function gameOver() {
  Crafty('Player').destroy();
  Crafty.e('Actor, Text')
    .text("U DIED!")
    .textFont({ size: '72px' })
    .move(16, -Crafty.viewport.y + 200);
}
