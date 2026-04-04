import { useSimulator } from '@/context/SimulatorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, OctagonX, Thermometer, Gauge } from 'lucide-react';
import { STATE_COLORS, STATE_LABELS } from '@/types/appliance';

export default function Dashboard() {
  const {
    fsmState, tempA, tempB, dispenserRPM, conveyorRPM, cycleProgress,
    isRunning, isPaused, activeRecipe, recipes,
    start, pause, stop, emergencyStop, setActiveRecipe,
  } = useSimulator();

  const stateColor = STATE_COLORS[fsmState];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time appliance monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={activeRecipe.id}
            onValueChange={(v) => {
              const r = recipes.find(r => r.id === v);
              if (r) setActiveRecipe(r);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {recipes.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* FSM State Banner */}
      <Card className="border-2" style={{ borderColor: stateColor }}>
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: stateColor }} />
            <div>
              <p className="text-sm text-muted-foreground">Current State</p>
              <p className="text-xl font-bold" style={{ color: stateColor }}>
                {STATE_LABELS[fsmState]}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-mono">{fsmState}</Badge>
        </CardContent>
      </Card>

      {/* Temp + Motor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Thermometer className="w-4 h-4" /> Zone A
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{tempA.toFixed(1)}°C</p>
            <p className="text-xs text-muted-foreground">Target: {activeRecipe.tempA}°C</p>
            <Progress value={Math.min((tempA / activeRecipe.tempA) * 100, 100)} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Thermometer className="w-4 h-4" /> Zone B
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{tempB.toFixed(1)}°C</p>
            <p className="text-xs text-muted-foreground">Target: {activeRecipe.tempB}°C</p>
            <Progress value={Math.min((tempB / activeRecipe.tempB) * 100, 100)} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gauge className="w-4 h-4" /> Dispenser
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{dispenserRPM.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">RPM (encoder)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gauge className="w-4 h-4" /> Conveyor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{conveyorRPM.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">RPM (encoder)</p>
          </CardContent>
        </Card>
      </div>

      {/* Cycle Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cycle Progress — {activeRecipe.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={cycleProgress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">{cycleProgress.toFixed(0)}% complete</p>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={start} disabled={isRunning} className="gap-2">
          <Play className="w-4 h-4" /> Start
        </Button>
        <Button onClick={pause} disabled={!isRunning} variant="secondary" className="gap-2">
          <Pause className="w-4 h-4" /> {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button onClick={stop} disabled={!isRunning && fsmState === 'IDLE'} variant="outline" className="gap-2">
          <Square className="w-4 h-4" /> Stop
        </Button>
        <Button onClick={emergencyStop} variant="destructive" className="gap-2 ml-auto">
          <OctagonX className="w-4 h-4" /> Emergency Stop
        </Button>
      </div>
    </div>
  );
}
