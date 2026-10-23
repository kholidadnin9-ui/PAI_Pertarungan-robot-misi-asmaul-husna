import pinkImg from '../assets/robot-pink';
import orangeImg from '../assets/robot-orange';
import greenImg from '../assets/robot-green';
import blueImg from '../assets/robot-blue';
import redImg from '../assets/robot-red';

export interface Point {
  x: number;
  y: number;
}

export interface Robot {
  id: string;
  name: string;
  img: string;
  /** image width / height */
  aspect: number;
  /** gun-muzzle tip (fractions of the image box, robot facing right) */
  muzzle: Point;
  /** chest point where lasers hit (fractions of the image box, robot facing right) */
  hit: Point;
  color: string; // main hex
  light: string; // lighter hex
  dark: string; // darker hex
  laser: string; // laser glow color
  gradient: string; // tailwind gradient classes
}

// muzzle/hit points detected by scripts/process-assets.cjs
export const ROBOTS: Robot[] = [
  {
    id: 'pink', name: 'PINK', img: pinkImg, aspect: 434 / 520,
    muzzle: { x: 0.985, y: 0.143 }, hit: { x: 0.334, y: 0.38 },
    color: '#ec3f9a', light: '#ff8ccf', dark: '#b4176a', laser: '#ff4fc0', gradient: 'from-pink-400 via-pink-500 to-fuchsia-600',
  },
  {
    id: 'orange', name: 'ORANYE', img: orangeImg, aspect: 357 / 520,
    muzzle: { x: 0.982, y: 0.118 }, hit: { x: 0.304, y: 0.377 },
    color: '#ff8a1f', light: '#ffc46b', dark: '#c75c05', laser: '#ffb13b', gradient: 'from-amber-400 via-orange-500 to-orange-600',
  },
  {
    id: 'green', name: 'HIJAU', img: greenImg, aspect: 415 / 520,
    muzzle: { x: 0.985, y: 0.154 }, hit: { x: 0.309, y: 0.373 },
    color: '#4cc22e', light: '#9ef06f', dark: '#2b8a14', laser: '#7dff4a', gradient: 'from-lime-400 via-green-500 to-green-600',
  },
  {
    id: 'blue', name: 'BIRU', img: blueImg, aspect: 357 / 520,
    muzzle: { x: 0.982, y: 0.127 }, hit: { x: 0.323, y: 0.372 },
    color: '#2d6cf0', light: '#7fb2ff', dark: '#1540b3', laser: '#4fd2ff', gradient: 'from-sky-400 via-blue-500 to-blue-700',
  },
  {
    id: 'red', name: 'MERAH', img: redImg, aspect: 433 / 520,
    muzzle: { x: 0.985, y: 0.109 }, hit: { x: 0.304, y: 0.371 },
    color: '#ee3333', light: '#ff8a80', dark: '#a81414', laser: '#ff5a3c', gradient: 'from-red-400 via-red-500 to-rose-700',
  },
];

export const getRobot = (id: string) => ROBOTS.find((r) => r.id === id) ?? ROBOTS[0];
