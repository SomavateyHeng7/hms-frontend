"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Barcode, CreditCard, Search, UserCheck } from "lucide-react";

interface PatientIdentificationProps {
  onPatientFound: (patientId: string, method: "qr" | "barcode" | "rfid" | "manual") => void;
  onError: (error: string) => void;
}

export function PatientIdentification({ onPatientFound, onError }: PatientIdentificationProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualId, setManualId] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [rfidInput, setRfidInput] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const qrCodeRegionId = "qr-code-scanner";

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startQRScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    const scanner = new Html5QrcodeScanner(
      qrCodeRegionId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current = scanner;
    setIsScanning(true);

    scanner.render(
      (decodedText) => {
        // Success callback
        setIsScanning(false);
        scanner.clear();
        onPatientFound(decodedText, "qr");
      },
      (error) => {
        // Error callback - ignore frequent scanner errors
        console.log("QR Scanner error:", error);
      }
    );
  };

  const stopQRScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      onPatientFound(barcodeInput.trim(), "barcode");
      setBarcodeInput("");
    }
  };

  const handleRfidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rfidInput.trim()) {
      onPatientFound(rfidInput.trim(), "rfid");
      setRfidInput("");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      onPatientFound(manualId.trim(), "manual");
      setManualId("");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-6 w-6" />
          Patient Identification
        </CardTitle>
        <CardDescription>
          Use QR code, barcode, RFID, or manual search to identify a patient
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="barcode" className="flex items-center gap-2">
              <Barcode className="h-4 w-4" />
              Barcode
            </TabsTrigger>
            <TabsTrigger value="rfid" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              RFID
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-4">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">QR Code Scanner</h3>
              <p className="text-sm text-muted-foreground">
                Position the patient's QR code within the scanner area
              </p>
              
              {!isScanning ? (
                <Button onClick={startQRScanning}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Start QR Scanner
                </Button>
              ) : (
                <div className="space-y-4">
                  <div id={qrCodeRegionId} className="w-full" />
                  <Button variant="outline" onClick={stopQRScanning}>
                    Stop Scanner
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="barcode" className="space-y-4">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">Barcode Input</h3>
              <p className="text-sm text-muted-foreground">
                Scan or manually enter the patient's barcode
              </p>
              
              <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Enter or scan barcode"
                    className="text-center"
                  />
                </div>
                <Button type="submit" disabled={!barcodeInput.trim()}>
                  <Barcode className="mr-2 h-4 w-4" />
                  Identify Patient
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="rfid" className="space-y-4">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">RFID Input</h3>
              <p className="text-sm text-muted-foreground">
                Tap patient's RFID card or enter RFID number manually
              </p>
              
              <form onSubmit={handleRfidSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rfid">RFID Number</Label>
                  <Input
                    id="rfid"
                    type="text"
                    value={rfidInput}
                    onChange={(e) => setRfidInput(e.target.value)}
                    placeholder="Enter RFID number"
                    className="text-center"
                  />
                </div>
                <Button type="submit" disabled={!rfidInput.trim()}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Identify Patient
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">Manual Search</h3>
              <p className="text-sm text-muted-foreground">
                Enter patient ID, name, or phone number to search
              </p>
              
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual">Patient ID / Name / Phone</Label>
                  <Input
                    id="manual"
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="Enter patient identifier"
                    className="text-center"
                  />
                </div>
                <Button type="submit" disabled={!manualId.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  Search Patient
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}