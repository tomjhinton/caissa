import './style.scss'
import * as THREE from 'three'

import { gsap } from 'gsap'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import Prism from 'prismjs'

import * as Tone from 'tone'


// let riverSelected = Math.floor(Math.random() * fragArray.length )


// snippet.textContent = fragArray[riverSelected]
const points =[
  {
    position: new THREE.Vector3(4.55, 0.3, -6.6),
    element: document.querySelector('.point-0')
  },
  {
    position: new THREE.Vector3(4.55, -2.3, -6.6),
    element: document.querySelector('.point-1')
  }

]

console.log(Prism)
Prism.highlightAll()
document.onkeydown = checkKey





const synth =  new Tone.FMSynth().toDestination()

let buttonMoving = false




function checkKey(e) {
  e.preventDefault()
  e = e || window.event
  console.log(e)
  if (e.keyCode === 38) {
    // up arrow
    // console.log(riverSelected)
  } else if (e.keyCode === 40) {
    // down arrow
    // console.log(fragArray[riverSelected])
  } else if (e.keyCode === 37) {
    // left arrow
    // scrollLeft()

  } else if (e.keyCode === 39) {
    // right arrow
    // console.log(riverSelected)

    // scrollRight()

  } else if (e.keyCode === 27) {
  // esc
  // console.log(riverSelected)
    modal.style.display = 'none'
  }

}

// var modal = document.getElementById('myModal')
//
// var refresh = document.getElementById('refresh')
//
// refresh.onclick = function(){
//   // scrollRight()
// }
//
// // Get the button that opens the modal
// var btn = document.getElementById('myBtn')
//
// // Get the <span> element that closes the modal
// var span = document.getElementsByClassName('close')[0]
//
// // When the user clicks on the button, open the modal
// btn.onclick = function() {
//   modal.style.display = 'block'
// }
//
// // When the user clicks on <span> (x), close the modal
// span.onclick = function() {
//   modal.style.display = 'none'
// }
//
// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//   if (event.target === modal) {
//     modal.style.display = 'none'
//   }
// }

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()
// scene.background = new THREE.Color( 0xffffff )
const loadingBarElement = document.querySelector('.loading-bar')
const loadingBarText = document.querySelector('.loading-bar-text')
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () =>{
    window.setTimeout(() =>{
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

      loadingBarElement.classList.add('ended')
      loadingBarElement.style.transform = ''

      loadingBarText.classList.add('fade-out')

    }, 500)
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) =>{
    const progressRatio = itemsLoaded / itemsTotal
    loadingBarElement.style.transform = `scaleX(${progressRatio})`

  }
)

const gtlfLoader = new GLTFLoader(loadingManager)

const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
  depthWrite: false,
  uniforms:
    {
      uAlpha: { value: 1 }
    },
  transparent: true,
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
  uniform float uAlpha;
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})

const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)




let sceneGroup, left, right, river, display, mixer, cloud, lightning

const intersectsArr = []
gtlfLoader.load(
  'hartwigSet.glb',
  (gltf) => {
    console.log(gltf)

    if(gltf.animations[0]){
      mixer = new THREE.AnimationMixer(gltf.scene)
    const action = mixer.clipAction(gltf.animations[0])
      const action2 = mixer.clipAction(gltf.animations[1])
        // const action3 = mixer.clipAction(gltf.animations[0])
    // action.play()
    action2.play()
      // action3.play()
  }
    // gltf.scene.scale.set(4.5,4.5,4.5)
    sceneGroup = gltf.scene
    sceneGroup.needsUpdate = true
    // sceneGroup.position.y -= 3
    scene.add(sceneGroup)




    // lightning.material = lightningMaterial
    // cloud.material = cloudMaterial


  }
)


const light = new THREE.AmbientLight( 0x404040 ) // soft white light
scene.add( light )

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.25 )
scene.add( directionalLight )

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>{



  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2 ))



})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 10
camera.position.y = -10
camera.position.z = 15
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2 - 0.1
//controls.enableZoom = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor( 0x000000, 0 )
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

renderer.domElement.addEventListener( 'pointerdown', onClick, false )

function onClick(e) {
  event.preventDefault()
  console.log(e)
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
  console.log(mouse)
  raycaster.setFromCamera( mouse, camera )

  var intersects = raycaster.intersectObjects( intersectsArr, true )

  if ( intersects.length > 0 ) {
    // console.log( 'Intersection:', intersects[0].object.parent.name );
console.log(intersects[0])

  }


}


const clock = new THREE.Clock()

const tick = () =>{
  if ( mixer ){
    mixer.update( clock.getDelta() )
    // console.log(mixer)
  }
  const elapsedTime = clock.getElapsedTime()




  if(sceneGroup){
    // sceneGroup.rotation.y += .001

  }
  if(sceneGroup){
    // sceneGroup.rotation.y += .001
    // cloud.rotation.x += .01
    // river.rotation.y += .01
    // lightning.rotation.z += .01
    for(const point of points){
      const screenPosition = point.position.clone()
      screenPosition.project(camera)
      raycaster.setFromCamera(screenPosition, camera)

      const intersects = raycaster.intersectObjects(scene.children, true)

    }

  }


  // Update controls
  controls.update()






  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
