import "./style.css";
import {
  ArcRotateCamera,
  Color3,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointerEventTypes,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;

const BALL_RADIUS = 0.22;
const TEE = new Vector3(0, BALL_RADIUS, -35);
const HOLE = new Vector3(0, 0, 38);
const GRAVITY = -22;
const AIR_DRAG = 0.35;
const GROUND_FRICTION = 0.88;
const BOUNCE = 0.28;
const STOP_EPS = 0.06;
const MAX_PULL = 14;
const POWER_SCALE = 2.8;

type Phase = "idle" | "aiming" | "moving";

const engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
});

const scene = new Scene(engine);
scene.clearColor = new Color3(0.55, 0.72, 0.92).toColor4(1);

const light = new HemisphericLight("hemi", new Vector3(0.25, 1, -0.35), scene);
light.intensity = 0.95;

const ground = MeshBuilder.CreateGround(
  "ground",
  { width: 220, height: 220, subdivisions: 32 },
  scene,
);
ground.position.y = 0;
const groundMat = new StandardMaterial("groundMat", scene);
groundMat.diffuseColor = new Color3(0.22, 0.55, 0.28);
groundMat.specularColor = new Color3(0.05, 0.05, 0.05);
ground.material = groundMat;

const fairway = MeshBuilder.CreateGround(
  "fairway",
  { width: 18, height: 95, subdivisions: 4 },
  scene,
);
fairway.position = new Vector3(0, 0.002, (TEE.z + HOLE.z) / 2);
const fairwayMat = new StandardMaterial("fairwayMat", scene);
fairwayMat.diffuseColor = new Color3(0.28, 0.62, 0.32);
fairwayMat.specularColor = Color3.Black();
fairway.material = fairwayMat;

const green = MeshBuilder.CreateGround(
  "green",
  { width: 14, height: 14, subdivisions: 2 },
  scene);
green.position = new Vector3(HOLE.x, 0.003, HOLE.z);
const greenMat = new StandardMaterial("greenMat", scene);
greenMat.diffuseColor = new Color3(0.2, 0.5, 0.3);
greenMat.specularColor = new Color3(0.02, 0.02, 0.02);
green.material = greenMat;

const ball = MeshBuilder.CreateSphere(
  "ball",
  { diameter: BALL_RADIUS * 2, segments: 24 },
  scene,
);
ball.position.copyFrom(TEE);
const ballMat = new StandardMaterial("ballMat", scene);
ballMat.diffuseColor = new Color3(0.95, 0.95, 0.95);
ballMat.specularColor = new Color3(0.35, 0.35, 0.35);
ball.material = ballMat;

const flagPole = MeshBuilder.CreateCylinder(
  "flagPole",
  { height: 6, diameter: 0.12 },
  scene,
);
flagPole.position = new Vector3(HOLE.x, 3, HOLE.z);
const poleMat = new StandardMaterial("poleMat", scene);
poleMat.diffuseColor = new Color3(0.75, 0.75, 0.78);
flagPole.material = poleMat;

const flag = MeshBuilder.CreateBox("flag", { width: 1.6, height: 1, depth: 0.05 }, scene);
flag.position = new Vector3(HOLE.x + 0.85, 5.1, HOLE.z);
const flagMat = new StandardMaterial("flagMat", scene);
flagMat.diffuseColor = new Color3(0.92, 0.2, 0.2);
flag.material = flagMat;

const cup = MeshBuilder.CreateCylinder(
  "cup",
  { height: 0.15, diameter: 0.9 },
  scene,
);
cup.position = new Vector3(HOLE.x, 0.05, HOLE.z);
const cupMat = new StandardMaterial("cupMat", scene);
cupMat.diffuseColor = new Color3(0.12, 0.12, 0.14);
cup.material = cupMat;

const camera = new ArcRotateCamera(
  "cam",
  Math.PI / 2.15,
  Math.PI / 3.1,
  48,
  ball.position.clone(),
  scene,
);
camera.lowerRadiusLimit = 18;
camera.upperRadiusLimit = 95;
camera.lowerBetaLimit = 0.35;
camera.upperBetaLimit = Math.PI / 2.05;
camera.attachControl(canvas, true);

let phase: Phase = "idle";
let ballPos = ball.position.clone();
let ballVel = Vector3.Zero();
let aimLine: Mesh | null = null;

function setStatus(text: string) {
  statusEl.textContent = text;
}

function disposeAimLine() {
  aimLine?.dispose();
  aimLine = null;
}

function projectPointerToGround(): Vector3 | null {
  const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m === ground);
  if (!pick.hit || !pick.pickedPoint) return null;
  return pick.pickedPoint;
}

function ensureAimLine(from: Vector3, to: Vector3) {
  if (aimLine) aimLine.dispose();
  aimLine = MeshBuilder.CreateDashedLines(
    "aim",
    [from, to],
    { dashSize: 0.35, gapSize: 0.22 },
    scene,
  );
  const aimMat = new StandardMaterial("aimMat", scene);
  aimMat.emissiveColor = new Color3(0.95, 0.95, 0.35);
  aimMat.disableLighting = true;
  aimLine.material = aimMat;
}

scene.onPointerObservable.add((info) => {
  if (phase === "moving") return;

  if (info.type === PointerEventTypes.POINTERDOWN) {
    if (phase !== "idle") return;
    phase = "aiming";
    setStatus("Aim: drag away from the ball, release to strike.");
  }

  if (info.type === PointerEventTypes.POINTERMOVE && phase === "aiming") {
    const p = projectPointerToGround();
    if (!p) return;
    const flatBall = new Vector3(ballPos.x, 0, ballPos.z);
    const flatPick = new Vector3(p.x, 0, p.z);
    const raw = flatPick.subtract(flatBall);
    const pull = Math.min(raw.length(), MAX_PULL);
    if (pull < 0.05) {
      disposeAimLine();
      return;
    }
    raw.normalize();
    const shotDir = raw;
    const aimEnd = flatBall.add(shotDir.scale(pull));
    aimEnd.y = 0.05;
    const aimStart = flatBall.add(new Vector3(0, 0.05, 0));
    ensureAimLine(aimStart, aimEnd);
  }

  if (info.type === PointerEventTypes.POINTERUP) {
    if (phase !== "aiming") return;
    const p = projectPointerToGround();
    disposeAimLine();
    phase = "idle";

    if (!p) {
      setStatus("Ready.");
      return;
    }

    const flatBall = new Vector3(ballPos.x, 0, ballPos.z);
    const flatPick = new Vector3(p.x, 0, p.z);
    const raw = flatPick.subtract(flatBall);
    const pull = Math.min(raw.length(), MAX_PULL);
    if (pull < 0.2) {
      setStatus("Ready.");
      return;
    }
    raw.normalize();
    const shotDir = new Vector3(raw.x, 0, raw.z);
    const speed = pull * POWER_SCALE;
    ballVel = shotDir.scale(speed).add(new Vector3(0, pull * 0.35, 0));
    phase = "moving";
    setStatus("Ball in play…");
  }
});

let lastT = performance.now();

scene.onBeforeRenderObservable.add(() => {
  const now = performance.now();
  const dt = Math.min((now - lastT) / 1000, 1 / 30);
  lastT = now;

  if (phase !== "moving") {
    camera.setTarget(ballPos);
    return;
  }

  ballVel.y += GRAVITY * dt;
  const horiz = new Vector3(ballVel.x, 0, ballVel.z);
  const hSpeed = horiz.length();
  if (hSpeed > 0.0001) {
    horiz.normalize();
    horiz.scaleInPlace(Math.max(0, hSpeed - AIR_DRAG * hSpeed * dt));
    ballVel.x = horiz.x;
    ballVel.z = horiz.z;
  }

  ballPos.x += ballVel.x * dt;
  ballPos.y += ballVel.y * dt;
  ballPos.z += ballVel.z * dt;

  if (ballPos.y < BALL_RADIUS) {
    ballPos.y = BALL_RADIUS;
    if (ballVel.y < 0) ballVel.y *= -BOUNCE;
    ballVel.x *= GROUND_FRICTION;
    ballVel.z *= GROUND_FRICTION;
  }

  const speed = ballVel.length();
  const onGround = ballPos.y <= BALL_RADIUS + 0.02;
  if (onGround && speed < STOP_EPS) {
    ballVel.setAll(0);
    ballPos.y = BALL_RADIUS;
    phase = "idle";
    const toHole = HOLE.subtract(new Vector3(ballPos.x, 0, ballPos.z));
    const dist = toHole.length();
    setStatus(
      dist < 1.1
        ? "Nice — on the dance floor. (Cup next.)"
        : `Stopped. ~${dist.toFixed(1)}m to pin (game units). Ready for next shot.`,
    );
  }

  ball.position.copyFrom(ballPos);
  camera.setTarget(ballPos);
});

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});

setStatus("Ready — drag from the ball to aim, release to strike.");
