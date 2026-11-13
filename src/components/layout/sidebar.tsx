"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Activity,
  Ambulance,
  BarChart3,
  BedDouble,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Droplet,
  FileText,
  Home,
  ListOrdered,
  Package,
  Scan,
  ShieldPlus,
  Siren,
  Stethoscope,
  Syringe,
  TestTube,
  Settings,
  UserCog,
  Users,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionaries";
import type { ModuleId } from "@/features/admin/system/module-registry";
import { useSystemSettings } from "@/features/admin/system/system-settings";
import { useSidebarState } from "./sidebar-state";

interface NavItem {
  title: TranslationKey;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  /** Hidden when an administrator switches this module off in the Admin Console. */
  module?: ModuleId;
}

const sub = (title: TranslationKey, href: string, icon: React.ReactNode = <Activity className="h-4 w-4" />): NavItem => ({ title, href, icon });

const NAV_ITEMS: NavItem[] = [
  { title: "sidebar.dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
  {
    title: "sidebar.patientManagement",
    module: "patients",
    icon: <Users className="h-5 w-5" />,
    children: [
      sub("sidebar.patients", "/front-desk/patients", <Users className="h-4 w-4" />),
      sub("sidebar.bookAppointment", "/front-desk/scheduling?tab=booking", <Calendar className="h-4 w-4" />),
    ],
  },
  {
    title: "sidebar.queue",
    module: "queue",
    icon: <ListOrdered className="h-5 w-5" />,
    children: [
      sub("sidebar.queueDashboard", "/front-desk/queue"),
      sub("sidebar.activeQueue", "/front-desk/queue?tab=queue", <Users className="h-4 w-4" />),
      sub("sidebar.counters", "/front-desk/queue?tab=counters"),
    ],
  },
  {
    title: "sidebar.scheduling",
    module: "scheduling",
    icon: <Calendar className="h-5 w-5" />,
    children: [
      sub("sidebar.overview", "/front-desk/scheduling", <Calendar className="h-4 w-4" />),
      sub("sidebar.departmentRosters", "/front-desk/scheduling?tab=departments", <Users className="h-4 w-4" />),
      sub("sidebar.reminders", "/front-desk/scheduling?tab=reminders"),
      sub("sidebar.telemedicine", "/front-desk/scheduling?tab=telemedicine"),
    ],
  },
  {
    title: "sidebar.opd",
    module: "opd",
    icon: <Stethoscope className="h-5 w-5" />,
    children: [
      sub("sidebar.opdDashboard", "/doctor/opd"),
      sub("sidebar.registration", "/doctor/opd?tab=registration", <FileText className="h-4 w-4" />),
      sub("sidebar.consultation", "/doctor/opd?tab=consultation", <Stethoscope className="h-4 w-4" />),
      sub("sidebar.diagnosis", "/doctor/opd?tab=diagnosis", <FileText className="h-4 w-4" />),
      sub("sidebar.prescription", "/doctor/opd?tab=prescription", <FileText className="h-4 w-4" />),
    ],
  },
  {
    title: "sidebar.medicalRecords",
    module: "medical-records",
    icon: <ClipboardList className="h-5 w-5" />,
    children: [
      sub("sidebar.recordsDashboard", "/doctor/medical-records"),
      sub("sidebar.patientRecords", "/doctor/medical-records?tab=records", <FileText className="h-4 w-4" />),
      sub("sidebar.documents", "/doctor/medical-records?tab=documents", <FileText className="h-4 w-4" />),
      sub("sidebar.consentForms", "/doctor/medical-records?tab=consents", <FileText className="h-4 w-4" />),
    ],
  },
  {
    title: "sidebar.inpatient",
    module: "inpatient",
    icon: <BedDouble className="h-5 w-5" />,
    children: [
      sub("sidebar.ipdDashboard", "/nursing/inpatient"),
      sub("sidebar.bedManagement", "/nursing/inpatient?tab=beds", <BedDouble className="h-4 w-4" />),
      sub("sidebar.admissions", "/nursing/inpatient?tab=admission", <FileText className="h-4 w-4" />),
      sub("sidebar.vitalSigns", "/nursing/inpatient?tab=vitals"),
    ],
  },
  {
    title: "sidebar.emergency",
    module: "emergency",
    icon: <Siren className="h-5 w-5" />,
    children: [
      sub("sidebar.erDashboard", "/nursing/emergency"),
      sub("sidebar.activeCases", "/nursing/emergency?tab=cases", <FileText className="h-4 w-4" />),
      sub("sidebar.erBeds", "/nursing/emergency?tab=beds", <BedDouble className="h-4 w-4" />),
      sub("sidebar.ambulances", "/nursing/emergency?tab=ambulances", <Ambulance className="h-4 w-4" />),
    ],
  },
  {
    title: "sidebar.operationTheater",
    module: "operation-theater",
    icon: <Syringe className="h-5 w-5" />,
    children: [
      sub("sidebar.otDashboard", "/nursing/operation-theater"),
      sub("sidebar.surgerySchedule", "/nursing/operation-theater?tab=schedule", <Calendar className="h-4 w-4" />),
      sub("sidebar.theaters", "/nursing/operation-theater?tab=theaters", <BedDouble className="h-4 w-4" />),
    ],
  },
  {
    title: "sidebar.laboratory",
    module: "laboratory",
    icon: <TestTube className="h-5 w-5" />,
    children: [
      sub("sidebar.labDashboard", "/diagnostics/laboratory"),
      sub("sidebar.labOrders", "/diagnostics/laboratory?tab=orders", <FileText className="h-4 w-4" />),
      sub("sidebar.sampleTracking", "/diagnostics/laboratory?tab=samples"),
      sub("sidebar.testResults", "/diagnostics/laboratory?tab=results", <TestTube className="h-4 w-4" />),
    ],
  },
  {
    title: "sidebar.radiology",
    module: "radiology",
    icon: <Scan className="h-5 w-5" />,
    children: [
      sub("sidebar.radiologyDashboard", "/diagnostics/radiology"),
      sub("sidebar.imagingOrders", "/diagnostics/radiology?tab=orders", <FileText className="h-4 w-4" />),
      sub("sidebar.scheduling", "/diagnostics/radiology?tab=scheduling", <Calendar className="h-4 w-4" />),
      sub("sidebar.studies", "/diagnostics/radiology?tab=studies", <Scan className="h-4 w-4" />),
      sub("sidebar.reports", "/diagnostics/radiology?tab=reports", <FileText className="h-4 w-4" />),
    ],
  },
  {
    title: "sidebar.bloodBank",
    module: "blood-bank",
    icon: <Droplet className="h-5 w-5" />,
    children: [
      sub("sidebar.bloodBankDashboard", "/diagnostics/blood-bank"),
      sub("sidebar.donors", "/diagnostics/blood-bank?tab=donors", <Users className="h-4 w-4" />),
      sub("sidebar.bloodInventory", "/diagnostics/blood-bank?tab=inventory", <Droplet className="h-4 w-4" />),
      sub("sidebar.requests", "/diagnostics/blood-bank?tab=requests", <FileText className="h-4 w-4" />),
    ],
  },
  {
    title: "sidebar.cssd",
    module: "cssd",
    icon: <ShieldPlus className="h-5 w-5" />,
    children: [
      sub("sidebar.cssdDashboard", "/support/cssd"),
      sub("sidebar.sterilization", "/support/cssd?tab=cycles"),
      sub("sidebar.packs", "/support/cssd?tab=packs", <Package className="h-4 w-4" />),
      sub("sidebar.requests", "/support/cssd?tab=requests", <FileText className="h-4 w-4" />),
      sub("sidebar.equipment", "/support/cssd?tab=equipment"),
    ],
  },
  {
    title: "sidebar.diet",
    module: "diet",
    icon: <Utensils className="h-5 w-5" />,
    children: [
      sub("sidebar.dietDashboard", "/support/diet"),
      sub("sidebar.dietOrders", "/support/diet?tab=orders", <FileText className="h-4 w-4" />),
      sub("sidebar.mealServices", "/support/diet?tab=services", <Utensils className="h-4 w-4" />),
      sub("sidebar.assessments", "/support/diet?tab=assessments", <FileText className="h-4 w-4" />),
    ],
  },
  {
    title: "sidebar.ambulanceServices",
    module: "ambulance",
    icon: <Ambulance className="h-5 w-5" />,
    children: [
      sub("sidebar.ambulanceDashboard", "/support/ambulance"),
      sub("sidebar.activeTrips", "/support/ambulance?tab=trips"),
      sub("sidebar.fleet", "/support/ambulance?tab=fleet", <Ambulance className="h-4 w-4" />),
      sub("sidebar.requests", "/support/ambulance?tab=requests", <FileText className="h-4 w-4" />),
    ],
  },
  { title: "sidebar.adminConsole", href: "/admin", icon: <Settings className="h-5 w-5" /> },
  {
    title: "sidebar.staffManagement",
    module: "staff",
    icon: <UserCog className="h-5 w-5" />,
    children: [
      sub("sidebar.staffDashboard", "/admin/staff"),
      sub("sidebar.staffRegistration", "/admin/staff?tab=register", <UserCog className="h-4 w-4" />),
      sub("sidebar.leaveManagement", "/admin/staff?tab=leave", <Calendar className="h-4 w-4" />),
    ],
  },
  {
    title: "sidebar.reporting",
    module: "reporting",
    icon: <BarChart3 className="h-5 w-5" />,
    children: [
      sub("sidebar.overview", "/admin/reporting", <BarChart3 className="h-4 w-4" />),
      sub("sidebar.dailyCensus", "/admin/reporting?tab=census"),
      sub("sidebar.clinicalReports", "/admin/reporting?tab=clinical", <FileText className="h-4 w-4" />),
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const tab = useSearchParams().get("tab");
  const currentHref = tab ? `${pathname}?tab=${tab}` : pathname;
  const { t } = useLanguage();
  const state = useSidebarState();
  const isOpen = state?.open ?? false;
  const close = () => state?.setOpen(false);
  const { disabledModules } = useSystemSettings();
  const navItems = NAV_ITEMS.filter((item) => !item.module || !disabledModules.includes(item.module));

  // The group containing the current page starts expanded; after a manual toggle the user's choice wins.
  const openGroups = navItems.filter((item) => item.children?.some((c) => c.href?.split("?")[0] === pathname)).map((i) => i.title);
  const [expandedItems, setExpandedItems] = useState<string[] | null>(null);
  const expanded = expandedItems ?? openGroups;
  const toggleExpand = (title: string) =>
    setExpandedItems((prev) => {
      const current = prev ?? openGroups;
      return current.includes(title) ? current.filter((i) => i !== title) : [...current, title];
    });

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = currentHref === item.href;
    const isExpanded = expanded.includes(item.title);
    const hasChildren = !!item.children?.length;
    const itemClass = cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
      isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
      level > 0 && "pl-8"
    );

    return (
      <div key={`${item.title}-${item.href ?? ""}`}>
        {item.href && !hasChildren ? (
          <Link href={item.href} onClick={close} className={itemClass} aria-current={isActive ? "page" : undefined}>
            {item.icon}
            <span className="flex-1">{t(item.title)}</span>
          </Link>
        ) : (
          <>
            <button type="button" onClick={() => toggleExpand(item.title)} className={itemClass} aria-expanded={isExpanded}>
              {item.icon}
              <span className="flex-1 text-left">{t(item.title)}</span>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {isExpanded && <div className="mt-1 space-y-1">{item.children?.map((child) => renderNavItem(child, level + 1))}</div>}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 top-14 z-30 bg-black/50 lg:hidden" onClick={close} aria-hidden />}

      <aside
        className={cn(
          "fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r bg-background transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">{navItems.map((item) => renderNavItem(item))}</nav>
        <div className="border-t p-4 text-center text-xs text-muted-foreground">
          {t("app.fullName")}
          <br />
          {t("sidebar.version")}
        </div>
      </aside>
    </>
  );
}
