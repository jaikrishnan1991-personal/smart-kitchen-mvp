import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import {
  FSMState, TelemetryData, Recipe, Fault, FaultCode, StateTransition,
  Notification, DEFAULT_RECIPES
} from '@/types/appliance';
import {
  simulateTemperature, simulateRPM, getStateDuration, getNextState, getCycleProgress
} from '@/simulator/engine';
import { toast } from 'sonner';

interface SimulatorState {
  fsmState: FSMState;
  tempA: number;
  tempB: number;
  dispenserRPM: number;
  conveyorRPM: number;
  cycleProgress: number;
  isRunning: boolean;
  isPaused: boolean;
  activeRecipe: Recipe;
  recipes: Recipe[];
  telemetryHistory: TelemetryData[];
  stateTransitions: StateTransition[];
  faults: Fault[];
  notifications: Notification[];
  firmwareVersion: string;
  otaProgress: number | null;
}

interface SimulatorActions {
  start: () => void;
  pause: () => void;
  stop: () => void;
  emergencyStop: () => void;
  setActiveRecipe: (recipe: Recipe) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  injectFault: (code: FaultCode) => void;
  clearFault: (id: string) => void;
  triggerOTA: () => void;
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const SimulatorContext = createContext<(SimulatorState & SimulatorActions) | null>(null);

export function useSimulator() {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error('useSimulator must be used within SimulatorProvider');
  return ctx;
}

export function SimulatorProvider({ children }: { children: React.ReactNode }) {
  const [fsmState, setFsmState] = useState<FSMState>('IDLE');
  const [tempA, setTempA] = useState(25);
  const [tempB, setTempB] = useState(25);
  const [dispenserRPM, setDispenserRPM] = useState(0);
  const [conveyorRPM, setConveyorRPM] = useState(0);
  const [cycleProgress, setCycleProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(DEFAULT_RECIPES[1]);
  const [recipes, setRecipes] = useState<Recipe[]>([...DEFAULT_RECIPES]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
  const [stateTransitions, setStateTransitions] = useState<StateTransition[]>([]);
  const [faults, setFaults] = useState<Fault[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [firmwareVersion] = useState('1.4.2');
  const [otaProgress, setOtaProgress] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateStartRef = useRef<number>(Date.now());
  const currentStateRef = useRef<FSMState>('IDLE');

  const addNotification = useCallback((type: Notification['type'], title: string, message: string) => {
    const n: Notification = {
      id: crypto.randomUUID(),
      type, title, message,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications(prev => [n, ...prev].slice(0, 50));
  }, []);

  const transitionTo = useCallback((newState: FSMState) => {
    const prev = currentStateRef.current;
    setStateTransitions(t => [{
      from: prev, to: newState, timestamp: Date.now()
    }, ...t].slice(0, 100));
    currentStateRef.current = newState;
    stateStartRef.current = Date.now();
    setFsmState(newState);
  }, []);

  const tick = useCallback(() => {
    const state = currentStateRef.current;
    
    setTempA(prev => simulateTemperature(prev, activeRecipe.tempA, state));
    setTempB(prev => simulateTemperature(prev, activeRecipe.tempB, state));
    setDispenserRPM(simulateRPM(activeRecipe.dispenserSpeed, state, true));
    setConveyorRPM(simulateRPM(activeRecipe.conveyorSpeed, state, false));

    const elapsed = Date.now() - stateStartRef.current;
    const duration = getStateDuration(state, activeRecipe);
    const progress = getCycleProgress(state, elapsed, duration);
    setCycleProgress(progress);

    setTelemetryHistory(prev => {
      const entry: TelemetryData = {
        timestamp: Date.now(),
        tempA: simulateTemperature(prev[prev.length - 1]?.tempA ?? 25, activeRecipe.tempA, state),
        tempB: simulateTemperature(prev[prev.length - 1]?.tempB ?? 25, activeRecipe.tempB, state),
        dispenserRPM: simulateRPM(activeRecipe.dispenserSpeed, state, true),
        conveyorRPM: simulateRPM(activeRecipe.conveyorSpeed, state, false),
        state,
      };
      return [...prev, entry].slice(-200);
    });

    // State transition
    if (elapsed >= duration && state !== 'IDLE' && state !== 'HALT_ERROR') {
      const next = getNextState(state, activeRecipe);
      transitionTo(next);
      if (next === 'IDLE') {
        setIsRunning(false);
        setCycleProgress(100);
        addNotification('success', 'Cycle Complete', `${activeRecipe.name} finished cooking.`);
        toast.success('Cooking cycle complete!');
      }
    }
  }, [activeRecipe, transitionTo, addNotification]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(tick, 200);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, tick]);

  const start = useCallback(() => {
    if (fsmState === 'HALT_ERROR') return;
    setIsRunning(true);
    setIsPaused(false);
    setCycleProgress(0);
    setTelemetryHistory([]);
    transitionTo('PRE_HEAT');
    addNotification('info', 'Cycle Started', `Starting ${activeRecipe.name}`);
    toast(`Starting ${activeRecipe.name}...`);
  }, [fsmState, activeRecipe, transitionTo, addNotification]);

  const pause = useCallback(() => {
    setIsPaused(p => !p);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    transitionTo('IDLE');
    setCycleProgress(0);
    setTempA(25);
    setTempB(25);
    setDispenserRPM(0);
    setConveyorRPM(0);
  }, [transitionTo]);

  const emergencyStop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    transitionTo('HALT_ERROR');
    setDispenserRPM(0);
    setConveyorRPM(0);
    addNotification('error', 'Emergency Stop', 'Emergency stop activated. All motors halted.');
    toast.error('EMERGENCY STOP ACTIVATED');
  }, [transitionTo, addNotification]);

  const injectFault = useCallback((code: FaultCode) => {
    const fault: Fault = {
      id: crypto.randomUUID(),
      code,
      message: `Simulated ${code.replace('_', ' ').toLowerCase()}`,
      timestamp: Date.now(),
      resolved: false,
    };
    setFaults(prev => [fault, ...prev]);
    transitionTo('HALT_ERROR');
    setIsRunning(false);
    addNotification('error', 'Fault Detected', fault.message);
    toast.error(`Fault: ${fault.message}`);
  }, [transitionTo, addNotification]);

  const clearFault = useCallback((id: string) => {
    setFaults(prev => prev.map(f => f.id === id ? { ...f, resolved: true } : f));
    if (fsmState === 'HALT_ERROR') {
      transitionTo('IDLE');
    }
  }, [fsmState, transitionTo]);

  const triggerOTA = useCallback(() => {
    setOtaProgress(0);
    addNotification('info', 'OTA Update', 'Firmware update starting...');
    let p = 0;
    const otaInterval = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 100) {
        p = 100;
        clearInterval(otaInterval);
        setOtaProgress(null);
        addNotification('success', 'OTA Complete', 'Firmware updated to v1.5.0');
        toast.success('Firmware updated successfully!');
      }
      setOtaProgress(Math.min(p, 100));
    }, 300);
  }, [addNotification]);

  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => [...prev, recipe]);
  }, []);

  const updateRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === recipe.id ? recipe : r));
    if (activeRecipe.id === recipe.id) setActiveRecipe(recipe);
  }, [activeRecipe]);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return (
    <SimulatorContext.Provider value={{
      fsmState, tempA, tempB, dispenserRPM, conveyorRPM, cycleProgress,
      isRunning, isPaused, activeRecipe, recipes, telemetryHistory,
      stateTransitions, faults, notifications, firmwareVersion, otaProgress,
      start, pause, stop, emergencyStop, setActiveRecipe, addRecipe,
      updateRecipe, deleteRecipe, injectFault, clearFault, triggerOTA,
      dismissNotification, markAllNotificationsRead,
    }}>
      {children}
    </SimulatorContext.Provider>
  );
}
