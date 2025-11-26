import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const entityCode = `
class Entity:
    def __init__(self, name, x, y, health=100):
        self.name = name
        self.x = x
        self.y = y
        self.health = health
        self.is_alive = True

    def get_position(self):
        return (self.x, self.y)

    def take_damage(self, amount):
        self.health -= amount
        if self.health <= 0:
            self.health = 0
            self.is_alive = False
            print(f"{self.name} telah dikalahkan!")
        else:
            print(f"{self.name} menerima {amount} damage. Kesehatan tersisa: {self.health}")
`;

const utilityCode = `
import math

def calculate_distance(pos1, pos2):
    """Menghitung jarak Euclidean antara dua titik."""
    return math.sqrt((pos1[0] - pos2[0])**2 + (pos1[1] - pos2[1])**2)

def calculate_angle_to_target(source_pos, target_pos):
    """Menghitung sudut (dalam derajat) dari posisi sumber ke target."""
    dx = target_pos[0] - source_pos[0]
    dy = target_pos[1] - source_pos[1]
    return math.degrees(math.atan2(dy, dx))
`;

const aimSystemCode = `
class AimSystem:
    def __init__(self, player_entity):
        self.player = player_entity
        self.crosshair_angle = 0

    def find_nearest_target(self, enemies):
        # ... logic to find nearest enemy
    
    def apply_aim_assist(self, target, strength=0.3):
        # ... smoothly adjusts crosshair
    
    def apply_aimlock_100_percent(self, target):
        # ... instantly locks crosshair
        
    def shoot(self, target, base_damage=20):
        # ... simulates shooting with accuracy check
`;


const CodeBlock = ({ code }: { code: string }) => (
  <pre className="bg-muted/50 p-4 rounded-lg">
    <code className="font-code text-sm text-foreground/80">
      {code.trim()}
    </code>
  </pre>
)

export function CodePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Code Explorer</CardTitle>
        <CardDescription>
          Explore the conceptual Python code behind the simulation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="aim-system" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="aim-system">AimSystem</TabsTrigger>
                <TabsTrigger value="entity">Entity</TabsTrigger>
                <TabsTrigger value="utils">Utilities</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[32rem] w-full">
                <TabsContent value="aim-system"><CodeBlock code={aimSystemCode} /></TabsContent>
                <TabsContent value="entity"><CodeBlock code={entityCode} /></TabsContent>
                <TabsContent value="utils"><CodeBlock code={utilityCode} /></TabsContent>
            </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
