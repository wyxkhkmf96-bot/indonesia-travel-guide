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

class TerrainStage {
  constructor(canvas, itinerary) {
    this.canvas = canvas;
    this.itinerary = itinerary;
    this.dayIndex = 0;
    this.stepIndex = 0;
    this.currentRegion = null;
    this.worldReady = false;
    this.moving = false;
    this.clock = new THREE.Clock();
    this.cameraTarget = new THREE.Vector3();
    this.cameraTween = null;
    this.motion = null;
    this.labelSprites = [];

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a2926, .0045);
    this.camera = new THREE.PerspectiveCamera(34, 1, .1, 420);
    this.camera.position.set(0, 23, 28);
    this.camera.lookAt(this.cameraTarget);

    this.worldGroup = new THREE.Group();
    this.routeGroup = new THREE.Group();
    this.detailGroup = new THREE.Group();
    this.scene.add(this.worldGroup, this.routeGroup, this.detailGroup);
    this.addLights();

    this.resize = this.resize.bind(this);
    this.render = this.render.bind(this);
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(canvas);
    this.resize();
    this.render();
    this.ready = this.initialize().catch(error => this.fail(error));
  }

  addLights() {
    const hemi = new THREE.HemisphereLight(0xd8fbff, 0x21453d, 2.3);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff0d2, 3.8);
    key.position.set(-12, 28, 16);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -28;
    key.shadow.camera.right = 28;
    key.shadow.camera.top = 28;
    key.shadow.camera.bottom = -28;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x80d9dd, 1.7);
    rim.position.set(20, 10, -20);
    this.scene.add(rim);
  }

  setProgress(value, label) {
    const progress = document.querySelector("#terrain-progress");
    const loader = document.querySelector("#terrain-loading");
    if (progress) progress.textContent = `${Math.round(value)}%`;
    if (loader && label) loader.querySelector("span").textContent = label;
    if (loader) loader.style.setProperty("--load", `${value}%`);
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
    const world = await fetch("assets/maps/countries-50m.json").then(response => {
      if (!response.ok) throw new Error("Terrain geography unavailable");
      return response.json();
    });
    const countries = window.topojson.feature(world, world.objects.countries).features;
    this.indonesia = countries.find(feature => feature.properties?.name === "Indonesia");
    this.worldReady = true;
    this.setProgress(30, "正在生成东爪哇地形");
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
    if (this.worldReady && this.currentRegion && !this.moving) this.focusOverview(true);
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
    if (height < .34) return new THREE.Color(0xe7d39a);
    if (height < 1.1) return new THREE.Color(0x85bd72);
    if (height < 2.7) return new THREE.Color(0x5e9b69);
    if (height < 4.8) return new THREE.Color(0x8c7658);
    return new THREE.Color(0xd9d1ba);
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

  buildTerrainGeometry(config) {
    const [minLon, maxLon, minLat, maxLat] = config.bounds;
    const nx = 112;
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
        const point = this.toLocal(coordinate, config);
        const height = this.heightAt(coordinate, config);
        positions.push(point.x, height, point.z);
        const color = this.colorForHeight(height);
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

  createOceanBase(config) {
    const base = new THREE.Group();
    const regionMaterial = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: .72,
      metalness: .02
    });
    const oceanMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x4faebb,
      roughness: .26,
      metalness: .06,
      transparent: true,
      opacity: .96,
      clearcoat: .45
    });

    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(20.5, 20.5, 1.15, 96), regionMaterial);
    pedestal.position.y = -.94;
    pedestal.receiveShadow = true;
    base.add(pedestal);

    const ocean = new THREE.Mesh(new THREE.CircleGeometry(20.5, 96), oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -.35;
    ocean.receiveShadow = true;
    base.add(ocean);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(20.5, .14, 10, 128),
      new THREE.MeshStandardMaterial({ color: 0xfff1d5, roughness: .5 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -.33;
    base.add(rim);
    return base;
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

  createBeach(beach, config) {
    const point = this.toLocal(beach.coord, config);
    const beachMesh = new THREE.Mesh(
      new THREE.CircleGeometry(beach.scale, 32),
      new THREE.MeshStandardMaterial({ color: beach.color, roughness: .82, depthTest: false })
    );
    beachMesh.rotation.x = -Math.PI / 2;
    beachMesh.position.set(point.x, .34, point.z);
    beachMesh.renderOrder = 4;
    beachMesh.receiveShadow = true;
    return beachMesh;
  }

  createVolcanoCrater(peak, config) {
    const point = this.toLocal(peak.coord, config);
    const height = this.heightAt(peak.coord, config);
    const crater = new THREE.Mesh(
      new THREE.TorusGeometry(.32, .09, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x5f4338, roughness: .95 })
    );
    crater.rotation.x = Math.PI / 2;
    crater.position.set(point.x, height + .02, point.z);
    crater.castShadow = true;
    return crater;
  }

  async buildRegion(regionKey) {
    const config = REGION_CONFIG[regionKey];
    this.currentRegion = regionKey;
    document.querySelector("#terrain-stage")?.classList.add("building");
    document.querySelector("#terrain-loading")?.classList.remove("ready");
    this.setProgress(38, `正在生成${config.name}立体海岸`);
    await new Promise(resolve => requestAnimationFrame(resolve));

    this.disposeGroup(this.worldGroup);
    this.worldGroup.add(this.createOceanBase(config));

    this.setProgress(58, `正在抬升${config.name}山脉`);
    const terrain = new THREE.Mesh(
      this.buildTerrainGeometry(config),
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: .83,
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

    config.forests.forEach((coordinate, forestIndex) => {
      const origin = this.toLocal(coordinate, config);
      for (let index = 0; index < 7; index += 1) {
        const angle = index * 2.17 + forestIndex;
        const radius = .35 + (index % 3) * .26;
        const tree = this.createTree(.65 + (index % 2) * .18);
        const lonOffset = Math.cos(angle) * radius / this.regionScale(config);
        const latOffset = Math.sin(angle) * radius / this.regionScale(config);
        const treeCoord = [coordinate[0] + lonOffset, coordinate[1] + latOffset];
        const height = this.heightAt(treeCoord, config);
        tree.position.set(origin.x + Math.cos(angle) * radius, height, origin.z - Math.sin(angle) * radius);
        this.worldGroup.add(tree);
      }
    });

    this.worldGroup.rotation.y = 0;
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
    sprite.scale.set(4.25, .96, 1);
    return sprite;
  }

  createMarker(number, coordinate, accent) {
    const point = this.toLocal(coordinate);
    const height = this.heightAt(coordinate);
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
    group.position.set(point.x, height, point.z);
    group.userData.number = number;
    group.add(pin, head);
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
      const point = this.toLocal(coord);
      const landHeight = this.heightAt(coord);
      if (mode === "flight") point.y = 1.2 + Math.sin(Math.PI * t) * 7.5;
      else if (mode === "boat" || mode === "ferry" || mode === "speedboat") point.y = .18;
      else point.y = landHeight + .32;
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
    this.disposeGroup(this.routeGroup);
    this.labelSprites = [];
    const accent = `#${REGION_CONFIG[day.region].color.toString(16).padStart(6, "0")}`;

    day.terrainStops.forEach((stop, index) => {
      const marker = this.createMarker(index + 1, stop.coord, REGION_CONFIG[day.region].color);
      this.routeGroup.add(marker);
      const label = this.createLabel(day.schedule[index][1], accent);
      label.position.copy(marker.position);
      label.position.y += 2.2;
      label.visible = true;
      this.labelSprites.push(label);
      this.routeGroup.add(label);
      if (index > 0) {
        const mode = stop.mode;
        const previousStop = day.terrainStops[index - 1];
        this.routeGroup.add(this.createRouteSegment(
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
        vehicle.rotation.y = -Math.atan2(tangent.z, tangent.x);
        vehicle.scale.multiplyScalar(.78);
        vehicle.userData.routeVehicle = true;
        this.routeGroup.add(vehicle);
      }
    });
  }

  meshMaterial(color, roughness = .62) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness: .02 });
  }

  wheel(radius = .2, width = .12) {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, width, 14),
      this.meshMaterial(0x263330, .95)
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    return wheel;
  }

  createRoadVehicle(mode, color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.35, .36, .72), this.meshMaterial(color));
    body.position.y = .38;
    body.castShadow = true;
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(mode === "jeep" ? .75 : .68, .38, .62),
      this.meshMaterial(mode === "jeep" ? 0x334941 : 0xf7e7c8, .4)
    );
    cabin.position.set(.1, .72, 0);
    cabin.castShadow = true;
    group.add(body, cabin);
    [[-.43, .25], [.43, .25], [-.43, -.25], [.43, -.25]].forEach(([x, z]) => {
      const wheel = this.wheel(mode === "atv" ? .25 : .21, .13);
      wheel.position.set(x, .2, z);
      group.add(wheel);
    });
    if (mode === "jeep") {
      const rack = new THREE.Mesh(new THREE.BoxGeometry(.72, .06, .66), this.meshMaterial(0x263330));
      rack.position.set(.12, .98, 0);
      group.add(rack);
    }
    if (mode === "atv") {
      group.scale.set(.78, .78, .78);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(.08, .48, .62), this.meshMaterial(0x263330));
      handle.position.set(.32, .74, 0);
      group.add(handle);
    }
    return group;
  }

  createPlane(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.16, .24, 1.9, 14), this.meshMaterial(color, .38));
    body.rotation.z = Math.PI / 2;
    body.castShadow = true;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(.65, .06, 2.1), this.meshMaterial(0xfff1dc, .35));
    const tail = new THREE.Mesh(new THREE.BoxGeometry(.34, .06, .8), this.meshMaterial(0xff7867, .4));
    tail.position.x = -.7;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(.35, .6, .08), this.meshMaterial(0xff7867, .4));
    fin.position.set(-.72, .27, 0);
    group.add(body, wing, tail, fin);
    group.scale.set(1.15, 1.15, 1.15);
    return group;
  }

  createBoat(mode, color) {
    const group = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(mode === "ferry" ? 1.9 : 1.45, .32, .68), this.meshMaterial(color));
    hull.position.y = .24;
    hull.castShadow = true;
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(mode === "ferry" ? 1.0 : .55, .55, .55),
      this.meshMaterial(0xfff2d9, .45)
    );
    cabin.position.set(mode === "ferry" ? -.1 : -.2, .68, 0);
    cabin.castShadow = true;
    const bow = new THREE.Mesh(new THREE.ConeGeometry(.43, .78, 4), this.meshMaterial(color));
    bow.rotation.z = -Math.PI / 2;
    bow.position.set(.95, .22, 0);
    group.add(hull, cabin, bow);
    return group;
  }

  createWalker(color) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .65, 10), this.meshMaterial(color));
    body.position.y = .55;
    const head = new THREE.Mesh(new THREE.SphereGeometry(.22, 14, 10), this.meshMaterial(0xf0c59f));
    head.position.y = 1.05;
    group.add(body, head);
    return group;
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
    const point = this.toLocal(stop.coord);
    point.y = (mode === "flight" ? this.heightAt(stop.coord) + 1.2 :
      (["boat", "ferry", "speedboat"].includes(mode) ? .42 : this.heightAt(stop.coord) + .48));
    this.vehicle.position.copy(point);
    this.vehicle.castShadow = true;
    this.detailGroup.add(this.vehicle);
  }

  focusOverview(instant = false) {
    const verticalFov = THREE.MathUtils.degToRad(this.camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * Math.max(this.camera.aspect, .32));
    const framingAngle = Math.min(verticalFov, horizontalFov) / 2;
    const distance = 21.5 / Math.tan(framingAngle) * 1.08;
    const toPosition = new THREE.Vector3(0, distance * .65, distance * .76);
    const toTarget = new THREE.Vector3(0, 0, 0);
    this.setCameraTween(toPosition, toTarget, instant ? 1 : 1450);
  }

  focusStop(stepIndex, instant = false) {
    const stop = this.itinerary[this.dayIndex].terrainStops[stepIndex];
    const point = this.toLocal(stop.coord);
    point.y = this.heightAt(stop.coord);
    const distance = window.innerWidth < 720 ? 12.5 : 10.5;
    const position = point.clone().add(new THREE.Vector3(distance * .72, distance * .78, distance));
    const target = point.clone().add(new THREE.Vector3(0, .6, 0));
    this.setCameraTween(position, target, instant ? 1 : 1250);
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
  }

  async setDay(index, options = {}) {
    if (!this.worldReady) return;
    if (this.motion) this.motion.resolve?.(false);
    this.motion = null;
    this.moving = false;
    const day = this.itinerary[index];
    const regionChanged = this.currentRegion !== day.region;
    this.dayIndex = index;
    this.stepIndex = 0;
    if (regionChanged) await this.buildRegion(day.region);
    this.disposeGroup(this.detailGroup);
    this.vehicle = null;
    this.buildDayRoute(day);
    this.labelSprites.forEach(label => { label.visible = true; });
    this.focusOverview(options.instant);
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
      this.vehicle.rotation.y = -Math.atan2(tangent.z, tangent.x);
      if (t >= 1) this.finishMotion();
    }
  }

  render() {
    const now = performance.now();
    this.updateTweens(now);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render);
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
