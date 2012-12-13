

require(['./arcade/arcade', 'missle', 'silo', 'bullet', 'TraceKit'], function(arcade, missle, silo, bullet, TraceKit){
	TraceKit.report.subscribe(function(stackInfo) { 
		console.log(stackInfo);
	});
	var mc = new arcade.Game({fullscreen:true, ctx:'./arcade/canvas'},function(){;
		var ctx = mc.ctx;

		missle.prototype.draw = function() {
			// Filled triangle
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.scale(6, 6);
			ctx.beginPath();
			ctx.moveTo(-1,0);
			ctx.lineTo(1,0);
			ctx.lineTo(0,2);
			ctx.fill();
			ctx.restore();
		};
		//missle.prototype.sprite = '?';
		//position top left

		silo.prototype.draw = function() {
			// Filled triangle
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.scale(5, 5);
			ctx.fillRect(-1,-1,2,2);
			ctx.restore();
		};
		
		bullet.prototype.draw = function() {
			// Filled triangle
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.scale(2, 2);
			ctx.fillRect(-1,-1,2,2);
			ctx.restore();
		};
		
		function clickshoot(){
			var e = target
			if(e){
				for(var i in mc.entities){
					if(mc.entities[i].type == 'silo'){
						var dist = Math.sqrt(((e.x-mc.entities[i].x)*(e.x-mc.entities[i].x))+((e.y-mc.entities[i].y)*(e.y-mc.entities[i].y)));
						var normal = {
							x:(e.x-mc.entities[i].x)/dist,
							y:(e.y-mc.entities[i].y)/dist
						}
						mc.entities[i].trigger({type:'fire', game:mc, normal:normal});
					}
				}
			}
		}

		var target = false;

		var touches = [];
		function touchshoot(){
			if(touches.length < 1){
				return;
			}
			for(var i in mc.entities){
				if(mc.entities[i].type == 'silo'){
					var xy = {
						x:touches[0].pageX,
						y:touches[0].pageY
					};
					var dist = Math.sqrt(((touches[0].pageX-mc.entities[i].x)*(touches[0].pageX-mc.entities[i].x))+((touches[0].pageY-mc.entities[i].y)*(touches[0].pageY-mc.entities[i].y)));
					for(var k=1; k < touches.length; k++){
						var newDist = Math.sqrt(((touches[k].pageX-mc.entities[i].x)*(touches[k].pageX-mc.entities[i].x))+((touches[k].pageY-mc.entities[i].y)*(touches[k].pageY-mc.entities[i].y)));
						if(newDist<dist){
							dist = newDist;
							xy.x = touches[k].pageX;
							xy.y = touches[k].pageY;
						};
					}
					var normal = {
						x:(xy.x-mc.entities[i].x)/dist,
						y:(xy.y-mc.entities[i].y)/dist
					}
					mc.entities[i].trigger({type:'fire', game:mc, normal:normal});
				}
			}
		}


		ctx.onmousedown(function(e){
			target = e;
		});

		ctx.ondrag(function(e){
			target = e;
		});

		ctx.onmouseup(function(e){
			target = false;
		});

		ctx.ontouchstart(function(e){
			touches = e.targetTouches;
		});
		ctx.ontouchmove(function(e){
			touches = e.targetTouches;
		});
		ctx.ontouchend(function(e){
			touches = e.targetTouches;
		})

		function shoot(){
			clickshoot();
			touchshoot();
			setTimeout(shoot, 100);
		}
		shoot();
		
		//turn on chrome fps counter
		mc.run(function(){
			ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); // clear canvas
			ctx.font = 'bold 24px sans-serif';
			ctx.fillText("Score: "+mc.score, 25, 25);
			ctx.fillText("Wave: "+stage, ctx.canvas.width-200, 25);
		});
		var stage = 1;
		var numsilos = 3;
		
		function round(level){
			var silos = [];
			for (var key in mc.entities){
				if(mc.entities[key].type == 'silo'){
					silos.push(mc.entities[key]);
				}
    		mc.remove(mc.entities[key]);
    	}
			for(var i = 0; i < numsilos; i++){
				if(i < silos.length){
					mc.add(silos[i])
					console.log(silos[i].health);
				} else {
					var silo1 = new silo(25+((ctx.canvas.width-50)/(numsilos-1))*(i), ctx.canvas.height - 25);
					mc.add(silo1);
				}
			}

			for(var i = 0; i < 20*level; i++){
				var m = new missle(Math.random() * (ctx.canvas.width), 20, level);
        var entities = mc.entities;
        for(var key in entities){
          if(entities[key].type == 'silo'){
            //check hit
            if(Math.abs(m.x-entities[key].x) < m.hitRadius*2){
              var hitTime = (entities[key].y-(m.y+m.hitRadius))/m.velocity;
          
              if(!m.willHit || m.willHit.t > hitTime){
                m.willHit = {x:entities[key].x, y:entities[key].y, t:hitTime, enemy:entities[key]};
              }
            }
          }
        }
                
				m.watch('y');
				m.on('set:y', function(e){
					if(e.new > ctx.canvas.height){
						e.self.trigger('die');
					}
				});
				m.on('die', function(e){
					if(!_.some(mc.entities, function(ent){return (ent.type == 'enemy' && ent != e)})){
						stage++;
						round(stage);
					}
				});
				//i need global events
				mc.add(m);
				
			}
		}
		round(stage);
	});
});