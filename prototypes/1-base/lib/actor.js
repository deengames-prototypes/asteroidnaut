// Lots and lots and lots of helpful, default helpers for an actor class.
// It can be moved, sized, clicked, etc.
Crafty.c('Actor', {
  init: function() {
    // Collision: every actor can be collision-detected
    this.requires('2D, Canvas, Color, Collision, Moveable, Alpha, Delay')
      .size(32, 32)
      .color("#888888");

    // Used for constant velocity
    this.v = { x: 0, y: 0 };

    // Used for cancelling "after" and "repeatedly" events
    this.timerEvents = []

    this.bind('EnterFrame', function() {
      this.attr({ x: this.x + this.v.x, y: this.y + this.v.y });
    })
  },

  // Do something once, after a certain amount of time.
  // See: repeatedly
  after: function(seconds, callback) {
    this.delay(callback, seconds * 1000, 0);
    this.timerEvents.push(callback);
    return this;
  },

  // Cancels anything set by "after" or "repeatedly"
  cancelTimerEvents: function() {
    for (var i = 0; i < this.timerEvents.length; i++) {
      this.cancelDelay(this.timerEvents[i]);
    }
  },

  // Execute a callback when clicked on
  click: function(callback) {
    this.requires('Mouse').bind('Click', function() {
      console.log("Clicked on " + this._entityName);
      callback();
    });
    return this;
  },

  // Execute a callback when collides with an entity with the tag in it. This
  // doesn't resolve the collision so that we're no longer overlapping the target.
  // If you want to displace out of the object, use collideWith.
  collide: function(tag, callback) {
    this.onHit(tag, function(data) {
      if (callback != null) {
        callback();
      }
    });
    return this;
  },

  // Collide against a solid object, and resolve the collision so that we're no
  // longer overlapping with the target. For non-resolving, use collide.
  // The callback receives an object (the thing that's hit).
  collideWith: function(tag, callback) {
    this.bind("Moved", function(evt) {
      var hitData = this.hit(tag);
      if (hitData != false) {
        // displace backward so we're no longer overlapping
        this[evt.axis] = evt.oldValue;
        // stop, even with gravity
        if (evt.axis === "y") this.vy = 0;

        if (callback != null) {
          // Invoke callback once per object hit
          for (var i = 0; i < hitData.length; i++) {
            callback(hitData[i]);
          }
        }
      }
    });
    return this;
  },

  // Responds to user input; speed = pixels per second
  controllable: function(speed) {
    if (speed == null) {
      speed = 4;
    }
    this.requires('Fourway').fourway(speed);
    return this;
  },

  die: function() {
    this.destroy();
    return this;
  },

  img: function(filename) {
    this.requires('Image');
    this.image(filename);
    return this;
  },

  // Keep doing something. Forever.
  repeatedly: function(callback, secondsInterval) {
    this.delay(callback, secondsInterval * 1000, -1);
    this.timerEvents.push(callback);
    return this;
  },

    // Resize
  size: function(x, y) {
    this.attr({ w: x, h: y });
    return this;
  },

  // Start moving
  velocity: function(x, y) {
    this.v = { x: x || 0, y: y || 0 };
    return this;
  }
});

// Overrides for built-in functions like 'move', etc.
Crafty.c('Moveable', {
  // Tween to location in T fractional seconds (defaults to 1.0s)
  move: function(x, y, t, callback) {
    if (t == null || t == 0) {
      this.attr({ x: x, y: y });
      if (callback != null) {
        callback();
      }
    } else {
      this.requires('Tween');
      this.tween({ x: x, y: y }, t * 1000);
      this.bind('TweenEnd', callback);
    }
    return this;
  }
});
