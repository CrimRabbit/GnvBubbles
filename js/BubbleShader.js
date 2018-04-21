BubbleShader = {

  vertexShader: `
    uniform float amplitude;
    attribute float displacement;
    varying vec3 vReflection;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPos;

    void main() {
      vec4 worldCoord = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldCoord.xyz;
      vWorldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
      vec3 cameraRay = worldCoord.xyz - cameraPosition;
      vReflection = reflect(cameraRay, vWorldNormal);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,

  fragmentShader: `
    varying vec3 vReflection;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPos;
    uniform samplerCube envMap;
    uniform vec3 priCol;
    uniform vec3 secCol;
    uniform vec3 priLightPos;
    uniform vec3 secLightPos;

    void main() {
      float c = dot(normalize(cameraPosition - vWorldPos), vWorldNormal);
      vec4 reflect = textureCube(envMap, vReflection);

      float d = pow(max(0.0, dot(normalize(priLightPos - vWorldPos), vWorldNormal)), 2.0);
      float d2 = max(0.0, dot(normalize(secLightPos - vWorldPos), vWorldNormal));

      vec3 col1 = 3.0*priCol*max(0.0, d*(1.0-c));
      vec3 col2 = 2.0*secCol*max(0.0, d2*(1.0-c));

      gl_FragColor = vec4(col1+col2 + reflect.xyz, 0.3+0.2*length(reflect.xyz));
    }
    `

}