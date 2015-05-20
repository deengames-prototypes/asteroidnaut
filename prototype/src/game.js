Game = {
  // This defines our grid's size and the size of each of its tiles
  view: {
    width: 300,
    height: 600,
  },

  start: function() {
    Crafty.init(Game.view.width, Game.view.height);
    loadImages(['images/background.jpg'], function() {

      // y: 0, -1200, -2400, ...
      Crafty.e('Background').bind('ViewportScroll', function() {
        this.y = 0 - (Math.round(Crafty.viewport.y / 1200) * 1200);
      });

      // y: -600, -1800, -3000, ...
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
      Crafty.e('Actor, Wall').size(1, 600).move(300, 0)
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
    this.requires('Actor, Image').size(300, 600)
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
      .collideWith('Asteroid')
      .collideWith('Wall')
      .gravity()
      // https://github.com/craftyjs/Crafty/issues/903#issuecomment-101486265
      .bind("EnterFrame", function(frameData) {
        if (this.isDown("W")) {
          this.vy = Math.max(-5, this._vy - 2.5); // apply upward velocity gradually to cap
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
      .move(randomBetween(0, 300 - 64), -Crafty.viewport.y - randomBetween(100, 600));
  }
});

Crafty.c('Destruction', {
  init: function() {
      this.requires('Actor')
        .color('red')
        .size(300, 64)
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
