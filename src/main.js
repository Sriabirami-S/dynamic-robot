import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimationMixer } from "three";

const interactionBox = document.getElementById("interactionBox");

function drawInteractionBox(left, right, top, bottom){

    interactionBox.style.left = left + "px";
    interactionBox.style.top = top + "px";
    interactionBox.style.width = (right - left) + "px";
    interactionBox.style.height = (bottom - top) + "px";

}
/* ======================================================
   SCENE
====================================================== */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8fbff);
/* ======================================================
   CAMERA
====================================================== */

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Camera slightly left so robot appears on right
camera.position.set(
    -1.2,
    1.8,
    9
);

/* ======================================================
   RENDERER
====================================================== */

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(window.devicePixelRatio);

// Makes lighting look much nicer
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type = THREE.PCFSoftShadowMap;
/* ======================================================
   LIGHTS
====================================================== */

// Bright ambient
const hemi = new THREE.HemisphereLight(

    0xffffff,

    0xdfe8ff,

    4

);

scene.add(hemi);

// Main sunlight
const sun = new THREE.DirectionalLight(
    0xffffff,
    5
);

sun.position.set(
    12,
    18,
    10
);

scene.add(sun);

sun.castShadow = true;

sun.shadow.mapSize.set(4096,4096);

sun.shadow.camera.near = 1;
sun.shadow.camera.far = 40;

sun.shadow.camera.left = -20;
sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20;
sun.shadow.camera.bottom = -20;

sun.shadow.bias = -0.0001;

sun.shadow.normalBias = 0.02;
// Fill light
const fill = new THREE.DirectionalLight(
    0xffffff,
    2.5
);

fill.position.set(
    -6,
    5,
    5
);

scene.add(fill);

// Blue accent
const blue = new THREE.PointLight(
    0x6ea8ff,
    90
);

blue.position.set(
    4,
    4,
    4
);

scene.add(blue);

// Purple accent
const purple = new THREE.PointLight(
    0xa855f7,
    70
);

purple.position.set(
    5,
    3,
    -2
);

scene.add(purple);

const backLight = new THREE.PointLight(

    0x66aaff,

    120,

    20

);

backLight.position.set(

    4.5,

    2,

    -4

);

scene.add(backLight);

// ======================
// STUDIO FLOOR
// ======================

const floor = new THREE.Mesh(

    new THREE.PlaneGeometry(80,80),

    new THREE.MeshStandardMaterial({

    color:0xffffff,

    roughness:0.35,

    metalness:0.02

})

);

floor.rotation.x = -Math.PI/2;

floor.position.y = -1.35;

scene.add(floor);
// ======================================
// CONTACT SHADOW
// ======================================

const shadowTexture = new THREE.TextureLoader().load(
    import.meta.env.BASE_URL + "textures/roundshadow.png"
);

const shadowMaterial = new THREE.MeshBasicMaterial({

    map: shadowTexture,

    transparent: true,

    opacity: 0.28,

    depthWrite: false

});

const contactShadow = new THREE.Mesh(

    new THREE.PlaneGeometry(5.2,4.2),

    shadowMaterial

);

contactShadow.rotation.x = -Math.PI / 2;

contactShadow.position.set(
    4.8,
    -1.348,
    0
);

scene.add(contactShadow);
floor.receiveShadow = true;
floor.material.side = THREE.DoubleSide;
// ======================
// GRID
// ======================

const grid = new THREE.GridHelper(

    80,

    80,

    0xc8d2e6,

    0xe9eef8

);

grid.position.y = -1.34;

scene.add(grid);

const contactSection = document.getElementById("contact");

/* ======================================================
   MODEL
====================================================== */

const loader = new GLTFLoader();

let robot;

let mixer;

let actions = {};

loader.load(

       import.meta.env.BASE_URL + "models/go1.glb",

    (gltf)=>{

        robot = gltf.scene;
        robot.traverse((child) => {

    if(child.isMesh){

        child.castShadow = true;

        child.receiveShadow = true;

    }

});

        // ==========================
        // Animation Mixer
        // ==========================

        mixer = new AnimationMixer(robot);

        gltf.animations.forEach((clip) => {

            actions[clip.name] = mixer.clipAction(clip);

        });

        // ==========================
        // Console Animation Names
        // ==========================

        console.log("Available Animations:");

        gltf.animations.forEach((clip, index) => {

            console.log(index, clip.name);

        });

        // ==========================
        // Create Control Panel Buttons
        // ==========================
        const animationMap = {

    "0Idle":      { label: "Idle",        group: "Basic" },

    "Playing":    { label: "Play",        group: "Basic" },

    "1Idle":      { label: "Active Idle", group: "Basic" },

    "0LYN":       { label: "Sit",         group: "Pose" },

    "0LYP":       { label: "Stand",       group: "Pose" },

    "0RYN":       { label: "Look Up",      group: "Head" },

    "0RYP":       { label: "Look Down",    group: "Head" },

    "0RXN":       { label: "Turn Left",    group: "Motion" },

    "0RXP":       { label: "Turn Right",   group: "Motion" },

    "1RXN":       { label: "Walk Left",   group: "Motion" },

    "1RXP":       { label: "Walk Right",  group: "Motion" }

};
        const container = document.getElementById("animationButtons");

const groups = ["Basic","Pose","Head","Motion"];

groups.forEach(group => {

    // Section Heading
    const heading = document.createElement("h3");

    heading.className = "controlHeading";

    heading.innerText = group;

    container.appendChild(heading);

    gltf.animations.forEach((clip) => {

        const info = animationMap[clip.name];

        if(!info || info.group !== group) return;

        const btn = document.createElement("button");

        btn.innerText = info.label;

        btn.onclick = () => {

            Object.values(actions).forEach(action => {

                action.fadeOut(0.25);

            });

            actions[clip.name]
                .reset()
                .fadeIn(0.25)
                .play();

        };

        container.appendChild(btn);

    });

});

        // ==========================
        // Robot Size & Position
        // ==========================

        robot.scale.set(
           8,8,8
        );

       robot.position.set(
    4.8,
    -1.22,
    0
);

        robot.rotation.y = -1.3;

        scene.add(robot);

        console.log("GO1 Loaded");

    },

    undefined,

    (err)=>{

        console.error(err);

    }

);

/* ======================================================
   MOUSE
====================================================== */

let mouseX = 0;
let mouseY = 0;

let rotationLocked = false;
let waitForMouseMove = false;

let lockedRotation = 0;
let mouseInsideZone = false;

// Toast / onboarding
let introToastShown = false;
let lockHintShown = false;

let introTimer = null;
let lockTimer = null;

window.addEventListener("mousemove", (e) => {

    if(waitForMouseMove){

        waitForMouseMove = false;

        return;

    }

    const left = window.innerWidth * 0.53;
    const right = window.innerWidth * 0.70;

    const top = window.innerHeight * 0.30;
    const bottom = window.innerHeight * 0.68;

    drawInteractionBox(left, right, top, bottom);

    const box = document.getElementById("interactionBox");

    box.style.left = left + "px";
    box.style.top = top + "px";
    box.style.width = (right - left) + "px";
    box.style.height = (bottom - top) + "px";

    // -------------------------
    // FIRST TIP
    // -------------------------

    if(!introToastShown){

        introToastShown = true;

        introTimer = setTimeout(()=>{

            showToast(
                "Move your cursor over the robot to rotate it.",
                5000
            );

        },1000);

    }

    if (
        e.clientX >= left &&
        e.clientX <= right &&
        e.clientY >= top &&
        e.clientY <= bottom
    ) {

        if(!mouseInsideZone){

            mouseInsideZone = true;

            if(!lockHintShown){

                lockTimer = setTimeout(()=>{

                    showToast(
                        "Click to lock the current view.",
                        4500
                    );

                    lockHintShown = true;

                },3200);

            }

        }

        mouseX =
            ((e.clientX - left) / (right - left)) * 2 - 1;

        mouseY =
            -(((e.clientY - top) / (bottom - top)) * 2 - 1);

    }
    else{

        mouseInsideZone = false;

        clearTimeout(lockTimer);

    }

}
);
window.addEventListener("click", (e) => {

    const left = window.innerWidth * 0.53;
    const right = window.innerWidth * 0.70;

    const top = window.innerHeight * 0.30;
    const bottom = window.innerHeight * 0.68;

    if (
        e.clientX >= left &&
        e.clientX <= right &&
        e.clientY >= top &&
        e.clientY <= bottom
    ) {

        rotationLocked = !rotationLocked;

if(rotationLocked){

    lockedRotation = robot.rotation.y;

    showToast("View Locked<br><small>Click again to unlock</small>",2500);

}
else{

    waitForMouseMove = true;

showToast("View Unlocked",1500);
}

        if (rotationLocked && robot) {

            lockedRotation = robot.rotation.y;

            console.log("Rotation Locked");

        }
        else{

            console.log("Rotation Unlocked");

        }

    }

});
/* ======================================================
   ANIMATION
====================================================== */
function shortestAngleDifference(current, target) {

    let difference = target - current;

    while (difference > Math.PI) {

        difference -= Math.PI * 2;

    }

    while (difference < -Math.PI) {

        difference += Math.PI * 2;

    }

    return difference;

}
function showToast(message, duration = 2500){

    const toast = document.getElementById("toast");

    toast.innerHTML = message;

    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(()=>{

        toast.classList.remove("show");

    }, duration);

}
function animate(){

    requestAnimationFrame(animate);

    if(robot){

        // Look towards cursor
      const defaultRotation = -1.3;

// Only update rotation while the mouse is inside the interaction zone
if (!rotationLocked &&
    !waitForMouseMove &&
    mouseInsideZone) {

    const targetRotation = defaultRotation + mouseX * (Math.PI * 2);

    const delta = shortestAngleDifference(
        robot.rotation.y,
        targetRotation
    );

    robot.rotation.y += delta * 0.10;

}
else if (rotationLocked) {

    const delta = shortestAngleDifference(
        robot.rotation.y,
        lockedRotation
    );

    robot.rotation.y += delta * 0.15;

}

        const targetX = mouseY * 0.08;

robot.rotation.x +=
(targetX - robot.rotation.x) * 0.12;

        // Gentle breathing motion
       robot.position.y =
    -1.24 +
    Math.sin(Date.now()*0.0015)*0.03;
            contactShadow.position.x = robot.position.x;

contactShadow.position.z = robot.position.z;

contactShadow.material.opacity =
0.55 - Math.abs(robot.position.y + 1.22) * 1.2;

    }

    // Camera movement
    camera.position.x +=
    (
        (-1.5 + mouseX*0.25)
        -
        camera.position.x
    )*0.03;

    camera.position.y +=
    (
        (1.8 + mouseY*0.12)
        -
        camera.position.y
    )*0.03;

    camera.lookAt(
        2,
        0,
        0
    );
    // -- new block alert
    if(mixer){

    mixer.update(0.016);

}
if (contactSection) {

    const contactTop = contactSection.offsetTop;

    if (window.scrollY >= contactTop - 200) {

        grid.visible = false;

    } else {

        grid.visible = true;

    }

}
    renderer.render(
        scene,
        camera
    );

}

animate();

/* ======================================================
   RESIZE
====================================================== */

window.addEventListener(

    "resize",

    ()=>{

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

);

// -- newly added code 
const playBtn = document.getElementById("playBtn");

const panel = document.getElementById("controlPanel");

//const closePanel = document.getElementById("closePanel");

// ==========================
// OPEN PANEL
// ==========================

playBtn.onclick = () => {

    panel.classList.add("open");

};

// ==========================
// CLOSE PANEL
// ==========================



// ==========================
// CLOSE WHEN CLICKING OUTSIDE
// ==========================

document.addEventListener("click", (e) => {

    if (
        panel.classList.contains("open") &&
        !panel.contains(e.target) &&
        e.target !== playBtn
    ) {

        panel.classList.remove("open");

        Object.values(actions).forEach(action => {

            action.fadeOut(0.3);

        });

        actions["0Idle"]
            .reset()
            .fadeIn(0.3)
            .play();

    }

});

// --- new block alert

window.addEventListener("keydown",(e)=>{

    Object.values(actions).forEach(a=>a.stop());

    switch(e.key){

        case "1":

            actions["0Idle"]?.reset().play();

            break;

        case "2":

            actions["Playing"]?.reset().play();

            break;

        case "3":

            actions["1Idle"]?.reset().play();

            break;

    }

});

// ===============================
// ACTIVE NAVIGATION
// ===============================

const navLinks = document.querySelectorAll("nav a");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            navLinks.forEach(link => {

                link.classList.remove("active");

            });

            const activeLink = document.querySelector(
                `nav a[href="#${entry.target.id}"]`
            );

            if(activeLink){

                activeLink.classList.add("active");

            }

        }

    });

},{
    threshold:0.6
});

document.querySelectorAll("section").forEach(section=>{

    observer.observe(section);

});