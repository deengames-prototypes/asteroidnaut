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
    Crafty.e('Destruction');
  }
}

window.addEventListener('load', Game.start);

Crafty.c('Player', {
  init: function() {
      this.requires('Actor, Gravity')
        .size(32, 32)
        .color('white')
        .controllable()
        .collide('Destruction', function() {
          gameOver();
        })
        .gravity('Asteroid');
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
