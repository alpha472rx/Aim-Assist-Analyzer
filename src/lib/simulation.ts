import type { Position } from './types';

export function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

export function calculateAngleToTarget(sourcePos: Position, targetPos: Position): number {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
