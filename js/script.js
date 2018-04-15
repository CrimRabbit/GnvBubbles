/***************************************
  THREE.JS APP
  https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene
 ***************************************/

/*** 1. INIT: THE NECESSARY COMPONENTS ***/
let mouse = new THREE.Vector2();
let controls;
let camera, scene, renderer, light;

let bubblesList = [];

init();
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
  camera.position.set(0, 0, 100);

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
  let path = "textures/park/";
  let format = ".jpg";
  let urls = [
    path + "posx" + format,
    path + "negx" + format,
    path + "posy" + format,
    path + "negy" + format,
    path + "posz" + format,
    path + "negz" + format
  ];
  let textureCube = new THREE.CubeTextureLoader().load(urls);
  textureCube.format = THREE.RGBFormat;
  scene.background = textureCube;

  bubblesList.push(createBubble(30,200,100,0,100,0,textureCube));
  bubblesList.push(createBubble(30,200,100,100,0,0,textureCube));
}

function createBubble(radius, widthSegments, heightSegments, x,y,z, textureCube){
  let geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  geometry.rotateX(Math.PI /2);
  let innerGeometry = new THREE.SphereGeometry(radius-1, widthSegments, heightSegments);
  innerGeometry.rotateX(Math.PI /2);
  let transparentMaterial = new THREE.MeshBasicMaterial({ transparent: true });
  transparentMaterial.opacity = 0;

  let uniforms = {
    envMap: textureCube
  };

      // point cloud material
  let shaderMaterial = new THREE.ShaderMaterial( {

      uniforms:       uniforms,
      vertexShader:   TransparentShader.vertexShader,
      fragmentShader: TransparentShader.fragmentShader,
      transparent:    true

  });
  let shader = BubbleShader;
  let bubbleMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    side: THREE.DoubleSide,
    transparent: true
  });

  let bubble = new THREE.Mesh(geometry, [bubbleMaterial, transparentMaterial]);
  //Compute normals so that particles know where to move
  bubble.geometry.computeFaceNormals();

  // create a new material for the particle mesh
  let particleMaterial = new THREE.PointsMaterial({ size: 0.1, color: "red" });

  let meshGeometry = new THREE.Geometry();

  //initialising meshGeometry so that the particles know where to move
  let sphereVerts = innerGeometry.vertices;
  let sphereFaces = innerGeometry.faces;

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

  scene.add(particleMesh);
  scene.add(bubble);

  bubble.position.set(x,y,z);
  particleMesh.position.set(x,y,z);

  let verticeToFaces = initFaces(bubble);

  bubble.particleMesh = particleMesh;
  bubble.verticeToFaces = verticeToFaces;
  return bubble;
}

function initFaces(bubble) {
  let verticeToFaces = Array.from({ length: bubble.geometry.vertices.length }).map(
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
  return verticeToFaces;
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

/*** 3. RENDERING THE SCENE: RENDERER LOOP ***/
function animate() {
  for (let i = 0; i < bubblesList.length; i++){
    bubblesList[i].particleMesh.geometry.verticesNeedUpdate = true;
    bubblesList[i].geometry.verticesNeedUpdate = true;

    // Moving the particles
    let verts = bubblesList[i].particleMesh.geometry.vertices;
    verts.forEach(v => {
      if (v.move) {
        v.addScaledVector(v.v.add(new THREE.Vector3(0.0,Math.random()*-0.05,0.0)), 1);
      }
    });
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

function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("mousemove", onMouseMove, false);

function sleep(ms) {
  //
  return new Promise(resolve => setTimeout(resolve, ms));
}

function propagatePop(object, faceIndices, remainingCount) {
  console.log(remainingCount + " vertices are visible");



  let nextFaces = [];

  // make faceindices transparent
  for (let faceIdx of faceIndices) {
    let face = object.geometry.faces[faceIdx];
    face.materialIndex = 1;

    let connectedVertices = [face.a, face.b, face.c].filter(
      v => object.geometry.vertices[v].visible
    );

    let meshVerts = object.particleMesh.geometry.vertices;
    for (let v of connectedVertices) {
      object.geometry.vertices[v].visible = false;
      meshVerts[v].move = true;
      remainingCount -= 1;
    }

    verticeToFaces = object.verticeToFaces;
    for (let vIdx of connectedVertices) {
      nextFaces = nextFaces.concat(
        verticeToFaces[vIdx].filter(
          f =>
            object.geometry.faces[f].materialIndex === 0 &&
            nextFaces.indexOf(f) == -1
        )
      );
    }
  }
  object.geometry.groupsNeedUpdate = true;

  if (remainingCount > 0) {
    setTimeout(() => propagatePop(object, nextFaces, remainingCount), 100);
    // setTimeout(() => destroyParticle(), 200);
  } else {
    scene.remove(object);
    // scene.remove(particleMesh);
  }
}

function onMouseDown(event) {
  event.preventDefault();
  //console.log(event)

  //gCamera.updateMatrixWorld();
  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  let raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(bubblesList);
  //console.log(intersects[0]);
  if (intersects.length > 0) {
    let bubble,particleMesh,verticeToFaces;
    bubble = bubblesList.filter(b => b.uuid === intersects[0].object.uuid)[0]

    bubble.lookAt(intersects[0].point)
    bubble.particleMesh.lookAt(intersects[0].point)
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
