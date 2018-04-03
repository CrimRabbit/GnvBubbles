console.log("main.js");

let container;
let scene, camera, renderer;
let moveForwardReq, moveBackwardReq, moveLeftReq, moveRightReq

init();
animate();

function init() {
  console.log("init");
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
  //camera.position.y = 1.5;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  camera.position.z = 5;

  container.appendChild(renderer.domElement);
}

function animate() {
  console.log("animate");
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
