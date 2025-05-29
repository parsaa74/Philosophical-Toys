import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import FilmstripOverlaySVG from './FilmstripOverlaySVG';

// Timeline item type
export interface TimelineFrame {
  image: string; // URL
  title: string;
  year: string;
  description?: string;
}

// Helper: create a canvas texture for a frame
function createFrameTexture(frame: TimelineFrame, width = 320, height = 400) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Draw background (film base)
  ctx.fillStyle = '#232323';
  ctx.fillRect(0, 0, width, height);

  // Draw image (fit to top 60%)
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.src = frame.image;
  return new Promise<THREE.Texture>((resolve) => {
    img.onload = () => {
      const imgH = Math.floor(height * 0.6);
      ctx.drawImage(img, 0, 0, width, imgH);
      // Draw title
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(frame.title, width / 2, imgH + 40);
      // Draw year
      ctx.font = '20px monospace';
      ctx.fillStyle = '#bdbdbd';
      ctx.fillText(frame.year, width / 2, imgH + 75);
      // Draw description (optional)
      if (frame.description) {
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#e0e0e0';
        ctx.textAlign = 'center';
        ctx.fillText(frame.description, width / 2, imgH + 110, width - 40);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      resolve(texture);
    };
    img.onerror = () => {
      // fallback: just title/year
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(frame.title, width / 2, height / 2);
      ctx.font = '20px monospace';
      ctx.fillStyle = '#bdbdbd';
      ctx.fillText(frame.year, width / 2, height / 2 + 40);
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      resolve(texture);
    };
  });
}

interface Filmstrip3DProps {
  timelineData: TimelineFrame[];
}

const FILM_WIDTH = 2.5;
const FILM_HEIGHT = 0.5;
const FILM_CURVE_POINTS = [
  [-5, 0, 0],
  [-2, 0.5, 0],
  [0, 0.7, 0],
  [2, 0.5, 0],
  [5, 0, 0],
];

function createFilmGeometry(frames: number, width = FILM_WIDTH, height = FILM_HEIGHT) {
  // Create a curved geometry for the filmstrip
  const curve = new THREE.CatmullRomCurve3(FILM_CURVE_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const points = curve.getSpacedPoints(frames * 10);
  const geometry = new THREE.PlaneGeometry(width * frames, height, frames * 10, 1);
  // Bend the geometry along the curve
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const x = geometry.attributes.position.getX(i);
    const t = (x / (width * frames)) * (points.length - 1);
    const p = points[Math.round(t)];
    geometry.attributes.position.setY(i, p.y);
    geometry.attributes.position.setZ(i, p.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

const Filmstrip3D: React.FC<Filmstrip3DProps> = ({ timelineData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });

  // --- Motion state ---
  const [targetFrame, setTargetFrame] = useState(0); // float, can be between frames
  const currentFrameRef = useRef(0); // for animation
  const draggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(0);
  const lastVelocity = useRef(0);
  const animationFrameId = useRef<number>();

  // --- Drag/scroll handlers ---
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setTargetFrame(f => {
        let next = f + e.deltaY * 0.01;
        next = Math.max(0, Math.min(timelineData.length - 1, next));
        return next;
      });
    };
    const handlePointerDown = (e: PointerEvent) => {
      draggingRef.current = true;
      dragStartX.current = e.clientX;
      dragStartFrame.current = targetFrame;
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - dragStartX.current;
      let next = dragStartFrame.current - dx / 120; // 120px drag = 1 frame
      next = Math.max(0, Math.min(timelineData.length - 1, next));
      setTargetFrame(next);
    };
    const handlePointerUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      // Snap to nearest frame, add jitter
      setTargetFrame(f => {
        let snapped = Math.round(f);
        // Add a tiny random jitter
        snapped += (Math.random() - 0.5) * 0.04;
        return Math.max(0, Math.min(timelineData.length - 1, snapped));
      });
    };
    const node = mountRef.current;
    if (node) {
      node.addEventListener('wheel', handleWheel, { passive: false });
      node.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      if (node) {
        node.removeEventListener('wheel', handleWheel);
        node.removeEventListener('pointerdown', handlePointerDown);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [timelineData.length, targetFrame]);

  useEffect(() => {
    const width = mountRef.current?.clientWidth || 800;
    const height = mountRef.current?.clientHeight || 400;
    setCanvasSize({ width, height });
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // --- Generate textures and mesh for each frame ---
    let filmMesh: THREE.Mesh | null = null;
    let stop = false;
    (async () => {
      const textures = await Promise.all(
        timelineData.map(frame => createFrameTexture(frame, 320, 400))
      );
      if (stop) return;
      const frames = timelineData.length;
      const geometry = createFilmGeometry(frames);
      const materials = textures.map(tex => new THREE.MeshPhysicalMaterial({
        map: tex,
        roughness: 0.45,
        metalness: 0.2,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        reflectivity: 0.18,
        side: THREE.DoubleSide,
      }));
      const segs = geometry.parameters.widthSegments;
      for (let i = 0; i < geometry.groups.length; i++) {
        const group = geometry.groups[i];
        const frameIdx = Math.min(Math.floor(i / (segs / frames)), frames - 1);
        group.materialIndex = frameIdx;
      }
      filmMesh = new THREE.Mesh(geometry, materials);
      scene.add(filmMesh);

      // --- Animation loop: spring/inertia motion ---
      const animate = () => {
        // Spring/ease currentFrame toward targetFrame
        const stiffness = draggingRef.current ? 0.25 : 0.12;
        const damping = draggingRef.current ? 0.7 : 0.85;
        let cf = currentFrameRef.current;
        const tf = targetFrame;
        let v = lastVelocity.current;
        v += (tf - cf) * stiffness;
        v *= damping;
        cf += v;
        // Clamp
        cf = Math.max(0, Math.min(frames - 1, cf));
        // Snap if close
        if (!draggingRef.current && Math.abs(tf - cf) < 0.01) {
          cf = tf;
          v = 0;
        }
        currentFrameRef.current = cf;
        lastVelocity.current = v;
        // Map frame to mesh rotation (center frame = 0)
        if (filmMesh) {
          const totalWidth = FILM_WIDTH * frames;
          const offset = (cf - (frames - 1) / 2) * FILM_WIDTH;
          filmMesh.position.x = -offset * Math.cos(0.12); // slight curve compensation
          filmMesh.rotation.y = Math.sin(Date.now() * 0.0002) * 0.08 + (offset / totalWidth) * 0.5;

          // --- Center frame focus effect ---
          if (Array.isArray(filmMesh.material)) {
            filmMesh.material.forEach((mat, idx) => {
              const material = mat as THREE.MeshPhysicalMaterial;
              const dist = Math.abs(idx - cf);
              // Focus: center frame is brighter and slightly scaled up
              material.emissive = new THREE.Color(0xffffff);
              material.emissiveIntensity = Math.max(0.12, 0.7 - dist * 0.25);
              // Optionally, scale geometry for center frame
              // We'll scale the mesh in z for a "pop" effect
              // For per-frame scale, we need to use mesh morph targets or per-frame objects,
              // but as a hack, we can slightly move the mesh in z for the center frame
              if (filmMesh) {
                if (dist < 0.5) {
                  filmMesh.position.z = 0.12;
                } else if (dist < 1.5) {
                  filmMesh.position.z = 0.04;
                } else {
                  filmMesh.position.z = 0;
                }
              }
            });
          }
        }
        renderer.render(scene, camera);
        animationFrameId.current = requestAnimationFrame(animate);
      };
      animate();

      // Cleanup for async
      return () => {
        stop = true;
        if (filmMesh) {
          scene.remove(filmMesh);
          filmMesh.geometry.dispose();
          if (Array.isArray(filmMesh.material)) {
            filmMesh.material.forEach(m => m.dispose());
          } else {
            filmMesh.material.dispose();
          }
        }
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      };
    })();

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(0, 2, 5);
    scene.add(ambient, dir);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current?.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Cleanup
    return () => {
      stop = true;
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [timelineData, targetFrame]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'relative', background: '#181818' }}
    >
      <FilmstripOverlaySVG width={canvasSize.width} height={canvasSize.height} />
    </div>
  );
};

export default Filmstrip3D; 