import { FSMState, Recipe } from '@/types/appliance';

const COOKING_SEQUENCE: FSMState[] = [
  'PRE_HEAT', 'HOMING', 'DISPENSE', 'DWELL_PRIMARY', 'FLIP', 'DWELL_SECONDARY', 'EJECT'
];

// Duration in ms for each state during simulation
const STATE_DURATIONS: Partial<Record<FSMState, number>> = {
  PRE_HEAT: 6000,
  HOMING: 2000,
  DISPENSE: 3000,
  DWELL_PRIMARY: 8000,
  FLIP: 2000,
  DWELL_SECONDARY: 6000,
  EJECT: 2000,
};

function noise(base: number, range: number): number {
  return base + (Math.random() - 0.5) * range;
}

export function simulateTemperature(
  current: number,
  target: number,
  state: FSMState
): number {
  if (state === 'IDLE' || state === 'INIT') {
    return Math.max(25, current - 0.5);
  }
  if (state === 'PRE_HEAT') {
    const delta = (target - current) * 0.04;
    return noise(current + delta, 1.5);
  }
  if (state === 'HALT_ERROR') {
    return noise(current - 0.3, 0.5);
  }
  // Active cooking states - maintain near target
  const delta = (target - current) * 0.08;
  return noise(current + delta, 1.0);
}

export function simulateRPM(
  targetRPM: number,
  state: FSMState,
  isDispenser: boolean
): number {
  if (state === 'IDLE' || state === 'INIT' || state === 'HALT_ERROR') return 0;
  if (state === 'PRE_HEAT' || state === 'HOMING') return isDispenser ? 0 : noise(30, 5);
  if (state === 'DISPENSE') return isDispenser ? noise(targetRPM, 8) : noise(targetRPM * 0.5, 5);
  if (state === 'FLIP') return isDispenser ? 0 : noise(targetRPM * 0.3, 3);
  if (state === 'EJECT') return isDispenser ? 0 : noise(targetRPM * 0.8, 5);
  // DWELL states
  return isDispenser ? 0 : noise(targetRPM * 0.2, 3);
}

export function getStateDuration(state: FSMState, recipe: Recipe): number {
  if (state === 'DWELL_PRIMARY') return recipe.dwellPrimary * 100; // scaled for demo
  if (state === 'DWELL_SECONDARY') return recipe.dwellSecondary * 100;
  if (state === 'DISPENSE') return recipe.dispenseDuration * 500;
  return STATE_DURATIONS[state] || 3000;
}

export function getNextState(current: FSMState, recipe: Recipe): FSMState {
  const idx = COOKING_SEQUENCE.indexOf(current);
  if (idx === -1) return 'IDLE';
  
  // Skip FLIP and DWELL_SECONDARY if flip disabled
  if (current === 'DWELL_PRIMARY' && !recipe.flipEnabled) {
    return 'EJECT';
  }
  
  if (idx < COOKING_SEQUENCE.length - 1) {
    return COOKING_SEQUENCE[idx + 1];
  }
  return 'IDLE'; // Cycle complete
}

export function getCycleProgress(state: FSMState, stateElapsed: number, stateDuration: number): number {
  const idx = COOKING_SEQUENCE.indexOf(state);
  if (idx === -1) return 0;
  const stateWeight = 1 / COOKING_SEQUENCE.length;
  const base = idx * stateWeight;
  const inState = Math.min(stateElapsed / stateDuration, 1) * stateWeight;
  return Math.min((base + inState) * 100, 100);
}

export { COOKING_SEQUENCE };
