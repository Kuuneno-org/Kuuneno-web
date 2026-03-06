import { shallowMount } from '@vue/test-utils';
import HomeScene from '@/components/home/HomeScene.vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Mocks
jest.mock('three', () => {
  const original = jest.requireActual('three');
  return {
    ...original,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      setPixelRatio: jest.fn(),
      domElement: document.createElement('canvas'),
      shadowMap: { enabled: false, type: 0 },
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      fog: null,
    })),
    PerspectiveCamera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn(), copy: jest.fn() },
      lookAt: jest.fn(),
      updateProjectionMatrix: jest.fn(),
      aspect: 1,
    })),
    Group: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      rotation: { x: 0 },
      position: { y: 0 },
    })),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
    })),
    PointLight: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
    })),
    Box3: jest.fn().mockImplementation(() => ({
      setFromObject: jest.fn().mockReturnThis(),
      getSize: jest.fn().mockReturnValue({ x: 10, y: 10, z: 10 }),
      getCenter: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
      min: { y: 0 },
    })),
    AnimationMixer: jest.fn().mockImplementation(() => ({
      clipAction: jest.fn().mockReturnValue({ play: jest.fn() }),
      update: jest.fn(),
    })),
    // Mock Mesh to avoid strict type checks if any
    Mesh: jest.fn().mockImplementation(() => ({
        rotation: { x: 0 },
        position: { y: 0 },
        receiveShadow: false,
    })),
  };
});

jest.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn((url, onLoad) => {
      // Simulate successful load
      const dummyGLTF = {
        scene: {
          traverse: jest.fn((cb) => {
             // traverse expects a callback that receives a child
             // Let's verify it works by passing a dummy child
             // The code checks if (c.isMesh).
             cb({ isMesh: true, castShadow: false, receiveShadow: false, name: 'mesh' });
             cb({ isMesh: false, name: 'other' });
          }),
          clone: jest.fn().mockReturnValue({
            position: { set: jest.fn() },
            rotation: { y: 0 },
            scale: { set: jest.fn() },
          }),
          scale: { set: jest.fn() },
          updateMatrixWorld: jest.fn(),
          position: { x: 0, y: 0, z: 0 },
          name: 'scene',
        },
        animations: [],
      };
      // Call the callback immediately
      if (onLoad) onLoad(dummyGLTF);
    }),
  })),
}));

jest.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({
    enableDamping: false,
    update: jest.fn(),
    target: { copy: jest.fn(), set: jest.fn(), x:0, y:0, z:0 },
    dispose: jest.fn(),
  })),
}));

jest.mock('gsap', () => ({
  to: jest.fn(),
}));

describe('HomeScene.vue', () => {
  it('renders and initializes the 3D scene', async () => {
    const wrapper = shallowMount(HomeScene, {
      props: {
        activeIndex: -1,
        isGameStarted: false,
      },
      global: {
        stubs: {
          GhostMask: true,
          MagicBook: true,
          MagicCredits: true,
          MagicGamepad: true,
          MagicMoon: true,
          KuunenoFox: true,
          PikminEvol: true,
          KuunenoSample: true,
          RoundTable: true,
        }
      }
    });

    // Verify canvas presence
    expect(wrapper.find('canvas').exists()).toBe(true);

    // Verify WebGLRenderer initialization
    expect(THREE.WebGLRenderer).toHaveBeenCalled();

    // Verify GLTFLoader usage
    expect(GLTFLoader).toHaveBeenCalled();
    const mockLoader = (GLTFLoader as unknown as jest.Mock).mock.results[0].value;
    expect(mockLoader.load).toHaveBeenCalled();

    // Check if child components are rendered (implies isSceneReady is true)
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: 'GhostMask' }).exists()).toBe(true);
  });
});
