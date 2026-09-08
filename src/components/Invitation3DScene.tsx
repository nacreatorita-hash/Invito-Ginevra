import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Invitation3DSceneProps {
  autoRotate: boolean;
  onUserInteract?: () => void;
  onCardClick?: () => void;
  resetViewTrigger?: number;
}

export const Invitation3DScene: React.FC<Invitation3DSceneProps> = ({
  autoRotate,
  onUserInteract,
  onCardClick,
  resetViewTrigger,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cardMeshRef = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Handle external autoRotate toggle
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Handle reset camera view trigger
  useEffect(() => {
    if (resetViewTrigger && cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0.2, 1.25, 1.9);
      controlsRef.current.target.set(0, 0.55, 0);
      controlsRef.current.update();
    }
  }, [resetViewTrigger]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Magical Fairytale Atmosphere
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#faeee4', 10, 32);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0.2, 1.25, 1.9);
    cameraRef.current = camera;

    // 3. Renderer with high-quality tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    // 4. Realistic Disney Fairytale Panorama Backdrop (Cylindrical Cyclorama)
    const backdropTex = textureLoader.load('/images/disney-fairytale-backdrop.jpg');
    backdropTex.colorSpace = THREE.SRGBColorSpace;
    backdropTex.wrapS = THREE.ClampToEdgeWrapping;
    backdropTex.wrapT = THREE.ClampToEdgeWrapping;

    const panoGeo = new THREE.CylinderGeometry(28, 28, 16, 48, 1, true);
    panoGeo.scale(-1, 1, 1); // Flip normals inward
    const panoMat = new THREE.MeshBasicMaterial({
      map: backdropTex,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const panorama = new THREE.Mesh(panoGeo, panoMat);
    panorama.position.set(0, 5, 0);
    panorama.rotation.y = -Math.PI * 0.45;
    scene.add(panorama);

    // 5. Soft Fairytale Skydome (Soft gradient above the panorama)
    const skyGeo = new THREE.SphereGeometry(38, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color('#94c8e8') },
        horizonColor: { value: new THREE.Color('#faeee4') },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          float f = smoothstep(0.05, 0.65, max(h, 0.0));
          vec3 col = mix(horizonColor, topColor, f);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // 6. Fairytale Lighting: Warm Golden Hour Sunlight & Gentle Fairy Ambient
    const ambientLight = new THREE.AmbientLight(0xfffaee, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff2db, 1.35);
    sunLight.position.set(4, 7, 3.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 20;
    sunLight.shadow.camera.left = -6;
    sunLight.shadow.camera.right = 6;
    sunLight.shadow.camera.top = 6;
    sunLight.shadow.camera.bottom = -6;
    sunLight.shadow.bias = -0.0002;
    scene.add(sunLight);

    const fairyPointLight = new THREE.PointLight(0xffd199, 0.8, 5);
    fairyPointLight.position.set(-1.0, 0.8, 0.6);
    scene.add(fairyPointLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.4);
    fillLight.position.set(-3, 4, -3);
    scene.add(fillLight);

    // 7. Low-Poly Faceted Undulating Meadow Ground
    const groundGeo = new THREE.PlaneGeometry(32, 32, 48, 48);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const distFromCenter = Math.sqrt(vx * vx + vy * vy);

      // Gentle rolling fairy knolls on the perimeter, flat clearing in the center
      let z = 0;
      if (distFromCenter > 1.8) {
        z =
          Math.sin(vx * 0.4) * 0.28 +
          Math.cos(vy * 0.45) * 0.25 +
          Math.sin(vx * 1.2 + vy * 0.8) * 0.08 +
          (Math.random() - 0.5) * 0.03;
      } else {
        z = (Math.random() - 0.5) * 0.015;
      }
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#78a467'),
      roughness: 0.88,
      metalness: 0.02,
      flatShading: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Inner soft lush clearing disc
    const innerDisc = new THREE.Mesh(
      new THREE.CircleGeometry(11, 40),
      new THREE.MeshStandardMaterial({
        color: '#6d9c5c',
        roughness: 0.9,
        flatShading: true,
      })
    );
    innerDisc.rotation.x = -Math.PI / 2;
    innerDisc.position.y = -0.015;
    innerDisc.receiveShadow = true;
    scene.add(innerDisc);

    // 8. Low-Poly Fairytale Castles in the background
    const createLowPolyCastle = (paletteRose = true) => {
      const castleGroup = new THREE.Group();

      const stoneMat = new THREE.MeshStandardMaterial({
        color: '#fdf2eb',
        roughness: 0.82,
        metalness: 0.04,
        flatShading: true,
      });

      const roofMatRose = new THREE.MeshStandardMaterial({
        color: paletteRose ? '#e08ca6' : '#7ba2d9',
        roughness: 0.58,
        metalness: 0.08,
        flatShading: true,
      });

      const roofMatAlt = new THREE.MeshStandardMaterial({
        color: paletteRose ? '#7ba2d9' : '#e08ca6',
        roughness: 0.58,
        metalness: 0.08,
        flatShading: true,
      });

      const goldMat = new THREE.MeshStandardMaterial({
        color: '#f5cb58',
        roughness: 0.35,
        metalness: 0.75,
        emissive: new THREE.Color('#f5cb58').multiplyScalar(0.12),
        flatShading: true,
      });

      const windowMat = new THREE.MeshBasicMaterial({
        color: '#ffe58f',
      });

      const createTurret = (r: number, h: number, roofH: number, roofMat: THREE.Material) => {
        const tGrp = new THREE.Group();
        // Body
        const bodyGeo = new THREE.CylinderGeometry(r * 0.9, r, h, 8);
        const body = new THREE.Mesh(bodyGeo, stoneMat);
        body.position.y = h / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        tGrp.add(body);

        // Cornice
        const cornice = new THREE.Mesh(
          new THREE.CylinderGeometry(r * 1.14, r * 0.96, 0.12, 8),
          stoneMat
        );
        cornice.position.y = h + 0.06;
        cornice.castShadow = true;
        tGrp.add(cornice);

        // Battlements
        for (let b = 0; b < 8; b += 2) {
          const ang = (b / 8) * Math.PI * 2;
          const cren = new THREE.Mesh(new THREE.BoxGeometry(r * 0.32, 0.14, 0.08), stoneMat);
          cren.position.set(Math.cos(ang) * (r * 1.04), h + 0.18, Math.sin(ang) * (r * 1.04));
          cren.rotation.y = -ang;
          tGrp.add(cren);
        }

        // Conical faceted roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.25, roofH, 8), roofMat);
        roof.position.y = h + 0.12 + roofH / 2;
        roof.castShadow = true;
        tGrp.add(roof);

        // Gold finial ball and spire
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.035, roofH * 0.45, 6), goldMat);
        spire.position.y = h + 0.12 + roofH + (roofH * 0.45) / 2;
        tGrp.add(spire);

        const ball = new THREE.Mesh(new THREE.SphereGeometry(r * 0.18, 6, 6), goldMat);
        ball.position.y = h + 0.12 + roofH;
        tGrp.add(ball);

        // Glowing fairytale windows
        [0.45, 0.72].forEach((frac) => {
          const win = new THREE.Mesh(new THREE.BoxGeometry(r * 0.28, 0.24, r * 0.1), windowMat);
          win.position.set(0, h * frac, r * 0.94);
          tGrp.add(win);
        });

        return tGrp;
      };

      // Main tower
      const main = createTurret(0.55, 2.7, 1.7, roofMatRose);
      main.position.set(0, 0, 0);
      castleGroup.add(main);

      // Flanking turrets
      const leftT = createTurret(0.4, 2.0, 1.3, roofMatAlt);
      leftT.position.set(-1.0, 0, 0.25);
      castleGroup.add(leftT);

      const rightT = createTurret(0.38, 2.2, 1.4, roofMatRose);
      rightT.position.set(0.95, 0, 0.2);
      castleGroup.add(rightT);

      // Back spire
      const backT = createTurret(0.32, 3.3, 1.6, roofMatAlt);
      backT.position.set(-0.35, 0, -0.65);
      castleGroup.add(backT);

      // Castle curtain wall
      const wall = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.15, 0.35), stoneMat);
      wall.position.set(0, 0.58, 0.2);
      wall.castShadow = true;
      castleGroup.add(wall);

      // Arched gateway
      const gate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.38, 8, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: '#563c35', roughness: 0.9, flatShading: true })
      );
      gate.rotation.z = Math.PI / 2;
      gate.rotation.y = Math.PI / 2;
      gate.position.set(0, 0.45, 0.2);
      castleGroup.add(gate);

      return castleGroup;
    };

    // Primary Disney Castle on the left knoll
    const mainCastle = createLowPolyCastle(true);
    mainCastle.position.set(-4.6, 0.15, -6.2);
    mainCastle.rotation.y = 0.38;
    mainCastle.scale.setScalar(1.08);
    scene.add(mainCastle);

    // Secondary Fairytale Watchtower/Castle on the right knoll
    const secondaryCastle = createLowPolyCastle(false);
    secondaryCastle.position.set(5.2, 0.2, -5.8);
    secondaryCastle.rotation.y = -0.42;
    secondaryCastle.scale.setScalar(0.9);
    scene.add(secondaryCastle);

    // 9. Low-Poly Enchanted Fairytale Trees (Multi-tiered crowns, pastel foliage)
    const treePalette = [
      '#7ba86c', // Sage green
      '#f5a7b8', // Rose blossom
      '#baa0d6', // Lavender
      '#b2d672', // Golden olive
      '#f8c4b2', // Soft peach
    ];

    const createLowPolyTree = (paletteIndex: number, heightScale = 1.0) => {
      const treeGrp = new THREE.Group();

      // Faceted trunk with slight whimsical organic bend
      const trunkGeo = new THREE.CylinderGeometry(0.07, 0.15, 0.95 * heightScale, 6);
      const trunkMat = new THREE.MeshStandardMaterial({
        color: '#6e4c38',
        roughness: 0.88,
        flatShading: true,
      });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = (0.95 * heightScale) / 2;
      trunk.rotation.z = (Math.random() - 0.5) * 0.12;
      trunk.castShadow = true;
      treeGrp.add(trunk);

      // Multi-tiered faceted foliage crown
      const folColor = treePalette[paletteIndex % treePalette.length];
      const folMat = new THREE.MeshStandardMaterial({
        color: folColor,
        roughness: 0.72,
        metalness: 0.02,
        flatShading: true,
      });

      const tiers = 3;
      for (let t = 0; t < tiers; t++) {
        const radius = (0.55 - t * 0.12) * heightScale;
        const tierGeo = new THREE.ConeGeometry(radius, 0.65 * heightScale, 7);
        const tier = new THREE.Mesh(tierGeo, folMat);
        tier.position.y = (0.75 + t * 0.36) * heightScale;
        tier.rotation.y = t * 0.7 + (Math.random() - 0.5) * 0.2;
        tier.castShadow = true;
        tier.receiveShadow = true;
        treeGrp.add(tier);
      }

      return treeGrp;
    };

    // Distribute enchanted trees framing the fairytale glade
    const treePositions = [
      // Left grove
      { x: -2.8, z: -2.2, p: 0, s: 1.1 },
      { x: -3.6, z: -1.4, p: 1, s: 0.95 },
      { x: -2.5, z: -0.4, p: 2, s: 0.85 },
      { x: -4.2, z: -3.5, p: 3, s: 1.2 },
      { x: -5.8, z: -2.0, p: 4, s: 1.3 },
      { x: -2.2, z: 1.2, p: 1, s: 0.9 },
      // Right grove
      { x: 2.7, z: -2.1, p: 1, s: 1.05 },
      { x: 3.5, z: -1.3, p: 0, s: 0.9 },
      { x: 2.6, z: -0.3, p: 3, s: 0.85 },
      { x: 4.1, z: -3.2, p: 2, s: 1.25 },
      { x: 5.6, z: -1.8, p: 4, s: 1.3 },
      { x: 2.3, z: 1.3, p: 0, s: 0.95 },
      // Distant background framing
      { x: -1.8, z: -4.8, p: 0, s: 1.1 },
      { x: -0.6, z: -5.5, p: 2, s: 1.2 },
      { x: 1.0, z: -5.2, p: 1, s: 1.15 },
      { x: 2.2, z: -4.9, p: 3, s: 1.05 },
    ];

    treePositions.forEach((tp) => {
      const tree = createLowPolyTree(tp.p, tp.s);
      tree.position.set(tp.x, 0, tp.z);
      scene.add(tree);
    });

    // 10. Low-Poly Stepping Stone Fairytale Path
    const pathGroup = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
      color: '#f0e6d8',
      roughness: 0.9,
      flatShading: true,
    });
    const stonePoints = [
      { x: 0.22, z: 2.1 },
      { x: 0.18, z: 1.8 },
      { x: 0.12, z: 1.5 },
      { x: 0.2, z: 1.25 },
      { x: 0.08, z: 1.0 },
      { x: 0.15, z: 0.75 },
      { x: 0.02, z: 0.5 },
      { x: -0.08, z: 0.28 },
    ];

    stonePoints.forEach((sp) => {
      const r = 0.14 + (Math.random() - 0.5) * 0.04;
      const stoneGeo = new THREE.CylinderGeometry(r, r * 1.1, 0.035, 6);
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(sp.x + (Math.random() - 0.5) * 0.06, 0.015, sp.z);
      stone.rotation.y = Math.random() * Math.PI;
      stone.receiveShadow = true;
      pathGroup.add(stone);
    });
    scene.add(pathGroup);

    // 11. Low-Poly Fairytale Mushrooms & Glowing Amethyst/Rose Crystals
    const decoGroup = new THREE.Group();

    // Spotted red & pink mushrooms
    const mushroomColors = ['#f45866', '#f4a6b8', '#e85d75'];
    const createMushroom = (col: string, scale = 1.0) => {
      const mGrp = new THREE.Group();
      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.035, 0.12 * scale, 6);
      const stem = new THREE.Mesh(
        stemGeo,
        new THREE.MeshStandardMaterial({ color: '#fbf5ed', roughness: 0.8, flatShading: true })
      );
      stem.position.y = (0.12 * scale) / 2;
      mGrp.add(stem);

      // Cap
      const capGeo = new THREE.ConeGeometry(0.09 * scale, 0.08 * scale, 7);
      const cap = new THREE.Mesh(
        capGeo,
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, flatShading: true })
      );
      cap.position.y = 0.12 * scale + (0.08 * scale) / 2;
      cap.castShadow = true;
      mGrp.add(cap);

      return mGrp;
    };

    [
      { x: -0.85, z: 0.35, c: mushroomColors[0], s: 1.1 },
      { x: -0.92, z: 0.45, c: mushroomColors[1], s: 0.8 },
      { x: 0.88, z: 0.3, c: mushroomColors[0], s: 1.0 },
      { x: 0.96, z: 0.4, c: mushroomColors[2], s: 0.75 },
      { x: -1.2, z: -0.6, c: mushroomColors[1], s: 1.2 },
      { x: 1.3, z: -0.5, c: mushroomColors[0], s: 1.1 },
    ].forEach((m) => {
      const mush = createMushroom(m.c, m.s);
      mush.position.set(m.x, 0, m.z);
      decoGroup.add(mush);
    });

    // Glowing fairytale crystals
    const crystalMatRose = new THREE.MeshStandardMaterial({
      color: '#ffc2d6',
      emissive: new THREE.Color('#ff85a8').multiplyScalar(0.25),
      roughness: 0.25,
      metalness: 0.1,
      flatShading: true,
      transparent: true,
      opacity: 0.9,
    });
    const crystalMatPurple = new THREE.MeshStandardMaterial({
      color: '#d4bbf2',
      emissive: new THREE.Color('#9f78db').multiplyScalar(0.25),
      roughness: 0.25,
      metalness: 0.1,
      flatShading: true,
      transparent: true,
      opacity: 0.9,
    });

    [
      { x: -0.75, z: -0.5, mat: crystalMatPurple, s: 0.12 },
      { x: -0.68, z: -0.42, mat: crystalMatRose, s: 0.08 },
      { x: 0.72, z: -0.45, mat: crystalMatRose, s: 0.13 },
      { x: 0.82, z: -0.38, mat: crystalMatPurple, s: 0.09 },
    ].forEach((c) => {
      const cGeo = new THREE.OctahedronGeometry(c.s, 0);
      cGeo.scale(0.8, 1.8, 0.8);
      const crystal = new THREE.Mesh(cGeo, c.mat);
      crystal.position.set(c.x, c.s * 0.9, c.z);
      crystal.rotation.set(0.1, Math.random() * Math.PI, 0.15);
      decoGroup.add(crystal);
    });

    scene.add(decoGroup);

    // 12. Scattered Low-Poly Wildflowers
    const flowerColors = [
      new THREE.Color('#ffe066'),
      new THREE.Color('#d8b4fe'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#f8c8d0'),
      new THREE.Color('#a8d8ea'),
    ];
    const flowerGroup = new THREE.Group();
    const petalGeo = new THREE.SphereGeometry(0.024, 6, 6);
    const stemMat = new THREE.MeshStandardMaterial({ color: '#527244', flatShading: true });
    const stemGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.08, 4);

    for (let i = 0; i < 220; i++) {
      const radius = 1.3 + Math.random() * 7.5;
      if (radius < 1.6) continue;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const col = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      const flowerMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, flatShading: true });
      const petal = new THREE.Mesh(petalGeo, flowerMat);
      petal.position.set(x, 0.02 + Math.random() * 0.06, z);
      petal.scale.setScalar(0.7 + Math.random() * 1.1);
      flowerGroup.add(petal);

      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(x, 0.01, z);
      flowerGroup.add(stem);
    }
    scene.add(flowerGroup);

    // 13. Low-Poly Flower Bushes
    const createBush = (posVec: THREE.Vector3, numFlowers = 7) => {
      const grp = new THREE.Group();
      for (let i = 0; i < 16; i++) {
        const leafGeo = new THREE.IcosahedronGeometry(0.1 + Math.random() * 0.06, 0);
        const leafMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(
            0.28 + Math.random() * 0.06,
            0.45,
            0.32 + Math.random() * 0.1
          ),
          roughness: 0.85,
          flatShading: true,
        });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(
          (Math.random() - 0.5) * 0.55,
          0.06 + Math.random() * 0.32,
          (Math.random() - 0.5) * 0.55
        );
        leaf.rotation.set(Math.random(), Math.random(), Math.random());
        leaf.castShadow = true;
        grp.add(leaf);
      }
      const bloomColors = ['#f8c8d0', '#f4a6b8', '#e891a8', '#fbc2c9', '#d98a9a'];
      for (let i = 0; i < numFlowers; i++) {
        const flwGeo = new THREE.IcosahedronGeometry(0.065 + Math.random() * 0.035, 0);
        const flwColor = bloomColors[Math.floor(Math.random() * bloomColors.length)];
        const flwMat = new THREE.MeshStandardMaterial({
          color: flwColor,
          roughness: 0.55,
          emissive: new THREE.Color(flwColor).multiplyScalar(0.06),
          flatShading: true,
        });
        const flw = new THREE.Mesh(flwGeo, flwMat);
        flw.position.set(
          (Math.random() - 0.5) * 0.48,
          0.18 + Math.random() * 0.32,
          (Math.random() - 0.5) * 0.48
        );
        flw.castShadow = true;
        grp.add(flw);
      }
      grp.position.copy(posVec);
      return grp;
    };

    [
      new THREE.Vector3(-0.95, 0, 0.2),
      new THREE.Vector3(0.95, 0, 0.15),
      new THREE.Vector3(-0.6, 0, -0.75),
      new THREE.Vector3(0.65, 0, -0.6),
      new THREE.Vector3(0, 0, -0.95),
      new THREE.Vector3(-0.2, 0, 0.95),
    ].forEach((p, idx) => {
      scene.add(createBush(p, idx % 2 === 0 ? 8 : 5));
    });

    // 14. High-Resolution Invitation Card Canvas Texture (With Sacred Baptism Medallion)
    const generateCardTexture = async (): Promise<THREE.CanvasTexture> => {
      try {
        await document.fonts.ready;
      } catch {
        // Fallback
      }

      // Load the sacred baptism illustration
      const loadImg = (url: string): Promise<HTMLImageElement | null> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };

      const baptismImg = await loadImg('/images/battesimo-art.jpg');

      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1536;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Background Paper texture with delicate grain
      ctx.fillStyle = '#fff9f2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 9000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = `rgba(201,168,106,${Math.random() * 0.05})`;
        ctx.fillRect(x, y, 1.2, 1.2);
      }

      // Elegant gold borders
      ctx.strokeStyle = '#c9a86a';
      ctx.lineWidth = 2.8;
      ctx.strokeRect(32, 32, canvas.width - 64, canvas.height - 64);

      ctx.lineWidth = 0.85;
      ctx.strokeStyle = 'rgba(201,168,106,0.45)';
      ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

      // Soft watercolor clouds in the corners
      const drawCloud = (cx: number, cy: number, r: number, col: string) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, col);
        g.addColorStop(1, 'rgba(255,249,242,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      };

      drawCloud(170, 230, 210, 'rgba(248,200,208,0.28)');
      drawCloud(860, 280, 190, 'rgba(168,216,234,0.22)');
      drawCloud(190, 1320, 170, 'rgba(200,230,200,0.18)');
      drawCloud(830, 1260, 200, 'rgba(248,200,208,0.20)');

      // Botanical leaves in corners
      const drawBotanical = (bx: number, by: number, flipX: boolean) => {
        ctx.save();
        ctx.translate(bx, by);
        if (flipX) ctx.scale(-1, 1);

        ctx.strokeStyle = 'rgba(127,164,110,0.55)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(12, -18, 28, -28);
        ctx.stroke();

        ctx.fillStyle = 'rgba(127,164,110,0.45)';
        [
          [10, -12, -0.6],
          [22, -24, 0.2],
          [32, -30, -0.3],
        ].forEach(([lx, ly, rot]) => {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, 9, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        [
          [30, -32],
          [38, -36],
        ].forEach(([fx, fy]) => {
          ctx.fillStyle = 'rgba(248,200,208,0.95)';
          ctx.beginPath();
          ctx.arc(fx, fy, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(232,145,168,0.7)';
          ctx.beginPath();
          ctx.arc(fx + 2, fy - 1, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      };

      drawBotanical(88, 1400, false);
      drawBotanical(936, 1400, true);
      drawBotanical(88, 140, false);
      drawBotanical(936, 140, true);

      const midX = canvas.width / 2;

      // Sacred Baptism Medallion above "Ginevra" (Pure white dove & olive wreath)
      if (baptismImg) {
        const radius = 86;
        const medalX = midX;
        const medalY = 180;

        ctx.save();
        ctx.beginPath();
        ctx.arc(medalX, medalY, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(baptismImg, medalX - radius, medalY - radius, radius * 2, radius * 2);
        ctx.restore();

        // Dual gold filigree borders around the sacred baptism medallion
        ctx.strokeStyle = '#c9a86a';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(medalX, medalY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(201,168,106,0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(medalX, medalY, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Watercolor butterfly illustrations on card
      const drawCardButterfly = (bx: number, by: number, scale: number, rot: number) => {
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(rot);
        ctx.scale(scale, scale);

        ctx.fillStyle = 'rgba(248,200,208,0.88)';
        ctx.beginPath();
        ctx.ellipse(-14, -4, 18, 12, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(14, -4, 18, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.62;
        ctx.beginPath();
        ctx.ellipse(-10, 6, 10, 7, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(10, 6, 10, 7, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#6b5a4a';
        ctx.fillRect(-1, -8, 2, 18);
        ctx.restore();
      };

      drawCardButterfly(210, 180, 0.65, -0.3);
      drawCardButterfly(820, 190, 0.6, 0.4);
      drawCardButterfly(760, 1340, 0.55, 0.2);

      // Typography
      ctx.textAlign = 'center';

      // Name "Ginevra" in Great Vibes cursive calligraphy
      ctx.fillStyle = '#a87e3a';
      ctx.font = '400 162px "Great Vibes", cursive';
      ctx.fillText('Ginevra', midX, 395);

      // "Il suo Battesimo"
      ctx.fillStyle = '#c9a86a';
      ctx.font = '300 36px "Cormorant Garamond", serif';
      ctx.fillText('Il suo Battesimo', midX, 448);

      // Decorative divider
      ctx.strokeStyle = 'rgba(201,168,106,0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const divY = 478;
      ctx.moveTo(midX - 120, divY);
      ctx.lineTo(midX + 120, divY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(midX, divY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#c9a86a';
      ctx.fill();

      // Date & Time
      let curY = 538;
      const lineStep = 42;
      const secStep = 28;

      ctx.fillStyle = '#4a3f35';
      ctx.font = '600 34px "Cormorant Garamond", serif';
      ctx.fillText('SABATO 17 OTTOBRE 2026', midX, curY);

      curY += lineStep;
      ctx.fillStyle = '#6b5a4a';
      ctx.font = '400 30px "Cormorant Garamond", serif';
      ctx.fillText('ore 19:00', midX, curY);

      curY += lineStep + secStep;

      // Divider
      ctx.strokeStyle = 'rgba(201,168,106,0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX - 40, curY - 12);
      ctx.lineTo(midX + 40, curY - 12);
      ctx.stroke();

      // Ceremony
      ctx.fillStyle = '#c9a86a';
      ctx.font = '400 22px "Cormorant Garamond", serif';
      ctx.fillText('Celebrazione presso', midX, curY);

      curY += 36;
      ctx.fillStyle = '#4a3f35';
      ctx.font = '600 32px "Cormorant Garamond", serif';
      ctx.fillText('Parrocchia Gesù Redentore', midX, curY);

      curY += 38;
      ctx.fillStyle = '#6b5a4a';
      ctx.font = '400 26px "Cormorant Garamond", serif';
      ctx.fillText('Via S. Maria La Carità, 477', midX, curY);

      curY += 30;
      ctx.font = '400 24px "Cormorant Garamond", serif';
      ctx.fillText("80057 Sant'Antonio Abate (NA)", midX, curY);

      curY += lineStep + secStep;

      // Divider
      ctx.strokeStyle = 'rgba(201,168,106,0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX - 40, curY - 12);
      ctx.lineTo(midX + 40, curY - 12);
      ctx.stroke();

      // Reception
      ctx.fillStyle = '#c9a86a';
      ctx.font = '400 22px "Cormorant Garamond", serif';
      ctx.fillText('A seguire, ore 20:30', midX, curY + 12);

      curY += 48;
      ctx.fillStyle = '#4a3f35';
      ctx.font = '400 24px "Cormorant Garamond", serif';
      ctx.fillText('festeggiamo insieme presso', midX, curY);

      curY += 38;
      ctx.font = '600 30px "Cormorant Garamond", serif';
      ctx.fillText('Ristorante Villa Palmentiello', midX, curY);

      curY += 38;
      ctx.fillStyle = '#6b5a4a';
      ctx.font = '400 26px "Cormorant Garamond", serif';
      ctx.fillText('Via Gesini', midX, curY);

      curY += 30;
      ctx.font = '400 24px "Cormorant Garamond", serif';
      ctx.fillText('80054 Casola di Napoli NA', midX, curY);

      curY += 78;

      // Sweet invitation closing note
      ctx.fillStyle = '#7a6a5a';
      ctx.font = 'italic 400 26px "Cormorant Garamond", serif';
      ctx.fillText('Con gioia vi aspettiamo', midX, curY);

      curY += 30;
      ctx.fillText('per condividere questo giorno speciale', midX, curY);

      curY += 46;
      ctx.fillStyle = '#c9a86a';
      ctx.font = '400 28px "Cormorant Garamond", serif';
      ctx.fillText('♡', midX, curY);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.needsUpdate = true;
      return tex;
    };

    // 16. Floating 3D Invitation Card
    const cardWidth = 0.82;
    const cardHeight = 1.23;
    const cardDepth = 0.012;
    const cardGeo = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);

    const baseMat = new THREE.MeshStandardMaterial({
      color: '#fff8f0',
      roughness: 0.8,
      metalness: 0,
    });

    const cardMats = [
      baseMat.clone(), // Right
      baseMat.clone(), // Left
      baseMat.clone(), // Top
      baseMat.clone(), // Bottom
      new THREE.MeshPhysicalMaterial({
        color: '#ffffff',
        roughness: 0.7,
        metalness: 0,
        clearcoat: 0.2,
        clearcoatRoughness: 0.5,
      }), // Front
      baseMat.clone(), // Back
    ];

    cardMats[0].color.set('#f5e8d8');
    cardMats[1].color.set('#f5e8d8');
    cardMats[2].color.set('#f5e8d8');
    cardMats[3].color.set('#f5e8d8');
    cardMats[5].color.set('#fffaf3');

    const card = new THREE.Mesh(cardGeo, cardMats);
    card.position.set(0, 0.55, 0);
    card.rotation.set(-0.06, 0.15, -0.015);
    card.castShadow = true;
    card.receiveShadow = true;
    scene.add(card);
    cardMeshRef.current = card;

    // Contact shadow plane beneath the card
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.7),
      new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.14 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0.1, 0.001, 0.25);
    scene.add(shadowPlane);

    generateCardTexture().then((tex) => {
      cardMats[4].map = tex;
      cardMats[4].color.set('#ffffff');
      cardMats[4].needsUpdate = true;
    });

    // 16. Realistic Animated Fairytale Butterflies (Smaller, anatomical veins & antennae)
    interface ButterflyInstance {
      group: THREE.Group;
      wingL: THREE.Mesh;
      wingR: THREE.Mesh;
      wingL2: THREE.Mesh;
      wingR2: THREE.Mesh;
      baseRadius: number;
      baseHeight: number;
      speed: number;
      offset: number;
      angle: number;
      yOffset: number;
    }

    const butterflies: ButterflyInstance[] = [];

    // Helper to generate realistic veined butterfly wing textures
    const createButterflyWingTextures = (baseColor: string, accentColor: string) => {
      const fwC = document.createElement('canvas');
      fwC.width = 128;
      fwC.height = 128;
      const fctx = fwC.getContext('2d');
      if (fctx) {
        fctx.clearRect(0, 0, 128, 128);
        fctx.beginPath();
        fctx.moveTo(10, 118);
        fctx.bezierCurveTo(18, 70, 36, 18, 98, 8);
        fctx.bezierCurveTo(120, 12, 122, 38, 114, 64);
        fctx.bezierCurveTo(106, 88, 76, 112, 15, 120);
        fctx.closePath();

        const grad = fctx.createRadialGradient(25, 105, 4, 65, 55, 90);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, baseColor);
        grad.addColorStop(0.85, accentColor);
        grad.addColorStop(1, '#2c221d');
        fctx.fillStyle = grad;
        fctx.fill();

        // Realistic veins radiating outward
        fctx.strokeStyle = 'rgba(44, 34, 29, 0.42)';
        fctx.lineWidth = 1.2;
        [
          [92, 14], [110, 30], [116, 50], [110, 72], [92, 94], [62, 112]
        ].forEach(([tx, ty]) => {
          fctx.beginPath();
          fctx.moveTo(20, 110);
          fctx.quadraticCurveTo(55, 75, tx, ty);
          fctx.stroke();
        });

        // Dark margin border
        fctx.lineWidth = 3.2;
        fctx.strokeStyle = 'rgba(44, 34, 29, 0.8)';
        fctx.stroke();

        // Delicate white pearl margin micro-dots
        fctx.fillStyle = '#ffffff';
        [[106, 22], [115, 38], [113, 56], [102, 76], [84, 98]].forEach(([dx, dy]) => {
          fctx.beginPath();
          fctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
          fctx.fill();
        });
      }

      const hwC = document.createElement('canvas');
      hwC.width = 128;
      hwC.height = 128;
      const hctx = hwC.getContext('2d');
      if (hctx) {
        hctx.clearRect(0, 0, 128, 128);
        hctx.beginPath();
        hctx.moveTo(16, 18);
        hctx.bezierCurveTo(48, 10, 94, 22, 110, 52);
        hctx.bezierCurveTo(116, 76, 104, 110, 74, 118);
        hctx.bezierCurveTo(42, 122, 18, 98, 12, 48);
        hctx.closePath();

        const grad = hctx.createRadialGradient(25, 25, 4, 60, 65, 75);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, baseColor);
        grad.addColorStop(0.85, accentColor);
        grad.addColorStop(1, '#2c221d');
        hctx.fillStyle = grad;
        hctx.fill();

        hctx.strokeStyle = 'rgba(44, 34, 29, 0.38)';
        hctx.lineWidth = 1.0;
        [[100, 42], [108, 66], [96, 90], [70, 110], [40, 112]].forEach(([tx, ty]) => {
          hctx.beginPath();
          hctx.moveTo(22, 22);
          hctx.quadraticCurveTo(55, 60, tx, ty);
          hctx.stroke();
        });

        hctx.lineWidth = 2.8;
        hctx.strokeStyle = 'rgba(44, 34, 29, 0.8)';
        hctx.stroke();

        hctx.fillStyle = '#ffffff';
        [[102, 50], [108, 70], [98, 90], [78, 106]].forEach(([dx, dy]) => {
          hctx.beginPath();
          hctx.arc(dx, dy, 1.4, 0, Math.PI * 2);
          hctx.fill();
        });
      }

      const fwTex = new THREE.CanvasTexture(fwC);
      fwTex.colorSpace = THREE.SRGBColorSpace;
      const hwTex = new THREE.CanvasTexture(hwC);
      hwTex.colorSpace = THREE.SRGBColorSpace;
      return { fwTex, hwTex };
    };

    const butterflyVarieties = [
      { base: '#fbc2d4', accent: '#e87295' }, // Soft rose swallowtail
      { base: '#fff2b2', accent: '#e0a33c' }, // Golden brimstone
      { base: '#c2e7f8', accent: '#5da4db' }, // Soft celestial blue morpho
      { base: '#e4d2f8', accent: '#9b6bd6' }, // Lavender fairy
      { base: '#fedbc8', accent: '#ea8d60' }, // Peach blossom
      { base: '#fefefe', accent: '#d6c8b8' }, // Pearl white
    ];

    const createRealisticButterfly = (variety: { base: string; accent: string }) => {
      const bGroup = new THREE.Group();
      const { fwTex, hwTex } = createButterflyWingTextures(variety.base, variety.accent);

      // Slender insect body aligned along Z axis (head at +Z, abdomen at -Z)
      const bodyMat = new THREE.MeshStandardMaterial({
        color: '#2e231d',
        roughness: 0.75,
      });

      // Thorax & Abdomen
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.005, 0.042, 4, 8), bodyMat);
      body.rotation.x = Math.PI / 2; // Aligns along Z axis so +Z is forward
      bGroup.add(body);

      // Head positioned at +Z (forward flight direction)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 6), bodyMat);
      head.position.set(0, 0.002, 0.026);
      bGroup.add(head);

      // Delicate curved antennae reaching forward towards +Z
      const antMat = new THREE.LineBasicMaterial({ color: '#2e231d' });
      [-0.006, 0.006].forEach((xOff) => {
        const antCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(xOff * 0.4, 0.004, 0.026),
          new THREE.Vector3(xOff * 1.3, 0.014, 0.042),
          new THREE.Vector3(xOff * 2.0, 0.018, 0.048)
        );
        const antGeo = new THREE.BufferGeometry().setFromPoints(antCurve.getPoints(8));
        const antLine = new THREE.Line(antGeo, antMat);
        bGroup.add(antLine);

        // Antenna club tip
        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.0018, 4, 4), bodyMat);
        tip.position.set(xOff * 2.0, 0.018, 0.048);
        bGroup.add(tip);
      });

      const wingMatFore = new THREE.MeshStandardMaterial({
        map: fwTex,
        side: THREE.DoubleSide,
        roughness: 0.65,
        transparent: true,
        alphaTest: 0.04,
      });

      const wingMatHind = new THREE.MeshStandardMaterial({
        map: hwTex,
        side: THREE.DoubleSide,
        roughness: 0.65,
        transparent: true,
        alphaTest: 0.04,
      });

      // Forewings (size ~0.075 x 0.065) - rotated so hinge is along Z and wing extends to +X
      const fwGeo = new THREE.PlaneGeometry(0.075, 0.065);
      fwGeo.rotateX(-Math.PI / 2);
      fwGeo.translate(0.038, 0.004, 0.012);

      // Right forewing
      const wingR = new THREE.Mesh(fwGeo, wingMatFore);
      wingR.position.set(0.003, 0.004, 0);

      // Left forewing (mirrored along X axis)
      const wingL = new THREE.Mesh(fwGeo, wingMatFore);
      wingL.position.set(-0.003, 0.004, 0);
      wingL.scale.set(-1, 1, 1);

      // Hindwings (size ~0.052 x 0.048)
      const hwGeo = new THREE.PlaneGeometry(0.052, 0.048);
      hwGeo.rotateX(-Math.PI / 2);
      hwGeo.translate(0.028, 0.002, -0.020);

      // Right hindwing
      const wingR2 = new THREE.Mesh(hwGeo, wingMatHind);
      wingR2.position.set(0.003, 0.002, 0);

      // Left hindwing (mirrored along X axis)
      const wingL2 = new THREE.Mesh(hwGeo, wingMatHind);
      wingL2.position.set(-0.003, 0.002, 0);
      wingL2.scale.set(-1, 1, 1);

      bGroup.add(wingL, wingR, wingL2, wingR2);
      bGroup.castShadow = true;

      return { group: bGroup, wingL, wingR, wingL2, wingR2 };
    };

    for (let i = 0; i < 7; i++) {
      const v = butterflyVarieties[i % butterflyVarieties.length];
      const { group, wingL, wingR, wingL2, wingR2 } = createRealisticButterfly(v);
      const inst: ButterflyInstance = {
        group,
        wingL,
        wingR,
        wingL2,
        wingR2,
        baseRadius: 0.55 + Math.random() * 0.9,
        baseHeight: 0.55 + Math.random() * 0.8,
        speed: 0.35 + Math.random() * 0.45,
        offset: Math.random() * Math.PI * 2,
        angle: (i / 7) * Math.PI * 2,
        yOffset: Math.random() * 10,
      };
      scene.add(group);
      butterflies.push(inst);
    }

    // 18. Low-Poly Hot Air Balloons Moving in the Sky
    interface BalloonInstance {
      group: THREE.Group;
      baseY: number;
      speedX: number;
      bobSpeed: number;
      bobAmp: number;
      phase: number;
      driftZ: number;
    }

    const balloons: BalloonInstance[] = [];

    // Helper to generate low-poly striped balloon textures with distinct fairytale themes
    const createBalloonTexture = (colorA: string, colorB: string, goldAccent = '#c9a86a') => {
      const bc = document.createElement('canvas');
      bc.width = 512;
      bc.height = 512;
      const bctx = bc.getContext('2d');
      if (bctx) {
        bctx.fillStyle = colorB;
        bctx.fillRect(0, 0, bc.width, bc.height);
        const stripeWidth = 512 / 10;
        for (let s = 0; s < 10; s++) {
          if (s % 2 === 0) {
            bctx.fillStyle = colorA;
            bctx.fillRect(s * stripeWidth, 0, stripeWidth, bc.height);
          }
          // Delicate gold divider line
          bctx.fillStyle = goldAccent;
          bctx.fillRect(s * stripeWidth, 0, 3, bc.height);
        }
      }
      const btex = new THREE.CanvasTexture(bc);
      btex.wrapS = THREE.RepeatWrapping;
      btex.colorSpace = THREE.SRGBColorSpace;
      return btex;
    };

    const balloonThemes = [
      { a: '#f8c8d0', b: '#fffaf2' }, // Blush Rose & Ivory Cream
      { a: '#a8d8ea', b: '#ffffff' }, // Celestial Sky Blue & Snow White
      { a: '#dfc6f5', b: '#fff8eb' }, // Pastel Lilac & Sweet Vanilla
      { a: '#ffd1ba', b: '#ffffff' }, // Peach Blossom & Pure White
      { a: '#cbead6', b: '#f6ebd0' }, // Mint Eucalyptus & Soft Gold
    ];

    const balloonDefs = [
      { startX: -3.4, y: 1.85, z: -1.9, scale: 0.62, speedX: 0.08, theme: 0 },
      { startX: -0.6, y: 2.35, z: -2.6, scale: 0.50, speedX: 0.055, theme: 1 },
      { startX: 1.8, y: 1.70, z: -2.2, scale: 0.68, speedX: 0.075, theme: 2 },
      { startX: -4.8, y: 2.50, z: -3.4, scale: 0.42, speedX: 0.042, theme: 3 },
      { startX: 3.5, y: 2.05, z: -2.4, scale: 0.56, speedX: 0.065, theme: 4 },
    ];

    balloonDefs.forEach((bDef, bIndex) => {
      const theme = balloonThemes[bDef.theme % balloonThemes.length];
      const bTex = createBalloonTexture(theme.a, theme.b);
      const bGrp = new THREE.Group();

      // Low-poly envelope material with flat shading
      const envelopeMat = new THREE.MeshStandardMaterial({
        map: bTex,
        roughness: 0.65,
        flatShading: true,
      });

      // 1. Top dome (faceted sphere with flatShading)
      const topGeo = new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const topMesh = new THREE.Mesh(topGeo, envelopeMat);
      topMesh.position.y = 0.55;
      topMesh.castShadow = true;
      bGrp.add(topMesh);

      // 2. Lower cone (tapered faceted cylinder)
      const coneGeo = new THREE.CylinderGeometry(0.54, 0.18, 0.46, 12, 1, true);
      const coneMesh = new THREE.Mesh(coneGeo, envelopeMat);
      coneMesh.position.y = 0.32;
      coneMesh.castShadow = true;
      bGrp.add(coneMesh);

      // 3. Gold collar ring at burner opening
      const collarGeo = new THREE.TorusGeometry(0.18, 0.02, 6, 12);
      const goldMat = new THREE.MeshStandardMaterial({
        color: '#c9a86a',
        metalness: 0.5,
        roughness: 0.35,
        flatShading: true,
      });
      const collarMesh = new THREE.Mesh(collarGeo, goldMat);
      collarMesh.rotation.x = Math.PI / 2;
      collarMesh.position.y = 0.09;
      bGrp.add(collarMesh);

      // 4. Burner housing & warm glowing flame
      const burnerMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6),
        goldMat
      );
      burnerMesh.position.y = 0.06;
      bGrp.add(burnerMesh);

      const flameMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.03, 0),
        new THREE.MeshBasicMaterial({ color: '#ffb347' })
      );
      flameMesh.position.y = 0.04;
      bGrp.add(flameMesh);

      // 5. Low-Poly Wicker Basket
      const basketMat = new THREE.MeshStandardMaterial({
        color: '#b08a54',
        roughness: 0.85,
        flatShading: true,
      });
      const basket = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.12, 0.16),
        basketMat
      );
      basket.position.y = -0.16;
      basket.castShadow = true;
      bGrp.add(basket);

      // Rim of basket
      const rim = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.025, 0.18),
        basketMat
      );
      rim.position.y = -0.095;
      bGrp.add(rim);

      // 6. Suspension Rigging Cords
      const lineMat = new THREE.LineBasicMaterial({
        color: '#6b5a4a',
        transparent: true,
        opacity: 0.65,
      });
      [
        [new THREE.Vector3(-0.16, 0.09, -0.08), new THREE.Vector3(-0.07, -0.10, -0.07)],
        [new THREE.Vector3(0.16, 0.09, -0.08), new THREE.Vector3(0.07, -0.10, -0.07)],
        [new THREE.Vector3(-0.16, 0.09, 0.08), new THREE.Vector3(-0.07, -0.10, 0.07)],
        [new THREE.Vector3(0.16, 0.09, 0.08), new THREE.Vector3(0.07, -0.10, 0.07)],
      ].forEach(([p1, p2]) => {
        const lGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const line = new THREE.Line(lGeo, lineMat);
        bGrp.add(line);
      });

      // 7. Mini Low-Poly Bunting (Pennant flags) around the equator
      const flagGeo = new THREE.ConeGeometry(0.028, 0.05, 3);
      flagGeo.rotateX(Math.PI);
      const flagColors = ['#f8c8d0', '#c9a86a', '#a8d8ea', '#ffffff'];
      for (let f = 0; f < 8; f++) {
        const fAng = (f / 8) * Math.PI * 2;
        const fMesh = new THREE.Mesh(
          flagGeo,
          new THREE.MeshStandardMaterial({
            color: flagColors[f % flagColors.length],
            roughness: 0.6,
            flatShading: true,
          })
        );
        fMesh.position.set(Math.cos(fAng) * 0.55, 0.54, Math.sin(fAng) * 0.55);
        fMesh.rotation.y = -fAng;
        bGrp.add(fMesh);
      }

      bGrp.position.set(bDef.startX, bDef.y, bDef.z);
      bGrp.scale.setScalar(bDef.scale);
      scene.add(bGrp);

      balloons.push({
        group: bGrp,
        baseY: bDef.y,
        speedX: bDef.speedX,
        bobSpeed: 0.4 + (bIndex % 3) * 0.15,
        bobAmp: 0.12 + (bIndex % 2) * 0.08,
        phase: bIndex * 1.5,
        driftZ: bDef.z,
      });
    });

    // 19. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 0.6;
    controls.maxDistance = 6.5;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.maxAzimuthAngle = Math.PI / 2.2;
    controls.minAzimuthAngle = -Math.PI / 2.2;
    controls.target.set(0, 0.55, 0);
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.35;
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      onUserInteract?.();
    });

    // Click on 3D card detection
    const handlePointerDown = (e: PointerEvent) => {
      if (!cardMeshRef.current) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObject(cardMeshRef.current);
      if (intersects.length > 0) {
        onCardClick?.();
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);

    // 20. Animation Loop
    const clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;

      controls.update();

      // Realistic butterflies flutter & orbital flight
      butterflies.forEach((b) => {
        b.angle += delta * b.speed * 0.45;
        const bx = Math.cos(b.angle + b.offset) * b.baseRadius;
        const bz = Math.sin(b.angle * 0.9 + b.offset) * b.baseRadius * 0.85;
        const by =
          b.baseHeight +
          Math.sin(elapsed * 1.5 + b.yOffset) * 0.18 +
          Math.cos(b.angle * 2) * 0.08;
        b.group.position.set(bx, by, bz);

        const lookAngle = b.angle + 0.08;
        const lx = Math.cos(lookAngle + b.offset) * b.baseRadius;
        const lz = Math.sin(lookAngle * 0.9 + b.offset) * b.baseRadius * 0.85;
        const ly =
          b.baseHeight +
          Math.sin(elapsed * 1.5 + b.yOffset + 0.08) * 0.18 +
          Math.cos(lookAngle * 2) * 0.08;
        // Butterfly head is aligned to +Z, so lookAt points the head straight forward along the flight trajectory
        b.group.lookAt(lx, ly, lz);

        // Realistic fast delicate wing flutter lifting upward around Z
        const flap = (Math.sin(elapsed * 16 + b.yOffset) * 0.5 + 0.5) * 0.88;
        b.wingR.rotation.z = flap;
        b.wingL.rotation.z = -flap;
        b.wingR2.rotation.z = flap * 0.82;
        b.wingL2.rotation.z = -flap * 0.82;
      });

      // Low-poly hot air balloons drifting serenely across the sky
      balloons.forEach((b) => {
        b.group.position.x += delta * b.speedX;
        // Wrap around horizon so balloons continuously cruise across the sky
        if (b.group.position.x > 5.5) {
          b.group.position.x = -5.5;
        }
        b.group.position.y = b.baseY + Math.sin(elapsed * b.bobSpeed + b.phase) * b.bobAmp;
        b.group.position.z = b.driftZ + Math.cos(elapsed * 0.35 + b.phase) * 0.08;
        b.group.rotation.z = Math.sin(elapsed * 0.65 + b.phase) * 0.04;
        b.group.rotation.y += delta * 0.05;
      });

      // Subtle card breath animation
      card.position.y = 0.55 + Math.sin(elapsed * 0.6) * 0.004;

      renderer.render(scene, camera);
    };

    animate();

    // 21. Window Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if ('geometry' in obj && obj.geometry instanceof THREE.BufferGeometry) {
          obj.geometry.dispose();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onUserInteract, onCardClick]);

  return (
    <div
      id="three-canvas-container"
      ref={containerRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    />
  );
};
