/***************************************
  THREE.JS APP
  https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene
 ***************************************/


/*** 1. INIT: THE NECESSARY COMPONENTS ***/
var mouse = new THREE.Vector2();
var lmbDown = false;

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);

// Orbit controls
var controls = new THREE.OrbitControls( camera );

// Light
var light = new THREE.PointLight(0xFFFF00);
light.position.set(10, 0, 100);
scene.add(light);

// Renderer
const renderer = new THREE.WebGLRenderer();
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
<<<<<<< HEAD
let geometry = new THREE.SphereGeometry(30, 32, 16);
// let material = new THREE.MeshLambertMaterial({color: 0xfd59d7, wireframe : false});

let material = new THREE.MeshBasicMaterial({color: 0xffffff, envMap: textureCube, opacity: 0.6, transparent: true});
let material2 = new THREE.MeshBasicMaterial({color: 0xff0000, envMap: textureCube, opacity: 0.6, transparent: true});

let cube = new THREE.Mesh(geometry, [material, material2]);
scene.add(cube);
console.log("Cube");
console.log(cube);
for(let i =0;i < cube.geometry.faces.length;i++ ){
  cube.geometry.faces[i].materialIndex = i%2;
}

cube.geometry.vertices[0].y += 30;
cube.geometry.verticesNeedUpdate = true;

console.log(cube.geometry);
//console.log(cube.geometry.vertices[0]);


/*** 3. RENDERING THE SCENE: RENDERER LOOP ***/
function animate(){
  
  // played 60 fps (60 rendering per second)
  requestAnimationFrame(animate);
  
  // animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  
  camera.updateProjectionMatrix();
  
  // render the code above at every frame
  renderer.render(scene, camera);
}
animate();



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


function onMouseDown(event){
        event.preventDefault();
        //console.log(event)
        // Check left button
        if (event.button == 0) {
          lmbDown = true;
        }
        
        //gCamera.updateMatrixWorld();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        var raycaster = new THREE.Raycaster();        
        raycaster.setFromCamera( mouse, camera );

        var intersects = raycaster.intersectObjects( scene.children );
        if(intersects.length > 0){
          console.log(intersects[0]);
          //console.log(intersects[0].object.geometry);
          let faceIndex = intersects[0].faceIndex;

          if(faceIndex == 0 || faceIndex % 2 == 0){
            //console.log(intersects[0].object.geometry.faces[faceIndex].color)
            //intersects[0].object.material.color.setHex( 0x33bbcc);
            //intersects[0].object.geometry.faces.splice(faceIndex,1);
            if(intersects[0].object.material[faceIndex].opacity == 0){
              intersects[0].object.material[faceIndex].opacity = 1;
            }else{
              intersects[0].object.material[faceIndex].opacity = 0;
            }
            //console.log(intersects[0].object.geometry.faces[faceIndex].color)
          }else {
            //intersects[0].object.material[faceIndex].opacity = 1;
            console.log("miss")
            // let deadFaces = [intersects[0].object.material[faceIndex].a,
            //                  intersects[0].object.material[faceIndex].b,
            //                  intersects[0].object.material[faceIndex].c];
            // for(let i = 0;i < )
            //intersects[0].object.material.color.setHex( 0xD1B3B3);
        }
    }
}

function onMouseUp( event ) {
  event.preventDefault();
  
  if (event.button == 0) {
    lmbDown = false;
  }
}

document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mouseup', onMouseUp, false);