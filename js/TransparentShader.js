TransparentShader = {

  vertexShader: `
    attribute float alpha;

    varying float vAlpha;

    void main() {

        vAlpha = alpha;

        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

        gl_PointSize = 8.0;

        gl_Position = projectionMatrix * mvPosition;


    }`,

  fragmentShader: `
  uniform vec3 color;

  varying float vAlpha;

  void main() {

      gl_FragColor = vec4( color, vAlpha );

  }
    `

}
