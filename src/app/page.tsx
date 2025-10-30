"use client";

import { useState } from "react";
import {
  Wifi,
  Scan,
  Monitor,
  Hand,
  Binary,
  KeyRound,
  Lock,
} from "lucide-react";

import {
  runHandshakeConversionAction,
  runPasswordCrackingAction,
} from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/layout/app-header";
import { StepCard, type Status } from "@/components/simulation/step-card";
import { TerminalOutput } from "@/components/simulation/terminal-output";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { HandshakeConversionOutput } from "@/ai/flows/handshake-conversion";
import type { PasswordCrackingEmulationOutput } from "@/ai/flows/password-cracking-emulation";
import { cn } from "@/lib/utils";

type Network = {
  bssid: string;
  pwr: number;
  beacons: number;
  data: number;
  s: number;
  ch: number;
  mb: string;
  enc: string;
  cipher: string;
  auth: string;
  essid: string;
};

const initialNetworks: Network[] = [
  {
    bssid: "FE:B5:D5:59:1E:5F",
    pwr: -55,
    beacons: 31,
    data: 0,
    s: 0,
    ch: 1,
    mb: "180",
    enc: "WPA2",
    cipher: "CCMP",
    auth: "PSK",
    essid: "nemo",
  },
  {
    bssid: "00:1A:C1:23:45:67",
    pwr: -62,
    beacons: 15,
    data: 0,
    s: 0,
    ch: 6,
    mb: "54",
    enc: "WPA2",
    cipher: "TKIP",
    auth: "PSK",
    essid: "Linksys-XYZ",
  },
  {
    bssid: "DA:3B:9E:C4:F1:8A",
    pwr: -71,
    beacons: 12,
    data: 0,
    s: 0,
    ch: 11,
    mb: "130",
    enc: "WPA2",
    cipher: "CCMP",
    auth: "PSK",
    essid: "MyHomeWiFi",
  },
];

const targetHash = "f6085bce4b9ccef6bf1fe616f3bcf38c:feb5d5591e5f:320ab2f2814e:nemo:24042012";

export default function Home() {
  const [step, setStep] = useState(1);
  const [targetNetwork, setTargetNetwork] = useState<Network | null>(null);
  const [isHandshakeCaptured, setIsHandshakeCaptured] = useState(false);
  const [handshakeConversionResult, setHandshakeConversionResult] =
    useState<HandshakeConversionOutput | null>(null);
  const [crackingMask, setCrackingMask] = useState("?d?d?d?d?d?d?d?d");
  const [crackingResult, setCrackingResult] =
    useState<PasswordCrackingEmulationOutput | null>(null);
  const [currentCommand, setCurrentCommand] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getStatus = (currentStep: number): Status => {
    if (step < currentStep) return "pending";
    if (step === currentStep) return "active";
    return "completed";
  };
  
  const handleCommandSubmit = (command: string, expectedCommand: string, nextStep: number) => {
    if (command.trim() === expectedCommand.trim()) {
      setStep(nextStep);
      setCurrentCommand("");
    } else {
      toast({
        variant: "destructive",
        title: "أمر خاطئ",
        description: "الأمر اللي كتبته مش صح، حاول تاني.",
      });
    }
  };

  const handleRunConversion = async () => {
    setIsLoading(true);
    try {
      const result = await runHandshakeConversionAction("nemo-01.cap");
      setHandshakeConversionResult(result);
      setStep(7);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل التحويل",
        description: "فشلت عملية تحويل الهاندشيك باستخدام الذكاء الاصطناعي. حاول مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRunCracking = async () => {
    if (!handshakeConversionResult) return;
    setIsLoading(true);
    try {
      const result = await runPasswordCrackingAction({
        hash: targetHash,
        mask: crackingMask,
      });
      setCrackingResult(result);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "فشل الاختراق",
        description: "فشلت محاكاة اختراق كلمة المرور. حاول مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCrackingCommandSubmit = (command: string) => {
    const expectedCommand = `hashcat -m 22000 ${targetHash} -a 3 ${crackingMask}`;
    if (command.trim() === expectedCommand.trim()) {
      handleRunCracking();
      setCurrentCommand("");
    } else {
      toast({
        variant: "destructive",
        title: "أمر خاطئ",
        description: "الأمر اللي كتبته مش مطابق للأمر المطلوب بالماسك الحالي. حاول تاني.",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="container mx-auto flex-1 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <StepCard
            stepNumber={1}
            title="التحقق من كارت الواي فاي وحالته"
            command="iwconfig"
            status={getStatus(1)}
            Icon={Wifi}
            onCommandSubmit={(cmd) => handleCommandSubmit(cmd, "iwconfig", 2)}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              ده أول أمر بنستخدمه عشان نتأكد إن كارت الواي فاي بتاعنا موجود والنظام شايفه. الأمر ده بيعرض لنا كل كروت الشبكة اللي على الجهاز، وإحنا بندور على الكارت اللي بيدعم الواي فاي (عادة بيكون اسمه wlan0).
            </p>
            <TerminalOutput>
              {`lo        no wireless extensions.

eth0      no wireless extensions.

wlan0     IEEE 802.11  ESSID:off/any
          Mode:Managed  Access Point: Not-Associated
          Tx-Power=20 dBm`}
            </TerminalOutput>
          </StepCard>

          <StepCard
            stepNumber={2}
            title="تفعيل وضع المراقبة (Monitor Mode)"
            command="sudo airmon-ng start wlan0"
            status={getStatus(2)}
            Icon={Monitor}
            onCommandSubmit={(cmd) => handleCommandSubmit(cmd, "sudo airmon-ng start wlan0", 3)}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              هنا بنحول كارت الواي فاي من الوضع العادي لوضع المراقبة. الوضع ده بيخلي الكارت يقدر "يسمع" كل باكيتات الواي فاي اللي في الهوا حواليه، مش بس اللي جاية لجهازك. ده أساسي عشان نقدر نلقط الـ Handshake بعد كده.
            </p>
            <TerminalOutput>
              {`Found 3 processes that could cause trouble.
Kill them using 'airmon-ng check kill'.

PHY  Interface  Driver    Chipset
phy0 wlan0      rtl8812au Realtek Semiconductor Corp. RTL8812AU

        (mac80211 monitor mode vif enabled for [phy0]wlan0 on [phy0]wlan0mon)`}
            </TerminalOutput>
          </StepCard>

          <StepCard
            stepNumber={3}
            title="التأكد من تفعيل وضع المراقبة"
            command="iwconfig"
            status={getStatus(3)}
            Icon={Scan}
            onCommandSubmit={(cmd) => handleCommandSubmit(cmd, "iwconfig", 4)}
          >
             <p className="mb-4 text-sm text-muted-foreground">
              بنستخدم نفس الأمر الأولاني تاني عشان نتأكد إن وضع المراقبة اشتغل. المفروض هنلاقي كارت جديد ظهر (عادة اسمه wlan0mon) والـ Mode بتاعه بقى Monitor.
            </p>
            <TerminalOutput>
              {`...

wlan0mon  IEEE 802.11  Mode:Monitor  Frequency:2.457 GHz
          Tx-Power=20 dBm`}
            </TerminalOutput>
          </StepCard>

          <StepCard
            stepNumber={4}
            title=" البحث عن شبكات الواي فاي"
            command="sudo airodump-ng wlan0mon"
            status={getStatus(4)}
            Icon={Scan}
            onCommandSubmit={(cmd) => {
              if (cmd.trim() !== 'sudo airodump-ng wlan0mon') {
                 toast({
                  variant: "destructive",
                  title: "أمر خاطئ",
                  description: "الأمر اللي كتبته مش صح، حاول تاني.",
                });
                return;
              }
              if (targetNetwork) {
                setStep(5);
                setCurrentCommand("");
              } else {
                toast({
                  variant: "destructive",
                  title: "اختار شبكة",
                  description: "لازم تختار شبكة 'nemo' الأول.",
                });
              }
            }}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              الأمر ده بيبدأ يعمل مسح لكل شبكات الواي فاي اللي حوالينا ويعرض تفاصيلها زي اسمها (ESSID) وقوة الإشارة (PWR) ونوع التشفير (ENC). هدفنا نلاقي الشبكة اللي عايزين نستهدفها، وفي حالتنا دي هي شبكة "nemo". اختارها عشان نكمل.
            </p>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>BSSID</TableHead>
                    <TableHead>PWR</TableHead>
                    <TableHead>CH</TableHead>
                    <TableHead>ENC</TableHead>
                    <TableHead>ESSID</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialNetworks.map((net) => (
                    <TableRow
                      key={net.bssid}
                      className={cn(
                        "cursor-pointer",
                        targetNetwork?.bssid === net.bssid
                          ? "bg-primary/10"
                          : ""
                      )}
                      onClick={() => setTargetNetwork(net)}
                    >
                      <TableCell className="font-code">{net.bssid}</TableCell>
                      <TableCell>{net.pwr}</TableCell>
                      <TableCell>{net.ch}</TableCell>
                      <TableCell>{net.enc}</TableCell>
                      <TableCell>{net.essid}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={
                            targetNetwork?.bssid === net.bssid
                              ? "default"
                              : "outline"
                          }
                          onClick={() => setTargetNetwork(net)}
                           disabled={net.essid !== "nemo"}
                        >
                          {net.essid === 'nemo' ? 'اختار' : 'غير متاح'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </StepCard>

          <StepCard
            stepNumber={5}
            title="التقاط الـ WPA Handshake"
            command={`sudo airodump-ng --bssid ${
              targetNetwork?.bssid ?? "FE:B5:D5:59:1E:5F"
            } -c ${targetNetwork?.ch ?? 1} --write nemo wlan0mon`}
            status={getStatus(5)}
            Icon={Hand}
             onCommandSubmit={(cmd) => {
              const expectedCommand = `sudo airodump-ng --bssid ${targetNetwork?.bssid} -c ${targetNetwork?.ch} --write nemo wlan0mon`;
              if (cmd.trim() === expectedCommand.trim()) {
                setIsHandshakeCaptured(true);
                setStep(6);
                setCurrentCommand("");
              } else {
                toast({
                  variant: "destructive",
                  title: "أمر خاطئ",
                  description: "الأمر اللي كتبته مش صح، أو ممكن تكون لسه مختارتش الشبكة. حاول تاني.",
                });
              }
            }}
          >
             <p className="mb-4 text-sm text-muted-foreground">
              دي أهم خطوة. بنركز المراقبة بتاعتنا على شبكة "nemo" بس وبنستنى أي جهاز يحاول يتصل بيها. لما ده بيحصل، بنلقط عملية "المصافحة" (Handshake) اللي بتحصل بينهم واللي بتحتوي على نسخة مشفرة من الباسورد. بعد ما تلقطها، هتلاقي رسالة تأكيد ظهرت.
            </p>
            <TerminalOutput>
              {`CH 1 ][ Elapsed: 45 s ][ 2025-10-28 16:59 ][ WPA handshake: ${
                targetNetwork?.bssid ?? "..."
              }

BSSID              PWR RXQ  Beacons    #Data    #/s  CH  MB   ENC  CIPHER  AUTH  ESSID
${targetNetwork?.bssid ?? "FE:B5:D5:59:1E:5F"}  ${
                targetNetwork?.pwr ?? "-55"
              } 100  31         0        0    1   180  WPA2 CCMP   PSK   ${
                targetNetwork?.essid ?? "nemo"
              }

STATION            BSSID              Pkt  Probes
CC:11:DD:22:EE:33  ${
                targetNetwork?.bssid ?? "FE:B5:D5:59:1E:5F"
              } 10   (Not associated)`}
            </TerminalOutput>
            {getStatus(5) === 'completed' && (
              <p className="mt-4 font-bold text-green-400">
                ✅ تم التقاط الـ WPA handshake بنجاح!
              </p>
            )}
          </StepCard>

          <StepCard
            stepNumber={6}
            title="تحويل صيغة الـ Handshake عشان Hashcat يفهمها"
            command="hcxpcapngtool -o nemo.hc22000 nemo-01.cap"
            status={getStatus(6)}
            Icon={Binary}
            onCommandSubmit={(cmd) => {
              if (cmd.trim() === 'hcxpcapngtool -o nemo.hc22000 nemo-01.cap') {
                handleRunConversion();
                setCurrentCommand("");
              } else {
                 toast({
                  variant: "destructive",
                  title: "أمر خاطئ",
                  description: "الأمر اللي كتبته مش صح، حاول تاني.",
                });
              }
            }}
            isButtonLoading={isLoading && step === 6}
          >
             <p className="mb-4 text-sm text-muted-foreground">
              الملف اللي لقطناه (cap.) مش جاهز لبرنامج كسر الباسوردات Hashcat. لازم الأول نحوله لصيغة مخصوصة (HC22000) باستخدام أداة مساعدة. هنا هنستخدم الذكاء الاصطناعي عشان يحاكي العملية دي ويجهز لنا الهاش.
            </p>
            {handshakeConversionResult ? (
              <TerminalOutput>
                {`${handshakeConversionResult.conversionDetails}

${handshakeConversionResult.hashcatFormat}`}
              </TerminalOutput>
            ) : (
               <p className="text-sm text-muted-foreground">
                في انتظار تنفيذ الأمر لتحويل الملف...
              </p>
            )}
          </StepCard>

          <StepCard
            stepNumber={7}
            title="كسر كلمة المرور باستخدام Hashcat"
            command={`hashcat -m 22000 ${targetHash} -a 3 ${crackingMask}`}
            status={getStatus(7)}
            Icon={KeyRound}
            onCommandSubmit={handleCrackingCommandSubmit}
            isButtonLoading={isLoading && step === 7}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              دي المرحلة الأخيرة. بنستخدم Hashcat عشان نبدأ هجوم "Mask Attack" على الهاش اللي جهزناه. بنحدد له شكل الباسورد المتوقع (مثلاً 8 أرقام زي ما هو مكتوب). الذكاء الاصطناعي هيحاكي العملية دي ويقولنا إذا كان الماسك ده ممكن يلاقي الباسورد ولا لأ.
            </p>
            <div className="my-4 flex items-center gap-2">
              <p className="font-code text-sm text-muted-foreground">الماسك:</p>
              <Input
                value={crackingMask}
                onChange={(e) => setCrackingMask(e.target.value)}
                placeholder="ادخل ماسك Hashcat"
                className="font-code flex-1"
                disabled={isLoading}
              />
            </div>

            {crackingResult && (
              <div className="mt-4">
                <h4 className="font-headline text-lg">نتيجة الاختراق:</h4>
                <TerminalOutput>
                  {crackingResult.status === "Cracked" ? (
                    <>
                      <span className="text-green-400">الحالة: تم الاختراق بنجاح</span>
                      {`

INFO: All hashes found!

${targetHash}`}
                    </>
                  ) : (
                    <>
                      <span className="text-yellow-400">الحالة: لم يتم الاختراق</span>
                      {`

INFO: Exhausted dictionary. No password found with this mask.`}
                    </>
                  )}
                </TerminalOutput>
                {crackingResult.status === "Cracked" && (
                   <div className="mt-4 flex items-center gap-4 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                      <Lock className="h-8 w-8 text-green-400" />
                      <div>
                         <p className="text-sm text-green-300">تم العثور على كلمة المرور!</p>
                         <p className="font-code text-2xl font-bold text-white">{crackingResult.crackedPassword}</p>
                      </div>
                   </div>
                )}
                 {crackingResult.status !== "Cracked" && (
                   <div className="mt-4 flex items-center gap-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                      <div>
                         <p className="text-sm text-yellow-300">لم يتم العثور على كلمة المرور</p>
                         <p className="text-white">جرب ماسك مختلف أو استخدم هجوم القاموس. عملية الاختراق ممكن تاخد وقت طويل.</p>
                      </div>
                   </div>
                )}
              </div>
            )}
          </StepCard>
        </div>
      </main>
    </div>
  );
}
