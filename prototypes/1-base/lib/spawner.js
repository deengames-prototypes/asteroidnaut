// Something that spawns a specific entity continuously and randomly within
// the specified time (eg. spawn a crystal every 10-15 seconds).
// Crafty.e('Spawner').spawn('Crystal').between(10, 15)
Crafty.c('Spawner', {
  spawn: function(className) {
    this.classToSpawn = className;
    return this;
  },

  between: function(minSpawnTime, maxSpawnTime) {
    this.lastSpawnOn = new Date();
    this.setNextSpawnTime(minSpawnTime, maxSpawnTime);
    this.bind('EnterFrame', function() {
      var now = new Date();
      if (now >= this.nextSpawnOn) {
        // SPAWN MORE OVERLORDZ
        Crafty.e(this.classToSpawn);
        this.setNextSpawnTime(minSpawnTime, maxSpawnTime);
      }
    });
    return this;
  },

  every: function(seconds) {
    this.between(seconds, seconds); // cheap shortcut
    return this;
  },

  // private

  setNextSpawnTime: function(minSpawnTime, maxSpawnTime) {
    var now = new Date();
    var nextSpawnSeconds = randomBetween(minSpawnTime, maxSpawnTime);
    // http://stackoverflow.com/a/1214753/210780
    this.nextSpawnOn = new Date(now.getTime() + (1000 * nextSpawnSeconds));
  }
});
