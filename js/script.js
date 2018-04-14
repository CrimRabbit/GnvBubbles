/***************************************
  THREE.JS APP
  https://threejs.org/docs/index.html#manual/introduction/Creating-a-scene
 ***************************************/

/*** 1. INIT: THE NECESSARY COMPONENTS ***/
let mouse = new THREE.Vector2();
let controls;
let camera, scene, renderer, light;

let listOfBubbles = [];

// let geometry;
// let bubble;
// let mesh2;
// let meshGeometry;
// let verticeToFaces;

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

  /*** 2. ADD AN ELEMENT: THE bubble ***/
  // Create the element
  listOfBubbles.push(createBubble(30,200,100,textureCube));
  // let geometry = new THREE.SphereGeometry(30, 200, 100);
  // geometry.rotateX(Math.PI /2);
  // let innerGeometry = new THREE.SphereGeometry(29, 200, 100);
  // innerGeometry.rotateX(Math.PI /2);
  // let transparentMaterial = new THREE.MeshBasicMaterial({ transparent: true });
  // transparentMaterial.opacity = 0;

  // let uniforms = {
  //   envMap: textureCube
  // };

  // let shader = BubbleShader;
  // let bubbleMaterial = new THREE.ShaderMaterial({
  //   uniforms: uniforms,
  //   vertexShader: shader.vertexShader,
  //   fragmentShader: shader.fragmentShader,
  //   side: THREE.DoubleSide,
  //   transparent: true
  // });

  // bubble = new THREE.Mesh(geometry, [bubbleMaterial, transparentMaterial]);
  // //Compute normals so that particles know where to move
  // bubble.geometry.computeFaceNormals();

  // // create a new material for the particle mesh
  // let particleMaterial = new THREE.PointsMaterial({ size: 0.1, color: "red" });

  // let meshGeometry = new THREE.Geometry();

  // //initialising meshGeometry so that the particles know where to move
  // let sphereVerts = innerGeometry.vertices;
  // let sphereFaces = innerGeometry.faces;

  // let checkVert = [];
  // sphereFaces.forEach(f => {
  //   let vertA = sphereVerts[f.a];
  //   let vertB = sphereVerts[f.b];
  //   let vertC = sphereVerts[f.c];

  //   let normal = f.normal.multiplyScalar(Math.random() * 0.3);

  //   vertA.v = normal;
  //   vertB.v = normal;
  //   vertC.v = normal;

  //   vertA.move = false;
  //   vertB.move = false;
  //   vertC.move = false;

  //   helperAddVertIfNotExist(checkVert, meshGeometry, vertA, f.a);
  //   helperAddVertIfNotExist(checkVert, meshGeometry, vertB, f.b);
  //   helperAddVertIfNotExist(checkVert, meshGeometry, vertC, f.c);
  // });

  // mesh2 = new THREE.Points(meshGeometry, particleMaterial);
  // mesh2.sortParticles = true;

  // scene.add(mesh2);
  // scene.add(bubble);
  // // console.log("bubble");
  // // console.log(bubble);
  // initFaces(bubble);
  // // console.log("============");
  // // console.log(verticeToFaces);
}

function createBubble(radius, widthSegments, heightSegments, textureCube){
  let geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  geometry.rotateX(Math.PI /2);
  let innerGeometry = new THREE.SphereGeometry(radius-1, widthSegments, heightSegments);
  innerGeometry.rotateX(Math.PI /2);
  let transparentMaterial = new THREE.MeshBasicMaterial({ transparent: true });
  transparentMaterial.opacity = 0;

  let uniforms = {
    envMap: textureCube
  };

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

    vertA.move = false;
    vertB.move = false;
    vertC.move = false;

    helperAddVertIfNotExist(checkVert, meshGeometry, vertA, f.a);
    helperAddVertIfNotExist(checkVert, meshGeometry, vertB, f.b);
    helperAddVertIfNotExist(checkVert, meshGeometry, vertC, f.c);
  });

  let mesh2 = new THREE.Points(meshGeometry, particleMaterial);
  mesh2.sortParticles = true;

  scene.add(mesh2);
  scene.add(bubble);
  // console.log("bubble");
  // console.log(bubble);
  let verticeToFaces = initFaces(bubble);
  // console.log("============");
  // console.log(verticeToFaces);
  console.log(bubble);
  return {uuid:bubble.uuid, bubble:bubble, mesh2:mesh2, verticeToFaces:verticeToFaces};
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
 * @parameter geometry is the geometry the vertex would be added to
 * @parameter vertex is the vertex to be added
 * @@parameter vertexIndex is the index number to be checked inside of arr (checkVert)
 */
function helperAddVertIfNotExist(arr, geometry, vertex, vertexIndex) {
  if (!arr.includes(vertexIndex)) {
    geometry.vertices.push(vertex);
    arr.push(vertexIndex);
  }
}

/*** 3. RENDERING THE SCENE: RENDERER LOOP ***/
function animate() {
  listOfBubbles[0].mesh2.geometry.verticesNeedUpdate = true;
  listOfBubbles[0].bubble.geometry.verticesNeedUpdate = true;

  // Moving the particles
  let verts = listOfBubbles[0].mesh2.geometry.vertices;
  verts.forEach(v => {
    if (v.move) {
      v.addScaledVector(v.v.add(new THREE.Vector3(0.0,Math.random()*-0.05,0.0)), 1);
    }
  });

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

function propagatePop(object,mesh2, verticeToFaces, faceIndices, remainingCount) {
  console.log(remainingCount + " vertices are visible");

  if (remainingCount <= 0){
    scene.remove(object);
  }

  if (remainingCount > 0) {
    setTimeout(() => propagatePop(object,mesh2, verticeToFaces, nextFaces, remainingCount), 10);
  }

  let nextFaces = [];

  for (let faceIdx of faceIndices) {
    let face = object.geometry.faces[faceIdx];
    face.materialIndex = 1;

    let connectedVertices = [face.a, face.b, face.c].filter(
      v => object.geometry.vertices[v].visible 
    );

    let meshVerts = mesh2.geometry.vertices;
    for (let v of connectedVertices) {
      object.geometry.vertices[v].visible = false;
      meshVerts[v].move = true;
      remainingCount -= 1;
    }

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
}

function onMouseDown(event) {
  event.preventDefault();
  //console.log(event)

  //gCamera.updateMatrixWorld();
  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  let raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  let intersects = raycaster.intersectObjects(scene.children);
  console.log(intersects[0]);
  if (intersects.length > 0) {
    let bubble,mesh2,verticeToFaces;
    for(let bubb of listOfBubbles){
      if(bubb.uuid === intersects[0].object.uuid){
        console.log("match!");
        console.log(bubb);
        bubble = bubb.bubble;
        mesh2 = bubb.mesh2;
        verticeToFaces = bubb.verticeToFaces;
      }
    }
    // let bubble = intersects[0].object;
    // let mesh2 = intersects[1].object;
    bubble.lookAt(intersects[0].point)
    mesh2.lookAt(intersects[0].point)
    let nextFaces = [0];//[intersects[0].faceIndex];
    vertexCount = bubble.geometry.vertices.length;
    console.log("there are " + vertexCount + " vertices");
    for (let i = 0; i < vertexCount; i++) {
      bubble.geometry.vertices[i].visible = true;
    }

    nextFaces = propagatePop(bubble,mesh2, verticeToFaces,nextFaces, vertexCount);
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

document.addEventListener("mousedown", onMouseDown, false);
