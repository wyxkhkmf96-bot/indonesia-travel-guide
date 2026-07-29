import * as THREE from "./assets/vendor/three.module.min.js";

const REGION_CONFIG = {
  java: {
    name: "东爪哇",
    color: 0xff7867,
    bounds: [112.35, 115.08, -8.55, -7.0],
    peaks: [
      { name: "塞梅鲁", coord: [112.92, -8.11], height: 6.8, width: .075, volcano: true },
      { name: "布罗莫", coord: [112.95, -7.94], height: 4.4, width: .055, volcano: true },
      { name: "伊真", coord: [114.24, -8.06], height: 5.2, width: .065, volcano: true }
    ],
    beaches: [
      { coord: [114.36, -8.29], color: 0xe6d29a, scale: .65 }
    ],
    forests: [[112.92, -8.22], [112.82, -8.08], [114.15, -8.12]],
    landPatches: [
      { center: [112.72, -7.31], radius: [.13, .1], rotation: -.12 }
    ]
  },
  bali: {
    name: "巴厘岛",
    color: 0xd8ef76,
    bounds: [114.85, 115.75, -8.92, -7.95],
    peaks: [
      { name: "阿贡", coord: [115.51, -8.34], height: 7.4, width: .06, volcano: true },
      { name: "巴图尔", coord: [115.38, -8.24], height: 5.6, width: .05, volcano: true },
      { name: "巴杜卡鲁", coord: [115.11, -8.34], height: 4.4, width: .06, volcano: false },
      { name: "佩尼达悬崖", coord: [115.46, -8.75], height: 2.4, width: .045, volcano: false }
    ],
    beaches: [
      { coord: [115.32, -8.62], color: 0x3c4141, scale: .55 },
      { coord: [115.45, -8.75], color: 0xf2d793, scale: .6 },
      { coord: [115.26, -8.69], color: 0xf0da9b, scale: .55 },
      { coord: [115.02, -8.16], color: 0x4a4a48, scale: .58 }
    ],
    forests: [[115.26, -8.51], [115.30, -8.42], [115.20, -8.36]],
    landPatches: [
      { center: [115.50, -8.73], radius: [.115, .06], rotation: -.18 },
      { center: [115.46, -8.69], radius: [.035, .025], rotation: 0 }
    ]
  },
  komodo: {
    name: "科莫多",
    color: 0xc3a7ff,
    bounds: [119.3, 120.05, -8.9, -8.25],
    peaks: [
      { name: "Padar", coord: [119.57, -8.65], height: 5.2, width: .045, volcano: false },
      { name: "Komodo", coord: [119.49, -8.55], height: 4.1, width: .07, volcano: false },
      { name: "Flores", coord: [119.83, -8.49], height: 3.8, width: .065, volcano: false }
    ],
    beaches: [
      { coord: [119.55, -8.54], color: 0xf4a6ae, scale: .7 },
      { coord: [119.61, -8.53], color: 0xf6e3ac, scale: .5 }
    ],
    forests: [[119.47, -8.56], [119.52, -8.51], [119.83, -8.49]],
    landPatches: [
      { center: [119.57, -8.65], radius: [.075, .042], rotation: -.28 },
      { center: [119.61, -8.53], radius: [.032, .018], rotation: .12 }
    ]
  }
};

const MODE_COLORS = {
  road: 0xff7867,
  jeep: 0xff9c62,
  atv: 0xd8ef76,
  walk: 0xfff4d8,
  boat: 0x6bd6e3,
  ferry: 0x6bd6e3,
  speedboat: 0x6bd6e3,
  flight: 0xc3a7ff
};

const GLOBE_RADIUS = 20;
const GLOBE_CENTER_Y = -20.45;
const TERRAIN_RELIEF = .68;

const seededRandom = seed => {
  let state = Math.max(1, seed % 2147483647);
  return () => {
    state = state * 16807 % 2147483647;
    return (state - 1) / 2147483646;
  };
};

class TerrainStage {
  constructor(canvas, itinerary) {
    this.canvas = canvas;
    this.itinerary = itinerary;
    this.dayIndex = 0;
    this.stepIndex = 0;
    this.currentRegion = null;
    this.worldReady = false;
    this.moving = false;
    this.cameraTarget = new THREE.Vector3();
    this.cameraTween = null;
    this.motion = null;
    this.labelSprites = [];
    this.photoSprites = [];
    this.userView = { zoom: 1, yaw: 0, pitch: 0, dragging: false, x: 0, y: 0 };
    this.pointerPositions = new Map();
    this.pinchDistance = null;
    this.baseCameraPosition = null;
    this.baseCameraTarget = null;
    this.frame = null;
    this.needsRender = true;
    this.inViewport = true;
    this.pageVisible = !document.hidden;
    this.regionCache = new Map();
    this.dayRouteCache = new Map();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 900 ? 1.1 : 1.25));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.16;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x01050a, .0025);
    this.camera = new THREE.PerspectiveCamera(34, 1, .1, 420);
    this.camera.position.set(0, 23, 28);
    this.camera.lookAt(this.cameraTarget);

    this.worldGroup = new THREE.Group();
    this.routeGroup = new THREE.Group();
    this.detailGroup = new THREE.Group();
    this.scene.add(this.worldGroup, this.routeGroup, this.detailGroup);
    this.addSpaceBackdrop();
    this.addLights();

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(canvas);
    this.intersectionObserver = new IntersectionObserver(entries => {
      this.inViewport = entries[0]?.isIntersecting ?? true;
      if (this.inViewport) this.requestRender();
      else this.cancelRender();
    }, { rootMargin: "120px" });
    this.intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.setupInteraction();
    this.resize();
    this.requestRender();
    this.ready = this.initialize().catch(error => this.fail(error));
  }

  addLights() {
    const hemi = new THREE.HemisphereLight(0x9cefff, 0x06110a, 1.55);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff4ce, 4.65);
    key.position.set(-12, 28, 16);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -28;
    key.shadow.camera.right = 28;
    key.shadow.camera.top = 28;
    key.shadow.camera.bottom = -28;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x26dfff, 3.1);
    rim.position.set(20, 10, -20);
    this.scene.add(rim);

    const greenFill = new THREE.DirectionalLight(0x8de83d, .72);
    greenFill.position.set(-22, -4, -8);
    this.scene.add(greenFill);
  }

  addSpaceBackdrop() {
    const positions = [];
    let seed = 94721;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let index = 0; index < 520; index += 1) {
      const radius = 72 + random() * 70;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xc7f4ff,
        size: .22,
        sizeAttenuation: true,
        transparent: true,
        opacity: .78,
        depthWrite: false,
        fog: false
      })
    );
    stars.renderOrder = -10;
    this.scene.add(stars);
  }

  createAtmosphere(radius, centerY = 0, color = 0x25dfff, strength = .92) {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(color) },
        glowStrength: { value: strength }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        void main() {
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewDirection = normalize(-viewPosition.xyz);
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float glowStrength;
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        void main() {
          float rim = pow(1.0 - max(0.0, dot(vNormal, vViewDirection)), 2.35);
          gl_FragColor = vec4(glowColor, rim * glowStrength);
        }
      `,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    });
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 72, 48),
      material
    );
    atmosphere.position.y = centerY;
    atmosphere.renderOrder = 2;
    return atmosphere;
  }

  setProgress(value, label) {
    const progress = document.querySelector("#terrain-progress");
    const loader = document.querySelector("#terrain-loading");
    if (progress) progress.textContent = `${Math.round(value)}%`;
    if (loader) loader.querySelector("span").textContent = value >= 100 ? "加载完成" : "加载中，请稍等";
    if (loader) loader.style.setProperty("--load", `${value}%`);
    window.dispatchEvent(new CustomEvent("terrain-progress", {
      detail: { value, label }
    }));
  }

  fail(error) {
    document.body.classList.add("terrain-unavailable");
    const loader = document.querySelector("#terrain-loading");
    if (loader) {
      loader.querySelector("span").textContent = "当前设备无法加载 3D 沙盘，已保留地球路线";
      loader.querySelector("b").textContent = "!";
    }
    window.terrainStage = this;
    window.dispatchEvent(new CustomEvent("terrain-ready", { detail: { error: error.message } }));
  }

  async initialize() {
    this.setProgress(8, "正在读取真实岛屿轮廓");
    const world = await (window.worldMapPromise ||= fetch("assets/maps/countries-50m.json").then(response => {
      if (!response.ok) throw new Error("Terrain geography unavailable");
      return response.json();
    }));
    const countries = window.topojson.feature(world, world.objects.countries).features;
    this.land = window.topojson.feature(world, world.objects.land);
    this.indonesia = countries.find(feature => feature.properties?.name === "Indonesia");
    this.worldReady = true;
    this.setProgress(30, "正在生成亚太微缩地球");
    await this.setDay(0, { instant: true });
    this.setProgress(100, "3D 沙盘准备完成");
    window.setTimeout(() => document.querySelector("#terrain-loading")?.classList.add("ready"), 350);
    window.terrainStage = this;
    window.dispatchEvent(new CustomEvent("terrain-ready"));
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.renderer.setSize(rect.width, rect.height, false);
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    if (this.worldReady && this.currentRegion && !this.moving) {
      if (this.currentRegion === "arrival") this.focusArrivalGlobe(true, false);
      else this.focusOverview(true, false);
    }
    this.requestRender();
  }

  setupInteraction() {
    this.canvas.addEventListener("wheel", event => {
      event.preventDefault();
      event.stopPropagation();
      const focused = document.body.classList.contains("globe-fullscreen");
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY) * .45) {
        const yawLimit = focused ? Math.PI : .2;
        this.userView.yaw = THREE.MathUtils.clamp(this.userView.yaw - event.deltaX * .00055, -yawLimit, yawLimit);
      } else {
        this.userView.zoom = THREE.MathUtils.clamp(
          this.userView.zoom * Math.exp(event.deltaY * .00042),
          focused ? .5 : .86,
          focused ? 1.45 : 1.18
        );
      }
      this.applyUserView();
    }, { passive: false });

    this.canvas.addEventListener("pointerdown", event => {
      this.pointerPositions.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.userView.dragging = this.pointerPositions.size === 1;
      this.userView.x = event.clientX;
      this.userView.y = event.clientY;
      this.canvas.classList.add("is-dragging");
      this.canvas.setPointerCapture?.(event.pointerId);
      if (this.pointerPositions.size === 2) {
        const [first, second] = [...this.pointerPositions.values()];
        this.pinchDistance = Math.hypot(second.x - first.x, second.y - first.y);
      }
    });

    this.canvas.addEventListener("pointermove", event => {
      const previous = this.pointerPositions.get(event.pointerId);
      if (!previous) return;
      this.pointerPositions.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const focused = document.body.classList.contains("globe-fullscreen");
      if (this.pointerPositions.size === 2) {
        const [first, second] = [...this.pointerPositions.values()];
        const distance = Math.hypot(second.x - first.x, second.y - first.y);
        if (this.pinchDistance && distance > 0) {
          this.userView.zoom = THREE.MathUtils.clamp(
            this.userView.zoom * (this.pinchDistance / distance),
            focused ? .5 : .86,
            focused ? 1.45 : 1.18
          );
          this.applyUserView();
        }
        this.pinchDistance = distance;
        return;
      }
      if (!this.userView.dragging) return;
      const dx = event.clientX - previous.x;
      const dy = event.clientY - previous.y;
      this.userView.x = event.clientX;
      this.userView.y = event.clientY;
      const yawLimit = focused ? Math.PI : .2;
      const pitchLimit = focused ? .52 : .13;
      this.userView.yaw = THREE.MathUtils.clamp(this.userView.yaw - dx * .0022, -yawLimit, yawLimit);
      this.userView.pitch = THREE.MathUtils.clamp(this.userView.pitch + dy * .0017, -pitchLimit, pitchLimit);
      this.applyUserView();
    });

    const finishDrag = event => {
      this.pointerPositions.delete(event.pointerId);
      this.pinchDistance = null;
      this.userView.dragging = this.pointerPositions.size === 1;
      if (!this.userView.dragging) this.canvas.classList.remove("is-dragging");
      if (this.userView.dragging) {
        const remaining = [...this.pointerPositions.values()][0];
        this.userView.x = remaining.x;
        this.userView.y = remaining.y;
      }
      if (event?.pointerId !== undefined) this.canvas.releasePointerCapture?.(event.pointerId);
    };
    this.canvas.addEventListener("pointerup", finishDrag);
    this.canvas.addEventListener("pointercancel", finishDrag);
    this.canvas.addEventListener("dblclick", event => {
      event.preventDefault();
      event.stopPropagation();
      this.resetUserView();
      this.applyUserView();
    });
  }

  resetUserView() {
    this.userView.zoom = 1;
    this.userView.yaw = 0;
    this.userView.pitch = 0;
  }

  applyUserView() {
    if (!this.baseCameraPosition || !this.baseCameraTarget) return;
    this.cameraTween = null;
    const offset = this.baseCameraPosition.clone().sub(this.baseCameraTarget);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta += this.userView.yaw;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi + this.userView.pitch, .28, 1.42);
    offset.setFromSpherical(spherical).multiplyScalar(this.userView.zoom);
    this.cameraTarget.copy(this.baseCameraTarget);
    this.camera.position.copy(this.baseCameraTarget).add(offset);
    this.camera.lookAt(this.cameraTarget);
    this.requestRender();
  }

  canRender() {
    return this.pageVisible && this.inViewport;
  }

  cancelRender() {
    if (!this.frame) return;
    cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  handleVisibility() {
    this.pageVisible = !document.hidden;
    if (this.pageVisible) this.requestRender();
    else this.cancelRender();
  }

  requestRender() {
    this.needsRender = true;
    if (!this.frame && this.canRender()) {
      this.frame = requestAnimationFrame(this.render);
    }
  }

  disposeGroup(group) {
    while (group.children.length) {
      const child = group.children.pop();
      child.traverse(object => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach(material => material.dispose?.());
        else object.material?.dispose?.();
        object.material?.map?.dispose?.();
      });
    }
  }

  clearGroup(group) {
    while (group.children.length) group.remove(group.children[0]);
  }

  activateCachedRegion(regionKey) {
    const cached = this.regionCache.get(regionKey);
    if (!cached) return false;
    this.clearGroup(this.worldGroup);
    this.worldGroup.add(cached);
    this.renderer.shadowMap.needsUpdate = true;
    return true;
  }

  cacheCurrentRegion(regionKey) {
    const cached = new THREE.Group();
    while (this.worldGroup.children.length) cached.add(this.worldGroup.children[0]);
    this.regionCache.set(regionKey, cached);
    this.worldGroup.add(cached);
    this.renderer.shadowMap.needsUpdate = true;
  }

  arrivalPoint(coordinate, radius = 14) {
    const longitude = THREE.MathUtils.degToRad(coordinate[0] - 105);
    const latitude = THREE.MathUtils.degToRad(coordinate[1]);
    const cosLatitude = Math.cos(latitude);
    return new THREE.Vector3(
      radius * cosLatitude * Math.sin(longitude),
      radius * Math.sin(latitude),
      radius * cosLatitude * Math.cos(longitude)
    );
  }

  createCloud(scale = 1) {
    const cloud = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0x315b55,
      emissiveIntensity: .18,
      roughness: .86,
      metalness: 0,
      transparent: true,
      opacity: .9
    });
    [
      [-.42, .02, 0, .42],
      [0, .16, 0, .58],
      [.48, .02, 0, .38],
      [.08, -.08, .16, .46]
    ].forEach(([x, y, z, size]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(size * scale, 18, 12), material);
      puff.position.set(x * scale, y * scale, z * scale);
      puff.castShadow = true;
      cloud.add(puff);
    });
    return cloud;
  }

  createArrivalMountain(coordinate, color, scale = 1) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.ConeGeometry(.42 * scale, 1.15 * scale, 8),
      new THREE.MeshStandardMaterial({ color, roughness: .9, flatShading: true })
    );
    base.position.y = .5 * scale;
    const snow = new THREE.Mesh(
      new THREE.ConeGeometry(.18 * scale, .38 * scale, 8),
      new THREE.MeshStandardMaterial({ color: 0xfff8e9, roughness: .82, flatShading: true })
    );
    snow.position.y = 1.04 * scale;
    group.add(base, snow);
    const point = this.arrivalPoint(coordinate, 14.08);
    group.position.copy(point);
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), point.clone().normalize());
    return group;
  }

  createArrivalMarker(coordinate, number, accent) {
    const group = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(.08, .1, .62, 12),
      new THREE.MeshStandardMaterial({ color: accent, roughness: .5 })
    );
    stem.position.y = .31;
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(.25, 18, 12),
      new THREE.MeshStandardMaterial({ color: 0xfff8e8, roughness: .4 })
    );
    head.position.y = .7;
    group.add(stem, head);

    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff8e8";
    context.beginPath();
    context.arc(64, 64, 52, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = `#${accent.toString(16).padStart(6, "0")}`;
    context.lineWidth = 10;
    context.stroke();
    context.fillStyle = "#12332e";
    context.font = "800 56px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(number).padStart(2, "0"), 64, 67);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const badge = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    }));
    badge.position.set(number === 1 ? -.32 : .32, 1.16, 0);
    badge.scale.set(.72, .72, 1);
    badge.renderOrder = 25;
    group.add(badge);

    const point = this.arrivalPoint(coordinate, 14.38);
    group.position.copy(point);
    group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), point.clone().normalize());
    return group;
  }

  orientArrivalVehicle(vehicle, tangent, point) {
    const up = point.clone().normalize();
    const forward = tangent.clone().projectOnPlane(up).normalize();
    const side = forward.clone().cross(up).normalize();
    const correctedUp = side.clone().cross(forward).normalize();
    vehicle.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(forward, correctedUp, side));
  }

  async buildArrivalGlobe() {
    this.currentRegion = "arrival";
    document.querySelector("#terrain-loading")?.classList.remove("ready");
    if (this.activateCachedRegion("arrival")) {
      this.setProgress(76, "正在恢复亚太微缩行星");
      return;
    }
    this.setProgress(36, "正在生成亚太微缩行星");
    await new Promise(resolve => requestAnimationFrame(resolve));
    this.clearGroup(this.worldGroup);

    const ocean = new THREE.Mesh(
      new THREE.SphereGeometry(14, 96, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0x087489,
        emissive: 0x003d4e,
        emissiveIntensity: .34,
        roughness: .22,
        metalness: .08,
        clearcoat: .82,
        clearcoatRoughness: .2
      })
    );
    ocean.receiveShadow = true;
    this.worldGroup.add(ocean);

    const grid = new THREE.Mesh(
      new THREE.SphereGeometry(14.05, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x62edff,
        wireframe: true,
        transparent: true,
        opacity: .025,
        depthWrite: false
      })
    );
    this.worldGroup.add(grid);

    const landCoordinates = [];
    for (let latitude = -55; latitude <= 70; latitude += 2) {
      for (let longitude = 18; longitude <= 182; longitude += 2) {
        if (window.d3.geoContains(this.land, [longitude, latitude])) {
          landCoordinates.push([longitude, latitude]);
        }
      }
    }
    const tileGeometry = new THREE.CircleGeometry(.265, 7);
    const landTiles = new THREE.InstancedMesh(
      tileGeometry,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .88, metalness: 0 }),
      landCoordinates.length
    );
    const palette = [0x7fcf32, 0x5fb52e, 0xa5d841, 0x40972b, 0x86c93a];
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);
    landCoordinates.forEach((coordinate, index) => {
      const point = this.arrivalPoint(coordinate, 14.13);
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), point.clone().normalize());
      matrix.compose(point, quaternion, scale);
      landTiles.setMatrixAt(index, matrix);
      const paletteIndex = Math.abs(Math.floor(coordinate[0] / 24) + Math.floor(coordinate[1] / 18)) % palette.length;
      landTiles.setColorAt(index, new THREE.Color(palette[paletteIndex]));
    });
    landTiles.instanceMatrix.needsUpdate = true;
    if (landTiles.instanceColor) landTiles.instanceColor.needsUpdate = true;
    landTiles.castShadow = true;
    landTiles.receiveShadow = true;
    this.worldGroup.add(landTiles);

    [
      [[86, 30], 0x607b37, 1.2],
      [[138, 36], 0x4c8d38, .72],
      [[113, -8], 0x397c34, .82],
      [[147, -6], 0x4a8735, .7]
    ].forEach(([coordinate, color, mountainScale]) => {
      this.worldGroup.add(this.createArrivalMountain(coordinate, color, mountainScale));
    });
    this.worldGroup.add(this.createArrivalForest());

    [
      [[54, 8], 1.05],
      [[151, 21], .9],
      [[128, -31], .82],
      [[75, -37], .7]
    ].forEach(([coordinate, cloudScale]) => {
      const cloud = this.createCloud(cloudScale);
      const point = this.arrivalPoint(coordinate, 15.1);
      cloud.position.copy(point);
      cloud.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), point.clone().normalize());
      this.worldGroup.add(cloud);
    });

    this.worldGroup.add(this.createAtmosphere(14.72, 0, 0x22dcff));
    this.cacheCurrentRegion("arrival");
    this.setProgress(76, "正在绘制上海至泗水航线");
  }

  createArrivalForest() {
    const coordinates = [];
    for (let latitude = -42; latitude <= 56; latitude += 6) {
      for (let longitude = 28; longitude <= 166; longitude += 6) {
        const variation = Math.abs(Math.sin(longitude * 12.71 + latitude * 8.17));
        if (variation > .42 && window.d3.geoContains(this.land, [longitude, latitude])) {
          coordinates.push([longitude, latitude, .7 + variation * .55]);
        }
      }
    }
    const group = new THREE.Group();
    const trunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(.035, .05, .25, 5),
      new THREE.MeshStandardMaterial({ color: 0x60482e, roughness: .96 }),
      coordinates.length
    );
    const crownMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x0b2c10,
      emissiveIntensity: .13,
      roughness: .88,
      flatShading: true
    });
    const lowerCrowns = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(.13, 1),
      crownMaterial,
      coordinates.length
    );
    const upperCrowns = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(.1, 1),
      crownMaterial.clone(),
      coordinates.length
    );
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const unitY = new THREE.Vector3(0, 1, 0);
    const palette = [0x2f8d36, 0x4ca33a, 0x69b443, 0x388f43];
    coordinates.forEach(([longitude, latitude, treeScale], index) => {
      const base = this.arrivalPoint([longitude, latitude], 14.14);
      const normal = base.clone().normalize();
      quaternion.setFromUnitVectors(unitY, normal);
      matrix.compose(
        base.clone().add(normal.clone().multiplyScalar(.11 * treeScale)),
        quaternion,
        new THREE.Vector3(treeScale, treeScale, treeScale)
      );
      trunks.setMatrixAt(index, matrix);
      matrix.compose(
        base.clone().add(normal.clone().multiplyScalar(.28 * treeScale)),
        quaternion,
        new THREE.Vector3(treeScale * 1.08, treeScale * .86, treeScale)
      );
      lowerCrowns.setMatrixAt(index, matrix);
      matrix.compose(
        base.clone().add(normal.clone().multiplyScalar(.39 * treeScale)),
        quaternion,
        new THREE.Vector3(treeScale * .82, treeScale * .78, treeScale * .86)
      );
      upperCrowns.setMatrixAt(index, matrix);
      const color = new THREE.Color(palette[index % palette.length]);
      lowerCrowns.setColorAt(index, color);
      upperCrowns.setColorAt(index, color.clone().offsetHSL(.015, -.03, .045));
    });
    [trunks, lowerCrowns, upperCrowns].forEach(mesh => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = mesh === lowerCrowns;
    });
    if (lowerCrowns.instanceColor) lowerCrowns.instanceColor.needsUpdate = true;
    if (upperCrowns.instanceColor) upperCrowns.instanceColor.needsUpdate = true;
    group.add(trunks, lowerCrowns, upperCrowns);
    return group;
  }

  buildArrivalRoute() {
    this.clearGroup(this.routeGroup);
    const cached = this.dayRouteCache.get("arrival");
    if (cached) {
      this.routeGroup.add(cached);
      return;
    }
    const routeScene = new THREE.Group();
    const start = this.arrivalPoint([121.81, 31.15], 1).normalize();
    const end = this.arrivalPoint([112.79, -7.38], 1).normalize();
    const axis = start.clone().cross(end).normalize();
    const angle = start.angleTo(end);
    const points = [];
    for (let index = 0; index <= 80; index += 1) {
      const t = index / 80;
      const radius = 14.52 + Math.sin(Math.PI * t) * 2.45;
      points.push(start.clone().applyAxisAngle(axis, angle * t).multiplyScalar(radius));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const route = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 96, .095, 8, false),
      new THREE.MeshStandardMaterial({
        color: 0xffb04f,
        emissive: 0xff8844,
        emissiveIntensity: .28,
        roughness: .45
      })
    );
    routeScene.add(route);
    routeScene.add(
      this.createArrivalMarker([121.81, 31.15], 1, 0xff7867),
      this.createArrivalMarker([112.79, -7.38], 2, 0xff7867)
    );
    const plane = this.createPlane(0xffb04f);
    const planePoint = curve.getPoint(.58);
    const tangent = curve.getTangent(.585);
    plane.position.copy(planePoint);
    plane.scale.multiplyScalar(.92);
    this.orientArrivalVehicle(plane, tangent, planePoint);
    routeScene.add(plane);
    this.dayRouteCache.set("arrival", routeScene);
    this.routeGroup.add(routeScene);
    this.renderer.shadowMap.needsUpdate = true;
  }

  focusArrivalGlobe(instant = false, resetInteraction = true) {
    const target = new THREE.Vector3(0, 0, 0);
    const distance = this.camera.aspect < .8 ? 55 : 48;
    const position = new THREE.Vector3(0, 3.2, distance);
    if (resetInteraction) this.resetUserView();
    this.baseCameraPosition = position.clone();
    this.baseCameraTarget = target.clone();
    if (!resetInteraction && (
      this.userView.zoom !== 1 ||
      this.userView.yaw !== 0 ||
      this.userView.pitch !== 0
    )) {
      this.applyUserView();
      return;
    }
    this.setCameraTween(position, target, instant ? 1 : 900);
  }

  regionScale(config) {
    const [minLon, maxLon, minLat, maxLat] = config.bounds;
    const latitude = (minLat + maxLat) / 2;
    const lonWidth = (maxLon - minLon) * Math.cos(THREE.MathUtils.degToRad(latitude));
    return 31 / Math.max(lonWidth, maxLat - minLat);
  }

  toLocal(coordinate, config = REGION_CONFIG[this.currentRegion]) {
    const [minLon, maxLon, minLat, maxLat] = config.bounds;
    const centerLon = (minLon + maxLon) / 2;
    const centerLat = (minLat + maxLat) / 2;
    const scale = this.regionScale(config);
    const x = (coordinate[0] - centerLon) * Math.cos(THREE.MathUtils.degToRad(centerLat)) * scale;
    const z = -(coordinate[1] - centerLat) * scale;
    return new THREE.Vector3(x, 0, z);
  }

  surfaceY(x, z) {
    const radial = Math.min(GLOBE_RADIUS - .02, Math.hypot(x, z));
    return GLOBE_CENTER_Y + Math.sqrt(Math.max(.01, GLOBE_RADIUS ** 2 - radial ** 2));
  }

  surfacePoint(coordinate, altitude = 0, config = REGION_CONFIG[this.currentRegion]) {
    const point = this.toLocal(coordinate, config);
    point.y = this.surfaceY(point.x, point.z) + altitude;
    return point;
  }

  terrainPoint(coordinate, extra = 0, config = REGION_CONFIG[this.currentRegion]) {
    return this.surfacePoint(coordinate, this.heightAt(coordinate, config) * TERRAIN_RELIEF + extra, config);
  }

  surfaceNormal(point) {
    return new THREE.Vector3(point.x, point.y - GLOBE_CENTER_Y, point.z).normalize();
  }

  alignToSurface(object, point) {
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.surfaceNormal(point));
    return object;
  }

  heightAt(coordinate, config = REGION_CONFIG[this.currentRegion]) {
    const [lon, lat] = coordinate;
    let height = .26;
    const noise = (
      Math.sin(lon * 91.7 + lat * 37.1) +
      Math.sin(lon * 43.3 - lat * 77.9) +
      Math.cos(lon * 129.1 + lat * 25.6)
    ) / 3;
    height += Math.max(0, noise) * .32;

    config.peaks.forEach(peak => {
      const dx = (lon - peak.coord[0]) * Math.cos(THREE.MathUtils.degToRad(lat));
      const dy = lat - peak.coord[1];
      const distanceSquared = dx * dx + dy * dy;
      height += peak.height * Math.exp(-distanceSquared / (2 * peak.width * peak.width));
    });
    return height;
  }

  colorForHeight(height) {
    if (height < .34) return new THREE.Color(0xd8d07a);
    if (height < 1.1) return new THREE.Color(0x79c62d);
    if (height < 2.7) return new THREE.Color(0x4d9e2e);
    if (height < 4.8) return new THREE.Color(0x526f36);
    return new THREE.Color(0x8d9270);
  }

  isLand(coordinate, config) {
    if (window.d3.geoContains(this.indonesia, coordinate)) return true;
    return (config.landPatches || []).some(patch => {
      const dx = coordinate[0] - patch.center[0];
      const dy = coordinate[1] - patch.center[1];
      const cos = Math.cos(patch.rotation || 0);
      const sin = Math.sin(patch.rotation || 0);
      const x = dx * cos - dy * sin;
      const y = dx * sin + dy * cos;
      return (x * x) / (patch.radius[0] ** 2) + (y * y) / (patch.radius[1] ** 2) <= 1;
    });
  }

  visibleTerrainEntries(day) {
    const config = REGION_CONFIG[day.region];
    const [minLon, maxLon, minLat, maxLat] = config.bounds;
    const padding = .12;
    return day.terrainStops
      .map((stop, index) => ({ stop, index }))
      .filter(({ stop }) => (
        stop.coord[0] >= minLon - padding &&
        stop.coord[0] <= maxLon + padding &&
        stop.coord[1] >= minLat - padding &&
        stop.coord[1] <= maxLat + padding
      ));
  }

  buildTerrainGeometry(config) {
    const [minLon, maxLon, minLat, maxLat] = config.bounds;
    const nx = 96;
    const ny = Math.max(68, Math.round(nx * (maxLat - minLat) / (maxLon - minLon)));
    const positions = [];
    const colors = [];

    const addTriangle = coordinates => {
      const center = [
        (coordinates[0][0] + coordinates[1][0] + coordinates[2][0]) / 3,
        (coordinates[0][1] + coordinates[1][1] + coordinates[2][1]) / 3
      ];
      if (!this.isLand(center, config)) return;
      coordinates.forEach(coordinate => {
        const height = this.heightAt(coordinate, config);
        const point = this.surfacePoint(coordinate, height * TERRAIN_RELIEF, config);
        positions.push(point.x, point.y, point.z);
        const color = this.colorForHeight(height);
        const grassGrain = Math.sin(coordinate[0] * 91.7 + coordinate[1] * 137.3) * .5
          + Math.sin(coordinate[0] * 211.1 - coordinate[1] * 73.9) * .25;
        color.offsetHSL(grassGrain * .006, grassGrain * .018, grassGrain * .035);
        colors.push(color.r, color.g, color.b);
      });
    };

    for (let y = 0; y < ny; y += 1) {
      const lat0 = minLat + (maxLat - minLat) * (y / ny);
      const lat1 = minLat + (maxLat - minLat) * ((y + 1) / ny);
      for (let x = 0; x < nx; x += 1) {
        const lon0 = minLon + (maxLon - minLon) * (x / nx);
        const lon1 = minLon + (maxLon - minLon) * ((x + 1) / nx);
        addTriangle([[lon0, lat0], [lon1, lat0], [lon1, lat1]]);
        addTriangle([[lon0, lat0], [lon1, lat1], [lon0, lat1]]);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
  }

  createGlobe(config) {
    const globe = new THREE.Group();
    const oceanMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x08778d,
      emissive: 0x003a49,
      emissiveIntensity: .38,
      roughness: .2,
      metalness: .08,
      transparent: true,
      opacity: .98,
      clearcoat: .85,
      clearcoatRoughness: .18
    });

    const ocean = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 96, 64), oceanMaterial);
    ocean.position.y = GLOBE_CENTER_Y;
    ocean.receiveShadow = true;
    globe.add(ocean);

    const grid = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS + .06, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x6aefff,
        wireframe: true,
        transparent: true,
        opacity: .022,
        depthWrite: false
      })
    );
    grid.position.y = GLOBE_CENTER_Y;
    globe.add(grid);

    globe.add(
      this.createAtmosphere(GLOBE_RADIUS + .76, GLOBE_CENTER_Y, 0x21ddff),
      this.createAtmosphere(GLOBE_RADIUS + .34, GLOBE_CENTER_Y, 0x3ef3e2, .28)
    );
    return globe;
  }

  createTree(scale = 1) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(.06 * scale, .09 * scale, .65 * scale, 7),
      new THREE.MeshStandardMaterial({ color: 0x76543c, roughness: .9 })
    );
    trunk.position.y = .32 * scale;
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(.34 * scale, .9 * scale, 9),
      new THREE.MeshStandardMaterial({ color: 0x4d8756, roughness: .86 })
    );
    crown.position.y = 1.05 * scale;
    crown.castShadow = true;
    tree.add(trunk, crown);
    return tree;
  }

  createForest(config) {
    const entries = [];
    config.forests.forEach((coordinate, forestIndex) => {
      for (let index = 0; index < 16; index += 1) {
        const angle = index * 2.399 + forestIndex * .83;
        const radius = .16 + Math.sqrt((index + .5) / 16) * .82;
        const scale = .42 + ((index * 7 + forestIndex * 3) % 9) * .032;
        const coord = [
          coordinate[0] + Math.cos(angle) * radius / this.regionScale(config),
          coordinate[1] + Math.sin(angle) * radius / this.regionScale(config)
        ];
        if (this.isLand(coord, config) && this.heightAt(coord, config) < 1.45) {
          entries.push({ coord, scale, angle });
        }
      }
    });

    const group = new THREE.Group();
    const trunkGeometry = new THREE.CylinderGeometry(.045, .075, .46, 6);
    const crownGeometry = new THREE.IcosahedronGeometry(.28, 1);
    const upperCrownGeometry = new THREE.IcosahedronGeometry(.23, 1);
    const sideCrownGeometry = new THREE.IcosahedronGeometry(.18, 1);
    const trunks = new THREE.InstancedMesh(
      trunkGeometry,
      new THREE.MeshStandardMaterial({ color: 0x6f4d2e, roughness: .95 }),
      entries.length
    );
    const crownMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x092e0d,
      emissiveIntensity: .14,
      roughness: .86,
      flatShading: true
    });
    const lowerCrowns = new THREE.InstancedMesh(
      crownGeometry,
      crownMaterial,
      entries.length
    );
    const upperCrowns = new THREE.InstancedMesh(
      upperCrownGeometry,
      crownMaterial.clone(),
      entries.length
    );
    const sideCrowns = new THREE.InstancedMesh(
      sideCrownGeometry,
      crownMaterial.clone(),
      entries.length
    );
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const unitY = new THREE.Vector3(0, 1, 0);
    const treePalette = [0x277e31, 0x34923a, 0x4ca33b, 0x5bad3f, 0x3f9348];
    entries.forEach(({ coord, scale, angle }, index) => {
      const base = this.terrainPoint(coord, .02, config);
      const normal = this.surfaceNormal(base);
      quaternion.setFromUnitVectors(unitY, normal);
      matrix.compose(
        base.clone().add(normal.clone().multiplyScalar(.24 * scale)),
        quaternion,
        new THREE.Vector3(scale, scale, scale)
      );
      trunks.setMatrixAt(index, matrix);
      matrix.compose(
        base.clone().add(normal.clone().multiplyScalar(.7 * scale)),
        quaternion,
        new THREE.Vector3(scale * 1.06, scale * .88, scale)
      );
      lowerCrowns.setMatrixAt(index, matrix);
      matrix.compose(
        base.clone().add(normal.clone().multiplyScalar(.97 * scale)),
        quaternion,
        new THREE.Vector3(scale * .78, scale * .72, scale * .82)
      );
      upperCrowns.setMatrixAt(index, matrix);
      const localOffset = new THREE.Vector3(
        Math.cos(angle) * .18 * scale,
        .73 * scale,
        Math.sin(angle) * .18 * scale
      ).applyQuaternion(quaternion);
      matrix.compose(
        base.clone().add(localOffset),
        quaternion,
        new THREE.Vector3(scale * .68, scale * .62, scale * .72)
      );
      sideCrowns.setMatrixAt(index, matrix);
      const color = new THREE.Color(treePalette[(index + Math.floor(angle * 3)) % treePalette.length]);
      lowerCrowns.setColorAt(index, color);
      upperCrowns.setColorAt(index, color.clone().offsetHSL(.012, -.02, .045));
      sideCrowns.setColorAt(index, color.clone().offsetHSL(-.012, .02, -.025));
    });
    [trunks, lowerCrowns, upperCrowns, sideCrowns].forEach(mesh => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = mesh === lowerCrowns;
    });
    [lowerCrowns, upperCrowns, sideCrowns].forEach(mesh => {
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });
    group.add(trunks, lowerCrowns, upperCrowns, sideCrowns);
    return group;
  }

  createGrassTuftGeometry() {
    const positions = [];
    const bladeCount = 5;
    for (let index = 0; index < bladeCount; index += 1) {
      const angle = index * Math.PI / bladeCount;
      const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      const side = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(.026);
      const base = direction.clone().multiplyScalar((index % 2) * .018);
      const tip = base.clone()
        .add(direction.clone().multiplyScalar(.035 + index * .006))
        .add(new THREE.Vector3(0, .2 + (index % 3) * .035, 0));
      positions.push(
        base.x - side.x, 0, base.z - side.z,
        base.x + side.x, 0, base.z + side.z,
        tip.x, tip.y, tip.z
      );
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
  }

  createSurfaceDetails(config) {
    const [minLon, maxLon, minLat, maxLat] = config.bounds;
    const regionSeed = Math.round((minLon + maxLon) * 1000 + (minLat + maxLat) * 10000);
    const random = seededRandom(Math.abs(regionSeed));
    const entries = [];
    const targetCount = 700;
    for (let attempt = 0; attempt < 4600 && entries.length < targetCount; attempt += 1) {
      const coord = [
        THREE.MathUtils.lerp(minLon, maxLon, .025 + random() * .95),
        THREE.MathUtils.lerp(minLat, maxLat, .025 + random() * .95)
      ];
      if (!this.isLand(coord, config)) continue;
      const height = this.heightAt(coord, config);
      if (height > 1.55 || (height > .85 && random() < .68)) continue;
      entries.push({
        coord,
        height,
        scale: .55 + random() * .9,
        rotation: random() * Math.PI * 2,
        kind: random()
      });
    }

    const groundEntries = entries.slice(0, 260);
    const grassEntries = entries.slice(60, 500);
    const shrubEntries = entries.filter(entry => entry.kind > .82).slice(0, 48);
    const flowerEntries = entries.filter(entry => entry.kind > .5 && entry.kind < .66).slice(0, 78);
    const flowerHeadsEntries = flowerEntries.flatMap(entry => (
      [0, 1, 2].map(petal => ({ ...entry, petal }))
    ));
    const rockEntries = entries.filter(entry => entry.kind < .085).slice(0, 34);
    const group = new THREE.Group();
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const unitY = new THREE.Vector3(0, 1, 0);

    const placeInstances = (mesh, instanceEntries, buildTransform, palette) => {
      instanceEntries.forEach((entry, index) => {
        const base = this.terrainPoint(entry.coord, .025, config);
        const normal = this.surfaceNormal(base);
        quaternion.setFromUnitVectors(unitY, normal);
        buildTransform(entry, base, normal, quaternion, matrix);
        mesh.setMatrixAt(index, matrix);
        if (palette) {
          const color = new THREE.Color(palette[Math.floor(entry.kind * palette.length) % palette.length]);
          mesh.setColorAt(index, color);
        }
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      group.add(mesh);
    };

    const groundGeometry = new THREE.CircleGeometry(.2, 7);
    groundGeometry.rotateX(-Math.PI / 2);
    const groundFlecks = new THREE.InstancedMesh(
      groundGeometry,
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: .95,
        transparent: true,
        opacity: .28,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1
      }),
      groundEntries.length
    );
    placeInstances(groundFlecks, groundEntries, (entry, base, normal, orientation, transform) => {
      const rotation = orientation.clone().multiply(
        new THREE.Quaternion().setFromAxisAngle(unitY, entry.rotation)
      );
      transform.compose(
        base.clone().add(normal.clone().multiplyScalar(.015)),
        rotation,
        new THREE.Vector3(entry.scale * (1.3 + entry.kind), 1, entry.scale * (.55 + entry.kind * .4))
      );
    }, [0x86ca35, 0xa1d845, 0x69b537, 0xb4d74e, 0x5ca13a]);

    const grassTufts = new THREE.InstancedMesh(
      this.createGrassTuftGeometry(),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x15350d,
        emissiveIntensity: .08,
        roughness: .94,
        flatShading: true,
        side: THREE.DoubleSide
      }),
      grassEntries.length
    );
    placeInstances(grassTufts, grassEntries, (entry, base, normal, orientation, transform) => {
      const rotation = orientation.clone().multiply(
        new THREE.Quaternion().setFromAxisAngle(unitY, entry.rotation)
      );
      transform.compose(
        base.clone().add(normal.clone().multiplyScalar(.075 * entry.scale)),
        rotation,
        new THREE.Vector3(entry.scale * (.75 + entry.kind * .5), entry.scale, entry.scale * (.75 + entry.kind * .35))
      );
    }, [0x4c992e, 0x61ad31, 0x7abe37, 0x8dca3e, 0x3f8830]);

    const shrubs = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(.18, 1),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x0b2b0c,
        emissiveIntensity: .12,
        roughness: .9,
        flatShading: true
      }),
      shrubEntries.length
    );
    placeInstances(shrubs, shrubEntries, (entry, base, normal, orientation, transform) => {
      transform.compose(
        base.clone().add(normal.clone().multiplyScalar(.13 * entry.scale)),
        orientation,
        new THREE.Vector3(entry.scale * (.72 + entry.kind * .25), entry.scale * .48, entry.scale * .68)
      );
    }, [0x2f8131, 0x46943a, 0x57a642, 0x397a39]);

    const flowerHeads = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(.045, 0),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x9d5f00,
        emissiveIntensity: .22,
        roughness: .72,
        flatShading: true
      }),
      flowerHeadsEntries.length
    );
    placeInstances(flowerHeads, flowerHeadsEntries, (entry, base, normal, orientation, transform) => {
      const flowerAngle = entry.rotation + entry.petal * 2.094;
      const tangentOffset = new THREE.Vector3(
        Math.cos(flowerAngle) * (.035 + entry.petal * .012),
        .13 + entry.kind * .08 + entry.petal * .014,
        Math.sin(flowerAngle) * (.035 + entry.petal * .012)
      ).applyQuaternion(orientation);
      transform.compose(
        base.clone().add(tangentOffset),
        orientation,
        new THREE.Vector3(entry.scale * (1.2 + entry.kind), entry.scale, entry.scale * 1.2)
      );
    }, [0xffc928, 0xffdc3e, 0xf6ad1c, 0xffe66a]);

    const rocks = new THREE.InstancedMesh(
      new THREE.DodecahedronGeometry(.15, 0),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: .98,
        metalness: .02,
        flatShading: true
      }),
      rockEntries.length
    );
    placeInstances(rocks, rockEntries, (entry, base, normal, orientation, transform) => {
      const rotation = orientation.clone().multiply(
        new THREE.Quaternion().setFromAxisAngle(unitY, entry.rotation)
      );
      transform.compose(
        base.clone().add(normal.clone().multiplyScalar(.08 * entry.scale)),
        rotation,
        new THREE.Vector3(entry.scale * (1.2 + entry.kind * 2), entry.scale * .62, entry.scale)
      );
    }, [0x667168, 0x7a826d, 0x525f58, 0x8b886f]);
    rocks.castShadow = true;
    rocks.receiveShadow = true;
    return group;
  }

  createWetlands(config) {
    const [minLon, maxLon, minLat, maxLat] = config.bounds;
    const random = seededRandom(Math.abs(Math.round(minLon * 8701 + minLat * 1297)));
    const channelCandidates = [];
    const geoLength = Math.min(maxLon - minLon, maxLat - minLat) * .34;
    for (let attempt = 0; attempt < 110; attempt += 1) {
      const center = [
        THREE.MathUtils.lerp(minLon, maxLon, .08 + random() * .84),
        THREE.MathUtils.lerp(minLat, maxLat, .08 + random() * .84)
      ];
      if (!this.isLand(center, config) || this.heightAt(center, config) > 1.05) continue;
      const angle = (random() - .5) * 1.05;
      const bend = .055 + random() * .055;
      let run = [];
      let longestRun = [];
      for (let index = 0; index < 29; index += 1) {
        const t = index / 28 - .5;
        const meander = Math.sin(t * Math.PI * 3 + attempt) * bend;
        const coord = [
          center[0] + Math.cos(angle) * geoLength * t - Math.sin(angle) * meander,
          center[1] + Math.sin(angle) * geoLength * t + Math.cos(angle) * meander
        ];
        if (this.isLand(coord, config) && this.heightAt(coord, config) < 1.25) {
          run.push(coord);
          if (run.length > longestRun.length) longestRun = run.slice();
        } else {
          run = [];
        }
      }
      if (longestRun.length >= 13) {
        channelCandidates.push(longestRun);
        if (channelCandidates.length >= 2) break;
      }
    }

    const group = new THREE.Group();
    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x62dbe1,
      emissive: 0x0b8b9a,
      emissiveIntensity: .25,
      roughness: .18,
      metalness: .02,
      transparent: true,
      opacity: .72,
      clearcoat: .9,
      clearcoatRoughness: .16,
      depthWrite: false
    });
    const glintMaterial = new THREE.MeshBasicMaterial({
      color: 0xc8ffff,
      transparent: true,
      opacity: .48,
      depthWrite: false
    });
    channelCandidates.forEach((coordinates, index) => {
      const points = coordinates.map(coord => this.terrainPoint(coord, .065 + index * .006, config));
      const curve = new THREE.CatmullRomCurve3(points);
      const channel = new THREE.Mesh(
        new THREE.TubeGeometry(curve, points.length * 3, .105 + index * .018, 7, false),
        waterMaterial
      );
      channel.renderOrder = 5;
      const glint = new THREE.Mesh(
        new THREE.TubeGeometry(curve, points.length * 3, .022, 5, false),
        glintMaterial
      );
      glint.renderOrder = 6;
      group.add(channel, glint);
    });
    return group;
  }

  createBeach(beach, config) {
    const point = this.surfacePoint(beach.coord, .12, config);
    const geometry = new THREE.CircleGeometry(beach.scale, 32);
    geometry.rotateX(-Math.PI / 2);
    const beachMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: beach.color, roughness: .82, depthTest: false })
    );
    beachMesh.position.copy(point);
    this.alignToSurface(beachMesh, point);
    beachMesh.renderOrder = 4;
    beachMesh.receiveShadow = true;
    return beachMesh;
  }

  createVolcanoCrater(peak, config) {
    const point = this.terrainPoint(peak.coord, .03, config);
    const geometry = new THREE.TorusGeometry(.32, .09, 8, 24);
    geometry.rotateX(Math.PI / 2);
    const crater = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color: 0x5f4338, roughness: .95 })
    );
    crater.position.copy(point);
    this.alignToSurface(crater, point);
    crater.castShadow = true;
    return crater;
  }

  async buildRegion(regionKey) {
    const config = REGION_CONFIG[regionKey];
    this.currentRegion = regionKey;
    document.querySelector("#terrain-stage")?.classList.add("building");
    document.querySelector("#terrain-loading")?.classList.remove("ready");
    if (this.activateCachedRegion(regionKey)) {
      this.setProgress(82, `正在恢复${config.name}行星地貌`);
      document.querySelector("#terrain-stage")?.classList.remove("building");
      return;
    }
    this.setProgress(38, `正在生成${config.name}行星地貌`);
    await new Promise(resolve => requestAnimationFrame(resolve));

    this.clearGroup(this.worldGroup);
    this.worldGroup.add(this.createGlobe(config));

    this.setProgress(58, `正在抬升${config.name}山脉与植被`);
    const terrain = new THREE.Mesh(
      this.buildTerrainGeometry(config),
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        emissive: 0x102d0d,
        emissiveIntensity: .13,
        roughness: .78,
        metalness: .01,
        flatShading: true,
        side: THREE.DoubleSide
      })
    );
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    this.worldGroup.add(terrain);

    config.peaks.filter(peak => peak.volcano).forEach(peak => {
      this.worldGroup.add(this.createVolcanoCrater(peak, config));
    });
    config.beaches.forEach(beach => this.worldGroup.add(this.createBeach(beach, config)));

    this.worldGroup.add(
      this.createSurfaceDetails(config),
      this.createForest(config),
      this.createWetlands(config)
    );

    const [minLon, maxLon, minLat, maxLat] = config.bounds;
    [
      [minLon + (maxLon - minLon) * .2, minLat + (maxLat - minLat) * .26],
      [minLon + (maxLon - minLon) * .78, minLat + (maxLat - minLat) * .7]
    ].forEach((coordinate, index) => {
      const cloud = this.createCloud(index ? .62 : .76);
      const point = this.surfacePoint(coordinate, 3.15 + index * .4, config);
      cloud.position.copy(point);
      this.alignToSurface(cloud, point);
      this.worldGroup.add(cloud);
    });

    this.worldGroup.rotation.y = 0;
    this.cacheCurrentRegion(regionKey);
    this.setProgress(82, "正在放置景点与交通路线");
    document.querySelector("#terrain-stage")?.classList.remove("building");
  }

  createLabel(text, accent) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 144;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(7,31,29,.9)";
    ctx.beginPath();
    ctx.roundRect(8, 8, 624, 128, 34);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = "#fffaf0";
    ctx.font = "700 42px Noto Sans SC, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const copy = text.length > 16 ? `${text.slice(0, 15)}…` : text;
    ctx.fillText(copy, 320, 76);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
    sprite.scale.set(2.9, .66, 1);
    return sprite;
  }

  createPhotoCard(photo, coordinate, index) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    const drawFrame = image => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(7,31,29,.94)";
      ctx.beginPath();
      ctx.roundRect(6, 6, 628, 408, 30);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(18, 18, 604, 310, 22);
      ctx.clip();
      if (image) {
        const ratio = Math.max(604 / image.width, 310 / image.height);
        const width = image.width * ratio;
        const height = image.height * ratio;
        ctx.drawImage(image, 320 - width / 2, 173 - height / 2, width, height);
      } else {
        const gradient = ctx.createLinearGradient(18, 18, 622, 328);
        gradient.addColorStop(0, "#5fb8c2");
        gradient.addColorStop(1, "#153f39");
        ctx.fillStyle = gradient;
        ctx.fillRect(18, 18, 604, 310);
      }
      ctx.restore();
      ctx.strokeStyle = index ? "#c3a7ff" : "#fff0d1";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(9, 9, 622, 402, 28);
      ctx.stroke();
      ctx.fillStyle = "#fff9ec";
      ctx.font = "700 32px Noto Sans SC, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const caption = photo[1].length > 27 ? `${photo[1].slice(0, 26)}…` : photo[1];
      ctx.fillText(caption, 30, 370);
    };
    drawFrame(null);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    }));
    sprite.scale.set(3.65, 2.4, 1);
    sprite.renderOrder = 30;

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      drawFrame(image);
      texture.needsUpdate = true;
      this.requestRender();
    };
    image.src = photo[0];

    const anchor = this.terrainPoint(coordinate, .28);
    const normal = this.surfaceNormal(anchor);
    const cardPosition = anchor.clone()
      .add(normal.multiplyScalar(3 + index * .2))
      .add(new THREE.Vector3(index ? 4.8 : -4.8, index ? 1 : 3.2, index ? -.1 : .2));
    sprite.position.copy(cardPosition);

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      anchor.clone().add(this.surfaceNormal(anchor).multiplyScalar(.4)),
      cardPosition
    ]);
    const line = new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: index ? 0xc3a7ff : 0xfff0d1,
        transparent: true,
        opacity: .68,
        depthTest: false
      })
    );
    line.renderOrder = 29;
    const group = new THREE.Group();
    group.add(line, sprite);
    return group;
  }

  createMarker(number, coordinate, accent) {
    const point = this.terrainPoint(coordinate, .08);
    const group = new THREE.Group();
    const pin = new THREE.Mesh(
      new THREE.CylinderGeometry(.15, .15, .72, 14),
      new THREE.MeshStandardMaterial({ color: accent, roughness: .55 })
    );
    pin.position.y = .36;
    pin.castShadow = true;
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(.35, 18, 12),
      new THREE.MeshStandardMaterial({ color: 0xfff5df, roughness: .5 })
    );
    head.position.y = .84;
    head.castShadow = true;
    const badgeCanvas = document.createElement("canvas");
    badgeCanvas.width = 128;
    badgeCanvas.height = 128;
    const badgeContext = badgeCanvas.getContext("2d");
    badgeContext.fillStyle = "#fff8e8";
    badgeContext.beginPath();
    badgeContext.arc(64, 64, 52, 0, Math.PI * 2);
    badgeContext.fill();
    badgeContext.strokeStyle = `#${accent.toString(16).padStart(6, "0")}`;
    badgeContext.lineWidth = 10;
    badgeContext.stroke();
    badgeContext.fillStyle = "#12332e";
    badgeContext.font = "800 54px sans-serif";
    badgeContext.textAlign = "center";
    badgeContext.textBaseline = "middle";
    badgeContext.fillText(String(number).padStart(2, "0"), 64, 67);
    const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
    badgeTexture.colorSpace = THREE.SRGBColorSpace;
    const badge = new THREE.Sprite(new THREE.SpriteMaterial({
      map: badgeTexture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    }));
    badge.position.set(number % 2 ? -.38 : .38, 1.35 + (number % 3) * .12, 0);
    badge.scale.set(.72, .72, 1);
    badge.renderOrder = 25;
    group.position.copy(point);
    this.alignToSurface(group, point);
    group.userData.number = number;
    group.add(pin, head, badge);
    return group;
  }

  routePoints(fromStop, toStop, mode) {
    const points = [];
    const samples = 56;
    for (let index = 0; index <= samples; index += 1) {
      const t = index / samples;
      const coord = [
        THREE.MathUtils.lerp(fromStop.coord[0], toStop.coord[0], t),
        THREE.MathUtils.lerp(fromStop.coord[1], toStop.coord[1], t)
      ];
      let point;
      if (mode === "flight") {
        point = this.surfacePoint(coord, 1.45 + Math.sin(Math.PI * t) * 5.8);
      } else if (mode === "boat" || mode === "ferry" || mode === "speedboat") {
        point = this.surfacePoint(coord, .2);
      } else {
        point = this.terrainPoint(coord, .3);
      }
      points.push(point);
    }
    return points;
  }

  createRouteSegment(fromStop, toStop, mode, color) {
    const points = this.routePoints(fromStop, toStop, mode);
    if (mode === "road" || mode === "jeep" || mode === "atv" || mode === "walk") {
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.Mesh(
        new THREE.TubeGeometry(curve, 70, mode === "walk" ? .055 : .09, 7, false),
        new THREE.MeshStandardMaterial({
          color,
          roughness: .55,
          emissive: color,
          emissiveIntensity: .15
        })
      );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color,
      linewidth: 1,
      dashSize: mode === "flight" ? .75 : .25,
      gapSize: mode === "flight" ? .42 : .22,
      transparent: true,
      opacity: .95
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
  }

  buildDayRoute(day) {
    this.clearGroup(this.routeGroup);
    this.labelSprites = [];
    this.photoSprites = [];
    const cacheKey = `day-${this.dayIndex}`;
    const cached = this.dayRouteCache.get(cacheKey);
    if (cached) {
      this.routeGroup.add(cached);
      return;
    }
    const routeScene = new THREE.Group();

    const visibleEntries = this.visibleTerrainEntries(day);
    const localStops = visibleEntries.map(({ stop }) => this.toLocal(stop.coord, REGION_CONFIG[day.region]));
    const spreadX = localStops.length
      ? Math.max(...localStops.map(point => point.x)) - Math.min(...localStops.map(point => point.x))
      : 0;
    const spreadZ = localStops.length
      ? Math.max(...localStops.map(point => point.z)) - Math.min(...localStops.map(point => point.z))
      : 0;
    const routeSpread = Math.max(spreadX, spreadZ);
    const clusterScale = THREE.MathUtils.clamp(.48 + routeSpread * .075, .48, 1);
    visibleEntries.forEach(({ stop, index }, visibleIndex) => {
      const marker = this.createMarker(index + 1, stop.coord, REGION_CONFIG[day.region].color);
      marker.scale.multiplyScalar(clusterScale);
      routeScene.add(marker);
      if (visibleIndex > 0) {
        const mode = stop.mode;
        const previousStop = visibleEntries[visibleIndex - 1].stop;
        routeScene.add(this.createRouteSegment(
          previousStop,
          stop,
          mode,
          MODE_COLORS[mode] || REGION_CONFIG[day.region].color
        ));
        const routePoints = this.routePoints(previousStop, stop, mode);
        const routeCurve = new THREE.CatmullRomCurve3(routePoints);
        const vehicle = this.createVehicle(mode);
        const vehiclePoint = routeCurve.getPoint(.52);
        const tangent = routeCurve.getTangent(.53);
        vehicle.position.copy(vehiclePoint);
        this.orientVehicle(vehicle, tangent, vehiclePoint);
        vehicle.scale.multiplyScalar(THREE.MathUtils.lerp(.56, 1.04, clusterScale));
        vehicle.userData.routeVehicle = true;
        routeScene.add(vehicle);
      }
    });
    this.dayRouteCache.set(cacheKey, routeScene);
    this.routeGroup.add(routeScene);
    this.renderer.shadowMap.needsUpdate = true;
  }

  meshMaterial(color, roughness = .62) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness: .04 });
  }

  wheel(radius = .2, width = .12) {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, width, 14),
      this.meshMaterial(0x263330, .95)
    );
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * .44, radius * .44, width + .015, 12),
      this.meshMaterial(0xd8d6ca, .3)
    );
    hub.rotation.x = Math.PI / 2;
    wheelGroup.add(tire, hub);
    return wheelGroup;
  }

  rodBetween(start, end, radius, color) {
    const direction = end.clone().sub(start);
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, direction.length(), 10),
      this.meshMaterial(color, .55)
    );
    rod.position.copy(start).add(end).multiplyScalar(.5);
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    rod.castShadow = true;
    return rod;
  }

  createAtv(color) {
    const group = new THREE.Group();
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.15, .22, .58), this.meshMaterial(0x273a35, .86));
    chassis.position.y = .35;
    const tank = new THREE.Mesh(new THREE.BoxGeometry(.52, .34, .48), this.meshMaterial(color, .48));
    tank.position.set(.1, .59, 0);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(.45, .16, .38), this.meshMaterial(0x222b2a, .9));
    seat.position.set(-.28, .76, 0);
    const engine = new THREE.Mesh(new THREE.BoxGeometry(.34, .3, .42), this.meshMaterial(0xb6b8ae, .42));
    engine.position.set(-.05, .34, 0);
    group.add(chassis, tank, seat, engine);
    [[-.42, .31], [.42, .31], [-.42, -.31], [.42, -.31]].forEach(([x, z]) => {
      const atvWheel = this.wheel(.26, .17);
      atvWheel.position.set(x, .25, z);
      group.add(atvWheel);
    });
    group.add(
      this.rodBetween(new THREE.Vector3(.35, .68, -.3), new THREE.Vector3(.35, .96, 0), .035, 0x24332f),
      this.rodBetween(new THREE.Vector3(.35, .96, 0), new THREE.Vector3(.35, .96, .34), .035, 0x24332f)
    );
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 8), this.meshMaterial(0xfff0a8, .25));
    lamp.position.set(.59, .6, 0);
    group.add(lamp);
    return group;
  }

  createRoadVehicle(mode, color) {
    if (mode === "atv") return this.createAtv(color);
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.55, .34, .76), this.meshMaterial(color, .48));
    body.position.y = .43;
    body.castShadow = true;
    const hood = new THREE.Mesh(new THREE.BoxGeometry(.48, .24, .7), this.meshMaterial(color, .43));
    hood.position.set(.58, .68, 0);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(.76, .48, .66),
      this.meshMaterial(mode === "jeep" ? 0x405b50 : 0xf2dfbd, .42)
    );
    cabin.position.set(-.08, .77, 0);
    cabin.castShadow = true;
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(.035, .29, .54), this.meshMaterial(0x8bc8cf, .2));
    windshield.position.set(.32, .83, 0);
    const rearGlass = windshield.clone();
    rearGlass.position.x = -.49;
    group.add(body, hood, cabin, windshield, rearGlass);
    [-.345, .345].forEach(z => {
      const sideWindow = new THREE.Mesh(new THREE.BoxGeometry(.48, .25, .025), this.meshMaterial(0x6faab2, .18));
      sideWindow.position.set(-.08, .84, z);
      group.add(sideWindow);
    });
    [[-.43, .25], [.43, .25], [-.43, -.25], [.43, -.25]].forEach(([x, z]) => {
      const roadWheel = this.wheel(mode === "jeep" ? .25 : .22, .14);
      roadWheel.position.set(x * 1.35, .25, z * 1.42);
      group.add(roadWheel);
    });
    [-.23, .23].forEach(z => {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(.075, 12, 8), this.meshMaterial(0xffe893, .2));
      lamp.position.set(.79, .5, z);
      group.add(lamp);
    });
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(.08, .12, .78), this.meshMaterial(0x263330, .65));
    bumper.position.set(.82, .29, 0);
    group.add(bumper);
    if (mode === "jeep") {
      const rollColor = 0x263330;
      group.add(
        this.rodBetween(new THREE.Vector3(-.42, .76, -.34), new THREE.Vector3(-.42, 1.23, -.34), .035, rollColor),
        this.rodBetween(new THREE.Vector3(-.42, .76, .34), new THREE.Vector3(-.42, 1.23, .34), .035, rollColor),
        this.rodBetween(new THREE.Vector3(-.42, 1.23, -.34), new THREE.Vector3(-.42, 1.23, .34), .035, rollColor)
      );
      const spare = this.wheel(.25, .12);
      spare.rotation.y = Math.PI / 2;
      spare.position.set(-.81, .55, 0);
      group.add(spare);
    } else {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(.68, .055, .6), this.meshMaterial(0x263330, .55));
      rack.position.set(-.08, 1.04, 0);
      const luggage = new THREE.Mesh(new THREE.BoxGeometry(.32, .18, .28), this.meshMaterial(0xff9c62, .68));
      luggage.position.set(-.08, 1.16, 0);
      group.add(rack, luggage);
    }
    return group;
  }

  createPlane(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.18, .25, 2.15, 20), this.meshMaterial(color, .32));
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(.18, .48, 20), this.meshMaterial(0xfff2d7, .28));
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 1.28;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(.7, .07, 2.35), this.meshMaterial(0xfff1dc, .3));
    wing.position.x = .1;
    const tail = new THREE.Mesh(new THREE.BoxGeometry(.42, .055, .82), this.meshMaterial(0xff7867, .35));
    tail.position.x = -.86;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(.38, .62, .065), this.meshMaterial(0xff7867, .35));
    fin.position.set(-.9, .29, 0);
    group.add(body, nose, wing, tail, fin);
    [-.63, .63].forEach(z => {
      const engine = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .38, 14), this.meshMaterial(0xd5d8d2, .3));
      engine.rotation.z = Math.PI / 2;
      engine.position.set(.2, -.13, z);
      group.add(engine);
    });
    for (let index = -3; index <= 3; index += 1) {
      const planeWindow = new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), this.meshMaterial(0x184b59, .15));
      planeWindow.position.set(index * .22, .16, .18);
      group.add(planeWindow);
    }
    group.scale.set(1.15, 1.15, 1.15);
    return group;
  }

  createBoat(mode, color) {
    const group = new THREE.Group();
    const ferry = mode === "ferry";
    const speedboat = mode === "speedboat";
    const hull = new THREE.Mesh(new THREE.BoxGeometry(ferry ? 2.15 : 1.62, .34, ferry ? .78 : .68), this.meshMaterial(color, .38));
    hull.position.y = .24;
    hull.castShadow = true;
    const lowerHull = new THREE.Mesh(
      new THREE.ConeGeometry(ferry ? .5 : .4, ferry ? 2.2 : 1.7, 4),
      this.meshMaterial(0x24464b, .5)
    );
    lowerHull.rotation.z = -Math.PI / 2;
    lowerHull.position.set(.02, .08, 0);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(ferry ? 1.15 : .68, ferry ? .62 : .48, ferry ? .66 : .5),
      this.meshMaterial(0xfff2d9, .45)
    );
    cabin.position.set(ferry ? -.12 : -.2, ferry ? .72 : .64, 0);
    cabin.castShadow = true;
    const bow = new THREE.Mesh(new THREE.ConeGeometry(.43, .78, 4), this.meshMaterial(color));
    bow.rotation.z = -Math.PI / 2;
    bow.position.set(ferry ? 1.18 : .91, .23, 0);
    group.add(lowerHull, hull, cabin, bow);
    [-.22, .22].forEach(z => {
      const boatWindow = new THREE.Mesh(new THREE.BoxGeometry(ferry ? .62 : .36, .16, .025), this.meshMaterial(0x4d9ba8, .16));
      boatWindow.position.set(-.14, ferry ? .8 : .68, z);
      group.add(boatWindow);
    });
    if (ferry) {
      const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(.86, .08, .7), this.meshMaterial(0xfff2d9, .52));
      upperDeck.position.set(-.14, 1.06, 0);
      const stack = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, .36, 10), this.meshMaterial(0xff9c62, .45));
      stack.position.set(-.5, 1.28, 0);
      group.add(upperDeck, stack);
    }
    if (speedboat) {
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(.05, .25, .46), this.meshMaterial(0x6cb7c3, .12));
      windshield.position.set(.14, .78, 0);
      const motor = new THREE.Mesh(new THREE.BoxGeometry(.26, .36, .35), this.meshMaterial(0x263330, .55));
      motor.position.set(-.9, .28, 0);
      group.add(windshield, motor);
    }
    return group;
  }

  createWalker(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .65, 10), this.meshMaterial(color));
    body.position.y = .55;
    const head = new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 10), this.meshMaterial(0xf0c59f));
    head.position.y = 1.05;
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(.2, .42, .36), this.meshMaterial(0xff7867, .68));
    backpack.position.set(-.17, .63, 0);
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(.26, .26, .05, 16), this.meshMaterial(0xffe0a3, .72));
    hat.position.y = 1.25;
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(.14, .17, .16, 14), this.meshMaterial(0xffe0a3, .72));
    hatTop.position.y = 1.34;
    const armLeft = this.rodBetween(new THREE.Vector3(0, .78, -.12), new THREE.Vector3(.28, .46, -.18), .045, 0xf0c59f);
    const armRight = this.rodBetween(new THREE.Vector3(0, .78, .12), new THREE.Vector3(.3, .48, .2), .045, 0xf0c59f);
    group.add(body, head, backpack, hat, hatTop, armLeft, armRight);
    return group;
  }

  orientVehicle(vehicle, tangent, point) {
    const up = this.surfaceNormal(point);
    const forward = tangent.clone().projectOnPlane(up).normalize();
    if (forward.lengthSq() < .001) forward.set(1, 0, 0);
    const side = forward.clone().cross(up).normalize();
    const correctedUp = side.clone().cross(forward).normalize();
    const rotation = new THREE.Matrix4().makeBasis(forward, correctedUp, side);
    vehicle.quaternion.setFromRotationMatrix(rotation);
  }

  createVehicle(mode) {
    const color = MODE_COLORS[mode] || REGION_CONFIG[this.currentRegion].color;
    if (mode === "flight") return this.createPlane(color);
    if (mode === "boat" || mode === "ferry" || mode === "speedboat") return this.createBoat(mode, color);
    if (mode === "walk") return this.createWalker(color);
    return this.createRoadVehicle(mode, color);
  }

  placeVehicleForStep(stepIndex, modeOverride = null) {
    if (this.vehicle) {
      this.detailGroup.remove(this.vehicle);
      this.vehicle.traverse(object => {
        object.geometry?.dispose?.();
        object.material?.dispose?.();
      });
    }
    const day = this.itinerary[this.dayIndex];
    const stop = day.terrainStops[stepIndex];
    const mode = modeOverride || stop.mode;
    this.vehicle = this.createVehicle(mode);
    const point = mode === "flight"
      ? this.surfacePoint(stop.coord, 1.45)
      : (["boat", "ferry", "speedboat"].includes(mode)
        ? this.surfacePoint(stop.coord, .28)
        : this.terrainPoint(stop.coord, .42));
    this.vehicle.position.copy(point);
    this.alignToSurface(this.vehicle, point);
    this.vehicle.castShadow = true;
    this.detailGroup.add(this.vehicle);
  }

  focusOverview(instant = false, resetInteraction = true) {
    if (this.currentRegion === "arrival") {
      this.focusArrivalGlobe(instant, resetInteraction);
      return;
    }
    const day = this.itinerary[this.dayIndex];
    const visibleEntries = this.visibleTerrainEntries(day);
    const localPoints = visibleEntries.map(({ stop }) => this.toLocal(stop.coord));
    if (!localPoints.length) return;
    const minX = Math.min(...localPoints.map(point => point.x));
    const maxX = Math.max(...localPoints.map(point => point.x));
    const minZ = Math.min(...localPoints.map(point => point.z));
    const maxZ = Math.max(...localPoints.map(point => point.z));
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const rawSpanX = maxX - minX;
    const rawSpanZ = maxZ - minZ;
    const routeSpread = Math.max(rawSpanX, rawSpanZ);
    const compactRoute = routeSpread < 4.5;
    const spanX = Math.max(compactRoute ? 4.2 : 7.5, rawSpanX + (compactRoute ? 4.2 : 9.5));
    const spanZ = Math.max(compactRoute ? 3.8 : 6.5, rawSpanZ + (compactRoute ? 3.8 : 7.5));
    const verticalFov = THREE.MathUtils.degToRad(this.camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * Math.max(this.camera.aspect, .32));
    const fitWidth = spanX / (2 * Math.tan(horizontalFov / 2));
    const fitHeight = spanZ / (2 * Math.tan(verticalFov / 2));
    const minimumDistance = compactRoute ? (window.innerWidth < 720 ? 13 : 10.5) : 18;
    const distance = Math.max(minimumDistance, Math.max(fitWidth, fitHeight) * 1.06);
    const toTarget = new THREE.Vector3(centerX, this.surfaceY(centerX, centerZ) + 1.55, centerZ);
    const normal = this.surfaceNormal(toTarget);
    const viewDirection = normal.multiplyScalar(.78).add(new THREE.Vector3(0, .18, .66)).normalize();
    const toPosition = toTarget.clone().add(viewDirection.multiplyScalar(distance));
    if (resetInteraction) this.resetUserView();
    this.baseCameraPosition = toPosition.clone();
    this.baseCameraTarget = toTarget.clone();
    if (!resetInteraction && (
      this.userView.zoom !== 1 ||
      this.userView.yaw !== 0 ||
      this.userView.pitch !== 0
    )) {
      this.applyUserView();
      return;
    }
    this.setCameraTween(toPosition, toTarget, instant ? 1 : 900);
  }

  focusStop(stepIndex, instant = false) {
    const stop = this.itinerary[this.dayIndex].terrainStops[stepIndex];
    const point = this.terrainPoint(stop.coord, .3);
    const distance = window.innerWidth < 720 ? 12.5 : 10.5;
    const normal = this.surfaceNormal(point);
    const position = point.clone().add(normal.multiplyScalar(distance * .72)).add(new THREE.Vector3(0, distance * .22, distance * .58));
    const target = point.clone().add(this.surfaceNormal(point).multiplyScalar(.6));
    this.setCameraTween(position, target, instant ? 1 : 800);
  }

  setCameraTween(toPosition, toTarget, duration) {
    this.cameraTween = {
      fromPosition: this.camera.position.clone(),
      toPosition,
      fromTarget: this.cameraTarget.clone(),
      toTarget,
      start: performance.now(),
      duration
    };
    this.requestRender();
  }

  async setDay(index, options = {}) {
    if (!this.worldReady) return;
    if (this.motion) this.motion.resolve?.(false);
    this.motion = null;
    this.moving = false;
    const day = this.itinerary[index];
    const targetRegion = index === 0 ? "arrival" : day.region;
    const regionChanged = this.currentRegion !== targetRegion;
    this.dayIndex = index;
    this.stepIndex = 0;
    this.disposeGroup(this.detailGroup);
    this.vehicle = null;
    if (index === 0) {
      if (regionChanged) await this.buildArrivalGlobe();
      this.buildArrivalRoute();
      this.focusArrivalGlobe(options.instant);
      this.setProgress(100, "3D 旅行舞台已就绪");
      document.querySelector("#terrain-loading")?.classList.add("ready");
      return { regionChanged };
    }
    if (regionChanged) await this.buildRegion(day.region);
    this.buildDayRoute(day);
    this.labelSprites.forEach(label => { label.visible = true; });
    this.focusOverview(options.instant);
    this.setProgress(100, "3D 旅行舞台已就绪");
    document.querySelector("#terrain-loading")?.classList.add("ready");
    return { regionChanged };
  }

  goToStep(targetIndex) {
    if (this.moving || targetIndex === this.stepIndex) return Promise.resolve(false);
    const day = this.itinerary[this.dayIndex];
    if (targetIndex < 0 || targetIndex >= day.terrainStops.length) return Promise.resolve(false);
    this.moving = true;
    const from = day.terrainStops[this.stepIndex];
    const to = day.terrainStops[targetIndex];
    const mode = targetIndex > this.stepIndex ? to.mode : from.mode;
    const points = this.routePoints(from, to, mode);
    const curve = new THREE.CatmullRomCurve3(points);
    const direction = targetIndex > this.stepIndex ? 1 : -1;
    if (direction < 0) points.reverse();

    this.placeVehicleForStep(this.stepIndex, mode);
    this.motion = {
      curve: direction > 0 ? curve : new THREE.CatmullRomCurve3(points),
      start: performance.now(),
      duration: mode === "flight" ? 2500 : (["boat", "ferry", "speedboat"].includes(mode) ? 2200 : 1900),
      targetIndex,
      resolve: null
    };
    this.focusStop(targetIndex);
    this.requestRender();

    return new Promise(resolve => {
      this.motion.resolve = resolve;
    });
  }

  finishMotion() {
    const targetIndex = this.motion.targetIndex;
    const resolve = this.motion.resolve;
    this.stepIndex = targetIndex;
    this.labelSprites.forEach((label, index) => { label.visible = index === targetIndex; });
    this.motion = null;
    this.moving = false;
    window.dispatchEvent(new CustomEvent("terrain-step-arrived", { detail: { step: targetIndex } }));
    resolve?.(true);
  }

  updateTweens(now) {
    if (this.cameraTween) {
      const t = Math.min(1, (now - this.cameraTween.start) / this.cameraTween.duration);
      const eased = 1 - Math.pow(1 - t, 4);
      this.camera.position.lerpVectors(this.cameraTween.fromPosition, this.cameraTween.toPosition, eased);
      this.cameraTarget.lerpVectors(this.cameraTween.fromTarget, this.cameraTween.toTarget, eased);
      this.camera.lookAt(this.cameraTarget);
      if (t >= 1) this.cameraTween = null;
    }

    if (this.motion && this.vehicle) {
      const t = Math.min(1, (now - this.motion.start) / this.motion.duration);
      const eased = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const point = this.motion.curve.getPoint(eased);
      const tangent = this.motion.curve.getTangent(Math.min(.999, eased + .002));
      this.vehicle.position.copy(point);
      this.orientVehicle(this.vehicle, tangent, point);
      if (t >= 1) this.finishMotion();
    }
  }

  render() {
    this.frame = null;
    if (!this.canRender()) return;
    const now = performance.now();
    this.updateTweens(now);
    if (this.needsRender || this.cameraTween || this.motion) {
      this.renderer.render(this.scene, this.camera);
      this.needsRender = false;
    }
    if (this.cameraTween || this.motion) {
      this.frame = requestAnimationFrame(this.render);
    }
  }
}

try {
  new TerrainStage(document.querySelector("#terrain-canvas"), window.tripDays);
} catch (error) {
  document.body.classList.add("terrain-unavailable");
  window.terrainStage = {
    setDay: async () => ({ regionChanged: false }),
    goToStep: async () => false,
    focusOverview: () => {}
  };
  window.dispatchEvent(new CustomEvent("terrain-ready", { detail: { error: error.message } }));
}
