
"use server";

import {
  convertHandshake,
  type HandshakeConversionInput,
  type HandshakeConversionOutput,
} from "@/ai/flows/handshake-conversion";


export async function runHandshakeConversionAction(
  input: HandshakeConversionInput
): Promise<HandshakeConversionOutput> {
  try {
    const result = await convertHandshake(input);
    return result;
  } catch (error) {
    console.error("Error in handshake conversion:", error);
    throw new Error("Failed to run handshake conversion.");
  }
}

export async function sendTelegramMessageAction(
  name: string,
  phone: string
): Promise<{ success: boolean; message: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram Bot Token or Chat ID is not configured.");
    return {
      success: false,
      message: "فشل الإرسال، إعدادات البوت غير مكتملة.",
    };
  }
  
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

export async function sendCertificateDetailsAction(
  name: string,
  phone: string,
  certificateNumber: string
): Promise<{ success: boolean; message: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram Bot Token or Chat ID is not configured.");
    return {
      success: false,
      message: "فشل إرسال بيانات الشهادة.",
    };
  }

  const text = `
🥳 شهادة جديدة صدرت 🥳

الاسم: ${name}
رقم الهاتف: ${phone}
رقم الشهادة: ${certificateNumber}
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
      return { success: true, message: "تم إرسال بيانات الشهادة بنجاح." };
    } else {
      console.error("Telegram API error (Certificate):", data);
      return { success: false, message: "فشل إرسال بيانات الشهادة." };
    }
  } catch (error) {
    console.error("Error sending certificate details to Telegram:", error);
    return { success: false, message: "حدث خطأ أثناء إرسال بيانات الشهادة." };
  }
}

    