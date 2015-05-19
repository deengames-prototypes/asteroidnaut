Game = {
  // This defines our grid's size and the size of each of its tiles
  view: {
    width: 300,
    height: 600,
  },

  start: function() {
    Crafty.init(Game.view.width, Game.view.height);

    Crafty.e('Background').bind('ViewportScroll', function() {
      this.y = 0 - (Math.round(Crafty.viewport.y / 600) * 600);
      console.log("B1 is at " + this.y);
    });

    Crafty.e('Background').bind('ViewportScroll', function() {
      this.y = 600 - (Math.round(Crafty.viewport.y / 600) * 600);
      console.log("B2 is at " + this.y);
    });

    var player = Crafty.e('Player').move(150, 350);
    Crafty.e('Asteroid').move(150, 400);
    Crafty.e('Destruction');

    // Left wall
    Crafty.e('Actor, Wall').size(1, 600).move(-1, 0)
      .bind('ViewportScroll', function() {
      this.y = -Crafty.viewport.y;
    });
    // Right wall
    Crafty.e('Actor, Wall').size(1, 600).move(300, 0)
      .bind('ViewportScroll', function() {
        this.y = -(Crafty.viewport.y / 2);
      });
    Crafty.viewport.follow(player);
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
        console.debug("a=" + JSON.stringify(this._acceleration) + " v=" + JSON.stringify(this._velocity));
        if (this.isDown("W")) {
          this.vy = Math.max(-5, this._vy - 2.5); // apply upward velocity gradually to cap
        }
      })
  }
});

Crafty.c('Asteroid', {
  init: function() {
    this.requires('Actor')
      .color('#888888').size(64, 24);
  }
});

Crafty.c('Destruction', {
  init: function() {
      this.requires('Actor')
        .color('red')
        .size(300, 64)
        .move(0, 600 - 64)
        .bind('EnterFrame', function() {
          this.y -= 1;
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
