import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, Settings, Activity, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Hospital Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive healthcare management platform for efficient patient care, 
            appointment scheduling, and medical record management.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Patient Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Patient Management
              </CardTitle>
              <CardDescription>
                Complete patient registration, records, and identification system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li>• Patient Registration & Demographics</li>
                <li>• Electronic Health Records (EHR)</li>
                <li>• QR Code, Barcode & RFID Identification</li>
                <li>• Insurance Details Management</li>
                <li>• Medical History Tracking</li>
              </ul>
              <Link href="/front-desk/patients">
                <Button className="w-full">
                  Access Patient Management
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Appointment System */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Appointment System
              </CardTitle>
              <CardDescription>
                Efficient scheduling and appointment management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li>• Online Appointment Booking</li>
                <li>• Doctor Schedule Management</li>
                <li>• Appointment Reminders</li>
                <li>• Visit History Tracking</li>
                <li>• Department-wise Scheduling</li>
              </ul>
              <Link href="/front-desk/scheduling">
                <Button className="w-full">
                  Access Scheduling System
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Medical Records */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                Medical Records
              </CardTitle>
              <CardDescription>
                Digital health records and documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li>• Digital Medical Charts</li>
                <li>• Lab Results Integration</li>
                <li>• Prescription Management</li>
                <li>• Diagnostic Reports</li>
                <li>• Treatment History</li>
              </ul>
              <Link href="/doctor/medical-records">
                <Button className="w-full">Access Medical Records</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Hospital Operations */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                Hospital Operations
              </CardTitle>
              <CardDescription>
                Staff, inventory, and facility management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li>• Staff Management</li>
                <li>• Bed Management</li>
                <li>• Inventory Tracking</li>
                <li>• Equipment Management</li>
                <li>• Department Coordination</li>
              </ul>
              <Link href="/nursing/inpatient">
                <Button className="w-full">Access Hospital Operations</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Billing & Finance */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Billing & Finance
              </CardTitle>
              <CardDescription>
                Financial management and billing system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li>• Patient Billing</li>
                <li>• Insurance Processing</li>
                <li>• Payment Tracking</li>
                <li>• Financial Reports</li>
                <li>• Revenue Management</li>
              </ul>
              <Button className="w-full" variant="outline" disabled>
                Handled by the billing system
              </Button>
            </CardContent>
          </Card>

          {/* System Administration */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                Administration
              </CardTitle>
              <CardDescription>
                System settings and user management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm space-y-2">
                <li>• User Access Control</li>
                <li>• System Configuration</li>
                <li>• Data Backup & Security</li>
                <li>• Audit Trails</li>
                <li>• Compliance Management</li>
              </ul>
              <Link href="/admin/staff">
                <Button className="w-full">Access Administration</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Key Features Highlight */}
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Multi-ID Patient Identification</h3>
              <p>Support for QR codes, barcodes, RFID, and manual search for quick patient identification</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Comprehensive EHR System</h3>
              <p>Complete electronic health records with visit history, diagnoses, and treatments</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Integrated Workflow</h3>
              <p>Seamless integration between patient registration, appointments, and medical records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
