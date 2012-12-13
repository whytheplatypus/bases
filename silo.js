"use strict";

/**
 * silo
 * The silo module.
 * @author 
 */
define(['./arcade/arcade', './bullet'], function(arcade, bullet) {
	var silo = function(x, y){
		var self = this;
		this.uid = _.uniqueId('silo_');
		this.type = 'silo';
		this.x = x;
		this.y = y;
		this.health = 10;
		arcade.Catalyst(this);
		this.on('collision', function(entity){
			self.health--;
			console.log(self.health);
			if(self.health < 1){
				self.trigger('die');
			}
		});
		//should inherit this
		this.children = {};
		this.add = function(child){
      self.children[child.uid] = child;
      child.on('die', function(event){
        self.remove(event);
      });
    };

    this.remove = function(child){
      delete self.children[child.uid];
    };


		self.on('fire', function(event){
			var shot = new bullet(self.x, self.y);
			shot.velocity = {x:shot.speed*event.normal.x, y:shot.speed*event.normal.y};
			//get entities somehow
			var entities = event.game.entities;
			for(var i in entities){
				if(entities[i].type == 'enemy'){
					//hit x would be entities[i].x
					var hitTime = (entities[i].x-self.x)/shot.velocity.x;
					var hitY = self.y+shot.velocity.y*hitTime;
					var missleY = entities[i].y+entities[i].velocity*hitTime;
					if(Math.abs(missleY-hitY) < entities[i].hitRadius*2){
						if(!shot.willHit || shot.willHit.t > hitTime){
							shot.willHit = {x:entities[i].x, y:hitY, t:hitTime, enemy:entities[i]};
						}
					}
				}
			}
			shot.on('hit', function(e){
				event.game.score++;
			});
			self.add(shot);
		});
	};

	silo.prototype = new arcade.Guy();
	
	silo.prototype.move = function(entities){
		//move children draw here
		//if(!_.isUndefined(ents[i].children) && !_.isEmpty(ents[i].children)){
    for(var key in this.children){
    	this.children[key].move(entities);
    }
		this.draw();
	}

  return silo;
});