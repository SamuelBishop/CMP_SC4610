"use strict";

var positions = [];

/*
Download the program DrawCube that will Render a 3D cube in WebGL. 
Implement the following: 

1. Press any key to make the cube a random color DONE 
2. Press the spacebar key to return the cube back to white DONE
3. Click on the canvas and change the color of the cube based on the click position DONE
    The RGBA value of the cube will be (x, y, 1, 1) where DONE
    x will go smoothly from 0 to 1 based on the horizontal click position, so it will be 0 if you click on the left, 0.5 in the middle, and 1 on the right. 
    y will do the same, but vertically, so it will be 0 if you click on the bottom, 0.5 in the middle, and 1 on the top. 
    When correctly implemented, the cube will be blue when you click in the bottom left, magenta when you click in the bottom right, white in the top right, and cyan in the top left. 
*/
var colorIndex = 0;

function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
    var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    var indices = [a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i) {
        positions.push(vertices[indices[i]]);
    }
}

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    var gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    //add vertices to positions to create a cube
    cube();

    //setup the canvas
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);;

    //setup the shader program
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //vertex array attribute buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    //rotation of the cube
    var theta = vec3(0, 0, 0);

    //send the (initially no rotation) theta to the shader
    var thetaLoc = gl.getUniformLocation(program, "uTheta");
    gl.uniform3fv(thetaLoc, theta);

    var colorLoc = gl.getUniformLocation(program, "uColor"); // To attach the uColor uniform to a JS variable
    var calcRGVal; // Variable to hold the calculated mouse color vertices

    // This is where you should add the event listeners
    canvas.addEventListener("mousedown", function(event){
        // Manipulating the mouse offsets to be in the form of a color vector
        calcRGVal = vec2(event.offsetX/canvas.width,
            (canvas.height-event.offsetY)/canvas.height);
        // Writing the calculated vector values back into the colorLoc -> uColor variable
        gl.uniform4f(colorLoc, calcRGVal[0], calcRGVal[1], 1, 1);
    });

    window.addEventListener("keydown", function(event){
        // If space detected set color to white
        if(event.code == "Space"){
            gl.uniform4f(colorLoc, 0, 0, 0, 0);
        }
        // else set color to random
        else{
            gl.uniform4f(colorLoc, Math.random(), Math.random(), Math.random(), Math.random());
        }
    });


    function render() {

        //change the theta somewhat randomly
        theta[0] += 0.221;
        theta[1] += 0.121;
        theta[2] += 0.3;

        //send the updated theta to the shader
        gl.uniform3fv(thetaLoc, theta);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, positions.length);

        requestAnimationFrame(render);
    }
    render();
}