
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

export async function sendTelegramMessageAction(
  name: string,
  phone: string
): Promise<{ success: boolean; message: string }> {
  const botToken = "8230425730:AAF5-RZl2erzm2nP-HuGmRY7QshAtgjasS4";
  const chatId = "-1002246755497"; // You need to get your chat ID
  const text = `
متدرب جديد بدأ المحاكاة:
الاسم: ${name}
رقم الهاتف: ${phone}
`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    const data = await response.json();

    if (data.ok) {
      return { success: true, message: "تم إرسال البيانات بنجاح." };
    } else {
      console.error("Telegram API error:", data);
      return {
        success: false,
        message: "فشل إرسال البيانات إلى تليجرام.",
      };
    }
  } catch (error) {
    console.error("Error sending to Telegram:", error);
    return { success: false, message: "حدث خطأ أثناء الاتصال بتليجرام." };
  }
}
