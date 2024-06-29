// Global Variables

var gl = null; // WebGL context

var shaderProgram = null;

var modelVertexPositionBuffer = null;
	
var modelVertexNormalBuffer = null;

var modelVertexColorBuffer = null;

var modelVertexTextureCoordBuffer = null;

var modelVertexIndexBuffer = null;

// The GLOBAL transformation parameters

var globalAngleXX = 0.0;

var globalAngleYY = 0.0;

var globalTz = 0.0;

// GLOBAL Animation controls

var globalRotationYY_ON = 0;

var globalRotationYY_DIR = 1;

var globalRotationYY_SPEED = 1;

// To allow choosing the way of drawing the model triangles

var primitiveType = null;
 
// To allow choosing the projection type

var projectionType = 0;

// NEW --- The viewer position

// It has to be updated according to the projection type

var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];



// NEW - To count the number of frames per second (fps)
//

var elapsedTime = 0;

var frameCount = 0;

var lastfpsTime = new Date().getTime();;


function countFrames() {
	
   var now = new Date().getTime();

   frameCount++;
   
   elapsedTime += (now - lastfpsTime);

   lastfpsTime = now;

   if(elapsedTime >= 1000) {
	   
       fps = frameCount;
       
       frameCount = 0;
       
       elapsedTime -= 1000;
	   
	   document.getElementById('fps').innerHTML = 'fps:' + fps;
   }
}


function initBuffers( model ) {

	// Coordinates

	modelVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	modelVertexPositionBuffer.itemSize = 3;
	modelVertexPositionBuffer.numItems = model.vertices.length / 3;
 
	// Colors

	modelVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.colors), gl.STATIC_DRAW);
	modelVertexColorBuffer.itemSize = 3;
	modelVertexColorBuffer.numItems = model.vertices.length / 3;

	// Vertex indices

	modelVertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.vertexIndices), gl.STATIC_DRAW);
	modelVertexIndexBuffer.itemSize = 1;
	modelVertexIndexBuffer.numItems = model.vertexIndices.length;

	// Vertex Normal Vectors

	modelVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW);
	modelVertexNormalBuffer.itemSize = 3;
	modelVertexNormalBuffer.numItems = model.normals.length / 3;

}

//----------------------------------------------------------------------------
//  Drawing the model

function drawModel( model, 
					mvMatrix,
					primitiveType ) {

	mvMatrix = mult( mvMatrix, translationMatrix( model.tx, model.ty, model.tz ) );
						 
	mvMatrix = mult( mvMatrix, rotationZZMatrix( model.rotAngleZZ ) );
	
	mvMatrix = mult( mvMatrix, rotationYYMatrix( model.rotAngleYY ) );
	
	mvMatrix = mult( mvMatrix, rotationXXMatrix( model.rotAngleXX ) );
	
	mvMatrix = mult( mvMatrix, scalingMatrix( model.sx, model.sy, model.sz ) );
						 
	// Passing the Model View Matrix to apply the current transformation    
	
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	initBuffers(model);

	// Passing the buffers

	//Coordinates

	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
    
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, modelVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	//Colors

	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexColorBuffer);

	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, modelVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	//Normals

	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);

	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, modelVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// The vertex indices

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);

	
	// Material properties
	
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_ambient"), 
		flatten(model.kAmbi) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_diffuse"),
        flatten(model.kDiff) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_specular"),
        flatten(model.kSpec) );

	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"), 
		model.nPhong );

	
    // Light Sources
	
	var numLights = lightSources.length;
	
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"), 
		numLights );

	//Light Sources
	
	for(var i = 0; i < lightSources.length; i++ )
	{
		gl.uniform1i( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].isOn"),
			lightSources[i].isOn );
    
		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].position"),
			flatten(lightSources[i].getPosition()) );
    
		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].intensities"),
			flatten(lightSources[i].getIntensity()) );
    }

    // Drawing the triangles --- NEW --- DRAWING ELEMENTS 
	
	gl.drawElements(gl.TRIANGLES, modelVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		
} 

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {
	
	var pMatrix;
	
	var mvMatrix = mat4();
	
	// Clearing the frame-buffer and the depth-buffer
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Computing the Projection Matrix


	// A standard view volume.
	
	// Viewer is at (0,0,0)
	
	// Ensure that the model is "inside" the view volume
	
	pMatrix = perspective( 45, 1, 0.05, 30 );
	
	// Global transformation !!
	
	globalTz = -2.5;

	// NEW --- The viewer is on (0,0,0)
	
	pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[2] = 0.0;
	
	pos_Viewer[3] = 2.0;  

	// Passing the Projection Matrix to apply the current projection
	
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	
	// NEW --- Passing the viewer position to the vertex shader
	
	gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"),
        flatten(pos_Viewer) );
	
	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	
	mvMatrix = translationMatrix( 0, 0, globalTz );
	
	// NEW - Updating the position of the light sources, if required
	
	// FOR EACH LIGHT SOURCE
	    
	for(var i = 0; i < lightSources.length; i++ )
	{
		// Animating the light source, if defined
		    
		var lightSourceMatrix = mat4();

		if( !lightSources[i].isOff() ) {
				
			// THE CODE FOR THE OTHER ROTATION AXES

			if( lightSources[i].isRotYYOn() ) 
			{
				lightSourceMatrix = mult( 
						lightSourceMatrix, 
						rotationYYMatrix( lightSources[i].getRotAngleYY() ) );
			}
			if( lightSources[i].isRotXXOn() ) 
			{
				lightSourceMatrix = mult( 
						lightSourceMatrix, 
						rotationXXMatrix( lightSources[i].getRotAngleXX() ) );
			}
		}
		
		// NEW Passing the Light Souree Matrix to apply
	
		var lsmUniform = gl.getUniformLocation(shaderProgram, "allLights["+ String(i) + "].lightSourceMatrix");
	
		gl.uniformMatrix4fv(lsmUniform, false, new Float32Array(flatten(lightSourceMatrix)));
	}

	// Instantianting all scene models
	
	for(var i = 0; i < sceneModels.length; i++ )
	{ 
		drawModel( sceneModels[i],
			   mvMatrix,
	           primitiveType );
	}
	           
	// NEW - Counting the frames
	
	countFrames();
}

//----------------------------------------------------------------------------
//
//  NEW --- Animation
//

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {
	
	var timeNow = new Date().getTime();
	
	if( lastTime != 0 ) {
		
		var elapsed = timeNow - lastTime;
		

		// Obstacles move

			obstaclesMove( gameSpeed * (90 * elapsed) / 1000.0 );

		// Global rotation
		
		if( globalRotationYY_ON ) {

			globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

		// For every model --- Local rotations
		
		for(var i = 0; i < sceneModels.length; i++ )
	    {
			if( sceneModels[i].rotXXOn ) {

				sceneModels[i].rotAngleXX += sceneModels[i].rotXXDir * sceneModels[i].rotXXSpeed * (90 * elapsed) / 1000.0;
			}

			if( sceneModels[i].rotYYOn ) {

				sceneModels[i].rotAngleYY += sceneModels[i].rotYYDir * sceneModels[i].rotYYSpeed * (90 * elapsed) / 1000.0;
			}

			if( sceneModels[i].rotZZOn ) {

				sceneModels[i].rotAngleZZ += sceneModels[i].rotZZDir * sceneModels[i].rotZZSpeed * (90 * elapsed) / 1000.0;
			}
		}
		
		// Rotating the light sources
	
		for(var i = 0; i < lightSources.length; i++ )
	    {
			if( lightSources[i].isRotYYOn() ) {

				var angle = lightSources[i].getRotAngleYY() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
		
				lightSources[i].setRotAngleYY( angle );
			}
			if( lightSources[i].isRotXXOn() ) {

				var angle = lightSources[i].getRotAngleXX() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
		
				lightSources[i].setRotAngleXX( angle );
			}
		}
}
	
	lastTime = timeNow;
}


//----------------------------------------------------------------------------

// Timer
//to start the rendering, using a timer, updating the scene and rendering it

function tick() {
	
	requestAnimFrame(tick);
	
	drawScene();
	
	animate();
	//movePlayerCar();  // Move the player car
}


//----------------------------------------------------------------------------
//
//  User Interaction
//

function outputInfos(){  
}

//----------------------------------------------------------------------------

function setEventListeners(){

	document.onkeydown = function(e) {
	    switch (e.keyCode) {
	        case 37:
	            turn('left');
	            break;

	        case 39:
	            turn('right');
	            break;

	        case 32:
	        	startGame();
	        	break;

			case 38:
				turn('up');
				break;
			case 40:
				turn('down');
				break;
	    }
	};

	document.getElementById("obj-file").onchange = function(){
		
		var file = this.files[0];
		
		var reader = new FileReader();

		reader.onload = function( progressEvent ){

			// Entire file read as a string
			
			// The file lines
			
			lines = this.result.split('\n');
			
			// The new vertices
			
			var newVertices = [];

			// The new colors

			var newColors = [];
			
			// The new normal vectors
			
			var newNormals = [];

			// The new face vectors
			
			var newFaces = [];
			
			// Check every line and store 

			for(var line = 0; line < lines.length; line++){

				// The tokens/values in each line

			    // Separation between tokens is 1 or mode whitespaces
			     
			    var tokens = lines[line].split(/\s\s*/);
			    
			    // Array of tokens; each token is a string
			    
			    if( tokens[0] == "v" ) 
			    {
					// For every vertex we have 3 floating point values

					for( j = 1; j < 7; j++ ) {
						if (j < 4)
							newVertices.push( parseFloat( tokens[ j ] ) );
						else
							newColors.push( parseFloat( tokens[ j ] ) );
					}
				}

				if( tokens[0] == "vn" ) 
				{
					// For every normal we have 3 floating point values

					for( j = 1; j < 4; j++ ) {

						newNormals.push( parseFloat( tokens[ j ] ) );
					}
				}

				if( tokens[0] == "f" ) 
				{
					// For every face we have 3 integer vertex values

					for( j = 1; j < 4; j++ ) {

						newFaces.push( parseInt( tokens[ j ] ) - 1 );
					}
				}
			}	

			// Assigning to the current model
			
			sceneModels[1].vertices = newVertices.slice();
			
			sceneModels[1].normals = newNormals.slice();

			sceneModels[1].vertexIndices = newFaces.slice();

			sceneModels[1].colors = newColors.slice();

			sceneModels[2].vertices = newVertices.slice();
			
			sceneModels[2].normals = newNormals.slice();

			sceneModels[2].vertexIndices = newFaces.slice();

			sceneModels[2].colors = newColors.slice();

			sceneModels[3].vertices = newVertices.slice();
			
			sceneModels[3].normals = newNormals.slice();

			sceneModels[3].vertexIndices = newFaces.slice();

			sceneModels[3].colors = newColors.slice();
			console.log(sceneModels[3].colors);
		};
		
		// Entire file read as a string

		reader.readAsText( file );		
	}
}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL( canvas ) {
	try {
		
		// Create the WebGL context
		
		// Some browsers still need "experimental-webgl"
		
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		
		// DEFAULT: The viewport occupies the whole canvas 

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		
		// DEFAULT: The viewport background color is WHITE
		
		// NEW - Drawing the triangles defining the model
		
		primitiveType = gl.TRIANGLES;

		// Enable DEPTH-TEST
		
		gl.enable( gl.DEPTH_TEST );
        
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}

//----------------------------------------------------------------------------

function runWebGL() {
	
	var canvas = document.getElementById("my-canvas");
	
	initWebGL( canvas );

	shaderProgram = initShaders( gl );
	
	setEventListeners();
	
	tick();		// A timer controls the rendering / animation    

	outputInfos();
}
