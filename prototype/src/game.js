Game = {
  // This defines our grid's size and the size of each of its tiles
  view: {
    width: 300,
    height: 600,
  },

  start: function() {
    Crafty.init(Game.view.width, Game.view.height);
    Crafty.background('black');
    Crafty.e('Player').move(150, 350);
    Crafty.e('Asteroid').move(150, 400);
    //Crafty.e('Destruction');

    // Three invisible bounding walls: left, bottom, and right
    Crafty.e('Actor, Wall').size(1, 600).move(0, 0); // left
    Crafty.e('Actor, Wall').size(1, 600).move(299, 0); // right
    Crafty.e('Actor, Wall').size(300, 1).move(0, 599); // bottom
  }
}

window.addEventListener('load', Game.start);

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
      .gravity("Asteroid")
      // https://github.com/craftyjs/Crafty/issues/903#issuecomment-101486265
      .bind("EnterFrame", function(frameData) {
        if (this.isDown("W")) {
          this.vy = Math.max(-5, this._vy - 2.5); // apply upward velocity gradually to cap
        }
      })
      .bind("CheckLanding", function(ground) {
        // forbid landing, if player's feet are not above ground
        if (this._y + this._h > ground._y + this._dy) {
          this.canLand = false;
        }
      });
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
    .move(16, 200);
}
