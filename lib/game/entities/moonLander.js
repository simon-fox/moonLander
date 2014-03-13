ig.module(
	'game.entities.moonLander'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityMoonLander = ig.Box2DEntity.extend({
	size: {x: 90, y:60},
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "LANDER",
	state: "ON",
	zIndex: 1,
	grabbable: true,
	fuel: 100,

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

	    fixture.density = 0.6;
	    fixture.friction = 1;
	    fixture.restitution = 0.4;
	    fixture.filter.groupIndex = -1;
	    this.body.SetAngularDamping(10);
	    //set userData
	    fixture.userData = this;

	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);
	    //engine 1
	    this.engine1 = ig.game.spawnEntity( EntityEngine , this.pos.x , this.pos.y );
		var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;

		jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( -45 * Box2D.SCALE , 30 * Box2D.SCALE );
		jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );

		jointDef.bodyA = this.body;
		jointDef.bodyB = this.engine1.body;
		jointDef.collideConnected = false;

	    ig.world.CreateJoint(jointDef);

	    //engine 2
	    this.engine2 = ig.game.spawnEntity( EntityEngine , this.pos.x , this.pos.y );
		var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;

		jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 45 * Box2D.SCALE , 30 * Box2D.SCALE );
		jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );

		jointDef.bodyA = this.body;
		jointDef.bodyB = this.engine2.body;
		jointDef.collideConnected = false;

	    ig.world.CreateJoint(jointDef);

	    //engine 3
	    this.engine3 = ig.game.spawnEntity( EntityEngine , this.pos.x , this.pos.y );
		var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;

		jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( -45 * Box2D.SCALE , -30 * Box2D.SCALE );
		jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );

		jointDef.bodyA = this.body;
		jointDef.bodyB = this.engine3.body;
		jointDef.collideConnected = false;

	    ig.world.CreateJoint(jointDef);

	    //engine 4
	    this.engine4 = ig.game.spawnEntity( EntityEngine , this.pos.x , this.pos.y );
		var jointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;

		jointDef.localAnchorA =  new Box2D.Common.Math.b2Vec2( 45 * Box2D.SCALE , -30 * Box2D.SCALE );
		jointDef.localAnchorB =  new Box2D.Common.Math.b2Vec2( 0 * Box2D.SCALE , 0 * Box2D.SCALE );

		jointDef.bodyA = this.body;
		jointDef.bodyB = this.engine4.body;
		jointDef.collideConnected = false;

	    ig.world.CreateJoint(jointDef);



	},

	update: function() {
		if( ig.input.state('up') ){
			ig.game.player = this;
		}

		this.fuel = this.engine1.fuel + this.engine2.fuel + this.engine3.fuel;
		//apply constant upward force
		
		this.parent();
	
	},

	kill: function(){
		//should spawn some debris particles here

		this.parent();

	}

});

});