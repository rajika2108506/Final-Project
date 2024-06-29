
//  Constructors


function emptyModelFeatures() {

	// EMPTY MODEL

	this.vertices = [];

	this.vertexIndices = [];

	this.normals = [];

	this.colors = [];

	this.textureCoords = [];

	// Transformation parameters

	// Displacement vector
	
	this.tx = 0.0;
	
	this.ty = 0.0;
	
	this.tz = 0.0;	
	
	// Rotation angles	
	
	this.rotAngleXX = 0.0;
	
	this.rotAngleYY = 0.0;
	
	this.rotAngleZZ = 0.0;	

	// Scaling factors
	
	this.sx = 1.0;
	
	this.sy = 600/448;
	
	this.sz = 1.0;		
	
	// Animation controls
	
	this.rotXXOn = false;
	
	this.rotYYOn = false;
	
	this.rotZZOn = false;
	
	this.rotXXSpeed = 1.0;
	
	this.rotYYSpeed = 1.0;
	
	this.rotZZSpeed = 1.0;
	
	this.rotXXDir = 1;
	
	this.rotYYDir = 1;
	
	this.rotZZDir = 1;
	
	// Material features
	
	this.kAmbi = [ 0.0, 0.0, 0.0 ];
	
	this.kDiff = [ 0.3, 0.3, 0.3];

	this.kSpec = [ 0.5, 0.5, 0.5 ];

	this.nPhong = 100;
}

function simpleCubeModel( ) {
	
	var cube = new emptyModelFeatures();
	
	cube.vertices = [

		// Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,	 
	];

	cube.vertexIndices = [

		0, 1, 2,    0, 2, 3,    // Front face

        4, 5, 6,    4, 6, 7,    // Back face

        5, 3, 2,    5, 2, 6,  	// Top face

        4, 7, 1,   	4, 1, 0, 	// Bottom face

        7, 6, 2,   	7, 2, 1,	// Right face

        4, 0, 3,   	4, 3, 5  	// Left face

	];

	cube.colors = [

		// Front face
		1.0, 0.0,  0.0,
		1.0, 0.0,  0.0,
		1.0, 0.0,  0.0,
		1.0, 0.0,  0.0,

		// Back face
		1.0, 0.0,  0.0,
		1.0, 0.0,  0.0,
		1.0, 0.0,  0.0,
		1.0, 0.0,  0.0,
	];

	computeVertexNormals( cube.vertices, cube.normals );

	return cube;
}

function roadModel(){
	var road = new emptyModelFeatures();
	
	road.vertices = [

		-0.900000, -1.000000, -1.000000,
		-0.900000, -1.000000,  1.000000,
         0.900000, -1.000000,  1.000000,
         0.900000, -1.000000, -1.000000
	];

	road.vertexIndices = [

		0, 1, 2,	0, 2, 3

	];

	road.colors = [
		0.0, 0.0,  0.0,
		0.0, 0.0,  0.0,
		0.0, 0.0,  0.0,
		0.0, 0.0,  0.0,
	]

	

	computeVertexNormals( road.vertices, road.normals );

	return road;
}

/*function carModel(){
	var car = new emptyModelFeatures();

	//objReader(car);
	//console.log(car.vertices);
	//console.log(car.colors);

	return car;
}*/


//----------------------------------------------------------------------------
//
//  Instantiating scene models
//

var sceneModels = [];

//Road

sceneModels.push( new roadModel() );

sceneModels[0].sx = sceneModels[0].sy = 1.0; sceneModels[0].sz = 1000


// Player Car

sceneModels.push( new simpleCubeModel() );

sceneModels[1].sx = sceneModels[1].sz = sceneModels[1].sy *= 0.08

sceneModels[1].ty = -0.8; sceneModels[1].tz = -0.2;

sceneModels[1].rotAngleYY = 180;


//Obstacle 1

sceneModels.push( new simpleCubeModel() );

sceneModels[2].sx = sceneModels[2].sz = sceneModels[2].sy *= 0.08

sceneModels[2].ty = -0.8; sceneModels[2].tz = -15;


//Obstacle 2

sceneModels.push( new simpleCubeModel() );

sceneModels[3].sx = sceneModels[3].sz = sceneModels[3].sy *= 0.08

sceneModels[3].ty = -0.8; sceneModels[3].tz = -15; sceneModels[3].tx = -0.5;



function computeVertexNormals( coordsArray, normalsArray ) {
	
	// Clearing the new normals array
	
	normalsArray.splice( 0, normalsArray.length );
	
    // Taking 3 vertices from the coordinates array 

    for( var index = 0; index < coordsArray.length; index += 9 )
    {
		// Compute unit normal vector for each triangle
			
        var normalVector = computeNormalVector( coordsArray.slice(index, index + 3),
												coordsArray.slice(index + 3, index + 6),
												coordsArray.slice(index + 6, index + 9) );

        // Store the unit normal vector for each vertex 

        for( var j = 0; j < 3; j++ )
        {
            normalsArray.push( normalVector[0], normalVector[1], normalVector[2] ); 
		}
	}
}
