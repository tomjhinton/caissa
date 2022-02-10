import './style.scss'
import * as THREE from 'three'

import { gsap } from 'gsap'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import Prism from 'prismjs'

import * as Tone from 'tone'

import vertexShader from './shaders/vertex.glsl'

import fragmentShader from './shaders/fragment.glsl'

// let riverSelected = Math.floor(Math.random() * fragArray.length )

let turn = 0

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
//
// console.log(Prism)
// Prism.highlightAll()
// document.onkeydown = checkKey












const canvas = document.querySelector('canvas.webgl')

const turnText = document.getElementById('turn')

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

const selectedMaterial  = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: true,
  uniforms: {
    uTime: { value: 0},
    uResolution: { type: 'v2', value: new THREE.Vector2() }
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide
})



let sceneGroup, left, right, river, display, mixer, cloud, lightning, whiteMat, blackMat



let intersectsArr = []
const squares = []
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


    const a1 = gltf.scene.children.find((child) => {
      return child.name === 'a1'
    })

    blackMat = a1.material

    const b1 = gltf.scene.children.find((child) => {
      return child.name === 'b1'
    })

    whiteMat = b1.material
    gltf.scene.children.filter(x => x.name.length > 2 && x.name !== 'Board').map(x => {
      intersectsArr.push(x)
    })

    gltf.scene.children.filter(x => x.name.length  === 2 ).map(x => {
      squares.push(x)
    })


    // lightning.material = lightningMaterial
    // cloud.material = cloudMaterial
    intersectsArr.map(x => {
      squares.map(y => {

        if(Math.round(x.position.z - y.position.z) ===0 && Math.round(x.position.x - y.position.x) ===0){
          x.square = y.name
        }
      })
    })



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


let selected, previouslySelected, intersectsSquare, seq, seq2

let synthFM, synthM

var freeverb = new Tone.Freeverb(.5, 1000).toMaster();
// freeverb.dampening.value = 1000;
var pingPong = new Tone.PingPongDelay("16n", 0.8).toMaster();
function onClick(e) {


  // console.log(selected)
  event.preventDefault()
  console.log(selected)
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
  // console.log(mouse)
  raycaster.setFromCamera( mouse, camera )

  var intersects = raycaster.intersectObjects( intersectsArr, true )
  let whites = intersectsArr.filter(x => x.name.split('_')[1][0] === 'W')

  let blacks = intersectsArr.filter(x => x.name.split('_')[1][0] === 'B')

  let whitesS =  whites.map(x=>{
    return (
      x = x.square.toUpperCase()

    )
  } ).filter(x=> !x.includes('H'))

  let blackS =  blacks.map(x=>{
    return (
      x = x.square
    )
  } ).filter(x=> !x.includes('h'))

  const bass = new Tone.Synth({
    oscillator : {
      type : "triangle"
    }
  }).toDestination().connect(freeverb, pingPong)

  const saw = new Tone.Synth({
    oscillator : {
      type : "sawtooth"
    }
  }).toDestination().connect(freeverb, pingPong)

  if(seq){
    seq.stop()
    seq2.stop()
  }

    synthFM = new Tone.FMSynth().toDestination()

    synthM = new Tone.MembraneSynth().toDestination()



   seq = new Tone.Pattern((time, note) => {
  // console.log(seq)
  bass.triggerAttackRelease(note, 0.5, time)
  // subdivisions are given as subarrays
  }, whitesS, 'randomOnce').start(0)

   seq2 = new Tone.Pattern((time, note) => {
  saw.triggerAttackRelease(note, 0.1, time)
  // subdivisions are given as subarrays
  }, blackS, 'randomOnce').start(0)

  // seq.iterations  = whitesS.length
  // seq2.iterations  = blackS.length
  console.log(Tone.now())

  Tone.Transport.start(Tone.now())



  //Tone.Transport.scheduleRepeat(repeat, "8n");




//   const seq = new Tone.Part(function(time, note) {
//   synthM.triggerAttackRelease(note.note, .1, time);
// }, blackS).start(0);
//  Tone.Transport.start();


  if ( intersects.length > 0  && turn % 2 === 0 && intersects[0].object.name.split('_')[1][0] === 'W') {
    intersects[0].object.material = selectedMaterial

    previouslySelected = selected

    selected = intersects[0].object


    if(previouslySelected){
      previouslySelected.material = whiteMat
    }
    if(selected && selected === previouslySelected){
      selected = null
    }

    previouslySelected = null



    // console.log( 'Intersection:', intersects[0].object.parent.name );
  }
  if(selected){
   intersectsSquare = raycaster.intersectObjects( squares, true )
}

  if(selected && intersectsSquare[0]  && turn %2 === 0){

    // console.log(selected)
    // console.log(intersectsSquare[0].object.position)

    if(Math.round(selected.position.z - intersectsSquare[0].object.position.z) !==0 || Math.round(selected.position.x - intersectsSquare[0].object.position.x) !==0){
      // console.log(intersectsArr.filter(x => x.name.split('_')[1][0] === 'W').map( y => {
      //   y = y.square
      // }))





      if(!whitesS.includes(intersectsSquare[0].object.name)){
        selected.position.z = intersectsSquare[0].object.position.z
        selected.position.x = intersectsSquare[0].object.position.x
        selected.material = whiteMat
        selected.square = intersectsSquare[0].object.name
        turn++
        selected = null
        blacks.map( x=> {
          if(x.square === intersectsSquare[0].object.name ){
            sceneGroup.remove(x)
            x.geometry.dispose()
            x.material.dispose()
            intersectsArr = intersectsArr.filter(y=> y.name !== x.name)
          }
        })
        turnText.textContent = 'Black To Move'
        gsap.to(camera.position, {
          duration: 3,
      z: camera.rotation.z + 10
      })
      camera.lookAt(scene)
      }
    }
  }

  if ( intersects.length > 0  && turn % 2 !== 0 && intersects[0].object.name.split('_')[1][0] === 'B') {
    intersects[0].object.material = selectedMaterial

    previouslySelected = selected
    selected = intersects[0].object
    previouslySelected.material = blackMat
    previouslySelected = null

  }

  if(selected && intersectsSquare[0]  && turn %2 !== 0){

    console.log(selected.position)
    console.log(intersectsSquare[0].object.position)

      if(Math.round(selected.position.z - intersectsSquare[0].object.position.z) !==0 || Math.round(selected.position.x - intersectsSquare[0].object.position.x) !==0){

        if(!blackS.includes(intersectsSquare[0].object.name)){
          selected.position.z = intersectsSquare[0].object.position.z
          selected.position.x = intersectsSquare[0].object.position.x
          selected.material = blackMat
          selected.square = intersectsSquare[0].object.name
          turn++
          selected = null
          whites.map( x=> {
            if(x.square === intersectsSquare[0].object.name ){
              sceneGroup.remove(x)
              x.geometry.dispose()
              x.material.dispose()
              intersectsArr = intersectsArr.filter(y=> y.name !== x.name)
            }
          })
          turnText.textContent = 'White To Move'
          gsap.to(camera.position, {
            duration: 3,
        z: camera.rotation.z - 10
        })
        camera.lookAt(scene)
        }
  }


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

  selectedMaterial.uniforms.uTime.value = elapsedTime






  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
