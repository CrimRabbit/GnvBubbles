/***************************************
  THREE.JS APP
  https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene
 ***************************************/


/*** 1. INIT: THE NECESSARY COMPONENTS ***/
console.log('hello');
var camera, scene, renderer;
var light;
var geometry, material;
var cube;
var INTERSECTED;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

init();
animate();

function init(){
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 100);

  // Light
  light = new THREE.PointLight(0xFFFF00);
  light.position.set(10, 0, 100);
  scene.add(light);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(  window.innerWidth, window.innerHeight );
  // Insert canvas element
  document.body.appendChild(renderer.domElement);


  var path = "textures/park/";
  var format = '.jpg';
  var urls = [
      path + 'posx' + format, path + 'negx' + format,
      path + 'posy' + format, path + 'negy' + format,
      path + 'posz' + format, path + 'negz' + format
    ];

  var textureCube = new THREE.CubeTextureLoader().load( urls );
  textureCube.format = THREE.RGBFormat;

  scene.background = textureCube;

  /*** 2. ADD AN ELEMENT: THE CUBE ***/
  // Create the element
  geometry = new THREE.SphereGeometry(30, 10, 10);
  material = new THREE.MeshLambertMaterial({color: 0xfd59d7, wireframe : false});
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}

// console.log(cube);
// console.log(cube.geometry.vertices[0]);
// cube.geometry.vertices[0].y += 30;
// cube.geometry.verticesNeedUpdate = true;
// console.log(cube.geometry);
// console.log(cube.geometry.vertices[0]);




/*** 3. RENDERING THE SCENE: RENDERER LOOP ***/
function animate(){

  // played 60 fps (60 rendering per second)
  requestAnimationFrame(animate);

  // animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;


	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children );


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

// DAT.GUI CONTROLS
let gui = new dat.GUI();

// FOW
let fovGui = gui.addFolder("Field Of view");
fovGui.add(camera, 'fov')
fovGui.open();

// Camera
let cameraGui = gui.addFolder("Camera position");
cameraGui.add(camera.position, 'x');
cameraGui.add(camera.position, 'y');
cameraGui.add(camera.position, 'z');
cameraGui.open();

// Light
let lightGui = gui.addFolder("Light position");
lightGui.add(light.position, 'x');
lightGui.add(light.position, 'y');
lightGui.add(light.position, 'z');
lightGui.open();
