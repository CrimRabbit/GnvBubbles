BubbleShader = {

  vertexShader: `
    uniform float amplitude;
    attribute float displacement;
    varying vec3 vReflection;
    varying vec3 vInternalReflection;
    varying vec3 vNormal;
    varying vec3 vWorldPos;

    void main() {
      vNormal = normal;
      vec4 worldCoord = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldCoord.xyz;
      vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
      vec3 cameraRay = worldCoord.xyz - cameraPosition;
      vReflection = reflect(cameraRay, worldNormal);
      // vInternalReflection = vec3(vReflection.x, -vReflection.y, vReflection.z);
      // vInternalReflection = reflect(vReflection, cameraRay);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,

  fragmentShader: `
    varying vec3 vReflection;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    uniform samplerCube envMap;

    void main() {
      float c = dot(normalize(cameraPosition - vWorldPos), vNormal);
      vec4 reflect = textureCube(envMap, vReflection);

      // vec3 diffusePurple = (0.25 - pow(c-0.5, 2.0)) * vec3(1.0, 0.0, 1.0);
      // vec3 diffuseGreen = (0.25 - pow(c-0.5, 2.0)) * vec3(0.0, 1.0, 0.0);
      // vec3 diffuseGreen = 0.5*(0.36 - pow(1.5*c-0.5, 2.0)) * vec3(0.0, 1.0, 0.0);
      // gl_FragColor = vec4(reflect.xyz + diffuse, 0.5);

      vec3 diffusePurple;
      vec3 diffuseBlue;
      vec3 diffuseGreen;
      if (c >= 0.0 && c < 0.6)
        diffusePurple = 0.3 * sqrt(0.3 - abs(c-0.3)) * vec3(1.0, 0.0, 1.0);
      if (c >= 0.3 && c < 0.6)
        diffuseBlue = (0.2 - abs(c-0.4)) * vec3(0.0, 0.0, 1.0);
      if (c >= 0.4 && c < 0.8)
        // diffuseGreen = (0.2 - abs(c-0.55)) * vec3(0.0, 1.0, 0.0);
        diffuseGreen = 0.1*(1.0 + cos(16.0*(c-0.6))) * vec3(0.0, 1.0, 0.0);

      gl_FragColor = vec4(diffusePurple + diffuseBlue + diffuseGreen + reflect.xyz, 0.6);
      // gl_FragColor = vec4(diffusePurple + diffuseBlue + diffuseGreen, 1.0);
      // gl_FragColor = vec4(diffuseGreen, 1.0);
    }
    `

}