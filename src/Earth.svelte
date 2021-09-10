<script>
	import * as THREE from "three";
	import { OrbitControls } from "./orbit-controls";
	import { TIMELINE } from './timeline';

	let renderer = new THREE.WebGLRenderer();
	let scene = new THREE.Scene();
	let aspect = window.innerWidth / window.innerHeight;
	let camera = new THREE.PerspectiveCamera(35, aspect, 0.1, 1500);
	let cameraAutoRotation = false;

	// Lights
	const light = new THREE.AmbientLight(0xffffff); // soft white light

	// Planet Proto
	let planetProto = {
		sphere: function (size) {
			let sphere = new THREE.SphereGeometry(size, 32, 32);

			return sphere;
		},
		material: function (options) {
			let material = new THREE.MeshPhongMaterial();
			if (options) {
				for (var property in options) {
					material[property] = options[property];
				}
			}

			return material;
		},
		glowMaterial: function (intensity, fade, color) {
			// Custom glow shader from https://github.com/stemkoski/stemkoski.github.com/tree/master/Three.js
			let glowMaterial = new THREE.ShaderMaterial({
				uniforms: {
					c: {
						type: "f",
						value: intensity,
					},
					p: {
						type: "f",
						value: fade,
					},
					glowColor: {
						type: "c",
						value: new THREE.Color(color),
					},
					viewVector: {
						type: "v3",
						value: camera.position,
					},
				},
				vertexShader: `
					uniform vec3 viewVector;
					uniform float c;
					uniform float p;
					varying float intensity;
					void main() {
					vec3 vNormal = normalize( normalMatrix * normal );
					vec3 vNormel = normalize( normalMatrix * viewVector );
					intensity = pow( c - dot(vNormal, vNormel), p );
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
					}`,
				fragmentShader: `
					uniform vec3 glowColor;
					varying float intensity;
					void main() 
					{
					vec3 glow = glowColor * intensity;
					gl_FragColor = vec4( glow, 1.0 );
					}`,
				side: THREE.BackSide,
				blending: THREE.AdditiveBlending,
				transparent: true,
			});

			return glowMaterial;
		},
		texture: (material, property, uri) => {
			let textureLoader = new THREE.TextureLoader();
			textureLoader.crossOrigin = true;
			textureLoader.load(uri, (texture) => {
				material[property] = texture;
				material.needsUpdate = true;
			});
		},
	};

	function createPlanet(options) {
		// Create the planet's Surface
		let surfaceGeometry = planetProto.sphere(options.surface.size);
		let surfaceMaterial = planetProto.material(options.surface.material);
		let surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

		// Nest the planet's Surface and Atmosphere into a planet object
		let planet = new THREE.Object3D();
		surface.name = "surface";
		planet.add(surface);

		// Load the Surface's textures
		for (let textureProperty in options.surface.textures) {
			planetProto.texture(
				surfaceMaterial,
				textureProperty,
				options.surface.textures[textureProperty]
			);
		}

		return planet;
	}

	// Main render function
	function render() {
		earth.getObjectByName("surface").rotation.y += (1 / 32) * 0.01;
		if (cameraAutoRotation) {
			// cameraRotation += cameraRotationSpeed;
			// camera.position.y = 0;
			// camera.position.x = 2 * Math.sin(cameraRotation);
			// camera.position.z = 2 * Math.cos(cameraRotation);
			// camera.lookAt(earth.position);
		}
		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}

	let earth = createPlanet({
		surface: {
			size: 0.5,
			material: {
				bumpScale: 0.05,
				specular: new THREE.Color("grey"),
				shininess: 10,
			},
			textures: {
				map: "map.png",
			},
		},
	});

	// Marker Proto
	let markerProto = {
		latLongToVector3: function latLongToVector3(
			latitude,
			longitude,
			radius,
			height
		) {
			var phi = (latitude * Math.PI) / 180;
			var theta = ((longitude - 180) * Math.PI) / 180;

			var x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
			var y = (radius + height) * Math.sin(phi);
			var z = (radius + height) * Math.cos(phi) * Math.sin(theta);

			return new THREE.Vector3(x, y, z);
		},
		marker: function marker(size, color, vector3Position) {
			let markerGeometry = new THREE.SphereGeometry(size);
			let markerMaterial = new THREE.MeshLambertMaterial({
				color: color,
			});
			let markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
			markerMesh.position.copy(vector3Position);

			return markerMesh;
		},
	};

	// Place Marker
	let placeMarker = function (object, options) {
		let position = markerProto.latLongToVector3(
			options.latitude,
			options.longitude,
			options.radius,
			options.height
		);
		let marker = markerProto.marker(options.size, options.color, position);
		object.add(marker);
	};

	// Scene, Camera, Renderer Configuration
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera.position.set(1, 1, 1);

	scene.add(camera);
	scene.add(light);
	scene.add(earth);

	const orbitControls = new OrbitControls(camera, renderer.domElement);

	orbitControls.enabled = true;

	// Light Configurations
	light.position.set(1, 0, 0);

	// Mesh Configurations
	earth.receiveShadow = true;
	earth.castShadow = true;
	earth.getObjectByName("surface").geometry.center();

	TIMELINE.forEach(position => {
		const { latitude, longitude } = position;

		placeMarker(earth.getObjectByName("surface"), {
			latitude,
			longitude,
			radius: 0.5,
			height: 0,
			size: 0.001,
			color: 0x0000ff,
		});
	})

	// On window resize, adjust camera aspect ratio and renderer size
	window.addEventListener("resize", () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	render();
</script>

<main />

<style>
</style>
