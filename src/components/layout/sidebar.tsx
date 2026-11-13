"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Calendar,
  FileText,
  Activity,
  Heart,
  BedDouble,
  UserCog,
  TestTube,
  Scan,
  Stethoscope,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const tab = useSearchParams().get("tab");
  const currentHref = tab ? `${pathname}?tab=${tab}` : pathname;
  const [isOpen, setIsOpen] = useState(false);
  // Groups start expanded when they contain the current page; set after navItems is defined below.
  const [expandedItems, setExpandedItems] = useState<string[] | null>(null);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      (prev ?? openGroups).includes(title)
        ? (prev ?? openGroups).filter((item) => item !== title)
        : [...(prev ?? openGroups), title]
    );
  };

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: "Patient Management",
      icon: <Users className="h-5 w-5" />,
      children: [
        { title: "Patients", href: "/front-desk/patients", icon: <Users className="h-4 w-4" /> },
        { title: "Book Appointment", href: "/front-desk/scheduling?tab=booking", icon: <Calendar className="h-4 w-4" /> },
      ],
    },
    {
      title: "Inpatient (IPD)",
      icon: <BedDouble className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "IPD Dashboard", href: "/nursing/inpatient", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Bed Management",
          href: "/nursing/inpatient?tab=beds",
          icon: <BedDouble className="h-4 w-4" />,
        },
        {
          title: "Admissions",
          href: "/nursing/inpatient?tab=admission",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Vital Signs",
          href: "/nursing/inpatient?tab=vitals",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "OPD Management",
      icon: <Stethoscope className="h-5 w-5" />,
      children: [
        { title: "OPD Dashboard", href: "/doctor/opd", icon: <Activity className="h-4 w-4" /> },
        { title: "Registration", href: "/doctor/opd?tab=registration", icon: <FileText className="h-4 w-4" /> },
        { title: "Consultation", href: "/doctor/opd?tab=consultation", icon: <Stethoscope className="h-4 w-4" /> },
        { title: "Diagnosis", href: "/doctor/opd?tab=diagnosis", icon: <FileText className="h-4 w-4" /> },
        { title: "Prescription", href: "/doctor/opd?tab=prescription", icon: <FileText className="h-4 w-4" /> },
      ],
    },
    {
      title: "Laboratory",
      icon: <TestTube className="h-5 w-5" />,
      children: [
        { title: "Lab Dashboard", href: "/diagnostics/laboratory", icon: <Activity className="h-4 w-4" /> },
        { title: "Lab Orders", href: "/diagnostics/laboratory?tab=orders", icon: <FileText className="h-4 w-4" /> },
        { title: "Sample Tracking", href: "/diagnostics/laboratory?tab=samples", icon: <Activity className="h-4 w-4" /> },
        { title: "Test Results", href: "/diagnostics/laboratory?tab=results", icon: <TestTube className="h-4 w-4" /> },
      ],
    },
    {
      title: "Radiology",
      icon: <Scan className="h-5 w-5" />,
      children: [
        { title: "Radiology Dashboard", href: "/diagnostics/radiology", icon: <Activity className="h-4 w-4" /> },
        { title: "Imaging Orders", href: "/diagnostics/radiology?tab=orders", icon: <FileText className="h-4 w-4" /> },
        { title: "Scheduling", href: "/diagnostics/radiology?tab=scheduling", icon: <Calendar className="h-4 w-4" /> },
        { title: "Studies", href: "/diagnostics/radiology?tab=studies", icon: <Scan className="h-4 w-4" /> },
        { title: "Reports", href: "/diagnostics/radiology?tab=reports", icon: <FileText className="h-4 w-4" /> },
      ],
    },
    {
      title: "Scheduling",
      icon: <Calendar className="h-5 w-5" />,
      children: [
        { title: "Overview", href: "/front-desk/scheduling", icon: <Calendar className="h-4 w-4" /> },
        { title: "Department Rosters", href: "/front-desk/scheduling?tab=departments", icon: <Users className="h-4 w-4" /> },
        { title: "Reminders", href: "/front-desk/scheduling?tab=reminders", icon: <Activity className="h-4 w-4" /> },
        { title: "Telemedicine", href: "/front-desk/scheduling?tab=telemedicine", icon: <Activity className="h-4 w-4" /> },
      ],
    },
    {
      title: "Staff Management",
      icon: <UserCog className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Staff Dashboard", href: "/admin/staff", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Staff Registration",
          href: "/admin/staff?tab=register",
          icon: <UserCog className="h-4 w-4" />,
        },
        {
          title: "Leave Management",
          href: "/admin/staff?tab=leave",
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Operation Theater",
      icon: <Activity className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "OT Dashboard", href: "/nursing/operation-theater", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Surgery Schedule",
          href: "/nursing/operation-theater?tab=schedule",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: "Theaters",
          href: "/nursing/operation-theater?tab=theaters",
          icon: <BedDouble className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Inventory",
      icon: <FileText className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Inventory Dashboard", href: "/support/inventory", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Stock Items",
          href: "/support/inventory?tab=items",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Purchase Orders",
          href: "/support/inventory?tab=orders",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Emergency Room",
      icon: <Heart className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "ER Dashboard", href: "/nursing/emergency", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Active Cases",
          href: "/nursing/emergency?tab=cases",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "ER Beds",
          href: "/nursing/emergency?tab=beds",
          icon: <BedDouble className="h-4 w-4" />,
        },
        {
          title: "Ambulances",
          href: "/nursing/emergency?tab=ambulances",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Queue Management",
      icon: <Users className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Queue Dashboard", href: "/front-desk/queue", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Active Queue",
          href: "/front-desk/queue?tab=queue",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Counters",
          href: "/front-desk/queue?tab=counters",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Medical Records",
      icon: <FileText className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Records Dashboard", href: "/doctor/medical-records", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Patient Records",
          href: "/doctor/medical-records?tab=records",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Documents",
          href: "/doctor/medical-records?tab=documents",
          icon: <FileText className="h-4 w-4" />,
        },
        { title: "Consent Forms", href: "/doctor/medical-records?tab=consents", icon: <FileText className="h-4 w-4" /> },
      ],
    },
    {
      title: "Blood Bank",
      icon: <Heart className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Blood Bank Dashboard", href: "/diagnostics/blood-bank", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Donors",
          href: "/diagnostics/blood-bank?tab=donors",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Inventory",
          href: "/diagnostics/blood-bank?tab=inventory",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Requests",
          href: "/diagnostics/blood-bank?tab=requests",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Ambulance Services",
      icon: <Activity className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Ambulance Dashboard", href: "/support/ambulance", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Active Trips",
          href: "/support/ambulance?tab=trips",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Fleet",
          href: "/support/ambulance?tab=fleet",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Requests",
          href: "/support/ambulance?tab=requests",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Diet Management",
      icon: <Heart className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Diet Dashboard", href: "/support/diet", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Diet Orders",
          href: "/support/diet?tab=orders",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Meal Services",
          href: "/support/diet?tab=services",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Assessments",
          href: "/support/diet?tab=assessments",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "CSSD Management",
      icon: <Activity className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "CSSD Dashboard", href: "/support/cssd", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Sterilization",
          href: "/support/cssd?tab=cycles",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Packs",
          href: "/support/cssd?tab=packs",
          icon: <FileText className="h-4 w-4" />,
        },
        { title: "Requests", href: "/support/cssd?tab=requests", icon: <FileText className="h-4 w-4" /> },
        {
          title: "Equipment",
          href: "/support/cssd?tab=equipment",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Reporting & Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { title: "Overview", href: "/admin/reporting", icon: <Activity className="h-4 w-4" /> },
        { title: "Daily Census", href: "/admin/reporting?tab=census", icon: <Activity className="h-4 w-4" /> },
        { title: "Clinical Reports", href: "/admin/reporting?tab=clinical", icon: <FileText className="h-4 w-4" /> },
        { title: "Billing Summary", href: "/admin/reporting?tab=billing", icon: <FileText className="h-4 w-4" /> },
        { title: "Inventory Reports", href: "/admin/reporting?tab=inventory", icon: <FileText className="h-4 w-4" /> },
      ],
    },
  ];

  const openGroups = navItems
    .filter((item) => item.children?.some((child) => child.href?.split("?")[0] === pathname))
    .map((item) => item.title);
  const expanded = expandedItems ?? openGroups;

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isActive = currentHref === item.href;
    const isExpanded = expanded.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title}>
        {item.href && !hasChildren ? (
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
              level > 0 && "pl-8"
            )}
          >
            {item.icon}
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <span className="ml-auto text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ) : (
          <>
            <button
              onClick={() => hasChildren && toggleExpand(item.title)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent w-full",
                isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground",
                level > 0 && "pl-8"
              )}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren &&
                (isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ))}
            </button>
            {hasChildren && isExpanded && (
              <div className="mt-1 space-y-1">
                {item.children?.map((child) => renderNavItem(child, level + 1))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col gap-2">
          {/* Header */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Heart className="h-6 w-6 text-red-500" />
              <span>HMS</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <nav className="space-y-1">{navItems.map((item) => renderNavItem(item))}</nav>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground text-center">
              Hospital Management System
              <br />
              v1.0.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main content offset */}
      <div className="lg:pl-64">{/* Content goes here */}</div>
    </>
  );
}
