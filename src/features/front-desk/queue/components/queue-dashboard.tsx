"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueueToken, QueueCounter } from "@/features/front-desk/queue/types";
import { Hash, Users, Clock, TrendingUp, Monitor, UserCheck } from "lucide-react";
import { useTabParam } from "@/hooks/use-tab-param";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { QUEUE_KM } from "@/features/front-desk/queue/km";

export function QueueDashboard() {
  const t = useT(QUEUE_KM);
  const tAny = useTranslateAny(QUEUE_KM);
  const fmt = useDateFormat();
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "queue", "counters"] as const);

  // Mock data
  const tokens: QueueToken[] = [
    {
      id: "1",
      tokenNumber: "A001",
      displayNumber: "A001",
      patientId: "PAT001",
      patientName: "Sok Dara",
      patientPhone: "012 345 678",
      serviceType: "opd",
      service: "Consultation",
      department: "General Medicine",
      priority: "normal",
      status: "in-service",
      counterNumber: "Counter 1",
      servedBy: "Pov Chanthou",
      issueTime: new Date(2025, 0, 15, 9, 0),
      calledTime: new Date(2025, 0, 15, 9, 15),
      serviceStartTime: new Date(2025, 0, 15, 9, 15),
      actualWaitTime: 15,
    },
    {
      id: "2",
      tokenNumber: "A002",
      displayNumber: "A002",
      patientId: "PAT002",
      patientName: "Chan Sreymom",
      patientPhone: "012 345 679",
      serviceType: "opd",
      service: "Consultation",
      department: "General Medicine",
      priority: "emergency",
      status: "waiting",
      issueTime: new Date(2025, 0, 15, 9, 10),
      estimatedWaitTime: 20,
      actualWaitTime: 20,
    },
  ];

  const counters: QueueCounter[] = [
    {
      id: "C1",
      counterNumber: "Counter 1",
      counterName: "Registration Counter 1",
      department: "General Medicine",
      services: ["Registration", "Consultation"],
      status: "active",
      currentTokenId: "1",
      currentTokenNumber: "A001",
      staffId: "STAFF001",
      staffName: "Pov Chanthou",
      location: "Ground Floor",
      tokensServedToday: 12,
      averageServiceTime: 8,
      isActive: true,
    },
    {
      id: "C2",
      counterNumber: "Counter 2",
      counterName: "Billing Counter 2",
      department: "Billing",
      services: ["Billing", "Payment"],
      status: "inactive",
      location: "Ground Floor",
      tokensServedToday: 8,
      averageServiceTime: 5,
      isActive: true,
    },
  ];

  const stats = {
    totalTokens: 45,
    waiting: 12,
    serving: 5,
    completed: 28,
    averageWaitTime: 15,
    averageServiceTime: 7,
    activeCounters: 8,
    totalCounters: 12,
    peakHour: "10:00 AM",
    satisfaction: 4.2,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "serving":
        return "bg-blue-500";
      case "waiting":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      case "no-show":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("Queue Management System")}</h1>
        <p className="text-muted-foreground">{t("Manage patient queues and service counters")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="queue">{t("Active Queue")}</TabsTrigger>
          <TabsTrigger value="counters">{t("Counters")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Total Tokens Today")}</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTokens}</div>
                <p className="text-xs text-muted-foreground">
                  {t("{waiting} waiting · {serving} serving", { waiting: stats.waiting, serving: stats.serving })}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Avg Wait Time")}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t("{averageWaitTime} min", { averageWaitTime: stats.averageWaitTime })}</div>
                <p className="text-xs text-muted-foreground">
                  {t("Service: {averageServiceTime} min", { averageServiceTime: stats.averageServiceTime })}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Active Counters")}</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.activeCounters}/{stats.totalCounters}
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(stats.activeCounters / stats.totalCounters) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Satisfaction")}</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.satisfaction}/5.0</div>
                <p className="text-xs text-muted-foreground">{t("Based on feedback")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Queue Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("Queue Status")}</CardTitle>
                <CardDescription>{t("Current queue distribution")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">{t("Waiting")}</span>
                  </div>
                  <Badge className="bg-yellow-500">{stats.waiting}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">{t("Serving")}</span>
                  </div>
                  <Badge className="bg-blue-500">{stats.serving}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">{t("Completed")}</span>
                  </div>
                  <Badge className="bg-green-500">{stats.completed}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Quick Actions")}</CardTitle>
                <CardDescription>{t("Common queue operations")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full">
                  <Hash className="mr-2 h-4 w-4" />
                  {t("Generate Token")}
                </Button>
                <Button variant="outline" className="w-full">
                  <Monitor className="mr-2 h-4 w-4" />
                  {t("Display Board")}
                </Button>
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  {t("Call Next Patient")}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Current Serving */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Currently Serving")}</CardTitle>
              <CardDescription>{t("Patients being served at counters")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tokens
                  .filter((token) => token.status === "in-service")
                  .map((token) => (
                    <div key={token.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="text-lg font-bold">{token.tokenNumber}</Badge>
                          <h4 className="font-semibold">{token.patientName}</h4>
                          {token.priority === "emergency" && (
                            <Badge variant="destructive">{t("Emergency")}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tAny(token.department)} • {token.counterNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{t("Wait Time")}</div>
                        <div className="font-semibold">{t("{actualWaitTime} min", { actualWaitTime: token.actualWaitTime })}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("Active Queue")}</CardTitle>
                  <CardDescription>{t("All tokens in the system")}</CardDescription>
                </div>
                <Button>
                  <Hash className="mr-2 h-4 w-4" />
                  {t("New Token")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tokens.map((token) => (
                  <Card key={token.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className="text-lg font-bold">{token.tokenNumber}</Badge>
                            <h3 className="font-semibold text-lg">{token.patientName}</h3>
                            <Badge
                              className={`${getStatusColor(token.status)} text-white capitalize`}
                            >
                              {tAny(token.status)}
                            </Badge>
                            {token.priority === "emergency" && (
                              <Badge variant="destructive">{t("Emergency")}</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">{t("Department")}</div>
                              <div className="font-medium">{tAny(token.department)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Service Type")}</div>
                              <div className="font-medium uppercase">{token.serviceType}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Issued At")}</div>
                              <div className="font-medium">{fmt(token.issueTime, "HH:mm")}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Wait Time")}</div>
                              <div className="font-medium">{t("{actualWaitTime} min", { actualWaitTime: token.actualWaitTime })}</div>
                            </div>
                          </div>

                          {token.counterNumber && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">{t("Counter:")} </span>
                              <span className="font-medium">{token.counterNumber}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {token.status === "waiting" && (
                            <Button size="sm">{t("Call")}</Button>
                          )}
                          {token.status === "in-service" && (
                            <Button size="sm" variant="outline">{t("Complete")}</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="counters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Service Counters")}</CardTitle>
              <CardDescription>{t("Counter status and performance")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {counters.map((counter) => (
                  <Card key={counter.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            <h3 className="font-semibold text-lg">{counter.counterNumber}</h3>
                          </div>
                          <Badge
                            variant={counter.status === "active" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {tAny(counter.status)}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("Type")}</span>
                            <span className="font-medium capitalize">{counter.counterName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("Department")}</span>
                            <span className="font-medium">{tAny(counter.department)}</span>
                          </div>
                          {counter.staffName && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("Staff")}</span>
                              <span className="font-medium">{counter.staffName}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("Tokens Served")}</span>
                            <span className="font-medium">{counter.tokensServedToday}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t("Avg Service Time")}</span>
                            <span className="font-medium">{t("{averageServiceTime} min", { averageServiceTime: counter.averageServiceTime })}</span>
                          </div>
                        </div>

                        {counter.currentTokenNumber && (
                          <div className="pt-2 border-t">
                            <div className="text-sm text-muted-foreground">{t("Now Serving")}</div>
                            <Badge className="mt-1 text-lg">{counter.currentTokenNumber}</Badge>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {counter.status === "active" && (
                            <Button size="sm" variant="outline" className="flex-1">
                              {t("Call Next")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant={counter.status === "active" ? "outline" : "default"}
                            className="flex-1"
                          >
                            {counter.status === "active" ? t("Close") : t("Open")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
