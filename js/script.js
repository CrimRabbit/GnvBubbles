/***************************************
  THREE.JS APP
  https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene
 ***************************************/

/*** 1. INIT: THE NECESSARY COMPONENTS ***/
let mouse = new THREE.Vector2();
let controls;
let camera, scene, renderer, light;

let bubblesList = [];
let verticeToFaces = null;
let textureCube;
let globalWind = new THREE.Vector3(0.0,0.0,0.0);
let spawningCount = 0;
let sprite;

init();
let timeStep = 0;
animate();

function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-20, 0, 0);

  // Light
  light = new THREE.PointLight(0xffff00);
  light.position.set(10, 0, 100);
  scene.add(light);

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Insert canvas element
  document.body.appendChild(renderer.domElement);

  // Controls
  controls = new THREE.OrbitControls(camera);

  //Background
  let path = "textures/Lycksele/";
  let format = ".jpg";
  let urls = [
    path + "posx" + format,
    path + "negx" + format,
    path + "posy" + format,
    path + "negy" + format,
    path + "posz" + format,
    path + "negz" + format
  ];
  textureCube = new THREE.CubeTextureLoader().load(urls);
  textureCube.format = THREE.RGBFormat;
  scene.background = textureCube;

	sprite = new THREE.TextureLoader().load( "../textures/sprites/disc.png" );

  for (let i=0; i<15; i++) {
    setTimeout(() => bubblesList.push(createBubble(10,50,25,0,-10,0,textureCube)), i*700)
  }
}

function createBubble(radius, widthSegments, heightSegments, x,y,z, textureCube){
  let geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  geometry.rotateX(Math.PI /2);
  let innerGeometry = new THREE.SphereGeometry(radius-0.1, widthSegments, heightSegments);
  innerGeometry.rotateX(Math.PI /2);
  let transparentMaterial = new THREE.MeshBasicMaterial({ transparent: true });
  transparentMaterial.opacity = 0;

  let rand = Math.random();
  let col = rand < 0.4 ? 0xff0099 : (rand < 0.7 ? 0x00ffcc : 0x999900);
  let col2 = rand < 0.4 ? 0xcccc00 : (rand < 0.7 ? 0x660033 : 0x996600);

  let uniforms = {
    envMap: textureCube,
    priCol: { value: new THREE.Color( col ) },
    secCol: { value: new THREE.Color( col2 ) },
    priLightDir: { value: new THREE.Vector3(Math.random()*200-100, Math.random()*200-100, Math.random()*200-100) },
    secLightDir: { value: new THREE.Vector3(Math.random()*1000-500, Math.random()*1000-500, Math.random()*1000-500) },
  };


  let bubbleMaterialProperties = {
    uniforms: uniforms,
    vertexShader: BubbleShader.vertexShader,
    fragmentShader: BubbleShader.fragmentShader,
    transparent: true,
  };

  let bubbleMaterial = new THREE.ShaderMaterial({side: THREE.FrontSide, ...bubbleMaterialProperties});
  let bubbleInnerMaterial = new THREE.ShaderMaterial({side: THREE.BackSide, ...bubbleMaterialProperties});

  let bubble = new THREE.Mesh(geometry, [bubbleMaterial, transparentMaterial]);
  bubble.renderOrder = 1;   // make innerMesh render first
  let innerMesh = new THREE.Mesh(innerGeometry, [bubbleInnerMaterial, transparentMaterial]);

  //Compute normals so that particles know where to move
  bubble.geometry.computeFaceNormals();

  bubble.bubbleRandom = Math.random() * (2 - (-2) + (-2));
  let maxInitVelo = 0.5;
  let minInitVelo = -0.5;
  let xMaxInitVelo = 2.0;
  let xMinInitVelo = 0.5;

  bubble.velocity = new THREE.Vector3(
    Math.random() * (xMaxInitVelo - xMinInitVelo) + xMinInitVelo,
    Math.random() * (maxInitVelo - minInitVelo) + minInitVelo,
    Math.random() * (maxInitVelo - minInitVelo) + minInitVelo);

  bubble.add(innerMesh)
  scene.add(bubble);

  bubble.position.set(x,y,z);

  if (!verticeToFaces)
    initFaces(bubble);

  bubble.innerMesh = innerMesh;
  return bubble;
}

function initFaces(bubble) {
  verticeToFaces = Array.from({ length: bubble.geometry.vertices.length }).map(
    (x, i) => []
  );
  for (
    let faceIndex = 0;
    faceIndex < bubble.geometry.faces.length;
    faceIndex++
  ) {
    let varA = bubble.geometry.faces[faceIndex].a;
    let varB = bubble.geometry.faces[faceIndex].b;
    let varC = bubble.geometry.faces[faceIndex].c;
    verticeToFaces[varA].push(faceIndex);
    verticeToFaces[varB].push(faceIndex);
    verticeToFaces[varC].push(faceIndex);
  }
}
/**
 * @parameter Array arr, array to be added into (checkVert), to check if the vertex index exists
 * @parameter Object3D geometry is the geometry the vertex would be added to
 * @parameter Integer vertex is the vertex to be added
 * @parameter Integer vertexIndex is the index number to be checked inside of arr (checkVert)
 */
function helperAddVertIfNotExist(arr, geometry, vertex, vertexIndex) {
  if (!arr.includes(vertexIndex)) {
    geometry.vertices.push(vertex);
    arr.push(vertexIndex);
  }
}

function animate() {
  timeStep = timeStep+1;

  for (let i = 0; i < bubblesList.length; i++){
    let bubb = bubblesList[i];
    //console.log(bubb);

    bubb.position.x += bubb.velocity.x + bubb.bubbleRandom*globalWind.x;
    bubb.position.y += bubb.velocity.y + bubb.bubbleRandom*globalWind.y + Math.sin(timeStep/100 * bubb.bubbleRandom);
    bubb.position.z += bubb.velocity.z + bubb.bubbleRandom*globalWind.z + Math.sin(timeStep/400 * bubb.bubbleRandom);

    //bubblesList[i].position.x += Math.random()*globalWind[0] + 0.5 + 0.2*Math.random();
    //bubblesList[i].position.y += Math.random()*globalWind[1] +0.1 + 0.2*(i%4)* Math.sin(timeStep/100+i);
    //bubblesList[i].position.z += Math.random()*globalWind[2] +0.5*Math.sin(timeStep/400+i**2);

    // Moving the particles
    if (bubblesList[i].particleMesh !== undefined){
      bubblesList[i].particleMesh.geometry.verticesNeedUpdate = true;
      let verts = bubblesList[i].particleMesh.geometry.vertices;
        verts.forEach(v => {
          if (v.move) {
            v.addScaledVector(v.v.add(new THREE.Vector3(0.0,Math.random()*-0.05,0.0)), 1);
          }
        });
    }
  }

  // played 60 fps (60 rendering per second)
  requestAnimationFrame(animate);

  // update the picking ray with the camera and mouse position
  // raycaster.setFromCamera( mouse, camera );

  // calculate objects intersecting the picking ray
  // var intersects = raycaster.intersectObjects( scene.children );
  //controls.update();
  camera.updateProjectionMatrix();

  // render the code above at every frame
  renderer.render(scene, camera);
}

function propagatePop(bubble, faceIndices, remainingCount) {
  let prevRemainingCount = remainingCount;
  let nextFaces = [];

  // make faceindices transparent
  for (let faceIdx of faceIndices) {
    let face = bubble.geometry.faces[faceIdx];
    let innerFace = bubble.innerMesh.geometry.faces[faceIdx];

    face.materialIndex = 1;
    innerFace.materialIndex = 1;

    let connectedVertices = [face.a, face.b, face.c].filter(
      v => bubble.geometry.vertices[v].visible
    );

    let meshVerts = bubble.particleMesh.geometry.vertices;
    for (let v of connectedVertices) {
      bubble.geometry.vertices[v].visible = false;
      meshVerts[v].move = true;
      remainingCount -= 1;
    }
    for (let vIdx of connectedVertices) {
      nextFaces = nextFaces.concat(
        verticeToFaces[vIdx].filter(
          f =>
            bubble.geometry.faces[f].materialIndex === 0 &&
            nextFaces.indexOf(f) == -1
        )
      );
    }
  }
  bubble.geometry.groupsNeedUpdate = true;
  bubble.innerMesh.geometry.groupsNeedUpdate = true;
  bubble.innerMesh.geometry.verticesNeedUpdate = true;

  if (remainingCount > 0 && remainingCount != prevRemainingCount) {
    setTimeout(() => propagatePop(bubble, nextFaces, remainingCount), 10);
  } else {
    scene.remove(bubble)
    bubblesList = bubblesList.filter(b => b.uuid != bubble.uuid);
    bubble = null
  }
}

function addParticleMesh(bubble) {
  let radius = bubble.geometry.parameters.radius;
  let widthSegments = bubble.geometry.parameters.widthSegments;
  let heightSegments = bubble.geometry.parameters.heightSegments;

  let particleGeometry = new THREE.SphereGeometry(radius-0.2, widthSegments, heightSegments);

  particleGeometry.rotateX(Math.PI /2);

  // create a new material for the particle mesh
  let particleMaterial = new THREE.PointsMaterial({
    size: 0.2,
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    map: sprite,
  });

  let meshGeometry = new THREE.Geometry();

  //initialising meshGeometry so that the particles know where to move
  let sphereVerts = particleGeometry.vertices;
  let sphereFaces = particleGeometry.faces;

  let checkVert = [];
  sphereFaces.forEach(f => {
    let vertA = sphereVerts[f.a];
    let vertB = sphereVerts[f.b];
    let vertC = sphereVerts[f.c];

    let normal = f.normal.multiplyScalar(Math.random() * 0.3);

    vertA.v = normal;
    vertB.v = normal;
    vertC.v = normal;

    vertA.visible = false;
    vertB.visible = false;
    vertC.visible = false;

    vertA.move = false;
    vertB.move = false;
    vertC.move = false;

    helperAddVertIfNotExist(checkVert, meshGeometry, vertA, f.a);
    helperAddVertIfNotExist(checkVert, meshGeometry, vertB, f.b);
    helperAddVertIfNotExist(checkVert, meshGeometry, vertC, f.c);
  });

  let particleMesh = new THREE.Points(meshGeometry, particleMaterial);
  particleMesh.sortParticles = true;

  bubble.add(particleMesh)
  bubble.particleMesh = particleMesh;
}

function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("mousemove", onMouseMove, false);

function onMouseDown(event) {
  event.preventDefault();

  //gCamera.updateMatrixWorld();
  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  let raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(bubblesList);
  //console.log(intersects[0]);
  if (intersects.length > 0) {
    let bubble = bubblesList.filter(b => b.uuid === intersects[0].object.uuid)[0]
    //add particle mesh only when clicked
    addParticleMesh(bubble);
    bubble.lookAt(intersects[0].point)

    let nextFaces = [0]; //[intersects[0].faceIndex];
    vertexCount = bubble.geometry.vertices.length;
    console.log("there are " + vertexCount + " vertices");
    for (let i = 0; i < vertexCount; i++) {
      bubble.geometry.vertices[i].visible = true;
    }

    nextFaces = propagatePop(bubble, nextFaces, vertexCount);
  } else {
    console.log("miss");
  }
}

document.addEventListener("mousedown", onMouseDown, false);

// function onKeyDown ( event ) {
//   switch( event.keyCode ) {

//   case 32: // space
//       for (let i=0; i<10; i++) {
//         let rad = Math.floor((Math.random() * 10) + 3);
//         setTimeout(() => bubblesList.push(createBubble(rad,50,25,0,-10,0,textureCube)), i*100)
//       }
//     break;

//   case 87: // w
//     globalWind = new THREE.Vector3(4.5,0,0);
//     break;

//   case 65: // a
//     globalWind = new THREE.Vector3(0,0,-4.5);
//     break;

//   case 83: // s
//     globalWind = new THREE.Vector3(-4.5,0,0);
//     break;

//   case 68: // d
//     globalWind = new THREE.Vector3(0,0,4.5);
//     break;

//   case 88: // x - cancels wind
//     globalWind = new THREE.Vector3(0,0,0);
//     break;
//   }
// }

// document.addEventListener( 'keydown', onKeyDown, false );

function onKeyUp ( event ) {
  switch( event.keyCode ) {
  case 32: // space
      for (let i=0; i<10; i++) {
        let rad = Math.floor((Math.random() * 10) + 3);
        setTimeout(() => bubblesList.push(createBubble(rad,50,25,0,-10,0,textureCube)), i*100)
      }
    break;

  case 87: // w
    globalWind = new THREE.Vector3(4.5,0,0);
    break;

  case 65: // a
    globalWind = new THREE.Vector3(0,0,-4.5);
    break;

  case 83: // s
    globalWind = new THREE.Vector3(-4.5,0,0);
    break;

  case 68: // d
    globalWind = new THREE.Vector3(0,0,4.5);
    break;

  case 88: // x - cancels wind
    globalWind = new THREE.Vector3(0,0,0);
    break;
  }
}

document.addEventListener( 'keyup', onKeyUp, false );
