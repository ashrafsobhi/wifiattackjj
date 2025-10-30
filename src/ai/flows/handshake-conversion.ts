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

  Your task is to act as the 'hcxpcapngtool' utility. When given the handshake data, you will output the converted hash in the HC22000 format.

  **Input Handshake Data:** {{{handshakeData}}}

  **Your Simulated Output:**
  1.  **Conversion Details:** Start with a line confirming the process, for example: "summarizing packets in nemo-01.cap... written hash to nemo.hc22000".
  2.  **Hashcat Format:** On a new line, provide the converted hash. For the specific target network "nemo", the output hash MUST be exactly: "f6085bce4b9ccef6bf1fe616f3bcf38c:feb5d5591e5f:320ab2f2814e:nemo:24042012". For any other input, you can generate a plausible but fake hash.
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
