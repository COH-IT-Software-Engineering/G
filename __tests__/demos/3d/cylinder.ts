import {
  MeshPhongMaterial,
  CylinderGeometry,
  DirectionalLight,
  Mesh,
  Plugin as Plugin3D,
} from '../../../packages/g-plugin-3d';
import { Plugin as PluginControl } from '../../../packages/g-plugin-control';

export async function cylinder(context) {
  const { canvas, renderer } = context;

  renderer.registerPlugin(new Plugin3D());
  renderer.registerPlugin(new PluginControl());

  // wait for canvas' initialization complete
  await canvas.ready;

  // use GPU device
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();

  const cylinderGeometry = new CylinderGeometry(device, {
    radius: 100,
    height: 200,
  });
  const basicMaterial = new MeshPhongMaterial(device, {
    wireframe: true,
  });

  const cylinder = new Mesh({
    style: {
      x: 300,
      y: 250,
      fill: 'white',
      opacity: 1,
      geometry: cylinderGeometry,
      material: basicMaterial,
    },
  });

  canvas.appendChild(cylinder);

  // add a directional light into scene
  const light = new DirectionalLight({
    style: {
      fill: 'white',
      direction: [-1, 0, 1],
      intensity: 3,
    },
  });
  canvas.appendChild(light);

  const camera = canvas.getCamera();
  camera.setPosition(300, 0, 500);
}
