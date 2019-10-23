export function intersects(boxA: number[], boxB: number[]): boolean {
  const [leftA, topA, rightA, bottomA] = boxA;
  const [leftB, topB, rightB, bottomB] = boxB;
  return !(leftB > rightA || rightB < leftA || topB > bottomA || bottomB < topA);
}
