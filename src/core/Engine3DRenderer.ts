import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ComponentType } from './Physics';
import { Colors } from './Theme';

/**
 * 3D Engine Renderer using Three.js
 * Creates realistic 3D models of rocket engine components
 */
export class Engine3DRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private componentMeshes: Map<string, THREE.Object3D> = new Map();
  private engineGroup: THREE.Group;
  private animationId: number | null = null;
  
  // Materials
  private materials: Record<string, THREE.Material> = {};

  constructor(container: HTMLElement, width: number, height: number) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a10);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(3, 2, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Position the canvas
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';

    // Orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 15;
    this.controls.target.set(0, 0, 0);

    // Lighting
    this.setupLighting();

    // Materials
    this.setupMaterials();

    // Engine group (all components will be added here)
    this.engineGroup = new THREE.Group();
    this.scene.add(this.engineGroup);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x333344, 0x222233);
    gridHelper.position.y = -3;
    this.scene.add(gridHelper);

    // Start render loop
    this.animate();
  }

  private setupLighting(): void {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x404050, 0.5);
    this.scene.add(ambient);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x4ecdc4, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);

    // Rim light (orange accent)
    const rimLight = new THREE.DirectionalLight(0xff6b35, 0.4);
    rimLight.position.set(0, -5, 5);
    this.scene.add(rimLight);
  }

  private setupMaterials(): void {
    // Stainless steel
    this.materials.steel = new THREE.MeshStandardMaterial({
      color: 0x888899,
      metalness: 0.8,
      roughness: 0.3,
    });

    // Aluminum
    this.materials.aluminum = new THREE.MeshStandardMaterial({
      color: 0xaabbcc,
      metalness: 0.6,
      roughness: 0.4,
    });

    // Copper (for combustion chamber)
    this.materials.copper = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Carbon composite
    this.materials.carbon = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.1,
      roughness: 0.8,
    });

    // Fuel tank (RP-1 kerosene - reddish)
    this.materials.fuelTank = new THREE.MeshStandardMaterial({
      color: 0x8b2500,
      metalness: 0.4,
      roughness: 0.5,
    });

    // Oxidizer tank (LOX - blue/white)
    this.materials.oxidizerTank = new THREE.MeshStandardMaterial({
      color: 0x4a6fa5,
      metalness: 0.4,
      roughness: 0.5,
    });

    // Nozzle interior (ablative/heat resistant)
    this.materials.nozzleInterior = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      metalness: 0.2,
      roughness: 0.9,
    });

    // Turbopump housing
    this.materials.turbopump = new THREE.MeshStandardMaterial({
      color: 0x556677,
      metalness: 0.7,
      roughness: 0.4,
    });

    // Brass (for injectors)
    this.materials.brass = new THREE.MeshStandardMaterial({
      color: 0xb5a642,
      metalness: 0.8,
      roughness: 0.3,
    });

    // Piping
    this.materials.pipe = new THREE.MeshStandardMaterial({
      color: 0x666677,
      metalness: 0.6,
      roughness: 0.4,
    });
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public updateComponents(components: Array<{ id: string; type: ComponentType; properties: Record<string, number> }>): void {
    // Clear existing meshes
    this.engineGroup.clear();
    this.componentMeshes.clear();

    if (components.length === 0) {
      this.addPlaceholder();
      return;
    }

    // Calculate positions for components (stacked vertically)
    let yOffset = 2;
    const hasComponent = (type: ComponentType) => components.some(c => c.type === type);

    // Fuel and Oxidizer tanks (side by side at top)
    if (hasComponent('fuelTank') || hasComponent('oxidizerTank')) {
      const fuelComp = components.find(c => c.type === 'fuelTank');
      const oxComp = components.find(c => c.type === 'oxidizerTank');

      if (fuelComp) {
        const tank = this.createFuelTank(fuelComp.properties);
        tank.position.set(-0.5, yOffset, 0);
        this.engineGroup.add(tank);
        this.componentMeshes.set(fuelComp.id, tank);
      }

      if (oxComp) {
        const tank = this.createOxidizerTank(oxComp.properties);
        tank.position.set(0.5, yOffset, 0);
        this.engineGroup.add(tank);
        this.componentMeshes.set(oxComp.id, tank);
      }

      // Feed lines from tanks
      if (fuelComp || oxComp) {
        const feedLines = this.createFeedLines(!!fuelComp, !!oxComp);
        feedLines.position.y = yOffset - 0.8;
        this.engineGroup.add(feedLines);
      }

      yOffset -= 1.8;
    }

    // Turbopump
    const pumpComp = components.find(c => c.type === 'turbopump');
    if (pumpComp) {
      const pump = this.createTurbopump(pumpComp.properties);
      pump.position.y = yOffset;
      this.engineGroup.add(pump);
      this.componentMeshes.set(pumpComp.id, pump);
      yOffset -= 0.8;
    }

    // Fuel injector
    const injectorComp = components.find(c => c.type === 'fuelInjector');
    if (injectorComp) {
      const injector = this.createFuelInjector(injectorComp.properties);
      injector.position.y = yOffset;
      this.engineGroup.add(injector);
      this.componentMeshes.set(injectorComp.id, injector);
      yOffset -= 0.3;
    }

    // Combustion chamber
    const chamberComp = components.find(c => c.type === 'combustionChamber');
    if (chamberComp) {
      const chamber = this.createCombustionChamber(chamberComp.properties);
      chamber.position.y = yOffset;
      this.engineGroup.add(chamber);
      this.componentMeshes.set(chamberComp.id, chamber);
      yOffset -= 0.9;
    }

    // Nozzle
    const nozzleComp = components.find(c => c.type === 'nozzle');
    if (nozzleComp) {
      const nozzle = this.createNozzle(nozzleComp.properties);
      nozzle.position.y = yOffset;
      this.engineGroup.add(nozzle);
      this.componentMeshes.set(nozzleComp.id, nozzle);
    }

    // Center the engine group
    this.centerEngine();
  }

  private addPlaceholder(): void {
    const geometry = new THREE.TorusKnotGeometry(0.5, 0.15, 100, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x333344,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    this.engineGroup.add(mesh);
  }

  private createFuelTank(props: Record<string, number>): THREE.Group {
    const group = new THREE.Group();
    const volume = props.volume || 100;
    const height = 0.6 + (volume / 200) * 0.4;
    const radius = 0.25 + (volume / 500) * 0.15;

    // Main cylinder
    const cylinderGeom = new THREE.CylinderGeometry(radius, radius, height, 32);
    const cylinder = new THREE.Mesh(cylinderGeom, this.materials.fuelTank);
    cylinder.castShadow = true;
    group.add(cylinder);

    // Top dome
    const domeGeom = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const topDome = new THREE.Mesh(domeGeom, this.materials.fuelTank);
    topDome.position.y = height / 2;
    topDome.castShadow = true;
    group.add(topDome);

    // Bottom dome (inverted)
    const bottomDome = new THREE.Mesh(domeGeom, this.materials.fuelTank);
    bottomDome.position.y = -height / 2;
    bottomDome.rotation.x = Math.PI;
    bottomDome.castShadow = true;
    group.add(bottomDome);

    // Tank label ring
    const ringGeom = new THREE.TorusGeometry(radius + 0.02, 0.015, 8, 32);
    const ring = new THREE.Mesh(ringGeom, this.materials.steel);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = height / 4;
    group.add(ring);

    // RP-1 label band
    const bandGeom = new THREE.CylinderGeometry(radius + 0.01, radius + 0.01, 0.1, 32);
    const band = new THREE.Mesh(bandGeom, new THREE.MeshStandardMaterial({ color: 0xcc4444 }));
    band.position.y = 0;
    group.add(band);

    return group;
  }

  private createOxidizerTank(props: Record<string, number>): THREE.Group {
    const group = new THREE.Group();
    const volume = props.volume || 100;
    const height = 0.6 + (volume / 200) * 0.4;
    const radius = 0.25 + (volume / 500) * 0.15;

    // Main cylinder
    const cylinderGeom = new THREE.CylinderGeometry(radius, radius, height, 32);
    const cylinder = new THREE.Mesh(cylinderGeom, this.materials.oxidizerTank);
    cylinder.castShadow = true;
    group.add(cylinder);

    // Top dome
    const domeGeom = new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const topDome = new THREE.Mesh(domeGeom, this.materials.oxidizerTank);
    topDome.position.y = height / 2;
    topDome.castShadow = true;
    group.add(topDome);

    // Bottom dome
    const bottomDome = new THREE.Mesh(domeGeom, this.materials.oxidizerTank);
    bottomDome.position.y = -height / 2;
    bottomDome.rotation.x = Math.PI;
    bottomDome.castShadow = true;
    group.add(bottomDome);

    // Frost effect (LOX is cryogenic)
    const frostGeom = new THREE.CylinderGeometry(radius + 0.02, radius + 0.02, height * 0.6, 32);
    const frostMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      roughness: 1,
    });
    const frost = new THREE.Mesh(frostGeom, frostMat);
    frost.position.y = -height * 0.1;
    group.add(frost);

    // LOX label band
    const bandGeom = new THREE.CylinderGeometry(radius + 0.01, radius + 0.01, 0.1, 32);
    const band = new THREE.Mesh(bandGeom, new THREE.MeshStandardMaterial({ color: 0x6699ff }));
    band.position.y = 0;
    group.add(band);

    return group;
  }

  private createFeedLines(hasFuel: boolean, hasOx: boolean): THREE.Group {
    const group = new THREE.Group();
    const pipeRadius = 0.03;

    if (hasFuel) {
      // Fuel feed line
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.5, 0.5, 0),
        new THREE.Vector3(-0.3, 0.2, 0),
        new THREE.Vector3(0, 0, 0)
      );
      const tubeGeom = new THREE.TubeGeometry(curve, 20, pipeRadius, 8, false);
      const tube = new THREE.Mesh(tubeGeom, this.materials.pipe);
      group.add(tube);
    }

    if (hasOx) {
      // Oxidizer feed line
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0.5, 0.5, 0),
        new THREE.Vector3(0.3, 0.2, 0),
        new THREE.Vector3(0, 0, 0)
      );
      const tubeGeom = new THREE.TubeGeometry(curve, 20, pipeRadius, 8, false);
      const tube = new THREE.Mesh(tubeGeom, this.materials.pipe);
      group.add(tube);
    }

    return group;
  }

  private createTurbopump(props: Record<string, number>): THREE.Group {
    const group = new THREE.Group();
    const power = props.power || 500;
    const scale = 0.8 + (power / 2000) * 0.4;

    // Main pump housing
    const housingGeom = new THREE.CylinderGeometry(0.2 * scale, 0.25 * scale, 0.35, 32);
    const housing = new THREE.Mesh(housingGeom, this.materials.turbopump);
    housing.castShadow = true;
    group.add(housing);

    // Turbine section (top)
    const turbineGeom = new THREE.CylinderGeometry(0.18 * scale, 0.2 * scale, 0.15, 32);
    const turbine = new THREE.Mesh(turbineGeom, this.materials.steel);
    turbine.position.y = 0.25;
    turbine.castShadow = true;
    group.add(turbine);

    // Pump impeller housing (bottom)
    const impellerGeom = new THREE.SphereGeometry(0.22 * scale, 32, 16);
    const impeller = new THREE.Mesh(impellerGeom, this.materials.aluminum);
    impeller.position.y = -0.2;
    impeller.scale.y = 0.6;
    impeller.castShadow = true;
    group.add(impeller);

    // Input/output flanges
    const flangeGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 16);
    
    // Fuel inlet
    const fuelInlet = new THREE.Mesh(flangeGeom, this.materials.pipe);
    fuelInlet.rotation.z = Math.PI / 2;
    fuelInlet.position.set(-0.25, 0.1, 0);
    group.add(fuelInlet);

    // Fuel outlet
    const fuelOutlet = new THREE.Mesh(flangeGeom, this.materials.pipe);
    fuelOutlet.rotation.z = Math.PI / 2;
    fuelOutlet.position.set(-0.25, -0.15, 0);
    group.add(fuelOutlet);

    // Oxidizer inlet
    const oxInlet = new THREE.Mesh(flangeGeom, this.materials.pipe);
    oxInlet.rotation.z = Math.PI / 2;
    oxInlet.position.set(0.25, 0.1, 0);
    group.add(oxInlet);

    // Oxidizer outlet
    const oxOutlet = new THREE.Mesh(flangeGeom, this.materials.pipe);
    oxOutlet.rotation.z = Math.PI / 2;
    oxOutlet.position.set(0.25, -0.15, 0);
    group.add(oxOutlet);

    return group;
  }

  private createFuelInjector(props: Record<string, number>): THREE.Group {
    const group = new THREE.Group();
    const numElements = Math.floor(props.elements || 100);

    // Injector face plate
    const plateGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32);
    const plate = new THREE.Mesh(plateGeom, this.materials.brass);
    plate.castShadow = true;
    group.add(plate);

    // Injector mounting ring
    const ringGeom = new THREE.TorusGeometry(0.28, 0.025, 8, 32);
    const ring = new THREE.Mesh(ringGeom, this.materials.steel);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.04;
    group.add(ring);

    // Injector orifices (visual representation)
    const holeGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.09, 8);
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    
    // Create injector pattern (concentric rings)
    const rings = Math.min(5, Math.floor(numElements / 20) + 1);
    for (let r = 1; r <= rings; r++) {
      const radius = r * 0.05;
      const count = r * 6;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const hole = new THREE.Mesh(holeGeom, holeMat);
        hole.position.set(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        );
        group.add(hole);
      }
    }

    // Feed manifold connections
    const manifoldGeom = new THREE.TorusGeometry(0.2, 0.03, 8, 32);
    const manifold = new THREE.Mesh(manifoldGeom, this.materials.pipe);
    manifold.rotation.x = Math.PI / 2;
    manifold.position.y = 0.1;
    group.add(manifold);

    return group;
  }

  private createCombustionChamber(props: Record<string, number>): THREE.Group {
    const group = new THREE.Group();
    const pressure = props.chamberPressure || 5;
    const thickness = 0.02 + (pressure / 20) * 0.02;
    const innerRadius = 0.25;
    const outerRadius = innerRadius + thickness;
    const height = 0.6;

    // Outer shell (regeneratively cooled)
    const outerGeom = new THREE.CylinderGeometry(outerRadius, outerRadius * 1.1, height, 32);
    const outer = new THREE.Mesh(outerGeom, this.materials.copper);
    outer.castShadow = true;
    group.add(outer);

    // Cooling channel ribs (visible on outside)
    const ribCount = 24;
    for (let i = 0; i < ribCount; i++) {
      const angle = (i / ribCount) * Math.PI * 2;
      const ribGeom = new THREE.BoxGeometry(0.01, height, 0.02);
      const rib = new THREE.Mesh(ribGeom, this.materials.copper);
      rib.position.set(
        Math.cos(angle) * (outerRadius + 0.005),
        0,
        Math.sin(angle) * (outerRadius + 0.005)
      );
      rib.rotation.y = -angle;
      group.add(rib);
    }

    // Top flange (connects to injector)
    const topFlangeGeom = new THREE.CylinderGeometry(outerRadius + 0.03, outerRadius + 0.03, 0.05, 32);
    const topFlange = new THREE.Mesh(topFlangeGeom, this.materials.steel);
    topFlange.position.y = height / 2;
    group.add(topFlange);

    // Bottom flange (connects to nozzle)
    const bottomFlangeGeom = new THREE.CylinderGeometry(outerRadius * 1.15, outerRadius * 1.15, 0.05, 32);
    const bottomFlange = new THREE.Mesh(bottomFlangeGeom, this.materials.steel);
    bottomFlange.position.y = -height / 2;
    group.add(bottomFlange);

    // Igniter port
    const igniterGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.1, 16);
    const igniter = new THREE.Mesh(igniterGeom, this.materials.steel);
    igniter.rotation.z = Math.PI / 2;
    igniter.position.set(outerRadius + 0.05, height / 4, 0);
    group.add(igniter);

    return group;
  }

  private createNozzle(props: Record<string, number>): THREE.Group {
    const group = new THREE.Group();
    const expansionRatio = props.expansionRatio || 20;
    
    // Calculate nozzle dimensions based on expansion ratio
    const throatRadius = 0.1;
    const exitRadius = throatRadius * Math.sqrt(expansionRatio);
    const nozzleLength = 0.8 + (expansionRatio / 40) * 0.4;

    // Create de Laval nozzle profile using LatheGeometry
    const points: THREE.Vector2[] = [];
    const segments = 50;
    
    // Converging section (from chamber)
    const convergeLength = 0.15;
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const y = -t * convergeLength;
      const r = 0.28 - (0.28 - throatRadius) * Math.pow(t, 1.5);
      points.push(new THREE.Vector2(r, y));
    }
    
    // Throat section
    points.push(new THREE.Vector2(throatRadius, -convergeLength));
    
    // Diverging section (bell curve - parabolic approximation)
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const y = -convergeLength - t * nozzleLength;
      // Bell curve profile
      const r = throatRadius + (exitRadius - throatRadius) * (1 - Math.pow(1 - t, 2));
      points.push(new THREE.Vector2(r, y));
    }
    
    const nozzleGeom = new THREE.LatheGeometry(points, 64);
    const nozzle = new THREE.Mesh(nozzleGeom, this.materials.nozzleInterior);
    nozzle.castShadow = true;
    group.add(nozzle);

    // Outer shell (thinner at exit)
    const outerPoints: THREE.Vector2[] = points.map((p, i) => {
      const thickness = 0.03 * (1 - (i / points.length) * 0.5);
      return new THREE.Vector2(p.x + thickness, p.y);
    });
    
    const outerGeom = new THREE.LatheGeometry(outerPoints, 64);
    const outer = new THREE.Mesh(outerGeom, this.materials.steel);
    outer.castShadow = true;
    group.add(outer);

    // Mounting flange at top
    const flangeGeom = new THREE.TorusGeometry(0.3, 0.025, 8, 32);
    const flange = new THREE.Mesh(flangeGeom, this.materials.steel);
    flange.rotation.x = Math.PI / 2;
    flange.position.y = 0.02;
    group.add(flange);

    // Nozzle extension ribs (for structural support)
    const ribCount = 8;
    for (let i = 0; i < ribCount; i++) {
      const angle = (i / ribCount) * Math.PI * 2;
      const ribGeom = new THREE.BoxGeometry(0.02, nozzleLength * 0.7, 0.01);
      const rib = new THREE.Mesh(ribGeom, this.materials.steel);
      const avgRadius = (throatRadius + exitRadius) / 2 + 0.04;
      rib.position.set(
        Math.cos(angle) * avgRadius,
        -convergeLength - nozzleLength * 0.4,
        Math.sin(angle) * avgRadius
      );
      rib.rotation.y = -angle;
      group.add(rib);
    }

    return group;
  }

  private centerEngine(): void {
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(this.engineGroup);
    const center = box.getCenter(new THREE.Vector3());
    
    // Offset to center
    this.engineGroup.position.sub(center);
    this.controls.target.set(0, 0, 0);
  }

  public highlightComponent(componentId: string | null): void {
    // Reset all materials
    this.componentMeshes.forEach((mesh) => {
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.originalMaterial) {
          child.material = child.userData.originalMaterial;
        }
      });
    });

    // Highlight selected
    if (componentId) {
      const mesh = this.componentMeshes.get(componentId);
      if (mesh) {
        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.userData.originalMaterial = child.material;
            child.material = new THREE.MeshStandardMaterial({
              color: Colors.secondary,
              emissive: Colors.secondary,
              emissiveIntensity: 0.3,
              metalness: 0.5,
              roughness: 0.5,
            });
          }
        });
      }
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    
    // Dispose geometries and materials
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });
  }

  public resetCamera(): void {
    this.camera.position.set(3, 2, 5);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
}
