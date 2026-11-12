"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Calendar,
  FileText,
  Activity,
  Heart,
  Settings,
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
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
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
        { title: "Patient List", href: "/patients", icon: <Users className="h-4 w-4" /> },
        {
          title: "Registration",
          href: "/patient-demo",
          icon: <FileText className="h-4 w-4" />,
        },
        { title: "Appointments", href: "/scheduling-demo", icon: <Calendar className="h-4 w-4" /> },
      ],
    },
    {
      title: "Inpatient (IPD)",
      icon: <BedDouble className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "IPD Dashboard", href: "/inpatient", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Bed Management",
          href: "/inpatient?tab=beds",
          icon: <BedDouble className="h-4 w-4" />,
        },
        {
          title: "Admissions",
          href: "/inpatient?tab=admission",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Vital Signs",
          href: "/inpatient?tab=vitals",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "OPD Management",
      icon: <Stethoscope className="h-5 w-5" />,
      children: [
        { title: "OPD Dashboard", href: "/opd", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Registration",
          href: "/opd/registration",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Consultation",
          href: "/opd/consultation",
          icon: <Stethoscope className="h-4 w-4" />,
        },
        { title: "Prescription", href: "/opd/prescription", icon: <FileText className="h-4 w-4" /> },
      ],
    },
    {
      title: "Laboratory",
      icon: <TestTube className="h-5 w-5" />,
      children: [
        { title: "Lab Dashboard", href: "/laboratory", icon: <Activity className="h-4 w-4" /> },
        { title: "Lab Orders", href: "/laboratory/orders", icon: <FileText className="h-4 w-4" /> },
        {
          title: "Test Results",
          href: "/laboratory/results",
          icon: <TestTube className="h-4 w-4" />,
        },
        {
          title: "Sample Tracking",
          href: "/laboratory/samples",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Radiology",
      href: "/radiology",
      icon: <Scan className="h-5 w-5" />,
      children: [
        { title: "Radiology Dashboard", href: "/radiology", icon: <Activity className="h-4 w-4" /> },
        { title: "Imaging Orders", href: "/radiology/orders", icon: <FileText className="h-4 w-4" /> },
        { title: "Reports", href: "/radiology/reports", icon: <FileText className="h-4 w-4" /> },
        { title: "Scheduling", href: "/radiology/schedule", icon: <Calendar className="h-4 w-4" /> },
      ],
    },
    {
      title: "Scheduling",
      href: "/scheduling-demo",
      icon: <Calendar className="h-5 w-5" />,
      children: [
        {
          title: "Appointments",
          href: "/scheduling-demo",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: "Emergency Triage",
          href: "/scheduling/triage",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Telemedicine",
          href: "/scheduling/telemedicine",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Staff Management",
      icon: <UserCog className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Staff Dashboard", href: "/staff", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Staff Registration",
          href: "/staff?tab=register",
          icon: <UserCog className="h-4 w-4" />,
        },
        {
          title: "Leave Management",
          href: "/staff?tab=leave",
          icon: <Calendar className="h-4 w-4" />,
        },
        { title: "Attendance", href: "/staff/attendance", icon: <Activity className="h-4 w-4" /> },
        { title: "Shifts", href: "/staff/shifts", icon: <Calendar className="h-4 w-4" /> },
      ],
    },
    {
      title: "Operation Theater",
      icon: <Activity className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "OT Dashboard", href: "/operation-theater", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Surgery Schedule",
          href: "/operation-theater?tab=schedule",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: "Theaters",
          href: "/operation-theater?tab=theaters",
          icon: <BedDouble className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Inventory",
      icon: <FileText className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Inventory Dashboard", href: "/inventory", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Stock Items",
          href: "/inventory?tab=items",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Purchase Orders",
          href: "/inventory?tab=orders",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Emergency Room",
      icon: <Heart className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "ER Dashboard", href: "/emergency", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Active Cases",
          href: "/emergency?tab=cases",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "ER Beds",
          href: "/emergency?tab=beds",
          icon: <BedDouble className="h-4 w-4" />,
        },
        {
          title: "Ambulances",
          href: "/emergency?tab=ambulances",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Queue Management",
      icon: <Users className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Queue Dashboard", href: "/queue", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Active Queue",
          href: "/queue?tab=queue",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Counters",
          href: "/queue?tab=counters",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Medical Records",
      icon: <FileText className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Records Dashboard", href: "/medical-records", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Patient Records",
          href: "/medical-records?tab=records",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Documents",
          href: "/medical-records?tab=documents",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Blood Bank",
      icon: <Heart className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Blood Bank Dashboard", href: "/blood-bank", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Donors",
          href: "/blood-bank?tab=donors",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Inventory",
          href: "/blood-bank?tab=inventory",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Requests",
          href: "/blood-bank?tab=requests",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Ambulance Services",
      icon: <Activity className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Ambulance Dashboard", href: "/ambulance-services", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Active Trips",
          href: "/ambulance-services?tab=trips",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Fleet",
          href: "/ambulance-services?tab=fleet",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Requests",
          href: "/ambulance-services?tab=requests",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Diet Management",
      icon: <Heart className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "Diet Dashboard", href: "/diet-management", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Diet Orders",
          href: "/diet-management?tab=orders",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Meal Services",
          href: "/diet-management?tab=services",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Assessments",
          href: "/diet-management?tab=assessments",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "CSSD Management",
      icon: <Activity className="h-5 w-5" />,
      badge: "New",
      children: [
        { title: "CSSD Dashboard", href: "/cssd-management", icon: <Activity className="h-4 w-4" /> },
        {
          title: "Sterilization",
          href: "/cssd-management?tab=cycles",
          icon: <Activity className="h-4 w-4" />,
        },
        {
          title: "Packs",
          href: "/cssd-management?tab=packs",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: "Equipment",
          href: "/cssd-management?tab=equipment",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Reporting & Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { title: "Dashboard", href: "/reports", icon: <Activity className="h-4 w-4" /> },
        { title: "Clinical Reports", href: "/reports/clinical", icon: <FileText className="h-4 w-4" /> },
        { title: "Billing Summary", href: "/reports/billing", icon: <FileText className="h-4 w-4" /> },
        { title: "Daily Census", href: "/reports/census", icon: <Activity className="h-4 w-4" /> },
      ],
    },
    {
      title: "Billing & Finance",
      icon: <Heart className="h-5 w-5" />,
      badge: "Soon",
      children: [
        { title: "Patient Billing", href: "#", icon: <FileText className="h-4 w-4" /> },
        { title: "Insurance Claims", href: "#", icon: <FileText className="h-4 w-4" /> },
        { title: "Payments", href: "#", icon: <Activity className="h-4 w-4" /> },
      ],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.title);
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
