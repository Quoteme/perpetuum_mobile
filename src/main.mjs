/**
 * Main module of the game
 * Entry point for all further execution
 */

import * as LEVEL from './level.mjs';
import * as THREE from './three.module.js';
import * as MESHER from './voxel-mesh/voxelMesh.mjs'

window.LEVEL = LEVEL;

let camera, scene, renderer;

async function init() {
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 400;
	scene = new THREE.Scene();
	let level = await LEVEL.Level.load("./usr/lvl/garten/garten.json");
	scene.add(level.map.threejs());

	// generate a simple surface in a 4x4x4 cube
	let geometry = MESHER.voxToGeometry(
			new Array(4).fill(0).map( (_,x) =>
				new Array(4).fill(0).map( (_,y) =>
					new Array(4).fill(0).map( (_,z) => y==x-z ) ))
		)
	geometry.scale(5,5,5);
	let material = new THREE.MeshBasicMaterial({
		color: 0xffffff
	})
	let mesh = new THREE.Mesh( geometry, material );
	scene.add(mesh)
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize );
	animate();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

init();
