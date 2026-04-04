import { useSimulator } from '@/context/SimulatorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { STATE_LABELS, STATE_COLORS } from '@/types/appliance';

export default function LiveData() {
  const { telemetryHistory, stateTransitions } = useSimulator();

  const chartData = telemetryHistory.map((t, i) => ({
    time: i,
    'Zone A': Number(t.tempA.toFixed(1)),
    'Zone B': Number(t.tempB.toFixed(1)),
  }));

  const rpmData = telemetryHistory.map((t, i) => ({
    time: i,
    Dispenser: Math.round(t.dispenserRPM),
    Conveyor: Math.round(t.conveyorRPM),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Data</h1>
        <p className="text-sm text-muted-foreground">Real-time telemetry visualization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Temperature (°C)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Zone A" stroke="hsl(0, 80%, 55%)" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="Zone B" stroke="hsl(210, 70%, 55%)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Motor Speed (RPM)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={rpmData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Dispenser" stroke="hsl(140, 60%, 45%)" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="Conveyor" stroke="hsl(30, 80%, 55%)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* State Transition Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">State Transition Log</CardTitle>
        </CardHeader>
        <CardContent>
          {stateTransitions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No transitions yet. Start a cooking cycle to see state changes.
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-auto">
              {stateTransitions.slice(0, 30).map((t, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-muted-foreground font-mono w-20">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{t.from}</Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge
                      className="text-xs"
                      style={{ backgroundColor: STATE_COLORS[t.to], color: 'white' }}
                    >
                      {STATE_LABELS[t.to]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
