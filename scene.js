import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm";

import { arrowCoords } from "./data.js";
import { heartCoords } from "./data.js";
import { pencilCoords } from "./data.js";
import { dollarCoords } from "./data.js";
import { randoms } from "./data.js";

const orderedCoords = [arrowCoords, heartCoords, pencilCoords, dollarCoords];

const slideContent = [
    {
        title: "Web Service",
        description:
            "Lorem1 ipsum dolor sit amet consectetur adipisicing elit. Quisquam rerum ea, placeat iure libero commodi possimus earum molestias architecto doloremque expedita debitis et sequi.",
    },
    {
        title: "Social Media",
        description:
            "Adipisicing elit. Quisquam rerum ea, placeat iure libero commodi possimus  molestias architecto doloremque expedita debitis et sequi.",
    },
    {
        title: "Graphic Design",
        description:
            "Lorem3 ipsum dolor sit amet consectetur adipisicing  placeat iure libero commodi possimus earum molestias architecto doloremque expedita debitis et sequi.",
    },
    {
        title: "Sales Funnel",
        description:
            "Lorem4 ipsum dolor sit amet consectetur adipisicing elit. Quisquam rerum ea, placeat iure libero commodi possimus earum molestia placeat iure libero commodi possimus earum molestiass architecto doloremque expedita debitis et sequi.",
    },
];

let currentShapeIndex = 0;

const DESKTOP_CAMERA_DISTANCE = 750;
const MOBILE_CAMERA_DISTANCE = 1100;
const FLOATING_SPEED = 3;
const FLOATING_DISTANCE = 9;
const TRANSITION_DURATION = 3;
const FLOATING_START_DELAY = 0.8;
const MOBILE_SWIPE_LENGTH = 30;

let IS_TRANSITIONING = false;

// mouse rotation effect
let multiplier = 0.0007;
const speed = 0.02;
const targetPos = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
};
const currentPos = {
    x: 0,
    y: 0,
};

document.addEventListener("mousemove", (e) => {
    targetPos.x = e.clientX;
    targetPos.y = e.clientY;
});

const canvasSize = {
    width: window.innerWidth,
    height: window.innerHeight,
};

const sceneData = {
    cubeGeometry: null,
};

const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(
    50,
    canvasSize.width / canvasSize.height,
    0.1,
    4000
);
camera.position.set(DESKTOP_CAMERA_DISTANCE, 0.2, -0.2);

camera.aspect = canvasSize.width / canvasSize.height;
camera.updateProjectionMatrix();

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    canvas: document.getElementById("canvas3d"),
    useLegacyLights: false,
    preserveDrawingBuffer: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvasSize.width, canvasSize.height);
renderer.setClearColor(0xffffff, 0);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(33, 100, -110);
scene.add(directionalLight);

const light = new THREE.AmbientLight(0xffffff);
light.intencity = 0.0;
scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 0, 0);
controls.enableDamping = false;
controls.enableZoom = false;
controls.enableRotate = false;
controls.enablePan = false;
controls.update();

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

window.addEventListener("resize", resize);

function resize() {
    // Update canvas sizes
    canvasSize.width = window.innerWidth;
    canvasSize.height = window.innerHeight;

    // Update camera
    camera.aspect = canvasSize.width / canvasSize.height;
    camera.updateProjectionMatrix();
    // Update renderer
    renderer.setSize(canvasSize.width, canvasSize.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

/// orientation
let orientationIsLandscape = isLandscape();
if (orientationIsLandscape) {
    switchToLandscape();
} else {
    switchToPortrait();
}

handleOrientationChange();
function handleOrientationChange() {
    if (isLandscape()) {
        if (!orientationIsLandscape) switchToLandscape();
        orientationIsLandscape = true;
    } else {
        if (orientationIsLandscape) switchToPortrait();
        orientationIsLandscape = false;
    }
}
function isLandscape() {
    return window.innerWidth > window.innerHeight;
}

window.addEventListener("resize", function () {
    handleOrientationChange();
});

function switchToLandscape() {
    camera.position.x = DESKTOP_CAMERA_DISTANCE;
}
function switchToPortrait() {
    camera.position.x = MOBILE_CAMERA_DISTANCE;
}

// load everything and save them in sceneData
const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => startScene(sceneData);

loadingManager.onError = (url) => {
    console.error(`Error loading ${url}`);
};

// load 3d models
const gltfloader = new GLTFLoader(loadingManager);
gltfloader.load("cube.glb", function (gltf) {
    const model = gltf.scene.children[0];
    model.traverse((child) => {
        if (child.type === "Mesh") {
            sceneData.cubeGeometry = child.geometry;
            sceneData.cubeMaterial = child.material;
            sceneData.loadedCube = model;
            return;
        }
    });
});

const rgbeLoader = new RGBELoader(loadingManager);
rgbeLoader.setPath("").load("environment.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    sceneData.environmentTexture = texture;
});

function startScene(data) {
    let geometry = sceneData.cubeGeometry;
    let material = sceneData.cubeMaterial;

    let newMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff, // 0x00dafc,
        metalness: 1,
        roughness: 0,
        envMapIntensity: 1,
    });

    scene.environment = sceneData.environmentTexture;
    // scene.background = sceneData.environmentTexture;

    let count = heartCoords.length;

    let rotRange = 0.0;
    let cubes = new THREE.InstancedMesh(geometry, newMaterial, count);
    cubes.rotateY(Math.PI / 2);

    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3(1, 1, 1); // Uniform scale

    const quaternions = [];
    for (let i = 0; i < count; i++) {
        let randomQuaternion = new THREE.Quaternion()
            .set(
                Math.random() * rotRange,
                Math.random() * rotRange,
                Math.random() * rotRange,
                Math.random()
            )
            .normalize();
        quaternions.push(randomQuaternion);
    }

    function interpolatePositions(start, end, t) {
        return start.clone().lerp(end, t);
    }

    const timeOffsets = [];

    for (let i = 0; i < count; i++) {
        const timeOffset = Math.random() * Math.PI * 2;
        timeOffsets.push(timeOffset);

        tempPosition.set(heartCoords[i].x, heartCoords[i].y, heartCoords[i].z);

        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        cubes.setMatrixAt(i, tempMatrix);
    }

    function animateFloating(deltaTime) {
        for (let i = 0; i < count; i++) {
            const timeShift = deltaTime + timeOffsets[i];
            const xOffset =
                Math.sin(timeShift) *
                FLOATING_DISTANCE *
                transsitionConfig.floatMultiplier;

            // Update position with xOffset
            tempPosition.set(
                orderedCoords[currentShapeIndex][i].x + xOffset,
                orderedCoords[currentShapeIndex][i].y,
                orderedCoords[currentShapeIndex][i].z
            );
            tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
            cubes.setMatrixAt(i, tempMatrix);
        }

        cubes.instanceMatrix.needsUpdate = true;
    }

    cubes.instanceMatrix.needsUpdate = true;
    scene.add(cubes);

    const transsitionConfig = {
        transitionProgress: 0,
        transitionSpeed: 0.005,
        rotationY: 0,
        floatMultiplier: 1,
    };

    function updateInstanceMatrices(coords1, coords2) {
        for (let i = 0; i < count; i++) {
            const startPos = new THREE.Vector3(
                coords1[i].x,
                coords1[i].y,
                coords1[i].z
            );
            const targetPos = new THREE.Vector3(
                coords2[i].x,
                coords2[i].y,
                coords2[i].z
            );

            let newPos = interpolatePositions(
                startPos,
                targetPos,
                transsitionConfig.transitionProgress
            );
            tempMatrix.compose(newPos, quaternions[i], tempScale);
            cubes.setMatrixAt(i, tempMatrix);
        }
        cubes.instanceMatrix.needsUpdate = true;
    }

    let floatDelayTween = null;

    function startTransition(nextShapeIndex, rotateDir) {
        if (floatDelayTween) {
            floatDelayTween.kill();
            transsitionConfig.floatMultiplier = 0;
        }
        startContentFadeingAnimation();

        IS_TRANSITIONING = true;

        gsap.to(transsitionConfig, {
            transitionProgress: 1,
            duration: TRANSITION_DURATION / 2,
            onUpdate: function () {
                updateInstanceMatrices(
                    orderedCoords[currentShapeIndex],
                    randoms
                );
            },
            ease: "power1.inOut",
            onComplete: function () {
                updateContent(nextShapeIndex);
                transsitionConfig.transitionProgress = 1;
                gsap.to(transsitionConfig, {
                    transitionProgress: 0,
                    duration: TRANSITION_DURATION / 2,
                    onUpdate: function () {
                        updateInstanceMatrices(
                            orderedCoords[nextShapeIndex],
                            randoms
                        );
                    },
                    ease: "power1.inOut",
                    onComplete: function () {
                        transsitionConfig.floatMultiplier = 0;
                        resetContentFadeingAnimation();
                        currentShapeIndex = nextShapeIndex;
                        // float mult
                        floatDelayTween = gsap.to(transsitionConfig, {
                            floatMultiplier: 1,
                            duration: FLOATING_START_DELAY,
                            ease: "power1.inOut",
                        });
                    },
                });
            },
        });

        gsap.to(transsitionConfig, {
            rotationY: Math.PI * 2 * rotateDir,
            duration: TRANSITION_DURATION,

            ease: "power1.inOut",
            onComplete: function () {
                currentShapeIndex = nextShapeIndex;
                IS_TRANSITIONING = false;
                transsitionConfig.rotationY = 0;
            },
        });
    }

    /// scroll
    window.addEventListener("wheel", function (event) {
        if (!IS_TRANSITIONING) {
            if (event.deltaY > 0) {
                onScrollDown();
            } else {
                onScrollUp();
            }
        }
    });

    /// scroll for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    window.addEventListener("touchstart", function (event) {
        touchStartY = event.touches[0].clientY;
    });

    window.addEventListener("touchmove", function (event) {
        touchEndY = event.touches[0].clientY;
    });

    window.addEventListener("touchend", function () {
        if (!IS_TRANSITIONING) {
            let deltaY = touchStartY - touchEndY;

            if (deltaY > MOBILE_SWIPE_LENGTH) {
                onScrollDown();
            } else if (deltaY < -MOBILE_SWIPE_LENGTH) {
                onScrollUp();
            }
        }
    });

    function onScrollDown() {
        startTransition(getNextShapeIndex(currentShapeIndex), 1);
    }

    function onScrollUp() {
        startTransition(getPrevShapeIndex(currentShapeIndex), -1);
    }

    function getPrevShapeIndex(currentIndex) {
        if (currentIndex - 1 < 0) {
            return orderedCoords.length - 1;
        }
        return currentIndex - 1;
    }

    function getNextShapeIndex(currentIndex) {
        if (currentIndex + 1 >= orderedCoords.length) {
            return 0;
        }
        return currentIndex + 1;
    }

    // UI
    const titleEl = document.getElementById("title");
    const descriptionEl = document.getElementById("description");
    const slideNumEl = document.getElementById("slide-num");
    const slideNumBottomEl = document.getElementById("slide-num-bottom");

    const paginationDots = document.querySelectorAll(".pagination-dot");

    updateContent(0);
    function updateContent(index) {
        titleEl.textContent = slideContent[index].title;
        descriptionEl.textContent = slideContent[index].description;
        slideNumEl.textContent = "0" + (index + 1);
        slideNumBottomEl.textContent =
            "0" + (index + 1) + "/0" + slideContent.length;

        paginationDots.forEach((dot) => {
            dot.classList.remove("pagination-dot-active");
        });
        paginationDots[index].classList.add("pagination-dot-active");
    }

    function startContentFadeingAnimation() {
        titleEl.classList.add("fadeOutIn");
        descriptionEl.classList.add("fadeOutIn");
        slideNumEl.classList.add("fadeOutIn");
        slideNumBottomEl.classList.add("fadeOutIn");
    }

    function resetContentFadeingAnimation() {
        titleEl.classList.remove("fadeOutIn");
        descriptionEl.classList.remove("fadeOutIn");
        slideNumEl.classList.remove("fadeOutIn");
        slideNumBottomEl.classList.remove("fadeOutIn");
    }

    const clock = new THREE.Clock();

    function animate() {
        currentPos.x += (targetPos.x - currentPos.x) * speed;
        currentPos.y += (targetPos.y - currentPos.y) * speed;

        if (cubes) {
            cubes.rotation.y =
                transsitionConfig.rotationY +
                multiplier * (currentPos.x - window.innerWidth / 2);
            cubes.rotation.z =
                -multiplier * (currentPos.y - window.innerHeight / 2);
        }

        ///floating
        if (!IS_TRANSITIONING) {
            const deltaTime = clock.getElapsedTime();
            animateFloating(deltaTime * FLOATING_SPEED);
        }

        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}

equalizeArrays(arrowCoords, heartCoords, pencilCoords, dollarCoords, randoms);

function equalizeArrays(...arrays) {
    const maxLength = Math.max(...arrays.map((arr) => arr.length));

    arrays.forEach((arr) => {
        if (arr.length < maxLength) {
            const missingLength = maxLength - arr.length;
            const newObjects = Array(missingLength)
                .fill()
                .map(() => ({ x: 0, y: 0, z: 0 }));
            arr.push(...newObjects);
        }
    });
}
