import { useState } from 'react';
import { useSimulator } from '@/context/SimulatorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, ChefHat } from 'lucide-react';
import { Recipe } from '@/types/appliance';
import { toast } from 'sonner';

const emptyRecipe: Omit<Recipe, 'id'> = {
  name: '', preset: 'Custom', tempA: 180, tempB: 175,
  dwellPrimary: 60, dwellSecondary: 45, dispenserSpeed: 100,
  conveyorSpeed: 75, dispenseDuration: 6, flipEnabled: true,
};

function RecipeForm({
  initial, onSave, onCancel
}: {
  initial?: Recipe;
  onSave: (r: Recipe) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<Recipe, 'id'>>(
    initial ? { ...initial } : { ...emptyRecipe }
  );
  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Recipe name is required'); return; }
    onSave({ ...form, id: initial?.id || crypto.randomUUID() } as Recipe);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Recipe Name</Label>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="My Recipe" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Temp Zone A (°C)</Label>
          <Input type="number" value={form.tempA} onChange={e => set('tempA', +e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Temp Zone B (°C)</Label>
          <Input type="number" value={form.tempB} onChange={e => set('tempB', +e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Dwell Primary (s)</Label>
          <Input type="number" value={form.dwellPrimary} onChange={e => set('dwellPrimary', +e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Dwell Secondary (s)</Label>
          <Input type="number" value={form.dwellSecondary} onChange={e => set('dwellSecondary', +e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Dispenser Speed (RPM)</Label>
          <Input type="number" value={form.dispenserSpeed} onChange={e => set('dispenserSpeed', +e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Conveyor Speed (RPM)</Label>
          <Input type="number" value={form.conveyorSpeed} onChange={e => set('conveyorSpeed', +e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Dispense Duration (s)</Label>
          <Input type="number" value={form.dispenseDuration} onChange={e => set('dispenseDuration', +e.target.value)} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={form.flipEnabled} onCheckedChange={v => set('flipEnabled', v)} />
          <Label>Flip Enabled</Label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button onClick={handleSubmit}>{initial ? 'Update' : 'Create'} Recipe</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

const PRESET_COLORS: Record<string, string> = {
  Soft: 'bg-blue-100 text-blue-700',
  Medium: 'bg-amber-100 text-amber-700',
  Crisp: 'bg-orange-100 text-orange-700',
  Custom: 'bg-muted text-muted-foreground',
};

export default function Recipes() {
  const { recipes, activeRecipe, setActiveRecipe, addRecipe, updateRecipe, deleteRecipe } = useSimulator();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | undefined>();

  const handleSave = (r: Recipe) => {
    if (editing) { updateRecipe(r); toast.success('Recipe updated'); }
    else { addRecipe(r); toast.success('Recipe created'); }
    setDialogOpen(false);
    setEditing(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recipes</h1>
          <p className="text-sm text-muted-foreground">Manage cooking profiles and presets</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) setEditing(undefined); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Recipe</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit' : 'Create'} Recipe</DialogTitle>
            </DialogHeader>
            <RecipeForm
              initial={editing}
              onSave={handleSave}
              onCancel={() => { setDialogOpen(false); setEditing(undefined); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map(recipe => (
          <Card
            key={recipe.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeRecipe.id === recipe.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActiveRecipe(recipe)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-muted-foreground" />
                  {recipe.name}
                </CardTitle>
                <Badge className={PRESET_COLORS[recipe.preset] || PRESET_COLORS.Custom}>
                  {recipe.preset}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>Zone A: {recipe.tempA}°C</span>
                <span>Zone B: {recipe.tempB}°C</span>
                <span>Dwell: {recipe.dwellPrimary}s / {recipe.dwellSecondary}s</span>
                <span>Flip: {recipe.flipEnabled ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setEditing(recipe); setDialogOpen(true); }}>
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                {recipe.preset === 'Custom' && (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={e => { e.stopPropagation(); deleteRecipe(recipe.id); toast('Recipe deleted'); }}>
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
