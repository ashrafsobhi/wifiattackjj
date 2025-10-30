'use server';

/**
 * @fileOverview Converts a captured handshake into a format suitable for Hashcat using AI.
 *
 * - convertHandshake - Converts the handshake to Hashcat format.
 * - HandshakeConversionInput - The input type for the convertHandshake function.
 * - HandshakeConversionOutput - The return type for the convertHandshake function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HandshakeConversionInputSchema = z.object({
  handshakeData: z
    .string()
    .describe('The captured handshake data in .cap format.'),
});

export type HandshakeConversionInput = z.infer<typeof HandshakeConversionInputSchema>;

const HandshakeConversionOutputSchema = z.object({
  hashcatFormat: z
    .string()
    .describe('The handshake data converted to Hashcat-compatible format.'),
  conversionDetails: z
    .string()
    .describe('Details about the conversion process and tools used.'),
});

export type HandshakeConversionOutput = z.infer<typeof HandshakeConversionOutputSchema>;

export async function convertHandshake(input: HandshakeConversionInput): Promise<HandshakeConversionOutput> {
  return handshakeConversionFlow(input);
}

const handshakeConversionPrompt = ai.definePrompt({
  name: 'handshakeConversionPrompt',
  input: {schema: HandshakeConversionInputSchema},
  output: {schema: HandshakeConversionOutputSchema},
  prompt: `You are an expert in wireless network security and penetration testing. A user has captured a WPA handshake in a .cap format and needs to convert it into a format suitable for cracking with Hashcat.

  Explain that you will use hcxpcapngtool (or an emulated substitute) to convert the captured handshake data into a Hashcat-compatible format (HC22000). Provide the converted hash and details about the conversion process.

  Handshake Data: {{{handshakeData}}}
`,
});

const handshakeConversionFlow = ai.defineFlow(
  {
    name: 'handshakeConversionFlow',
    inputSchema: HandshakeConversionInputSchema,
    outputSchema: HandshakeConversionOutputSchema,
  },
  async input => {
    const {output} = await handshakeConversionPrompt(input);
    return output!;
  }
);
