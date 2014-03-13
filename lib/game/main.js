ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	//plugins
	'plugins.box2d.game',
	'plugins.box2d.debug',
	//levels
	'game.levels.moon',
	'game.levels.stage2',
	//entities
	'game.entities.moonLander',
	'game.entities.moonLanderP2',
	'game.entities.engine',
	'game.entities.engine2',
	'game.entities.dirigible',
	'game.entities.balloon_ropeSegment',
	'game.entities.balloon',
	'game.entities.grabber',

	//particles
	
	//UI classes

	//debug
	'impact.debug.debug'
)
.defines(function(){

MyGame = ig.Box2DGame.extend({
	font: new ig.Font( 'media/invasionFont.png' ),
	gravity: 300,
	mouseLast: {x: 0, y: 0},
	mouseOverBody: false,
	mouseOverClass: false,
	mouseJoint: false,
	killList: [],
	ropeSegmentCount: 0,
	grabberJoint: null,
	vehicles: [ ],
	vehicleIndex: 0,

	init: function() {
		//box2d debug
		this.debugCollisionRects = true;
		//bind keys
		ig.input.bind( ig.KEY.UP_ARROW, 'up');
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left');
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right');
		ig.input.bind( ig.KEY.MOUSE1, 'mouseLeft' );

		ig.input.bind( ig.KEY.W, 'W');
		ig.input.bind( ig.KEY.S, 'S');
		ig.input.bind( ig.KEY.A, 'A');
		ig.input.bind( ig.KEY.D, 'D');
		ig.input.bind( ig.KEY.Q, 'Q');
		ig.input.bind( ig.KEY.SPACE, 'space');
		ig.input.bind( ig.KEY.TAB, 'tab');


		
		ig.game.sortEntitiesDeferred();

		//set up camera trap
		this.camera = new Camera( ig.system.width/3.5 , ig.system.height/2 , 6 );
	    this.camera.trap.size.x = 160;
	    this.camera.trap.size.y = 100;
	    this.camera.lookAhead.x = ig.ua.mobile ? ig.system.width/6 : 0;
		// Load level
		this.loadLevel( LevelMoon );
		
		//set up contact listener
		this.setContactListener();
		//spawn monster
		this.player = ig.game.getEntitiesByType( EntityDirigible )[0];
		this.camera.set( this.player );

		 //balloons
		if( ig.game.getEntitiesByType(EntityDirigible).length ){
			this.dirigible = ig.game.getEntitiesByType(EntityDirigible)[0];
			for( var i = 0 ; i < 4 ; i ++ ){
		    	this.dirigible.balloons.push( ig.game.spawnEntity( EntityBalloon , this.dirigible.pos.x , this.dirigible.pos.y ) );
			}
		}
		


		
	},

	loadLevel: function( level ) {        
	    this.parent( level );
	    
	    // Set camera max and reposition trap
	    this.camera.max.x = this.collisionMap.width * this.collisionMap.tilesize - ig.system.width;
	    this.camera.max.y = this.collisionMap.height * this.collisionMap.tilesize - ig.system.height;
	    
	},
	
	update: function() {
		this.parent();
		this.handleMouseInput();
		this.processKillList();

		this.camera.follow( this.player );

		if( ig.input.pressed('tab') ){
			if ( ig.game.vehicleIndex == ig.game.vehicles.length - 1 ){
				ig.game.vehicleIndex = 0;
			}
			else{
				ig.game.vehicleIndex += 1;
			}
			ig.game.player = ig.game.vehicles[ ig.game.vehicleIndex ];
		}
	},
	
	draw: function() {
		//draw box2d debug
		//this.debugDrawer.draw();

		this.parent();

		//get system dimensions for drawing
		var x = ig.system.width/2,
		y = ig.system.height/2;
		//drawing text
		this.font.draw( "Fuel: " + ig.game.player.fuel , x - 150, y - 280, ig.Font.ALIGN.LEFT );	
	},

	handleMouseInput: function() {
		//grab mouse positions and adjust for b2d
        this.mouseX = (ig.input.mouse.x + ig.game.screen.x) * Box2D.SCALE;
    	this.mouseY = (ig.input.mouse.y + ig.game.screen.y) * Box2D.SCALE;

		//click, state & release functions for mouse click
		if (ig.input.pressed('mouseLeft') ) {
			//do collision detection in box3d
			this.getBodyUnderMouse();

        }
        if (ig.input.state('mouseLeft')) {
        	this.createMouseJoint();
        }
        if (ig.input.released('mouseLeft') ) {

			this.destroyMouseJoint();
        }
        this.updateMouseJointTarget();
	}, 

	setContactListener: function(){
		this.contactListener = new Box2D.Dynamics.b2ContactListener;
		ig.world.SetContactListener(this.contactListener);
		this.contactListener.BeginContact = function(contact){
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
			// INVESTIGATE FIXTURE A
			if ( fixtureA.m_userData != null && fixtureB.m_userData != null ){
				switch(fixtureA.m_userData.name){
					case 'GRABBER':
					console.log('test');
						if( ig.world.grabberJoint == null){
							//fixture A is the grabber
							//make a joint with fixture B
							var jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;

							jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );
							jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );

							jointDef.bodyA = fixtureA.m_userData.body;
							jointDef.bodyB = fixtureB.m_userData.body;
							jointDef.collideConnected = false;

						    ig.world.grabberJoint = ig.world.CreateJoint(jointDef);
						    console.log(ig.world.grabberJoint);
						}
						
					break;
				}
			}
			// INVESTIGATE FIXTURE b
			if ( fixtureA.m_userData != null && fixtureB.m_userData != null ){
				switch(fixtureB.m_userData.name){
					case 'GRABBER':
					console.log('test');

						if( ig.world.grabberJoint == null){
							//fixture A is the grabber
							//make a joint with fixture B
							var jointDef = new Box2D.Dynamics.Joints.b2DistanceJointDef;

							jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );
							jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );

							jointDef.bodyA = fixtureA.m_userData.body;
							jointDef.bodyB = fixtureB.m_userData.body;
							jointDef.collideConnected = false;

						    ig.world.grabberJoint = ig.world.CreateJoint(jointDef);
						    console.log(ig.world.grabberJoint);

						}

					break;
				}
			}
		};

		this.contactListener.EndContact = function(contact){
			// INVESTIGATE FIXTURE A
			if ( contact.GetFixtureA().m_userData != null){
				switch(contact.GetFixtureA().m_userData.name){
				}
			}
			// INVESTIGATE FIXTURE b
			if ( contact.GetFixtureA().m_userData != null){
				switch(contact.GetFixtureA().m_userData.name){
				}
			}
		};


	},

	processKillList: function(){
		//loop through killList and destroy all bodies
		if( this.killList.length > 0 ){
			for( var i = 0 ; i < this.killList.length ; i++ ){
				this.killList[i].kill();
			}
			//empty killList 
			this.killList = [];
		}
	},

	cleanUpWindVectors: function(){
		var windVectorArray = ig.game.getEntitiesByType(EntityWindVector);
		if( windVectorArray.length > 1){
			windVectorArray[0].kill();
		}
	},

	buildVehiclesArray: function(){
		for( var i = 0 ; i < ig.game.getEntitiesByType(EntityMoonLander).length ; i++ ){
			this.vehicles.push( ig.game.getEntitiesByType(EntityBalloon)[i] );
		}
	},

	sortZindex: function(){
		//sort into ascending order - lowest yPos (back of z order) at 0 
		this.balloonsArray.sort(function(o1, o2) {
			return o1.yPos - o2.yPos;
		});
		//give zIndex based on yPos, sails above boat bodies
		for( var i = 0 ; i < this.balloonsArray.length ; i++ ){
			//play button is always at the front
			if( this.balloonsArray[i].name == "PLAYBUTTON"){
				this.balloonsArray[i].zIndex = i + 20;
			}
			else { this.balloonsArray[i].zIndex = i + 10; }
		}
		//sort entities for render order
		ig.game.sortEntitiesDeferred(); 
	},

	getBodyUnderMouse: function(){
		//let's grab a body in box2d
        //Create a new bounding box
        var aabb = new Box2D.Collision.b2AABB();
        //set lower & upper bounds
        aabb.lowerBound.Set( this.mouseX - 0.01, this.mouseY - 0.01 );
        aabb.upperBound.Set( this.mouseX + 0.01, this.mouseY + 0.01 );
        //callback for the query function
        function GetBodyCallBack(fixture){
                //store body
                ig.game.mouseOverBody = fixture.GetBody();
        }
        ig.world.QueryAABB(GetBodyCallBack,aabb);
	},

	createMouseJoint: function(){
		//is there a body stored? is there a joint already?
        if(this.mouseOverBody != false && this.mouseJoint == false){
                var mouseJointDef = new Box2D.Dynamics.Joints.b2MouseJointDef;
                mouseJointDef.bodyA = ig.world.GetGroundBody();
                mouseJointDef.bodyB = this.mouseOverBody;
                mouseJointDef.maxForce = 10000;
                mouseJointDef.target.Set((ig.input.mouse.x + ig.game.screen.x)*Box2D.SCALE,(ig.input.mouse.y + ig.game.screen.y)*Box2D.SCALE);
                this.mouseJoint = ig.world.CreateJoint(mouseJointDef);
        }
	},

	destroyMouseJoint: function(){
		if(this.mouseOverBody != false){
            //clear stored body
            //happens in breathIndicator.cleanUpAfterBreathIsFinished();
        }
        if(this.mouseJoint != false){
            //destroy mouse joint
            ig.world.DestroyJoint(this.mouseJoint);
            //clear stored body
            this.mouseJoint = false;
        }
	},

	updateMouseJointTarget: function(){
		//if we have a mouse joint, keep setting the target
        if(this.mouseJoint != false){
                var target = new Box2D.Common.Math.b2Vec2((ig.input.mouse.x + ig.game.screen.x) * Box2D.SCALE , (ig.input.mouse.y + ig.game.screen.y) * Box2D.SCALE);
                this.mouseJoint.SetTarget(target);
        }
	},

	rotate: function(pointX, pointY, rectWidth, rectHeight, angle) {
	  // convert angle to radians
	  //angle = angle * Math.PI / 180.0
	  // calculate center of rectangle
	  var centerX = rectWidth / 2.0;
	  var centerY = rectHeight / 2.0;
	  // get coordinates relative to center
	  var dx = pointX - centerX;
	  var dy = pointY - centerY;
	  // calculate angle and distance
	  var a = Math.atan2(dy, dx);
	  var dist = Math.sqrt(dx * dx + dy * dy);
	  // calculate new angle
	  var a2 = a + angle;
	  // calculate new coordinates
	  var dx2 = Math.cos(a2) * dist;
	  var dy2 = Math.sin(a2) * dist;
	  // return coordinates relative to top left corner
	  return { newX: dx2 + centerX, newY: dy2 + centerY };
	}

});

var c = document.createElement('canvas');
c.id = 'canvas';
document.body.appendChild(c);

// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 800, 600, 1 );

});
