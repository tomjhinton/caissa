varying float vTime;
varying vec2 vUv;

void coswarp(inout vec3 trip, float warpsScale ){

  trip.xyz += warpsScale * .1 * cos(3. * trip.yzx + (vTime * .5));
  trip.xyz += warpsScale * .05 * sin(11. * trip.yzx + (vTime * .5));
  trip.xyz += warpsScale * .025 * cos(17. * trip.yzx + (vTime * .5));
  trip.xyz += warpsScale * .0125 * sin(21. * trip.yzx + (vTime * .5));
}

void main (){
  float alpha = 1.;
  vec3 color = vec3(vUv.x, vUv.y, 1.);
  coswarp(color, 4.);

  gl_FragColor = vec4(color, alpha);
}
