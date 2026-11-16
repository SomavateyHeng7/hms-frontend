"use client";

import React, { useState } from "react";
import { Settings, Wifi, Database, Shield, TestTube, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { PACSConfig } from "@/types/radiology";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pacsConfigSchema, PACSConfigFormData } from "@/lib/validations/radiology";

interface PACSIntegrationProps {
  pacsConfig: PACSConfig;
  connectionStatus: {
    connected: boolean;
    lastSync: Date;
    syncProgress: number;
    errors: string[];
  };
  onUpdateConfig: (config: Partial<PACSConfig>) => Promise<void>;
  onTestConnection: () => Promise<boolean>;
  onSyncData: () => Promise<void>;
  onResetConnection: () => Promise<void>;
}

const DICOM_PROTOCOLS = [
  { value: "C-FIND", label: "C-FIND (Query)" },
  { value: "C-GET", label: "C-GET (Retrieve)" },
  { value: "C-MOVE", label: "C-MOVE (Move)" },
  { value: "C-STORE", label: "C-STORE (Store)" },
  { value: "C-ECHO", label: "C-ECHO (Verification)" },
];

const COMPRESSION_TYPES = [
  { value: "none", label: "No Compression" },
  { value: "jpeg", label: "JPEG Lossy" },
  { value: "jpeg2000", label: "JPEG 2000" },
  { value: "jpegls", label: "JPEG-LS Lossless" },
  { value: "rle", label: "RLE Lossless" },
];

export function PACSIntegration({
  pacsConfig,
  connectionStatus,
  onUpdateConfig,
  onTestConnection,
  onSyncData,
  onResetConnection,
}: PACSIntegrationProps) {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const form = useForm<PACSConfigFormData>({
    resolver: zodResolver(pacsConfigSchema),
    defaultValues: pacsConfig,
  });

  const handleUpdateConfig = async (data: PACSConfigFormData) => {
    try {
      await onUpdateConfig(data);
      setConfigDialogOpen(false);
    } catch (error) {
      console.error("Error updating PACS configuration:", error);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const success = await onTestConnection();
      if (success) {
        // Connection successful
      }
    } catch (error) {
      console.error("Connection test failed:", error);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSyncData();
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const getConnectionStatusColor = () => {
    if (connectionStatus.connected) {
      return "bg-green-100 text-green-800";
    } else if (connectionStatus.errors.length > 0) {
      return "bg-red-100 text-red-800";
    } else {
      return "bg-yellow-100 text-yellow-800";
    }
  };

  const getConnectionStatusIcon = () => {
    if (connectionStatus.connected) {
      return CheckCircle;
    } else if (connectionStatus.errors.length > 0) {
      return AlertTriangle;
    } else {
      return RefreshCw;
    }
  };

  const StatusIcon = getConnectionStatusIcon();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">PACS Integration</h1>
        <p className="text-gray-600">Manage DICOM connectivity and image storage settings</p>
      </div>

      <div className="grid gap-6">
        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon className="h-6 w-6" />
                <div>
                  <CardTitle>Connection Status</CardTitle>
                  <CardDescription>Current PACS connectivity status</CardDescription>
                </div>
              </div>
              <Badge className={getConnectionStatusColor()}>
                {connectionStatus.connected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Server</p>
                <p className="text-gray-600">{pacsConfig.serverAddress}:{pacsConfig.port}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">AE Title</p>
                <p className="text-gray-600">{pacsConfig.aeTitle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Last Sync</p>
                <p className="text-gray-600">
                  {connectionStatus.lastSync ? new Date(connectionStatus.lastSync).toLocaleString() : "Never"}
                </p>
              </div>
            </div>

            {connectionStatus.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-medium text-red-900 mb-2">Connection Errors:</p>
                <ul className="text-sm text-red-800 space-y-1">
                  {connectionStatus.errors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {connectionStatus.syncProgress > 0 && connectionStatus.syncProgress < 100 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Syncing data...</span>
                  <span>{connectionStatus.syncProgress}%</span>
                </div>
                <Progress value={connectionStatus.syncProgress} />
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button onClick={handleTestConnection} disabled={testingConnection}>
                <TestTube className="mr-2 h-4 w-4" />
                {testingConnection ? "Testing..." : "Test Connection"}
              </Button>
              <Button onClick={handleSync} disabled={syncing || !connectionStatus.connected}>
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync Now"}
              </Button>
              <Button variant="destructive" onClick={onResetConnection}>
                Reset Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6" />
                <div>
                  <CardTitle>PACS Configuration</CardTitle>
                  <CardDescription>Configure DICOM server settings and protocols</CardDescription>
                </div>
              </div>
              <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>PACS Configuration</DialogTitle>
                    <DialogDescription>
                      Configure DICOM server connection and security settings
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(handleUpdateConfig)} className="space-y-6">
                    <Tabs defaultValue="connection" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="connection">Connection</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="storage">Storage</TabsTrigger>
                      </TabsList>

                      <TabsContent value="connection" className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="serverAddress">Server Address *</Label>
                            <Input
                              id="serverAddress"
                              {...form.register("serverAddress")}
                              placeholder="pacs.hospital.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="port">Port *</Label>
                            <Input
                              id="port"
                              type="number"
                              {...form.register("port", { valueAsNumber: true })}
                              placeholder="11112"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="aeTitle">AE Title *</Label>
                            <Input
                              id="aeTitle"
                              {...form.register("aeTitle")}
                              placeholder="HMS_PACS"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="callingAeTitle">Calling AE Title</Label>
                            <Input
                              id="callingAeTitle"
                              {...form.register("callingAeTitle")}
                              placeholder="HMS_CLIENT"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Supported Protocols</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {DICOM_PROTOCOLS.map((protocol) => (
                              <div key={protocol.value} className="flex items-center space-x-2">
                                <Switch
                                  id={protocol.value}
                                  checked={pacsConfig.supportedProtocols.includes(protocol.value)}
                                  onCheckedChange={(checked) => {
                                    const protocols = checked
                                      ? [...pacsConfig.supportedProtocols, protocol.value]
                                      : pacsConfig.supportedProtocols.filter(p => p !== protocol.value);
                                    form.setValue("supportedProtocols", protocols);
                                  }}
                                />
                                <Label htmlFor={protocol.value} className="text-sm">
                                  {protocol.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="timeout">Timeout (seconds)</Label>
                            <Input
                              id="timeout"
                              type="number"
                              {...form.register("timeout", { valueAsNumber: true })}
                              placeholder="30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="retryAttempts">Retry Attempts</Label>
                            <Input
                              id="retryAttempts"
                              type="number"
                              {...form.register("retryAttempts", { valueAsNumber: true })}
                              placeholder="3"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="security" className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="tlsEnabled"
                            checked={pacsConfig.security.tlsEnabled}
                            onCheckedChange={(checked) => 
                              form.setValue("security.tlsEnabled", checked)
                            }
                          />
                          <Label htmlFor="tlsEnabled">Enable TLS Encryption</Label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              {...form.register("security.username")}
                              placeholder="pacs_user"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              {...form.register("security.password")}
                              placeholder="••••••••"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="certificatePath">Certificate Path</Label>
                          <Input
                            id="certificatePath"
                            {...form.register("security.certificatePath")}
                            placeholder="/path/to/certificate.pem"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="storage" className="space-y-4">
                        <div className="space-y-2">
                          <Label>Compression</Label>
                          <Select
                            value={pacsConfig.storage.compression}
                            onValueChange={(value) => form.setValue("storage.compression", value as any)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {COMPRESSION_TYPES.map((compression) => (
                                <SelectItem key={compression.value} value={compression.value}>
                                  {compression.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                            <Input
                              id="maxFileSize"
                              type="number"
                              {...form.register("storage.maxFileSize", { valueAsNumber: true })}
                              placeholder="500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="retentionDays">Retention (Days)</Label>
                            <Input
                              id="retentionDays"
                              type="number"
                              {...form.register("storage.retentionDays", { valueAsNumber: true })}
                              placeholder="2555"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="autoArchive"
                            checked={pacsConfig.storage.autoArchive}
                            onCheckedChange={(checked) => 
                              form.setValue("storage.autoArchive", checked)
                            }
                          />
                          <Label htmlFor="autoArchive">Auto Archive Old Studies</Label>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="archivePath">Archive Path</Label>
                          <Input
                            id="archivePath"
                            {...form.register("storage.archivePath")}
                            placeholder="/archive/dicom"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setConfigDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Configuration</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Server</p>
                  <p className="text-gray-600">{pacsConfig.serverAddress}:{pacsConfig.port}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Protocols</p>
                  <p className="text-gray-600">{pacsConfig.supportedProtocols.length} enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Security</p>
                  <p className="text-gray-600">{pacsConfig.security.tlsEnabled ? "TLS Enabled" : "No TLS"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">Storage</p>
                  <p className="text-gray-600">{pacsConfig.storage.compression} compression</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Statistics</CardTitle>
            <CardDescription>PACS usage and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">1,247</p>
                <p className="text-sm text-blue-800">Studies Stored</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">98.5%</p>
                <p className="text-sm text-green-800">Uptime</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">847 GB</p>
                <p className="text-sm text-yellow-800">Storage Used</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">45ms</p>
                <p className="text-sm text-purple-800">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}