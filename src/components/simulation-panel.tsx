"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { useToast } from "@/hooks/use-toast";
import type { PerformanceData, SimulationMode, Entity, Position } from "@/lib/types";
import { calculateAngleToTarget, calculateDistance, degreesToRadians } from "@/lib/simulation";
import { getOrganicAim } from "@/app/actions";
import { Dices, Play, StopCircle, RefreshCw, Bot, User } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

const CANVAS_SIZE = 500;
const INITIAL_PLAYER_POS = { x: 50, y: 50 };
const INITIAL_ENEMY_POS = { x: 250, y: 250 };
const INITIAL_ENEMY_HEALTH = 100;

interface SimulationPanelProps {
  onSimulationComplete: (data: PerformanceData) => void;
  onReset: () => void;
}

const SimulationCanvas = ({ player, enemy, crosshair }: { player: Entity, enemy: Entity, crosshair: Position }) => {
    return (
        <div 
            className="relative w-full aspect-square bg-card rounded-lg overflow-hidden border"
            style={{
                backgroundSize: '20px 20px',
                backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)'
            }}
        >
            {/* Player */}
            <div className="absolute flex flex-col items-center" style={{ left: `${player.position.x / CANVAS_SIZE * 100}%`, top: `${player.position.y / CANVAS_SIZE * 100}%`, transform: 'translate(-50%, -50%)' }}>
                <User className="w-6 h-6 text-primary" />
                <span className="text-xs font-bold text-primary">Player</span>
            </div>

            {/* Enemy */}
            {enemy.isAlive && (
              <div className="absolute flex flex-col items-center" style={{ left: `${enemy.position.x / CANVAS_SIZE * 100}%`, top: `${enemy.position.y / CANVAS_SIZE * 100}%`, transform: 'translate(-50%, -50%)' }}>
                  <Bot className="w-6 h-6 text-destructive" />
                  <span className="text-xs font-bold text-destructive">Enemy</span>
                  <div className="w-16 h-1 bg-muted-foreground rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-destructive transition-all duration-300" style={{ width: `${enemy.health}%` }} />
                  </div>
              </div>
            )}

            {/* Crosshair */}
            <div className="absolute w-5 h-5" style={{ left: `${crosshair.x / CANVAS_SIZE * 100}%`, top: `${crosshair.y / CANVAS_SIZE * 100}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="absolute top-1/2 left-0 w-full h-px bg-accent -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 h-full w-px bg-accent -translate-x-1/2" />
            </div>
        </div>
    );
};

export function SimulationPanel({ onSimulationComplete, onReset }: SimulationPanelProps) {
  const { toast } = useToast();
  const [player, setPlayer] = useState<Entity>({ name: 'Player', position: INITIAL_PLAYER_POS, health: 100, isAlive: true });
  const [enemy, setEnemy] = useState<Entity>({ name: 'Enemy', position: INITIAL_ENEMY_POS, health: INITIAL_ENEMY_HEALTH, isAlive: true });
  const [crosshair, setCrosshair] = useState<Position>({ x: 250, y: 100 });
  
  const [aimAssistStrength, setAimAssistStrength] = useState(0.3);
  const [randomnessFactor, setRandomnessFactor] = useState(5);
  const [baseDamage, setBaseDamage] = useState(20);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>(['Simulation ready.']);

  const crosshairAngleRef = useRef(90);
  const simulationTimer = useRef<number | null>(null);
  const shotsFiredRef = useRef(0);
  const hitsRef = useRef(0);
  const simulationStartTimeRef = useRef(0);

  const addToLog = (message: string) => {
    setSimulationLog(prev => [message, ...prev.slice(0, 100)]);
  };

  const resetEntities = useCallback(() => {
    setPlayer(p => ({ ...p, position: INITIAL_PLAYER_POS }));
    setEnemy(e => ({...e, position: INITIAL_ENEMY_POS, health: INITIAL_ENEMY_HEALTH, isAlive: true}));
    setCrosshair({x:250, y:100});
    crosshairAngleRef.current = 90;
    addToLog("Entities reset to initial positions.");
  }, []);
  
  const stopSimulation = useCallback(() => {
    if (simulationTimer.current) cancelAnimationFrame(simulationTimer.current);
    setIsSimulating(false);
    addToLog("Simulation stopped.");
  }, []);

  const randomizePositions = () => {
    const newPlayerPos = { x: Math.random() * CANVAS_SIZE, y: Math.random() * CANVAS_SIZE };
    const newEnemyPos = { x: Math.random() * CANVAS_SIZE, y: Math.random() * CANVAS_SIZE };
    setPlayer(p => ({ ...p, position: newPlayerPos }));
    setEnemy(e => ({ ...e, position: newEnemyPos, health: INITIAL_ENEMY_HEALTH, isAlive: true }));
    addToLog("Player and enemy positions randomized.");
  };

  const shoot = useCallback((mode: SimulationMode) => {
    if (!enemy.isAlive) {
        addToLog("Target already eliminated.");
        return;
    }
    shotsFiredRef.current += 1;
    const targetAngle = calculateAngleToTarget(player.position, enemy.position);
    const angleDifference = Math.abs(crosshairAngleRef.current - targetAngle);

    let damageMultiplier = 0.0;
    let message = "";
    if (angleDifference < 5) {
        damageMultiplier = 2.5; message = "HEADSHOT!"; hitsRef.current += 1;
    } else if (angleDifference < 20) {
        damageMultiplier = 1.0; message = "Body Shot."; hitsRef.current += 1;
    } else {
        damageMultiplier = 0.0; message = "Missed!";
    }
    
    const finalDamage = baseDamage * damageMultiplier;
    addToLog(`[${mode}] Fired! ${message}`);
    
    setEnemy(prevEnemy => {
        const newHealth = Math.max(0, prevEnemy.health - finalDamage);
        const isAlive = newHealth > 0;
        if (!isAlive && prevEnemy.isAlive) {
            const timeToEliminate = Date.now() - simulationStartTimeRef.current;
            const accuracy = shotsFiredRef.current > 0 ? (hitsRef.current / shotsFiredRef.current) * 100 : 0;
            addToLog(`[${mode}] Enemy eliminated in ${timeToEliminate}ms. Accuracy: ${accuracy.toFixed(1)}%`);
            onSimulationComplete({ id: Date.now().toString(), mode, timeToEliminate, shotsFired: shotsFiredRef.current, accuracy });
            stopSimulation();
        }
        return { ...prevEnemy, health: newHealth, isAlive };
    });
  }, [enemy.isAlive, player.position, enemy.position, baseDamage, onSimulationComplete, stopSimulation]);


  const runSimulation = useCallback((mode: SimulationMode) => {
    setIsSimulating(true);
    setSimulationLog([]);
    addToLog(`Starting ${mode} simulation...`);
    resetEntities();
    shotsFiredRef.current = 0;
    hitsRef.current = 0;
    simulationStartTimeRef.current = Date.now();

    let lastShootTime = 0;
    const shootInterval = 500; // ms

    const simulationLoop = async (timestamp: number) => {
        if (!enemy.isAlive) {
            stopSimulation();
            return;
        }

        const targetAngle = calculateAngleToTarget(player.position, enemy.position);
        
        if (mode === 'Aim Assist') {
            const adjustedAngle = await getOrganicAim({
                playerX: player.position.x, playerY: player.position.y,
                targetX: enemy.position.x, targetY: enemy.position.y,
                aimAssistStrength, randomnessFactor
            });
            const diff = (targetAngle - crosshairAngleRef.current);
            crosshairAngleRef.current += diff * aimAssistStrength + adjustedAngle;
        } else if (mode === 'Aimlock') {
            crosshairAngleRef.current = targetAngle;
        }
        // For Manual, angle does not change automatically

        const angleRad = degreesToRadians(crosshairAngleRef.current);
        const crosshairDist = 100;
        setCrosshair({
            x: player.position.x + crosshairDist * Math.cos(angleRad),
            y: player.position.y + crosshairDist * Math.sin(angleRad)
        });

        if (timestamp - lastShootTime > shootInterval) {
            shoot(mode);
            lastShootTime = timestamp;
        }
        
        simulationTimer.current = requestAnimationFrame(simulationLoop);
    };
    simulationTimer.current = requestAnimationFrame(simulationLoop);
  }, [resetEntities, enemy.isAlive, player.position, enemy.position, aimAssistStrength, randomnessFactor, shoot, stopSimulation]);

  useEffect(() => {
    return () => {
      if (simulationTimer.current) cancelAnimationFrame(simulationTimer.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
              <CardTitle>Simulation Environment</CardTitle>
              <CardDescription>Visualize the player, enemy, and crosshair in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <SimulationCanvas player={player} enemy={enemy} crosshair={crosshair} />
          </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Simulation Controls</CardTitle>
          <CardDescription>Adjust parameters and run simulations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label>Aim Assist Strength: {aimAssistStrength.toFixed(2)}</Label>
                  <Slider value={[aimAssistStrength]} onValueChange={([v]) => setAimAssistStrength(v)} max={1} step={0.05} />
              </div>
              <div className="space-y-2">
                  <Label>Randomness Factor: {randomnessFactor.toFixed(2)}</Label>
                  <Slider value={[randomnessFactor]} onValueChange={([v]) => setRandomnessFactor(v)} max={20} step={0.5} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="base-damage">Base Damage</Label>
                  <Input id="base-damage" type="number" value={baseDamage} onChange={(e) => setBaseDamage(Number(e.target.value))} />
              </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={randomizePositions} disabled={isSimulating}>
              <Dices className="mr-2 h-4 w-4" />
              Randomize Positions
            </Button>
            <Button variant="outline" size="sm" onClick={() => { onReset(); resetEntities(); setSimulationLog(['Simulation reset.']); }} disabled={isSimulating}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset All
            </Button>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => runSimulation("Manual")} disabled={isSimulating} variant="secondary">
              <Play className="mr-2 h-4 w-4" />
              Run Manual
            </Button>
            <Button onClick={() => runSimulation("Aim Assist")} disabled={isSimulating}>
              <Play className="mr-2 h-4 w-4" />
              Run Aim Assist
            </Button>
            <Button onClick={() => runSimulation("Aimlock")} disabled={isSimulating} variant="destructive">
              <Play className="mr-2 h-4 w-4" />
              Run Aimlock
            </Button>
            {isSimulating && (
              <Button onClick={stopSimulation} variant="outline">
                <StopCircle className="mr-2 h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Simulation Log</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48 w-full rounded-md border p-3 font-code text-sm">
            {simulationLog.map((log, i) => (
              <p key={i} className="leading-relaxed">
                <span className="text-muted-foreground mr-2">{String(simulationLog.length - i).padStart(2, '0')}</span>
                {log.includes("HEADSHOT") ? <Badge variant="destructive" className="mr-2">HS</Badge> : log.includes("Body Shot") ? <Badge variant="secondary" className="mr-2">HIT</Badge> : <Badge variant="outline" className="mr-2 opacity-50">SYS</Badge>}
                {log}
              </p>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

    </div>
  );
}
