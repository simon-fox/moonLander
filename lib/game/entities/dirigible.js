ig.module(
	'game.entities.dirigible'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityDirigible = ig.Box2DEntity.extend({
	size: {x: 120, y:30},
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "DIRIGIBLE",
	state: "ON",
	zIndex: 1,
	grabbable: true,
	fuel: 100,
	balloons: [],

	init: function( x, y, settings ) {
		//call parent
		this.parent( x, y, settings );


	},

	createBody: function() {
		//build new body definition from prototype
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		//set values
	    bodyDef.position = new Box2D.Common.Math.b2Vec2(
			(this.pos.x + this.size.x / 2 ) * Box2D.SCALE,
			(this.pos.y + this.size.y / 2 ) * Box2D.SCALE
		); 
	    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;    
	    //create body, assign to this class
	    this.body = ig.world.CreateBody(bodyDef);

	    //new fixture definition from prototype
	    var fixture = new Box2D.Dynamics.b2FixtureDef;
	    //set values
		fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();   
		//set up vertex array - array of points
		fixture.shape.SetAsBox(
			this.size.x / 2 * Box2D.SCALE,
			this.size.y / 2 * Box2D.SCALE
		);

	    fixture.density = 1.3;
	    fixture.friction = 1;
	    fixture.restitution = 0.4;
	    fixture.filter.groupIndex = 1;
	    this.body.SetAngularDamping(60);

	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);

	   
	    //engine 1
	    this.engine1 = ig.game.spawnEntity( EntityEngine2 , this.pos.x , this.pos.y );
	    //this.engine1.body.SetAngle( Math.PI / 2 );
		var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;

		jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );
		jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );

		jointDef.bodyA = this.body;
		jointDef.bodyB = this.engine1.body;
		jointDef.collideConnected = false;

	    ig.world.CreateJoint(jointDef);




	},

	update: function() {
		if( ig.input.state('W') ){
			ig.game.player = this;
		}
		if( ig.input.pressed('space') ){
	    	this.balloons.push( ig.game.spawnEntity( EntityBalloon , this.pos.x , this.pos.y ) );
		}
		if( ig.input.pressed('S') ){
			console.log(this.balloons[0]);
			this.balloons[0].kill();
			this.balloons.splice( 0 , 1 );
		}


		//apply constant upward force
		
		this.parent();
	
	},

	kill: function(){
		//should spawn some debris particles here

		this.parent();

	}

});

});