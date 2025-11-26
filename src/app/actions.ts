"use server";

import { interactiveAimingTutorials } from "@/ai/flows/interactive-aiming-tutorials";
import { simulateAimAssistWithRandomness } from "@/ai/flows/simulate-aim-assist-randomness";
import type { SimulateAimAssistWithRandomnessInput } from "@/ai/flows/simulate-aim-assist-randomness";

export async function getTutorial(topic: string) {
  try {
    const result = await interactiveAimingTutorials({ topic });
    return result.tutorialContent;
  } catch (error) {
    console.error("Error fetching tutorial:", error);
    return "Sorry, there was an error generating the tutorial. Please try again.";
  }
}

export async function getOrganicAim(input: SimulateAimAssistWithRandomnessInput) {
  try {
    const result = await simulateAimAssistWithRandomness(input);
    return result.adjustedAngle;
  } catch (error) {
    console.error("Error getting organic aim:", error);
    // Return a simple random value as a fallback
    return (Math.random() - 0.5) * 2 * input.randomnessFactor;
  }
}
