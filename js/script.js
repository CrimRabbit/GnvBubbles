/***************************************
  THREE.JS APP
  https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene
 ***************************************/

/*** 1. INIT: THE NECESSARY COMPONENTS ***/
var mouse = new THREE.Vector2();
var lmbDown = false;
var controls;
console.log('hello');
var camera, scene, renderer;
var light;
var geometry, material;
let cube;
var INTERSECTED;
var verticeToFaces;

init();
animate();

function init(){
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 100);

  // Orbit controls
  var controls = new THREE.OrbitControls( camera );

  // Light
  light = new THREE.PointLight(0xFFFF00);
  light.position.set(10, 0, 100);
  scene.add(light);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(  window.innerWidth, window.innerHeight );
  // Insert canvas element
  document.body.appendChild(renderer.domElement);

  // Controls
  controls = new THREE.OrbitControls(camera);

  var path = "textures/park/";
  var format = '.jpg';
  var urls = [
      path + 'posx' + format, path + 'negx' + format,
      path + 'posy' + format, path + 'negy' + format,
      path + 'posz' + format, path + 'negz' + format
    ];

  var textureCube = new THREE.CubeTextureLoader().load( urls );
  //list of vertice to faces, where index is the verticeIndex

  textureCube.format = THREE.RGBFormat;

  scene.background = textureCube;

  /*** 2. ADD AN ELEMENT: THE CUBE ***/
  // Create the element

  // Create the element
  let geometry = new THREE.SphereGeometry(30, 200, 100);
  // let material = new THREE.MeshLambertMaterial({color: 0xfd59d7, wireframe : false});

  // let material = new THREE.MeshBasicMaterial({color: 0x33bbcc, transparent: true});
  // let material2 = new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true});
  let transparentMaterial = new THREE.MeshBasicMaterial({transparent: true});
  transparentMaterial.opacity = 0;

  let uniforms = {
    envMap: textureCube,
  };

  let shader = BubbleShader;
  let bubbleMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });

  cube = new THREE.Mesh(geometry, [bubbleMaterial, transparentMaterial]);

  scene.add(cube);
  console.log("Cube");
  //console.log(cube);

  // cube.geometry.vertices[0].y += 30;
  cube.geometry.verticesNeedUpdate = true;
  cube.geometry.GroupsNeedUpdate = true;

  // console.log(cube.geometry);
  //console.log(cube.geometry.vertices[0]);


  initFaces(cube);


  console.log(cube);
  console.log("============");
  console.log(verticeToFaces);
}

function initFaces(cube){
  verticeToFaces = Array.from({length:cube.geometry.vertices.length}).map((x,i) => []);
  for (let faceIndex=0; faceIndex < cube.geometry.faces.length; faceIndex++ ){

    let varA = cube.geometry.faces[faceIndex].a;
    let varB = cube.geometry.faces[faceIndex].b;
    let varC = cube.geometry.faces[faceIndex].c;
    verticeToFaces[varA].push(faceIndex);
    verticeToFaces[varB].push(faceIndex);
    verticeToFaces[varC].push(faceIndex);
  }
}



/*** 3. RENDERING THE SCENE: RENDERER LOOP ***/
function animate(){

  // played 60 fps (60 rendering per second)
  requestAnimationFrame(animate);

  // animation
  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;


	// update the picking ray with the camera and mouse position
	// raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	// var intersects = raycaster.intersectObjects( scene.children );
  //controls.update();
  camera.updateProjectionMatrix();

  // render the code above at every frame
  renderer.render(scene, camera);
}


function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


window.addEventListener( 'mousemove', onMouseMove, false );

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function propagatePop(object, faceIndices, remainingCount) {
  console.log(remainingCount + ' vertices are visible')

  if (remainingCount > 0) {
    setTimeout(() => propagatePop(object, nextFaces, remainingCount), 100)
  }

  let nextFaces = []

  for (let faceIdx of faceIndices) {

    let face = object.geometry.faces[faceIdx]
    face.materialIndex = 1

    let connectedVertices = [face.a, face.b, face.c].filter((v) => object.geometry.vertices[v].visible);

    for (let v of connectedVertices) {
      object.geometry.vertices[v].visible = false;
      remainingCount -= 1;
    }

    for (let vIdx of connectedVertices) {
      nextFaces = nextFaces.concat(verticeToFaces[vIdx].filter((f) =>
        object.geometry.faces[f].materialIndex === 0 && nextFaces.indexOf(f) == -1))
    }

  }
  object.geometry.groupsNeedUpdate = true
}

function onMouseDown(event){
  event.preventDefault();
  //console.log(event)
  // Check left button
  if (event.button === 0) {
    lmbDown = true;
  }

  //gCamera.updateMatrixWorld();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObjects( scene.children );
  if(intersects.length > 0){

    let nextFaces = [intersects[0].faceIndex]
    vertexCount = cube.geometry.vertices.length
    console.log('there are '+vertexCount+' vertices')
    for (let i=0; i<vertexCount; i++) {
      cube.geometry.vertices[i].visible = true
    }

    nextFaces = propagatePop(cube, nextFaces, vertexCount)

  } else {
    //intersects[0].object.material[faceIndex].opacity = 1;
    console.log("miss");
    // let deadFaces = [intersects[0].object.material[faceIndex].a,
    //                  intersects[0].object.material[faceIndex].b,
    //                  intersects[0].object.material[faceIndex].c];
    // for(let i = 0;i < )
    //intersects[0].object.material.color.setHex( 0xD1B3B3);
  }
}

function onMouseUp( event ) {
  event.preventDefault();

  if (event.button === 0) {
    lmbDown = false;
  }
}

document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mouseup', onMouseUp, false);
