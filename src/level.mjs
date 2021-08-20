/**
 * Level module.
 * Load levels easily
 */

import * as THREE from './three.module.js';
import * as MESHER from 'lib/voxel-mesh/voxelMesh.mjs';
import * as CUTIMG from 'lib/cutImg/cutImg.mjs';

/**
 * A level which consists of a map, objects in it and functions
 * that must be updated
 */
export class Level {
	/**
	 * Construct a level from JSON data (provided by the tiled editor)
	 * @param {Object} json
	 */
	constructor(json) {
		this.map;
		this.entities;
		this.updates;
	}
	/**
	 * Load a level from a url
	 * @param {String} url
	 */
	async load(url){
		return Level(await fetch(url).json())
	}
}

/**
 * A three.js object which represents the map of a level
 */
class Map {
	/**
	 * Create a Map
	 * @param obj - a three.js object
	 */
	constructor(obj){
		this = obj;
	}
	/**
	 * @param {Number[][][]} vox - A array of voxel-ids
	 * @param materials - An array for each different voxel-id
	 */
	fromVox(vox, materials){
		let group = new THREE.Group();
		for(let i=0; i<=materials.length; i++){
			let geometry = MESHER.multiMaterial(MESHER.voxToGeometry(
				vox.map(x => x.map(y => y.map(z => z==i+1)))
			))
			group.push( new THREE.Mesh(geometry, materials[i]) )
		}
		return group;
	}
}

/**
 * A set of tiles used to build a map from voxels
 */
class Tileset {
	/**
	 * Create a new tileset
	 * @param {Image} img - tileset
	 * @param {Number} dx - spacing between tiles horizontally
	 * @param {Number} dy - spacing between tiles vertically
	 */
	constructor(img, dx, dy){
		this.tileset = img;
		this.dx = dx;
		this.dy = dy;
	}
	/**
	 * Load a tileset from a url
	 */
	async load(url, dx, dy){
		let img = new Image();
		img.src = url;
		await img.decode();
		return new Tileset(img, dx, dy);
	}
	/**
	 * Get the tile corresponding to a specific id
	 * 0 | 1 | 2
	 * 3 | 4 | 5
	 * 6 | 7 | 8
	 */
	getTile(id){
		let x = (id%(this.tileset.width/this.dx))*this.dx
		let y = Math.floor(id/(this.tileset.width/this.dx))*this.dy
		return CUTIMG.cut(this.tileset,x,y,this.dx,this.dy)
	}
}
