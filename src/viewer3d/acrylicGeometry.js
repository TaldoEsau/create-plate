import * as THREE from 'three';

/**
 * Cria a malha paramétrica do suporte acrílico em formato L com base nas dimensões em milímetros.
 * A orientação segue o padrão 3D:
 * - Largura (W) no eixo X: centralizado de -W/2 a +W/2
 * - Altura (H) no eixo Y: apoiado na mesa em Y = 0 até o topo Y ~ H
 * - Profundidade no eixo Z: a face frontal com a arte fica voltada para +Z (em direção à câmera),
 *   e a base horizontal se estende para trás (-Z) para manter o equilíbrio físico do display.
 * 
 * @param {Object} dimensions - { widthMm, heightMm, thicknessMm, baseDepthMm, tiltAngleDeg, cornerChamferMm }
 * @returns {THREE.Group} Grupo contendo o suporte acrílico e a face da arte adesivada
 */
export function createAcrylicPlaqueMesh(dimensions) {
  const group = new THREE.Group();
  group.name = 'AcrylicPlaque';

  const w = Number(dimensions.widthMm) || 110;        // ex: 110 mm
  const h = Number(dimensions.heightMm) || 150;       // ex: 150 mm
  const t = Number(dimensions.thicknessMm) || 6;       // ex: 6 mm
  const baseD = Number(dimensions.baseDepthMm) || 55; // ex: 55 mm
  
  // Ângulo de inclinação da face frontal em relação à vertical (ex: 82° com a mesa = 8° com a vertical)
  const angleFromHorizontal = dimensions.tiltAngleDeg || 82;
  const tiltRad = ((90 - angleFromHorizontal) * Math.PI) / 180;
  const sinT = Math.sin(tiltRad);
  const cosT = Math.cos(tiltRad);

  // ==========================================
  // 1. PERFIL 2D DO SUPORTE EM L (PLANO Z-Y)
  // ==========================================
  const topFrontZ = -sinT * h;
  const topFrontY = cosT * h;

  const topBackZ = topFrontZ - cosT * t;
  const topBackY = topFrontY - sinT * t;

  const lambdaInner = (topBackY - t) / cosT;
  const innerBendZ = topBackZ + lambdaInner * sinT;
  const innerBendY = t;

  const shape = new THREE.Shape();
  // 1. Canto traseiro inferior da base
  shape.moveTo(-baseD, 0);
  // 2. Base inferior horizontal até o canto frontal
  shape.lineTo(0, 0);
  // 3. Face frontal inclinada
  shape.lineTo(topFrontZ, topFrontY);
  // 4. Borda superior
  shape.lineTo(topBackZ, topBackY);
  // 5. Face traseira descendo até a dobra interna
  shape.lineTo(innerBendZ, innerBendY);
  // 6. Superfície superior da base horizontal
  shape.lineTo(-baseD, t);
  // 7. Fechamento da borda traseira
  shape.lineTo(-baseD, 0);

  // ==========================================
  // 2. EXTRUSÃO DO PERFIL NA LARGURA W
  // ==========================================
  const bevel = 0.6;
  const extrudeSettings = {
    steps: 1,
    depth: w,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments: 3
  };

  const acrylicGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // Transladamos o eixo Z da extrusão para centralizar a largura (-w/2 a +w/2)
  acrylicGeo.translate(0, 0, -w / 2);

  // Rotacionamos -90° em torno de Y:
  // - Largura W (antigo Z) -> Eixo X (-w/2 a +w/2)
  // - Profundidade (antigo X) -> Eixo Z (face frontal voltada para +Z)
  // - Altura Y permanece no eixo Y (0 a ~150 mm)
  acrylicGeo.rotateY(-Math.PI / 2);
  acrylicGeo.computeVertexNormals();

  // Garante que o fundo da base apoie exatamente no plano Y = 0
  const box = new THREE.Box3().setFromBufferAttribute(acrylicGeo.attributes.position);
  acrylicGeo.translate(0, -box.min.y, 0);

  // Material de acrílico cristal de alta fidelidade óptica
  const acrylicMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fbff,
    transparent: true,
    opacity: 0.65,
    transmission: 0.85,
    roughness: 0.08,
    metalness: 0.0,
    ior: 1.491,
    thickness: t,
    specularIntensity: 1.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const acrylicMesh = new THREE.Mesh(acrylicGeo, acrylicMat);
  acrylicMesh.name = 'AcrylicBody';
  acrylicMesh.castShadow = true;
  acrylicMesh.receiveShadow = true;
  acrylicMesh.renderOrder = 1;
  group.add(acrylicMesh);

  // ==========================================
  // 3. FACE DA ARTE ADESIVADA (FRONTE DA PLACA)
  // ==========================================
  const stickerW = w - 2;
  const stickerH = h - 4;
  const stickerGeo = new THREE.PlaneGeometry(stickerW, stickerH);

  // Material fotográfico sem lavagem de luz:
  // Usamos MeshBasicMaterial com toneMapped: false para que as cores do design
  // mantenham 100% da fidelidade, contraste de pretos e saturação originais sem desbotamento!
  const stickerMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    toneMapped: false
  });

  const stickerMesh = new THREE.Mesh(stickerGeo, stickerMat);
  stickerMesh.name = 'StickerFace';
  stickerMesh.castShadow = false;
  stickerMesh.receiveShadow = false;
  stickerMesh.renderOrder = 3; // Renderiza acima do acrílico frontalmente

  // Cálculo da posição central da face frontal:
  const midH = h / 2;
  const stickerX = 0;
  
  // Normal da face inclinada: normalZ = cosT, normalY = sinT
  // Posicionamos o adesivo imediatamente à frente do bisel frontal (bevel + 0.12mm)
  const offsetFront = bevel + 0.12;
  const stickerY = (cosT * midH) + (sinT * offsetFront) + 1.2;
  const stickerZ = (-sinT * midH) + (cosT * offsetFront);

  stickerMesh.position.set(stickerX, stickerY, stickerZ);
  stickerMesh.rotation.set(-tiltRad, 0, 0);

  group.add(stickerMesh);

  return group;
}
