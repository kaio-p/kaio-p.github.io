import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

(function initKeyboardBackground() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
  } catch (err) {
    console.warn("[keyboard-bg] WebGL indisponível:", err);
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    22,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  // câmera próxima (~2x de zoom), olhando pro centro
  camera.position.set(-0.28, 0.85, 1.9);
  camera.lookAt(0, -0.2, 0);

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  if ("outputColorSpace" in renderer) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderOnce();
  }

  // A partir do three.js r155 as luzes usam unidades fisicamente corretas
  // (candela), então valores "antigos" como intensity: 1 renderizam quase
  // pretos. Os valores abaixo são deliberadamente altos por causa disso.
  // Luzes neutras (branco puro), sem matiz de cor.

  scene.add(new THREE.AmbientLight(0x4a4a4a, 2.2));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(-2, 3, 4);
  scene.add(keyLight);

  // luz que se move devagar revelando o teclado, tipo lanterna no escuro
  const revealLight = new THREE.PointLight(0xffffff, 260, 16, 1.6);
  revealLight.position.set(-3, 2, 3);
  scene.add(revealLight);

  // segunda luz, mais fraca e fixa, só pra dar uma leitura mínima de volume
  const fillLight = new THREE.PointLight(0xffffff, 60, 14, 1.6);
  fillLight.position.set(2, -1, 2);
  scene.add(fillLight);

  // ---------------------------------------------------------------
  // TECLADO
  // ---------------------------------------------------------------
  let keyboard = null;
  const KEYBOARD_ROTATION = { x: 0.35, y: -0.5, z: 0 };

  function renderOnce() {
    renderer.render(scene, camera);
  }

  const loader = new GLTFLoader();
  loader.setPath("assets/keyboard-v2/");
  loader.load(
    "scene.gltf",
    (gltf) => {
      keyboard = gltf.scene;
      keyboard.scale.setScalar(0.065);
      keyboard.position.set(0, -0.4, 0);
      keyboard.rotation.set(
        KEYBOARD_ROTATION.x,
        KEYBOARD_ROTATION.y,
        KEYBOARD_ROTATION.z
      );
      scene.add(keyboard);
      applyScrollTransform();
      renderOnce();
      console.info("[keyboard-bg] modelo carregado.");
    },
    undefined,
    (err) => {
      console.warn("[keyboard-bg] não foi possível carregar o modelo:", err);
    }
  );

  // ---------------------------------------------------------------
  // SCROLL
  // ---------------------------------------------------------------
  let scrollFraction = 0;
  function updateScrollFraction() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollFraction = max > 0 ? window.scrollY / max : 0;
  }

  function applyScrollTransform() {
    if (!keyboard) return;
    keyboard.rotation.y = KEYBOARD_ROTATION.y + scrollFraction * 1.4;
    keyboard.position.y = -0.4 + scrollFraction * 0.7;
  }

  resize();
  window.addEventListener("resize", resize);

  if (prefersReducedMotion) {
    // sem animação contínua: só reage ao scroll, sem a luz em movimento
    window.addEventListener(
      "scroll",
      () => {
        updateScrollFraction();
        applyScrollTransform();
        renderOnce();
      },
      { passive: true }
    );
    updateScrollFraction();
    applyScrollTransform();
    renderOnce();
    return;
  }

  window.addEventListener("scroll", updateScrollFraction, { passive: true });
  updateScrollFraction();

  const clock = new THREE.Clock();
  let rafId = null;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    applyScrollTransform();

    // caminho lento e elíptico, revelando faces diferentes com o tempo
    revealLight.position.x = Math.sin(t * 0.12) * 4;
    revealLight.position.z = Math.cos(t * 0.09) * 4 + 1;
    revealLight.position.y = 1.4 + Math.sin(t * 0.07) * 1.2;

    renderOnce();
  }
  animate();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && rafId === null) {
      animate();
    }
  });
})();
