"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Barcode, CreditCard, Search, UserCheck } from "lucide-react";
import { useT } from "@/lib/i18n/messages";
import { PATIENTS_KM } from "../km";

interface PatientIdentificationProps {
  onPatientFound: (patientId: string, method: "qr" | "barcode" | "rfid" | "manual") => void;
  onError: (error: string) => void;
}

export function PatientIdentification({ onPatientFound, onError }: PatientIdentificationProps) {
  const t = useT(PATIENTS_KM);
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
          {t("Patient Identification")}
        </CardTitle>
        <CardDescription>
          {t("Use QR code, barcode, RFID, or manual search to identify a patient")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              {t("QR Code")}
            </TabsTrigger>
            <TabsTrigger value="barcode" className="flex items-center gap-2">
              <Barcode className="h-4 w-4" />
              {t("Barcode")}
            </TabsTrigger>
            <TabsTrigger value="rfid" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t("RFID")}
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {t("Manual")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="space-y-4">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">{t("QR Code Scanner")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Position the patient's QR code within the scanner area")}
              </p>
              
              {!isScanning ? (
                <Button onClick={startQRScanning}>
                  <QrCode className="mr-2 h-4 w-4" />
                  {t("Start QR Scanner")}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div id={qrCodeRegionId} className="w-full" />
                  <Button variant="outline" onClick={stopQRScanning}>
                    {t("Stop Scanner")}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="barcode" className="space-y-4">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">{t("Barcode Input")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Scan or manually enter the patient's barcode")}
              </p>
              
              <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">{t("Barcode")}</Label>
                  <Input
                    id="barcode"
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder={t("Enter or scan barcode")}
                    className="text-center"
                  />
                </div>
                <Button type="submit" disabled={!barcodeInput.trim()}>
                  <Barcode className="mr-2 h-4 w-4" />
                  {t("Identify Patient")}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="rfid" className="space-y-4">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">{t("RFID Input")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Tap patient's RFID card or enter RFID number manually")}
              </p>
              
              <form onSubmit={handleRfidSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rfid">{t("RFID Number")}</Label>
                  <Input
                    id="rfid"
                    type="text"
                    value={rfidInput}
                    onChange={(e) => setRfidInput(e.target.value)}
                    placeholder={t("Enter RFID number")}
                    className="text-center"
                  />
                </div>
                <Button type="submit" disabled={!rfidInput.trim()}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t("Identify Patient")}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">{t("Manual Search")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("Enter patient ID, name, or phone number to search")}
              </p>
              
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual">{t("Patient ID / Name / Phone")}</Label>
                  <Input
                    id="manual"
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder={t("Enter patient identifier")}
                    className="text-center"
                  />
                </div>
                <Button type="submit" disabled={!manualId.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  {t("Search Patient")}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}