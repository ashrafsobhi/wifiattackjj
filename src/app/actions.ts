
"use server";

import { convertHandshake } from "@/ai/flows/handshake-conversion";
import {
  passwordCrackingEmulation,
  type PasswordCrackingEmulationInput,
  type PasswordCrackingEmulationOutput,
} from "@/ai/flows/password-cracking-emulation";
import type { HandshakeConversionOutput } from "@/ai/flows/handshake-conversion";

export async function runHandshakeConversionAction(
  handshakeData: string
): Promise<HandshakeConversionOutput> {
  try {
    // In a real scenario, you'd pass the actual handshake data.
    // For this simulation, the AI has been prompted to respond to the context.
    const result = await convertHandshake({ handshakeData });
    return result;
  } catch (error) {
    console.error("Error in handshake conversion:", error);
    throw new Error("Failed to convert handshake.");
  }
}

export async function runPasswordCrackingAction(
  input: PasswordCrackingEmulationInput
): Promise<PasswordCrackingEmulationOutput> {
  try {
    const result = await passwordCrackingEmulation(input);
    return result;
  } catch (error) {
    console.error("Error in password cracking emulation:", error);
    throw new Error("Failed to run password cracking emulation.");
  }
}
