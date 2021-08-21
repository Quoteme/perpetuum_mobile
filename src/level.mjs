/**
 * Level module.
 * Load levels easily
 */

import * as THREE from './three.module.js';
import * as MESHER from './voxel-mesh/voxelMesh.mjs';

/**
 * A level which consists of a map, objects in it and functions
 * that must be updated
 */
export class Level {
	/**
	 * Construct a level from JSON data (provided by the tiled editor)
	 * @param {Object} json
	 */
	constructor(map, entities, updates) {
		this.map = map;
		this.entities = entities;
		this.updates = updates;
	}
	/**
	 * Load a level from a url
	 * @param {String} url
	 */
	static async load(url){
		let json = await fetch(url).then(r => r.json())
		let materials = await Promise.all(json.materials.map(Material.load))
		let map = Map.fromVox(json.voxels, materials);
		let entities = [];
		let updates = [];
		return new Level(map, entities, updates);
	}
}

/**
 * A three.js object which represents the map of a level
 */
class Map {
	/**
	 * Create a Map
	 * @param {Number[][][]} vox - A array of voxel-ids
	 * @param materials - An array for each different voxel-id
	 * @param obj - a three.js object
	 */
	constructor(vox, materials, obj){
		this.vox = vox;
		this.materials = materials;
		this.obj = obj;
	}
	/**
	 * Returns the map as a threejs object
	 */
	threejs(){
		return this.obj;
	}
	/**
	 * Create a new map from given voxel-data and corresponding
	 * materials
	 * @param {Number[][][]} vox - A array of voxel-ids
	 * @param materials - An array for each different voxel-id
	 */
	static fromVox(vox, materials){
		let obj = new THREE.Group();
		// create a mesh from all the voxels of number i in the
		// "vox"-array and bind the "material[i]" to it.
		// (skip voxels whose corresponding material is of type "Empty")
		// then add all these meshes to one main mesh "obj"
		for(let i=0; i<materials.length; i++){
			if (materials[i].type == "Empty") continue;
			let geometry = MESHER.multiMaterial(MESHER.voxToGeometry(
				vox.map(x => x.map(y => y.map(z => z==i+1)))
			))
			console.log(geometry)
			let mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xffffff}))
			console.log(mesh);
			// obj.add()
		}
		return new Map(vox, materials, obj);
	}
}

/**
 * A material for a voxel
 */
class Material {
	/**
	 * Create a new material
	 * @param {String} name
	 * @param {String} type
	 * @param {Texture} Texture
	 */
	constructor(name, type, texture){
		this.name = name;
		this.type = type;
		this.texture = texture;
	}
	/**
	 * Load a material from json data found in a level file
	 */
	static async load(material){
		let name = material.name;
		let type = material.type;
		if(type=="Empty") return new Material(name, type, undefined);
		let texture = await Texture.load(material.texture);
		return new Material(name, type, texture);
	}
}

/**
 * A texture which a material might be based on
 */
class Texture {
	/**
	 * Construct a new texture for voxels
	 * @param {Image} left
	 * @param {Image} right
	 * @param {Image} front
	 * @param {Image} back
	 * @param {Image} top
	 * @param {Image} bottom
	 */
	constructor(left, right, front, back, top, bottom){
		this.left = left;
		this.right = right;
		this.front = front
		this.back = back
		this.top = top
		this.bottom = bottom
	}
	/**
	 * return this texture for usage in three.js
	 * @returns {Object} - threejs compatible texture
	 */
	threejs(){
		return new THREE.CubeTexture([this.left, this.right, this.front, this.back, this.top, this.bottom])
	}
	/**
	 * Load a texture from a json object of the form:
	 * @example
	 * 	"texture": {
	 * 		"left"   : "./grass_side.png",
	 * 		"right"  : "./grass_side.png",
	 * 		"front"  : "./grass_side.png",
	 * 		"back"   : "./grass_side.png",
	 * 		"top"    : "./grass_top.png",
	 * 		"bottom" : "./dirt.png"
	 * }
	 * @param {Object} texture
	 */
	static async load(texture){
		let left = new Image();
		left.src = texture.left;
		let right = new Image();
		right.src = texture.right;
		let front = new Image();
		front.src = texture.front;
		let back = new Image();
		back.src = texture.back;
		let top = new Image();
		top.src = texture.top;
		let bottom = new Image();
		bottom.src = texture.bottom;
		await left.decode();
		await right.decode();
		await front.decode();
		await back.decode();
		await top.decode();
		await bottom.decode();
		return new Texture(left, right, front, back, top, bottom);
	}
}
