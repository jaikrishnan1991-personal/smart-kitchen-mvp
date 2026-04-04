import { useSimulator } from '@/context/SimulatorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle2, Download, Zap, Flame, Cpu, Radio } from 'lucide-react';
import { FAULT_DETAILS, FaultCode } from '@/types/appliance';

const FAULT_INJECT_OPTIONS: { code: FaultCode; icon: React.ReactNode; label: string }[] = [
  { code: 'MOTOR_STALL', icon: <Zap className="w-4 h-4" />, label: 'Motor Stall' },
  { code: 'OVERHEAT', icon: <Flame className="w-4 h-4" />, label: 'Overheat' },
  { code: 'SENSOR_FAILURE', icon: <Cpu className="w-4 h-4" />, label: 'Sensor Fail' },
  { code: 'ENCODER_ERROR', icon: <Radio className="w-4 h-4" />, label: 'Encoder Error' },
];

export default function Diagnostics() {
  const { faults, clearFault, injectFault, firmwareVersion, otaProgress, triggerOTA } = useSimulator();

  const activeFaults = faults.filter(f => !f.resolved);
  const faultHistory = faults.filter(f => f.resolved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Diagnostics</h1>
        <p className="text-sm text-muted-foreground">System health, faults, and firmware</p>
      </div>

      {/* Fault Injection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Simulate Fault (Testing)</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {FAULT_INJECT_OPTIONS.map(f => (
            <Button key={f.code} variant="outline" size="sm" className="gap-2" onClick={() => injectFault(f.code)}>
              {f.icon} {f.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Active Faults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> Active Faults ({activeFaults.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeFaults.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> No active faults
            </div>
          ) : (
            <div className="space-y-3">
              {activeFaults.map(fault => (
                <div key={fault.id} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-destructive">{FAULT_DETAILS[fault.code].label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{FAULT_DETAILS[fault.code].suggestion}</p>
                      <p className="text-xs text-muted-foreground">{new Date(fault.timestamp).toLocaleString()}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => clearFault(fault.id)}>Clear</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fault History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Fault History</CardTitle>
        </CardHeader>
        <CardContent>
          {faultHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No resolved faults</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faultHistory.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.code}</TableCell>
                    <TableCell className="text-sm">{f.message}</TableCell>
                    <TableCell className="text-xs">{new Date(f.timestamp).toLocaleString()}</TableCell>
                    <TableCell><Badge variant="secondary">Resolved</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* OTA Update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Firmware</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Current Version: <span className="font-mono font-bold">v{firmwareVersion}</span></p>
              <p className="text-xs text-muted-foreground">Latest: v1.5.0 available</p>
            </div>
            <Button
              size="sm"
              className="gap-2"
              disabled={otaProgress !== null}
              onClick={triggerOTA}
            >
              <Download className="w-4 h-4" /> Update
            </Button>
          </div>
          {otaProgress !== null && (
            <div className="space-y-1">
              <Progress value={otaProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{otaProgress.toFixed(0)}% — Updating firmware...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
