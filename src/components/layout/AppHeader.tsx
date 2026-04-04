import { Bell, Cpu } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSimulator } from '@/context/SimulatorContext';
import { STATE_LABELS } from '@/types/appliance';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AppHeader() {
  const { fsmState, notifications, isRunning, markAllNotificationsRead, dismissNotification } = useSimulator();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-14 flex items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">SIM MODE</span>
          <Badge variant={isRunning ? 'default' : 'secondary'} className="text-xs">
            {STATE_LABELS[fsmState]}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" onClick={markAllNotificationsRead}>
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b font-medium text-sm">Notifications</div>
            <ScrollArea className="max-h-64">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
              ) : (
                notifications.slice(0, 15).map(n => (
                  <div key={n.id} className="p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => dismissNotification(n.id)}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
