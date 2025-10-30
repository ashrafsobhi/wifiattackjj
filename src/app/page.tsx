
"use client";

import { useState, useEffect } from "react";
import {
  Wifi,
  Scan,
  Monitor,
  Hand,
  Binary,
  KeyRound,
  User,
  Phone,
  Loader2,
  Signal,
  XCircle,
  Award,
  Printer
} from "lucide-react";

import {
  sendTelegramMessageAction,
  sendCertificateDetailsAction,
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
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
const correctPassword = "24042012";

function RegistrationForm({ onRegister }: { onRegister: (name: string, phone: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "من فضلك أدخل الاسم ورقم الهاتف.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await sendTelegramMessageAction(name, phone);
      if (result.success) {
        toast({
          title: "تم التسجيل",
          description: "بياناتك اتبعتت بنجاح. هنبدأ المحاكاة دلوقتي.",
        });
        onRegister(name, phone);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في التسجيل",
        description: error.message || "فشلت عملية إرسال البيانات. حاول مرة أخرى.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">تسجيل بيانات المتدرب</CardTitle>
          <CardDescription>
            من فضلك أدخل بياناتك لبدء محاكاة اختراق الشبكات.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اكتب اسمك هنا"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
               <div className="relative">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="اكتب رقم تليفونك"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                "ابدأ المحاكاة"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


function Certificate({ studentName, certificateNumber }: { studentName: string; certificateNumber: string; }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body > *:not(.printable-certificate) {
            display: none;
          }
          .printable-certificate {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: hsl(var(--background));
            z-index: 9999;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="printable-certificate flex justify-center items-center py-12">
        <Card className="w-full max-w-2xl border-2 border-primary shadow-2xl shadow-primary/20">
          <CardHeader className="text-center items-center space-y-4">
            <Award className="h-16 w-16 text-primary" />
            <p className="text-sm font-bold text-muted-foreground tracking-widest">CybHack</p>
            <CardTitle className="text-4xl font-headline">شهادة تقدير</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 px-10 py-8">
            <p className="text-lg text-foreground">مقدمة إلى</p>
            <p className="text-3xl font-bold font-headline text-accent">{studentName}</p>
            <p className="text-xl text-muted-foreground">
              لاجتيازه محاكي اختراق الشبكات بنجاح
            </p>
            <p className="text-2xl font-bold">"اشطر كتكوت بيهكر شبكاااات😍💕🥳🥳"</p>
            <div className="pt-4">
              <p className="text-xs text-muted-foreground">رقم الشهادة</p>
              <p className="font-code text-sm text-foreground">{certificateNumber}</p>
            </div>
          </CardContent>
           <div className="p-6 pt-0 flex justify-center no-print">
             <Button onClick={handlePrint}>
               <Printer className="ml-2 h-4 w-4" />
               طباعة الشهادة
             </Button>
          </div>
        </Card>
      </div>
    </>
  );
}


export default function Home() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [studentData, setStudentData] = useState({ name: "", phone: "" });

  const [step, setStep] = useState(1);
  const [targetNetwork, setTargetNetwork] = useState<Network | null>(null);
  const [isHandshakeCaptured, setIsHandshakeCaptured] = useState(false);
  const [handshakeConversionResult, setHandshakeConversionResult] =
    useState<HandshakeConversionOutput | null>(null);
  const [connectionPassword, setConnectionPassword] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<"pending" | "success" | "failed">("pending");
  const [currentCommand, setCurrentCommand] = useState("");
  const [certificateNumber, setCertificateNumber] = useState<string | null>(null);


  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleRegister = (name: string, phone: string) => {
    setStudentData({ name, phone });
    setIsRegistered(true);
  };

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

  const handleRunConversion = () => {
    setIsLoading(true);
    // Simulate the conversion process without AI
    setTimeout(() => {
      setHandshakeConversionResult({
        hashcatFormat: targetHash,
        conversionDetails: "summarizing packets in nemo-01.cap... written hash to nemo.hc22000",
      });
      setStep(7);
      setIsLoading(false);
    }, 1000); // Simulate a short delay
  };
  
  const handleConnect = async () => {
    setIsLoading(true);
    setConnectionStatus("pending");
    setTimeout(() => {
      if (connectionPassword === correctPassword) {
        setConnectionStatus("success");
        const newCertNumber = `CYBHACK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setCertificateNumber(newCertNumber);
        sendCertificateDetailsAction(studentData.name, studentData.phone, newCertNumber);
      } else {
        setConnectionStatus("failed");
        toast({
          variant: "destructive",
          title: "فشل الاتصال",
          description: "كلمة المرور اللي دخلتها غلط. حاول تاني.",
        });
      }
      setIsLoading(false);
    }, 1500);
  };
  
  const handleConnectionAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    handleConnect();
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="container mx-auto flex-1 px-4 py-6 md:px-6 md:py-12">
        {!isRegistered ? (
          <RegistrationForm onRegister={handleRegister} />
        ) : connectionStatus === 'success' && certificateNumber ? (
           <Certificate studentName={studentData.name} certificateNumber={certificateNumber} />
        ) : (
          <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
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
                      <TableHead className="p-2 md:p-4">BSSID</TableHead>
                      <TableHead className="p-2 md:p-4">PWR</TableHead>
                      <TableHead className="hidden sm:table-cell p-2 md:p-4">CH</TableHead>
                      <TableHead className="hidden sm:table-cell p-2 md:p-4">ENC</TableHead>
                      <TableHead className="p-2 md:p-4">ESSID</TableHead>
                      <TableHead className="p-2 md:p-4"></TableHead>
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
                        <TableCell className="font-code p-2 md:p-4 text-xs md:text-sm">{net.bssid}</TableCell>
                        <TableCell className="p-2 md:p-4">{net.pwr}</TableCell>
                        <TableCell className="hidden sm:table-cell p-2 md:p-4">{net.ch}</TableCell>
                        <TableCell className="hidden sm:table-cell p-2 md:p-4">{net.enc}</TableCell>
                        <TableCell className="p-2 md:p-4">{net.essid}</TableCell>
                        <TableCell className="p-2 md:p-4">
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
              title="تحويل صيغة الـ Handshake"
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
                الملف اللي لقطناه (cap.) مش جاهز لبرنامج كسر الباسوردات. لازم الأول نحوله لصيغة مخصوصة (HC22000) باستخدام أداة مساعدة عشان نقدر نستخدمه في الخطوات الجاية.
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
              title="محاولة الاتصال بالشبكة"
              status={getStatus(7)}
              Icon={KeyRound}
              isButtonLoading={isLoading && step === 7}
            >
              <p className="mb-4 text-sm text-muted-foreground">
                الخطوة الأخيرة! دلوقتي هنستخدم الباسورد اللي عرفناه (
                <span className="font-code text-accent">{correctPassword}</span>
                ) عشان نحاول نتصل بشبكة "nemo".
              </p>
              
              <form onSubmit={handleConnectionAttempt}>
                <Card className="bg-background/50">
                  <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wifi className="h-5 w-5 text-primary" />
                        الاتصال بشبكة
                      </CardTitle>
                      <CardDescription>
                        أدخل كلمة المرور للاتصال بشبكة <span className="font-bold text-foreground">nemo</span>.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="password">كلمة المرور</Label>
                        <Input
                          id="password"
                          type="password"
                          value={connectionPassword}
                          onChange={(e) => setConnectionPassword(e.target.value)}
                          placeholder="اكتب الباسورد هنا"
                          className="font-code"
                          disabled={isLoading}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري الاتصال...
                          </>
                        ) : (
                          "اتصال"
                        )}
                      </Button>
                  </CardContent>
                </Card>
              </form>

              {connectionStatus !== "pending" && (
                <div className="mt-4">
                  {connectionStatus === "success" ? (
                     <div className="flex items-center gap-4 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                        <Signal className="h-8 w-8 text-green-400" />
                        <div>
                           <p className="text-sm text-green-300">تم الاتصال بنجاح!</p>
                           <p className="font-bold text-white">أنت الآن متصل بشبكة "nemo".</p>
                        </div>
                     </div>
                  ) : (
                     <div className="flex items-center gap-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                        <XCircle className="h-8 w-8 text-red-400" />
                        <div>
                           <p className="text-sm text-red-300">فشل الاتصال</p>
                           <p className="text-white">كلمة المرور اللي دخلتها غلط. حاول تاني.</p>
                        </div>
                     </div>
                  )}
                </div>
              )}
            </StepCard>
          </div>
        )}
      </main>
    </div>
  );
}
