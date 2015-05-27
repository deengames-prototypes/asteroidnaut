
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
      //Crafty.e('Asteroid').size(64, 24).move(150, 400).velocity(0, 0);

      Crafty.e('Destruction');

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

      Crafty.e('Spawner').spawn('Enemy').between(extern('enemy_spawn_min'), extern('enemy_spawn_max'));

      Crafty.e('Actor, Text').textFont({ size: '18px' })
        .bind('EnterFrame', function() {
          this.move(0, -Crafty.viewport.y);
          if (Crafty('Player') != null && Crafty('Player').points != null) {
            this.text(Crafty('Player').points + " points");
          }
      });

      Crafty.e('Actor').repeatedly(function() {
        console.debug(Crafty.viewport.y);
      }, 1);

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
      // https://github.com/craftyjs/Crafty/issues/903#issuecomment-101486265
      .bind("EnterFrame", function(frameData) {
        if (this.isDown("W") || this.isDown("UP_ARROW")) {
          this.vy = Math.max(-7, this._vy - 0.5); // apply upward velocity gradually to cap
          this.onAsteroid = null;
        }

        if (this.isDown('SPACE') && this.onAsteroid != null && this.onAsteroid.health > 0) {
          this.onAsteroid.health -= 1;
          this.points += 1;
          if (this.onAsteroid.health == 0) {
            this.points += 10;
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
      .move(randomBetween(0, Game.view.width - 64), -Crafty.viewport.y - randomBetween(100, Game.view.height));

    // Smallest (24x24) has 15 health (~0.5s to mine)
    // Largest (64x64) has 30 health (~1s to mine)
    // Try to map linearly the size from [576, 4096] to the range [0.5, 1.25]
    // This formula is flawed. Oh well.
    this.health = 0.5 + (this.w * this.h) / (64*64) * (1.25 - 0.5);
    this.health = Math.round(30 * this.health);

    this.bind('EnterFrame', function() {
      console.debug(Math.round(this.y) + " >= " + -Math.round(Crafty.viewport.y - Crafty.viewport.height));

      if (this.y >= -(Crafty.viewport.y - Crafty.viewport.height)) {
        this.die();
      }
    })
  }
});

// Make sure the right number of asteriods exist at all times. Asteroids die
// when they fall off-screen. We spawn new ones out of sight when that happens.
Crafty.c('AsteroidManager', {
  init: function() {
    this.requires('Actor').size(1, 1).color('blue');

    this.bind('EnterFrame', function() {
      var actual = Crafty('Asteroid').length;
      var expected = extern('asteroids');

      for (var i = 0; i < expected - actual; i++) {
        var a = Crafty.e('Asteroid');
        console.log('Created asteroid at y=' + Math.round(a.y));
      }
    });
  }
});

Crafty.c('Enemy', {
  init: function() {
    var self = this;
    this.requires('Actor')
      .color('green')
      .size(randomBetween(24, 32), 18)
      // x: left or right side; y: Player's y, plus higher.
      .move(randomBetween(0, 100) <= 50 ? Game.view.width - 32 : 0, Crafty('Player').y + randomBetween(100, -300))
      .velocity(this.x == 0 ? extern('enemy_speed') : -extern('enemy_speed'))
      .bind('EnterFrame', function() {
        if (this.x < 0 || this.x > Game.view.width) {
          this.die();
        }
      }).collide('Player', function() {
        self.die();
        //var v = self.v.x > 0 ? 1 : -1;
        //var delta = v * extern('enemy_knockback');
        p = Crafty('Player');
        // FREEZE!
        p.move(p.x, p.y, extern('freeze_duration'));
        if (extern('enemies_kill') == true)
        {
          gameOver();
        }
        //p.velocity(p._velocity.x + delta, p._velocity.y);
        //p.move(p.x + v * extern('enemy_knockback'), p.y + p._velocity.y, 0.5);
        //p._velocity.x += v * extern('enemy_knockback');
      });
  }
});

Crafty.c('Destruction', {
  init: function() {
      this.requires('Actor')
        .color('red')
        .size(Game.view.width, 64)
        .move(0, Game.view.height - 64)
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
