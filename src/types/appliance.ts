export type FSMState =
  | 'INIT'
  | 'IDLE'
  | 'PRE_HEAT'
  | 'HOMING'
  | 'DISPENSE'
  | 'DWELL_PRIMARY'
  | 'FLIP'
  | 'DWELL_SECONDARY'
  | 'EJECT'
  | 'MAINTENANCE'
  | 'HALT_ERROR';

export type FaultCode = 'MOTOR_STALL' | 'OVERHEAT' | 'SENSOR_FAILURE' | 'ENCODER_ERROR';

export interface TelemetryData {
  timestamp: number;
  tempA: number;
  tempB: number;
  dispenserRPM: number;
  conveyorRPM: number;
  state: FSMState;
}

export interface Fault {
  id: string;
  code: FaultCode;
  message: string;
  timestamp: number;
  resolved: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  preset: 'Soft' | 'Medium' | 'Crisp' | 'Custom';
  tempA: number;
  tempB: number;
  dwellPrimary: number;
  dwellSecondary: number;
  dispenserSpeed: number;
  conveyorSpeed: number;
  dispenseDuration: number;
  flipEnabled: boolean;
}

export interface StateTransition {
  from: FSMState;
  to: FSMState;
  timestamp: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export const STATE_COLORS: Record<FSMState, string> = {
  INIT: 'hsl(210, 50%, 60%)',
  IDLE: 'hsl(210, 70%, 55%)',
  PRE_HEAT: 'hsl(45, 90%, 50%)',
  HOMING: 'hsl(210, 50%, 60%)',
  DISPENSE: 'hsl(140, 60%, 45%)',
  DWELL_PRIMARY: 'hsl(140, 60%, 45%)',
  FLIP: 'hsl(280, 60%, 55%)',
  DWELL_SECONDARY: 'hsl(140, 60%, 45%)',
  EJECT: 'hsl(30, 80%, 55%)',
  MAINTENANCE: 'hsl(45, 90%, 50%)',
  HALT_ERROR: 'hsl(0, 80%, 55%)',
};

export const STATE_LABELS: Record<FSMState, string> = {
  INIT: 'Initializing',
  IDLE: 'Idle',
  PRE_HEAT: 'Preheating',
  HOMING: 'Homing',
  DISPENSE: 'Dispensing',
  DWELL_PRIMARY: 'Cooking (Side 1)',
  FLIP: 'Flipping',
  DWELL_SECONDARY: 'Cooking (Side 2)',
  EJECT: 'Ejecting',
  MAINTENANCE: 'Maintenance',
  HALT_ERROR: 'Error',
};

export const FAULT_DETAILS: Record<FaultCode, { label: string; suggestion: string }> = {
  MOTOR_STALL: { label: 'Motor Stall Detected', suggestion: 'Check for mechanical obstruction. Clean and restart.' },
  OVERHEAT: { label: 'Overheat Warning', suggestion: 'Allow appliance to cool. Check ventilation.' },
  SENSOR_FAILURE: { label: 'Sensor Failure', suggestion: 'Inspect NTC thermistor connections. Replace if damaged.' },
  ENCODER_ERROR: { label: 'Encoder Read Error', suggestion: 'Check IR encoder alignment and wiring.' },
};

export const DEFAULT_RECIPES: Recipe[] = [
  {
    id: 'preset-soft',
    name: 'Classic Soft',
    preset: 'Soft',
    tempA: 160,
    tempB: 155,
    dwellPrimary: 45,
    dwellSecondary: 30,
    dispenserSpeed: 80,
    conveyorSpeed: 60,
    dispenseDuration: 5,
    flipEnabled: true,
  },
  {
    id: 'preset-medium',
    name: 'Golden Medium',
    preset: 'Medium',
    tempA: 180,
    tempB: 175,
    dwellPrimary: 60,
    dwellSecondary: 45,
    dispenserSpeed: 100,
    conveyorSpeed: 75,
    dispenseDuration: 6,
    flipEnabled: true,
  },
  {
    id: 'preset-crisp',
    name: 'Extra Crisp',
    preset: 'Crisp',
    tempA: 200,
    tempB: 195,
    dwellPrimary: 75,
    dwellSecondary: 60,
    dispenserSpeed: 120,
    conveyorSpeed: 90,
    dispenseDuration: 7,
    flipEnabled: true,
  },
];
