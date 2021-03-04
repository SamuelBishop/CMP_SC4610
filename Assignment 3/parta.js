"use strict";

var canvas;
var gl;

// Sierpinski Gasket Variables
var positions = [];
var numTimesToSubdivide = 5;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    // Initial declaration of vertices
    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Recursive method that divides the vertices of the gasket (preliminary run)
    divideTriangle( vertices[0], vertices[1], vertices[2],
         numTimesToSubdivide);

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Mousedown event listener that edits the vertices of the gasket
    canvas.addEventListener("mousedown", function(event){
        var vertices = [
            vec2( -.3 + ((event.clientX/256)-1), -.3 - ((event.clientY/256)-1) ),
            vec2(  0 + ((event.clientX/256)-1),  .3 - ((event.clientY/256)-1) ),
            vec2( .3 + ((event.clientX/256)-1), -.3 - ((event.clientY/256)-1) )
        ];
        // clear a,b,c positions for gasket to generate new ones
        positions = [];
        // Calculate new gasket
        divideTriangle( vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );
        render();
    });

    // Bind the buffer data to the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    
}

// For Sierpinski Gasket
function triangle(a, b, c)
{
    positions.push(a, b, c);
}

// For Sierpinski Gasker
function divideTriangle(a, b, c, count)
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle(a, b, c);
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, positions.length );
}
