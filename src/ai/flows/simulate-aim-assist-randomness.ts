// use server'

/**
 * @fileOverview Simulates aim assist with organic randomness.
 *
 * - simulateAimAssistWithRandomness - Simulates aim assist with randomness to make the outcome appear organic and human-like.
 * - SimulateAimAssistWithRandomnessInput - The input type for the simulateAimAssistWithRandomness function.
 * - SimulateAimAssistWithRandomnessOutput - The return type for the simulateAimAssistWithRandomness function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateAimAssistWithRandomnessInputSchema = z.object({
  playerX: z.number().describe('The X coordinate of the player.'),
  playerY: z.number().describe('The Y coordinate of the player.'),
  targetX: z.number().describe('The X coordinate of the target.'),
  targetY: z.number().describe('The Y coordinate of the target.'),
  aimAssistStrength: z.number().describe('The strength of the aim assist (0.0 - 1.0).'),
  randomnessFactor: z.number().describe('The factor that controls the randomness of the aim assist.'),
});
export type SimulateAimAssistWithRandomnessInput = z.infer<typeof SimulateAimAssistWithRandomnessInputSchema>;

const SimulateAimAssistWithRandomnessOutputSchema = z.object({
  adjustedAngle: z.number().describe('The adjusted aim angle after applying aim assist with randomness.'),
});
export type SimulateAimAssistWithRandomnessOutput = z.infer<typeof SimulateAimAssistWithRandomnessOutputSchema>;

export async function simulateAimAssistWithRandomness(
  input: SimulateAimAssistWithRandomnessInput
): Promise<SimulateAimAssistWithRandomnessOutput> {
  return simulateAimAssistWithRandomnessFlow(input);
}

const calculateAngleToTarget = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

const addRandomness = ai.defineTool({
    name: 'addRandomness',
    description: 'Adds a degree of randomness to the aim angle to simulate human-like imprecision.',
    inputSchema: z.object({
      baseAngle: z.number().describe('The original calculated angle to the target.'),
      randomnessFactor: z.number().describe('The factor that controls the randomness of the aim assist.'),
    }),
    outputSchema: z.number().describe('The adjusted angle with added randomness.'),
  },
  async (input) => {
    const { baseAngle, randomnessFactor } = input;
    const randomness = (Math.random() - 0.5) * 2 * randomnessFactor;
    return baseAngle + randomness;
  }
);

const simulateAimAssistWithRandomnessPrompt = ai.definePrompt({
  name: 'simulateAimAssistWithRandomnessPrompt',
  tools: [addRandomness],
  input: {schema: SimulateAimAssistWithRandomnessInputSchema},
  output: {schema: SimulateAimAssistWithRandomnessOutputSchema},
  prompt: `You are an expert in game mechanics, specializing in aim assist algorithms.

Given the player's position ({{{playerX}}}, {{{playerY}}}), the target's position ({{{targetX}}}, {{{targetY}}}), and the aim assist strength ({{{aimAssistStrength}}}), calculate the adjusted aim angle with organic randomness.

First, calculate the ideal angle to the target.

Then, use the addRandomness tool to introduce randomness to the angle, using the randomnessFactor ({{{randomnessFactor}}}).

Return the final adjusted angle.

Important: You MUST use the addRandomness tool to add randomness to the angle.  Do not attempt to calculate the random value directly in the prompt.

Final adjusted angle:
`,
});

const simulateAimAssistWithRandomnessFlow = ai.defineFlow(
  {
    name: 'simulateAimAssistWithRandomnessFlow',
    inputSchema: SimulateAimAssistWithRandomnessInputSchema,
    outputSchema: SimulateAimAssistWithRandomnessOutputSchema,
  },
  async input => {
    const idealAngle = calculateAngleToTarget(input.playerX, input.playerY, input.targetX, input.targetY);
    const {output} = await simulateAimAssistWithRandomnessPrompt({
      ...input,
    });
    return {
      adjustedAngle: idealAngle * input.aimAssistStrength,
    };
  }
);
