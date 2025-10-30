'use server';
/**
 * @fileOverview An AI-powered password cracking emulation tool using Hashcat.
 *
 * - passwordCrackingEmulation - A function that emulates the password cracking process.
 * - PasswordCrackingEmulationInput - The input type for the passwordCrackingEmulation function.
 * - PasswordCrackingEmulationOutput - The return type for the passwordCrackingEmulation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PasswordCrackingEmulationInputSchema = z.object({
  hash: z
    .string()
    .describe('The hash to crack (in HC22000 format).'),
  mask: z
    .string()
    .describe('The mask to use for the Hashcat attack (e.g., ?d?d?d?d?d?d?d?d for 8 digits).'),
});
export type PasswordCrackingEmulationInput = z.infer<typeof PasswordCrackingEmulationInputSchema>;

const PasswordCrackingEmulationOutputSchema = z.object({
  crackedPassword: z
    .string()
    .optional()
    .describe('The cracked password, if found.  Empty string if not found.'),
  status: z.string().describe('The status of the cracking attempt (e.g., Cracked, Not Cracked).'),
});
export type PasswordCrackingEmulationOutput = z.infer<typeof PasswordCrackingEmulationOutputSchema>;

export async function passwordCrackingEmulation(input: PasswordCrackingEmulationInput): Promise<PasswordCrackingEmulationOutput> {
  return passwordCrackingEmulationFlow(input);
}

const passwordCrackingEmulationPrompt = ai.definePrompt({
  name: 'passwordCrackingEmulationPrompt',
  input: {schema: PasswordCrackingEmulationInputSchema},
  output: {schema: PasswordCrackingEmulationOutputSchema},
  prompt: `You are simulating the Hashcat password cracking tool.  Given a WPA hash and a mask, determine if Hashcat would be able to crack the password.

Hash: {{{hash}}}
Mask: {{{mask}}}

Scenarios:

*   If the hash is "f6085bce4b9ccef6bf1fe616f3bcf38c:feb5d5591e5f:320ab2f2814e:nemo:24042012" and the mask is "?d?d?d?d?d?d?d?d", then the password is "24042012" and status is "Cracked".
*   If the hash is "f6085bce4b9ccef6bf1fe616f3bcf38c:feb5d5591e5f:320ab2f2814e:nemo:24042012" and the mask is "?a?a?a?a?a?a?a?a", then status is "Not Cracked" because the password contains only digits and the mask is for all character types.
*   If the hash is a random hash and the mask is "?d?d?d?d?d?d?d?d", then status is "Not Cracked" because cracking a real password takes time and this is just a simulation.  Do not attempt to crack the password.

Return the cracked password if you can determine it, otherwise return an empty string.  Return "Cracked" or "Not Cracked" status.

Consider these parameters for output:
* crackedPassword
* status`,
});

const passwordCrackingEmulationFlow = ai.defineFlow(
  {
    name: 'passwordCrackingEmulationFlow',
    inputSchema: PasswordCrackingEmulationInputSchema,
    outputSchema: PasswordCrackingEmulationOutputSchema,
  },
  async input => {
    const {output} = await passwordCrackingEmulationPrompt(input);
    return output!;
  }
);
