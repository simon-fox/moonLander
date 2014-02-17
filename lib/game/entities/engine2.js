ig.module(
	'game.entities.engine2'
)
.requires(
	'impact.entity',
	'plugins.box2d.entity'
)
.defines(function(){

EntityEngine2 = ig.Box2DEntity.extend({
	size: {x: 30, y:40},
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	name: "ENGINE",
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

	    fixture.density = 0.3;
	    fixture.friction = 1;
	    fixture.restitution = 0.4;
	    fixture.filter.groupIndex = -1;
	    this.body.SetAngularDamping(50);

	    //create with body as parent 
	    this.fixture = this.body.CreateFixture(fixture);

	},

	update: function() {
		//check for upwards keypress
		if( ig.input.state('W') ){
			if( this.fuel > 0 ){
				var angle = this.body.GetAngle() - ( Math.PI / 2 );
				var xImpulse = 500 * Math.cos( angle );
				var yImpulse = 500 * Math.sin( angle );
				this.body.ApplyForce( new Box2D.Common.Math.b2Vec2( xImpulse , yImpulse ), this.body.GetPosition() );
				this.fuel -= 0.1;
			}
			else{
				console.log('out of fuel!');
			}
		}
		if( ig.input.state('A') ){
			this.body.ApplyTorque( -4000 );
			
		}
		if( ig.input.state('D') ){
			this.body.ApplyTorque( 4000 );			

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