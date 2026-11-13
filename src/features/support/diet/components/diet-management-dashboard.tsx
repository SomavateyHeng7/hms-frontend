"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Utensils, 
  Users, 
  Calendar, 
  ClipboardList, 
  AlertCircle,
  Plus,
  ChefHat,
  Activity
} from "lucide-react";
import type { 
  PatientDietOrder, 
  MenuItem, 
  MealService,
  NutritionalAssessment,
  DietStats 
} from "@/features/support/diet/types";
import { useTabParam } from "@/hooks/use-tab-param";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { DIET_KM } from "@/features/support/diet/km";

export function DietManagementDashboard() {
  const t = useT(DIET_KM);
  const tAny = useTranslateAny(DIET_KM);
  const fmt = useDateFormat();
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "orders", "services", "assessments"] as const);

  // Mock data
  const dietOrders: PatientDietOrder[] = [
    {
      id: "1",
      orderNumber: "DIET-2025-001",
      patientId: "PAT001",
      patientName: "Sok Dara",
      admissionId: "ADM-2025-001",
      ward: "Ward-A",
      bedNumber: "A-101",
      dietType: "diabetic",
      consistency: "regular",
      startDate: new Date(2025, 0, 10),
      mealSchedule: [
        {
          mealType: "breakfast",
          time: "08:00",
          menuItems: [
            { itemId: "1", itemName: "Oatmeal", quantity: 1 },
            { itemId: "2", itemName: "Boiled Egg", quantity: 1 },
          ],
        },
        {
          mealType: "lunch",
          time: "13:00",
          menuItems: [
            { itemId: "3", itemName: "Grilled Chicken", quantity: 1 },
            { itemId: "4", itemName: "Brown Rice", quantity: 1 },
            { itemId: "5", itemName: "Steamed Vegetables", quantity: 1 },
          ],
        },
      ],
      restrictions: {
        allergies: ["Peanuts"],
        intolerances: [],
        culturalRestrictions: [],
        religiousRestrictions: [],
      },
      feedingRoute: "oral",
      orderedBy: "Dr. Chea Sovann",
      orderDate: new Date(2025, 0, 10),
      status: "active",
    },
  ];

  const menuItems: MenuItem[] = [
    {
      id: "1",
      itemName: "Oatmeal with Berries",
      category: "main-course",
      dietTypes: ["diabetic", "cardiac", "regular"],
      consistency: "soft",
      ingredients: [
        { name: "Oats", quantity: 100, unit: "g" },
        { name: "Mixed Berries", quantity: 50, unit: "g" },
        { name: "Almond Milk", quantity: 200, unit: "ml" },
      ],
      allergens: [],
      nutritionalInfo: {
        calories: 250,
        protein: 8,
        carbohydrates: 45,
        fat: 6,
        fiber: 8,
        sodium: 50,
        sugar: 12,
      },
      portionSize: 1,
      portionUnit: "bowl",
      preparationTime: 10,
      cost: 80,
      availableMeals: ["breakfast"],
      isActive: true,
    },
  ];

  const mealServices: MealService[] = [
    {
      id: "1",
      serviceNumber: "SVC-2025-001",
      date: new Date(),
      mealType: "lunch",
      serviceTime: new Date(),
      ward: "Ward-A",
      orders: [
        {
          orderId: "1",
          patientId: "PAT001",
          patientName: "Sok Dara",
          bedNumber: "A-101",
          dietType: "diabetic",
          items: [
            { itemId: "3", itemName: "Grilled Chicken", quantity: 1 },
            { itemId: "4", itemName: "Brown Rice", quantity: 1 },
          ],
          served: false,
        },
      ],
      preparedBy: "Chef Mike",
      status: "preparing",
      totalMeals: 45,
      servedMeals: 0,
    },
  ];

  const assessments: NutritionalAssessment[] = [
    {
      id: "1",
      assessmentNumber: "NA-2025-001",
      patientId: "PAT001",
      patientName: "Sok Dara",
      assessmentDate: new Date(2025, 0, 10),
      assessedBy: "Dietitian Sarah",
      anthropometricData: {
        height: 175,
        weight: 85,
        bmi: 27.8,
        idealBodyWeight: 70,
      },
      dietaryHistory: {
        usualDiet: "Mixed diet with high carbohydrates",
        appetite: "good",
        recentWeightChange: {
          amount: 5,
          duration: "3 months",
          type: "gain",
        },
        foodPreferences: ["Rice", "Chicken", "Vegetables"],
        foodAversions: ["Fish"],
        allergies: ["Peanuts"],
        supplements: [],
      },
      clinicalData: {
        diagnosis: "Type 2 Diabetes Mellitus",
        comorbidities: ["Hypertension"],
        medications: ["Metformin", "Amlodipine"],
      },
      functionalStatus: {
        abilityToFeed: "independent",
        chewingDifficulty: false,
        swallowingDifficulty: false,
        nausea: false,
        vomiting: false,
        diarrhea: false,
        constipation: false,
      },
      nutritionalDiagnosis: "Excess energy intake related to poor dietary choices",
      recommendations: {
        dietType: "diabetic",
        consistency: "regular",
        energyRequirement: 1800,
        proteinRequirement: 70,
        fluidRequirement: 2000,
        specialConsiderations: ["Low glycemic index foods", "Regular meal timings"],
        supplementsRecommended: [],
      },
    },
  ];

  const stats: DietStats = {
    totalActiveOrders: 156,
    todayMealsScheduled: 468,
    mealsServedToday: 312,
    pendingOrders: 8,
    byDietType: {
      regular: 85,
      diabetic: 32,
      cardiac: 18,
      renal: 12,
      soft: 9,
    },
    kitchenCapacity: {
      total: 500,
      utilized: 468,
      available: 32,
    },
    patientSatisfaction: {
      averageRating: 4.2,
      totalResponses: 145,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("Diet Management")}</h2>
          <p className="text-muted-foreground">
            {t("Manage patient diets, menus, and nutritional services")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("New Diet Order")}
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            {t("Plan Menu")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Active Orders")}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveOrders}</div>
            <p className="text-xs text-muted-foreground">
              {t("{pendingOrders} pending approvals", { pendingOrders: stats.pendingOrders })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Today's Meals")}</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mealsServedToday}</div>
            <p className="text-xs text-muted-foreground">
              {t("of {todayMealsScheduled} scheduled", { todayMealsScheduled: stats.todayMealsScheduled })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Kitchen Capacity")}</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.kitchenCapacity.utilized / stats.kitchenCapacity.total) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t("{available} meals available", { available: stats.kitchenCapacity.available })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Patient Satisfaction")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.patientSatisfaction.averageRating}/5
            </div>
            <p className="text-xs text-muted-foreground">
              {t("from {totalResponses} responses", { totalResponses: stats.patientSatisfaction.totalResponses })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="orders">{t("Diet Orders")}</TabsTrigger>
          <TabsTrigger value="services">{t("Meal Services")}</TabsTrigger>
          <TabsTrigger value="assessments">{t("Assessments")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("Diet Type Distribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.byDietType).map(([dietType, count]) => (
                    <div key={dietType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{dietType}</span>
                        <span className="text-sm font-bold">{t("{count} patients", { count: count })}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(count / stats.totalActiveOrders) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Today's Meal Services")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mealServices.map((service) => (
                    <div
                      key={service.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{tAny(service.mealType)}</p>
                          <p className="text-sm text-muted-foreground">
                            {tAny(service.ward)} • {service.serviceNumber}
                          </p>
                        </div>
                        <Badge
                          variant={
                            service.status === "completed"
                              ? "default"
                              : service.status === "serving"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {tAny(service.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t("{servedMeals} / {totalMeals} served", { servedMeals: service.servedMeals, totalMeals: service.totalMeals })}</span>
                        <span className="text-muted-foreground">
                          {fmt(service.serviceTime, "HH:mm")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Active Diet Orders")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dietOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{order.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.orderNumber} • {tAny(order.ward)} - {order.bedNumber}
                        </p>
                      </div>
                      <Badge variant={order.status === "active" ? "default" : "secondary"}>
                        {tAny(order.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t("Diet Type:")}</span>{" "}
                        <span className="capitalize">{tAny(order.dietType)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Consistency:")}</span>{" "}
                        <span className="capitalize">{order.consistency}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Feeding Route:")}</span>{" "}
                        <span className="uppercase">{order.feedingRoute}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Ordered By:")}</span>{" "}
                        {order.orderedBy}
                      </div>
                    </div>

                    {order.restrictions.allergies.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-1 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          {t("Allergies")}
                        </p>
                        <div className="flex gap-2">
                          {order.restrictions.allergies.map((allergy, idx) => (
                            <Badge key={idx} variant="destructive">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">{t("Meal Schedule")}</p>
                      <div className="space-y-2">
                        {order.mealSchedule.map((meal, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="font-medium capitalize">{tAny(meal.mealType)}</span>{" "}
                            <span className="text-muted-foreground">({meal.time}):</span>{" "}
                            {meal.menuItems.map((item) => item.itemName).join(", ")}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {t("Modify Order")}
                      </Button>
                      <Button size="sm" variant="outline">
                        {t("View Details")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Meal Service Status")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mealServices.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-lg capitalize">{tAny(service.mealType)}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.serviceNumber} • {fmt(service.date, "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          service.status === "completed"
                            ? "default"
                            : service.status === "serving"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {tAny(service.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t("Ward:")}</span> {tAny(service.ward)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Time:")}</span>{" "}
                        {fmt(service.serviceTime, "HH:mm")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Prepared By:")}</span>{" "}
                        {service.preparedBy}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t("Service Progress")}</span>
                        <span className="text-sm text-muted-foreground">
                          {t("{servedMeals} / {totalMeals} meals", { servedMeals: service.servedMeals, totalMeals: service.totalMeals })}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${(service.servedMeals / service.totalMeals) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">{t("Mark Served")}</Button>
                      <Button size="sm" variant="outline">
                        {t("View Orders")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Nutritional Assessments")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{assessment.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {assessment.assessmentNumber} •{" "}
                          {fmt(assessment.assessmentDate, "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge variant="secondary">{assessment.assessedBy}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t("Height:")}</span>{" "}
                        {assessment.anthropometricData.height} {t("cm")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Weight:")}</span>{" "}
                        {assessment.anthropometricData.weight} {t("kg")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("BMI:")}</span>{" "}
                        {assessment.anthropometricData.bmi.toFixed(1)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Ideal Weight:")}</span>{" "}
                        {assessment.anthropometricData.idealBodyWeight} {t("kg")}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm">
                        <span className="font-medium">{t("Diagnosis:")}</span>{" "}
                        {assessment.nutritionalDiagnosis}
                      </p>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">{t("Recommendations")}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{t("Diet Type:")}</span>{" "}
                          <span className="capitalize">{tAny(assessment.recommendations.dietType)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("Energy:")}</span>{" "}
                          {assessment.recommendations.energyRequirement} {t("kcal/day")}
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("Protein:")}</span>{" "}
                          {assessment.recommendations.proteinRequirement} {t("g/day")}
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("Fluids:")}</span>{" "}
                          {assessment.recommendations.fluidRequirement} {t("ml/day")}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">{t("Create Diet Order")}</Button>
                      <Button size="sm" variant="outline">
                        {t("View Full Report")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
