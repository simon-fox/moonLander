- set a variable that calculates what to add i
- we need to add this.stemCount multiplied by the balloon count
- so if it is the first balloon (balloonCount == 0) we add nothing
- but if it is the second we add stemCount
should work

OK, instead
lets just add up all the ropeSegments
so keep a global count and add

randomised stems
- make sure that multiplier variable looks at PREVIOUS balloons stemcount
- when initialising balloon allow for random variation in stemCount
	-  Math.floor(Math.random()*10);


///////////////////////////////////
// OLD HANDLE MOUSE INPUT /////////
///////////////////////////////////
	handleMouseInput: function() {
		//grab mouse positions and adjust for b2d
        this.mouseX = (ig.input.mouse.x + ig.game.screen.x) * Box2D.SCALE;
    	this.mouseY = (ig.input.mouse.y + ig.game.screen.y) * Box2D.SCALE;

		//click, state & release functions for mouse click
		if (ig.input.pressed('mouseLeft') /*&& ig.game.getEntitiesByType(EntityBreathCounter).length == 0*/) {
            //spawn windvector & breathCounter at mouse click
            //this.windVector = ig.game.spawnEntity(EntityWindVector, this.mouseX/Box2D.SCALE, this.mouseY/Box2D.SCALE);        
        	//this.breathCounter =  ig.game.spawnEntity(EntityBreathCounter, this.mouseX/Box2D.SCALE, this.mouseY/Box2D.SCALE); 
        	
        	//set breathTimer and state in breathBulb
        	//this.breathBulb.state = "IN";
        	//this.breathBulb.breathTimer.set( ig.game.breaths[ ig.game.breathCount ].i);
        }
        if (ig.input.state('mouseLeft')) {
        	//send mouse co-ords to windVector
        	//this.windVector.mouseX = ig.system.getDrawPos( ig.input.mouse.x  );
        	//this.windVector.mouseY = ig.system.getDrawPos( ig.input.mouse.y  );
        	
        }
        if (ig.input.released('mouseLeft') /*&& this.windVector.hasBlown == false*/) {
			//this.breathCounter.io = "o";
			//this.breathCounter.timer.set(ig.game.breaths[ ig.game.breathCount ].o);
			
			//this.windVector.blowTimer.reset();
			//this.windVector.adjustVector();
			//this.windVector.blowing = true;
			//this.windVector.draw = function(){};
			//this.windVector.hasBlown = true;

			//set breathTimer and state in breathBulb
			//this.breathBulb.killText();
			//this.breathBulb.state = "OUT";
			//this.breathBulb.breathTimer.set( ig.game.breaths[ ig.game.breathCount ].o);
        }
	}, 

	//////////////////////////
	//////////////////////////

	update: function() {
        // Update all entities and backgroundMaps
        this.parent();

        //click & state functions for mouse click
        if (ig.input.pressed('mouseLeft')) {
            // set the starting point
            this.mouseLast.x = ig.input.mouse.x;
            this.mouseLast.y = ig.input.mouse.y;        

            //let's grab a body in box2d
            //Create a new bounding box
            var aabb = new Box2D.Collision.b2AABB();
            //grab mouse positions and adjust for b2d
            var px = (ig.input.mouse.x + ig.game.screen.x)*Box2D.SCALE;
            var py = (ig.input.mouse.y + ig.game.screen.y)*Box2D.SCALE;
            console.log("mouse x: "+px+" mouse y: "+py);
            //set lower & upper bounds
            aabb.lowerBound.Set( px - 0.01, py - 0.01 );
            aabb.upperBound.Set( px + 0.01, py + 0.01 );
            //callback for the query function
            function GetBodyCallBack(fixture){
                    //store body
                    ig.game.mouseOverBody = fixture.GetBody();
                    console.log(ig.game.mouseOverBody);
            }
            ig.world.QueryAABB(GetBodyCallBack,aabb);
           
        }
        if (ig.input.state('mouseLeft')) {
                //is there a body stored? is there a joint already?
                if(this.mouseOverBody != false && this.mouseJoint == false){
                        var mouseJointDef = new Box2D.Dynamics.Joints.b2MouseJointDef;
                        mouseJointDef.bodyA = ig.world.GetGroundBody();
                        mouseJointDef.bodyB = this.mouseOverBody;
                        mouseJointDef.maxForce = 10000;
                        mouseJointDef.target.Set((ig.input.mouse.x + ig.game.screen.x)*Box2D.SCALE,(ig.input.mouse.y + ig.game.screen.y)*Box2D.SCALE);
                        this.mouseJoint = ig.world.CreateJoint(mouseJointDef);
                }
        }
        if (ig.input.released('mouseLeft')) {
                        if(this.mouseOverBody != false){
                                //clear stored body
                                this.mouseOverBody = false;
                        }
                        if(this.mouseJoint != false){
                                //destroy mouse joint
                                ig.world.DestroyJoint(this.mouseJoint);
                                //clear stored body
                                this.mouseJoint = false;
                        }
        }
        //if we have a mouse joint, keep setting the target
        if(this.mouseJoint != false){
                var target = new Box2D.Common.Math.b2Vec2((ig.input.mouse.x + ig.game.screen.x) * Box2D.SCALE , (ig.input.mouse.y + ig.game.screen.y) * Box2D.SCALE);
                this.mouseJoint.SetTarget(target);
        }

    },


        