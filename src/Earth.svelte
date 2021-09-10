<script>
	import * as THREE from "three";

	let renderer = new THREE.WebGLRenderer();
	let scene = new THREE.Scene();
	let aspect = window.innerWidth / window.innerHeight;
	let camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1500);
	let cameraRotation = 0;
	let cameraRotationSpeed = 0.001;
	let cameraAutoRotation = true;
	let orbitControls = new THREE.OrbitControls(camera);

	// Lights
	let spotLight = new THREE.SpotLight(0xffffff, 1, 0, 10, 2);

	// Texture Loader
	let textureLoader = new THREE.TextureLoader();
</script>

<main>
	<div>Earth</div>
</main>

<style>
	canvas {
		display: block;
	}
</style>
