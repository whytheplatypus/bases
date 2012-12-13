"use strict";

/**
 * bullet
 * The bullet module.
 * @author 
 */
define(['./arcade/arcade'], function(arcade) {
	var bullet = function(x, y){
		var self = this;
		this.age = 0;
		this.willHit = false;
		this.uid = _.uniqueId('bullet_');
		this.x = x;
		this.y = y;
		this.velocity = {x:0, y:0};
		this.speed = 4;
		arcade.Catalyst(this);
	}
	bullet.prototype = new arcade.Guy();//the real benifit is error checking at the moment.. makeing sure draw and move get defined...

	bullet.prototype.move = function(entities){
		this.x += this.velocity.x
		this.y += this.velocity.y
		var self = this;
		if(self.y < 0 || self.x < 0 || self.x > window.innerWidth){
			this.trigger('die');
			return;
		}
		self.age++;
		if(self.willHit && self.willHit.t < self.age){
			if(_.contains(entities, self.willHit.enemy)){
				self.willHit.enemy.trigger({type:'collision', a:self.willHit.enemy, b:self});
				self.trigger('hit');
				self.trigger('die');
			} else {
				//recompute
				console.log('recomputing');
				self.willHit = false;
				for(var i in entities){
					if(entities[i].type == 'enemy'){
						//hit x would be entities[i].x
						var hitTime = (entities[i].x-self.x)/self.velocity.x;
						var hitY = self.y+self.velocity.y*hitTime;
						var missleY = entities[i].y+entities[i].velocity*hitTime;
						if(Math.abs(missleY-hitY) < entities[i].hitRadius*2){
							if(!self.willHit || self.willHit.t > hitTime){
								self.willHit = {x:entities[i].x, y:hitY, t:hitTime, enemy:entities[i]};
							}
						}
					}
				}
			}
		}

		this.draw();
	}

  return bullet;
});
