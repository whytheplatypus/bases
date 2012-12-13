"use strict";

/**
 * missle
 * The missle module.
 * @author 
 */
define(['../arcade'], function(arcade) {
  var missle = function(x, y, speed){
		var self = this;
		this.uid = _.uniqueId('missle_');
		this.x = x;
		this.y = y;
		this.velocity = Math.random()*speed;
        this.willHit = false;
        this.age = 0;
		//add events
		arcade.Catalyst(this);
		//
		var collisionListener = this.on('collision', function(event){
			self.remove(collisionListener);
			self.trigger('die');
		});

	};
	
	missle.prototype = new arcade.Enemy();
	missle.prototype.hitRadius = 6;
	missle.prototype.move = function(entities) {
		var self = this;
		self.y += self.velocity;
		// body...
        self.age++;
		if(self.willHit && self.willHit.t < self.age){
			self.willHit.enemy.trigger({type:'collision', a:self.willHit.enemy, b:self});
            self.trigger('die');
		}
		self.draw();
	};

  return missle;
});