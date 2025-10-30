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

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getStatus = (currentStep: number): Status => {
    if (step < currentStep) return "pending";
    if (step === currentStep) return "active";
    return "completed";
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
        title: "Conversion Failed",
        description: "The AI-powered handshake conversion failed. Please try again.",
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
        title: "Cracking Failed",
        description: "The AI-powered password cracking emulation failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="container mx-auto flex-1 px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <StepCard
            stepNumber={1}
            title="Check Wifi Interface & Status"
            command="iwconfig"
            status={getStatus(1)}
            Icon={Wifi}
            buttonText="Check Interface"
            onButtonClick={() => setStep(2)}
          >
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
            title="Enable Monitor Mode"
            command="sudo airmon-ng start wlan0"
            status={getStatus(2)}
            Icon={Monitor}
            buttonText="Enable Monitor Mode"
            onButtonClick={() => setStep(3)}
          >
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
            title="Verify Monitor Mode"
            command="iwconfig"
            status={getStatus(3)}
            Icon={Scan}
            buttonText="Verify Mode & Scan Networks"
            onButtonClick={() => setStep(4)}
          >
            <TerminalOutput>
              {`...

wlan0mon  IEEE 802.11  Mode:Monitor  Frequency:2.457 GHz
          Tx-Power=20 dBm`}
            </TerminalOutput>
          </StepCard>

          <StepCard
            stepNumber={4}
            title="Scan for Wi-Fi Networks"
            command="sudo airodump-ng wlan0mon"
            status={getStatus(4)}
            Icon={Scan}
          >
            <p className="mb-4 text-sm text-muted-foreground">
              Scanning for nearby access points. Select the target network
              (&quot;nemo&quot;) to proceed.
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
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {targetNetwork && (
              <Button
                onClick={() => setStep(5)}
                className="mt-4"
                disabled={targetNetwork.essid !== "nemo"}
              >
                {targetNetwork.essid === 'nemo' ? `Target '${targetNetwork.essid}' and Capture Handshake` : 'Please select "nemo"'}
              </Button>
            )}
          </StepCard>

          <StepCard
            stepNumber={5}
            title="Capture WPA Handshake"
            command={`sudo airodump-ng --bssid ${
              targetNetwork?.bssid ?? "FE:B5:D5:59:1E:5F"
            } -c ${targetNetwork?.ch ?? 1} --write nemo wlan0mon`}
            status={getStatus(5)}
            Icon={Hand}
            buttonText="Capture Handshake"
            onButtonClick={() => setIsHandshakeCaptured(true)}
          >
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
            <p className="mt-4 font-bold text-green-400">
              ✅ WPA handshake captured!
            </p>
            {isHandshakeCaptured && (
              <Button onClick={() => setStep(6)} className="mt-4">
                Proceed to Conversion
              </Button>
            )}
          </StepCard>

          <StepCard
            stepNumber={6}
            title="Convert Handshake for Hashcat"
            command="hcxpcapngtool -o nemo nemo-01.cap"
            status={getStatus(6)}
            Icon={Binary}
            buttonText="Convert with AI"
            onButtonClick={handleRunConversion}
            isButtonLoading={isLoading && step === 6}
          >
            {handshakeConversionResult ? (
              <TerminalOutput>
                {`${handshakeConversionResult.conversionDetails}

${handshakeConversionResult.hashcatFormat}`}
              </TerminalOutput>
            ) : (
               <p className="text-sm text-muted-foreground">
                The captured `.cap` file must be converted to a format Hashcat understands (HC22000). We&apos;ll use an AI to simulate `hcxpcapngtool` for this conversion.
              </p>
            )}
          </StepCard>

          <StepCard
            stepNumber={7}
            title="Crack Password with Hashcat"
            command={`hashcat -m 22000 nemo -a 3 ${crackingMask}`}
            status={getStatus(7)}
            Icon={KeyRound}
          >
            <p className="text-sm text-muted-foreground">
              Simulate a Hashcat mask attack on the captured handshake. The AI will determine if the password can be cracked with the provided mask.
            </p>
            <div className="my-4 flex items-center gap-2">
              <Input
                value={crackingMask}
                onChange={(e) => setCrackingMask(e.target.value)}
                placeholder="Enter Hashcat mask"
                className="font-code"
                disabled={isLoading && step === 7}
              />
              <Button
                onClick={handleRunCracking}
                disabled={isLoading && step === 7}
              >
                {isLoading && step === 7 ? "Cracking..." : "Crack Password"}
              </Button>
            </div>
            {crackingResult && (
              <div className="mt-4">
                <h4 className="font-headline text-lg">Cracking Result:</h4>
                <TerminalOutput>
                  {crackingResult.status === "Cracked" ? (
                    <>
                      <span className="text-green-400">Status: Cracked</span>
                      {`

INFO: All hashes found!

${targetHash}`}
                    </>
                  ) : (
                    <>
                      <span className="text-yellow-400">Status: Not Cracked</span>
                      {`

INFO: Exhausted dictionary. No password found with this mask.`}
                    </>
                  )}
                </TerminalOutput>
                {crackingResult.status === "Cracked" && (
                   <div className="mt-4 flex items-center gap-4 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
                      <Lock className="h-8 w-8 text-green-400" />
                      <div>
                         <p className="text-sm text-green-300">Password Found!</p>
                         <p className="font-code text-2xl font-bold text-white">{crackingResult.crackedPassword}</p>
                      </div>
                   </div>
                )}
                 {crackingResult.status !== "Cracked" && (
                   <div className="mt-4 flex items-center gap-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                      <div>
                         <p className="text-sm text-yellow-300">Password Not Found</p>
                         <p className="text-white">Try a different mask or a dictionary attack. Cracking can take a long time.</p>
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
