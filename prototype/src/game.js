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
  }
}

window.addEventListener('load', Game.start);

Crafty.c('Player', {
  init: function() {
      this.requires('Actor, Gravity')
        .size(32, 32)
        .color('white')
        .controllable()
        .gravity('Asteroid');
  }
});

Crafty.c('Asteroid', {
  init: function() {
    this.requires('Actor')
      .color('#888888').size(64, 24);
  }
});
