"use client";

import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, Phone, Mail, MessageSquare, Clock, CheckCircle, User, Calendar, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { LabTestResult, LabReport } from "@/features/diagnostics/laboratory/types";

interface NotificationRule {
  id: string;
  testCode: string;
  condition: 'critical_high' | 'critical_low' | 'abnormal' | 'completed';
  thresholdValue?: number;
  notificationMethods: ('email' | 'sms' | 'phone' | 'pager' | 'portal')[];
  recipients: string[];
  priority: 'immediate' | 'urgent' | 'routine';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Notification {
  id: string;
  type: 'critical_value' | 'result_completed' | 'report_ready' | 'equipment_alert' | 'qc_failure';
  title: string;
  message: string;
  relatedId: string;
  priority: 'immediate' | 'urgent' | 'routine';
  status: 'pending' | 'sent' | 'failed' | 'acknowledged';
  method: 'email' | 'sms' | 'phone' | 'pager' | 'portal' | 'push';
  recipient: string;
  sentAt?: Date;
  acknowledgedAt?: Date;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

interface AutomatedNotificationsProps {
  results: LabTestResult[];
  reports: LabReport[];
  notifications: Notification[];
  rules: NotificationRule[];
  onCreateRule: (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateRule: (ruleId: string, updates: Partial<NotificationRule>) => Promise<void>;
  onDeleteRule: (ruleId: string) => Promise<void>;
  onSendNotification: (notification: Notification) => Promise<void>;
  onAcknowledgeNotification: (notificationId: string) => Promise<void>;
  onRetryNotification: (notificationId: string) => Promise<void>;
}

const NOTIFICATION_TYPES = [
  { value: 'critical_value', label: 'Critical Values', icon: AlertTriangle, color: 'text-red-600' },
  { value: 'result_completed', label: 'Results Completed', icon: CheckCircle, color: 'text-green-600' },
  { value: 'report_ready', label: 'Reports Ready', icon: Send, color: 'text-blue-600' },
  { value: 'equipment_alert', label: 'Equipment Alerts', icon: Bell, color: 'text-orange-600' },
  { value: 'qc_failure', label: 'QC Failures', icon: AlertTriangle, color: 'text-red-600' },
];

const NOTIFICATION_METHODS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'pager', label: 'Pager', icon: Bell },
  { value: 'portal', label: 'Patient Portal', icon: User },
];

const PRIORITY_CONFIG = {
  immediate: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  urgent: { color: 'bg-orange-100 text-orange-800', icon: Clock },
  routine: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
};

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  sent: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  acknowledged: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
};

export function AutomatedNotifications({
  results,
  reports,
  notifications,
  rules,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onSendNotification,
  onAcknowledgeNotification,
  onRetryNotification,
}: AutomatedNotificationsProps) {
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states for rule creation/editing
  const [ruleForm, setRuleForm] = useState({
    testCode: '',
    condition: 'critical_high' as 'critical_high' | 'critical_low' | 'abnormal' | 'completed',
    thresholdValue: '',
    notificationMethods: [] as string[],
    recipients: [''],
    priority: 'urgent' as 'immediate' | 'urgent' | 'routine',
    enabled: true,
  });

  useEffect(() => {
    // Reset form when dialog closes
    if (!ruleDialogOpen && !editingRule) {
      setRuleForm({
        testCode: '',
        condition: 'critical_high',
        thresholdValue: '',
        notificationMethods: [],
        recipients: [''],
        priority: 'urgent',
        enabled: true,
      });
    }
  }, [ruleDialogOpen, editingRule]);

  useEffect(() => {
    // Load rule data when editing
    if (editingRule) {
      setRuleForm({
        testCode: editingRule.testCode,
        condition: editingRule.condition,
        thresholdValue: editingRule.thresholdValue?.toString() || '',
        notificationMethods: editingRule.notificationMethods,
        recipients: editingRule.recipients,
        priority: editingRule.priority,
        enabled: editingRule.enabled,
      });
    }
  }, [editingRule]);

  const handleCreateRule = async () => {
    try {
      const rule = {
        testCode: ruleForm.testCode,
        condition: ruleForm.condition,
        thresholdValue: ruleForm.thresholdValue ? parseFloat(ruleForm.thresholdValue) : undefined,
        notificationMethods: ruleForm.notificationMethods as any[],
        recipients: ruleForm.recipients.filter(r => r.trim()),
        priority: ruleForm.priority,
        enabled: ruleForm.enabled,
      };

      if (editingRule) {
        await onUpdateRule(editingRule.id, rule);
        setEditingRule(null);
      } else {
        await onCreateRule(rule);
      }
      
      setRuleDialogOpen(false);
    } catch (error) {
      console.error("Error saving rule:", error);
    }
  };

  const handleToggleRule = async (rule: NotificationRule) => {
    try {
      await onUpdateRule(rule.id, { enabled: !rule.enabled });
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm("Are you sure you want to delete this notification rule?")) {
      try {
        await onDeleteRule(ruleId);
      } catch (error) {
        console.error("Error deleting rule:", error);
      }
    }
  };

  const handleEditRule = (rule: NotificationRule) => {
    setEditingRule(rule);
    setRuleDialogOpen(true);
  };

  const addRecipient = () => {
    setRuleForm({
      ...ruleForm,
      recipients: [...ruleForm.recipients, ''],
    });
  };

  const removeRecipient = (index: number) => {
    setRuleForm({
      ...ruleForm,
      recipients: ruleForm.recipients.filter((_, i) => i !== index),
    });
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...ruleForm.recipients];
    newRecipients[index] = value;
    setRuleForm({
      ...ruleForm,
      recipients: newRecipients,
    });
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = notificationFilter === "all" || notification.type === notificationFilter;
    const matchesPriority = priorityFilter === "all" || notification.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: string) => PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.color || "bg-gray-100 text-gray-800";
  const getStatusColor = (status: string) => STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || "bg-gray-100 text-gray-800";

  const pendingNotifications = notifications.filter(n => n.status === 'pending' || n.status === 'failed').length;
  const criticalNotifications = notifications.filter(n => n.priority === 'immediate' && n.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Automated Notifications</h1>
        <p className="text-gray-600">Manage notification rules and monitor delivery status</p>
      </div>

      {/* Alert Summary */}
      {(pendingNotifications > 0 || criticalNotifications > 0) && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900">Notification Alerts</h3>
                  <p className="text-orange-700">
                    {pendingNotifications} pending notifications
                    {criticalNotifications > 0 && (
                      <span className="font-semibold"> • {criticalNotifications} critical</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-orange-800">
                  {pendingNotifications} pending
                </Badge>
                {criticalNotifications > 0 && (
                  <Badge variant="destructive">
                    {criticalNotifications} critical
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList>
          <TabsTrigger value="notifications">Active Notifications</TabsTrigger>
          <TabsTrigger value="rules">Notification Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search notifications by title, message, or recipient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={notificationFilter} onValueChange={setNotificationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {NOTIFICATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredNotifications.map((notification) => {
            const typeConfig = NOTIFICATION_TYPES.find(t => t.value === notification.type);
            const TypeIcon = typeConfig?.icon || Bell;

            return (
              <Card key={notification.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TypeIcon className={`h-5 w-5 ${typeConfig?.color}`} />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {notification.title}
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          <Badge className={getStatusColor(notification.status)}>
                            {notification.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          To: {notification.recipient} • Via: {notification.method} • 
                          {notification.sentAt 
                            ? ` Sent: ${new Date(notification.sentAt).toLocaleString()}`
                            : ` Created: ${new Date(notification.createdAt).toLocaleString()}`
                          }
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {notification.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSendNotification(notification)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Now
                        </Button>
                      )}
                      {notification.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRetryNotification(notification.id)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Retry
                        </Button>
                      )}
                      {notification.status === 'sent' && !notification.acknowledgedAt && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAcknowledgeNotification(notification.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-700">{notification.message}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Related ID</p>
                        <p className="text-gray-600">{notification.relatedId}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Attempts</p>
                        <p className="text-gray-600">
                          {notification.attempts} / {notification.maxAttempts}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Type</p>
                        <p className="text-gray-600">{typeConfig?.label || notification.type}</p>
                      </div>
                    </div>

                    {notification.status === 'failed' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="font-medium text-red-900">Delivery Failed</p>
                        <p className="text-red-700">
                          Failed to deliver after {notification.attempts} attempts. 
                          Check recipient information and retry.
                        </p>
                      </div>
                    )}

                    {notification.acknowledgedAt && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="font-medium text-green-900">Acknowledged</p>
                        <p className="text-green-700">
                          Acknowledged on {new Date(notification.acknowledgedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notification Rules</h3>
            <Button onClick={() => setRuleDialogOpen(true)}>
              Create Rule
            </Button>
          </div>

          {rules.map((rule) => (
            <Card key={rule.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {rule.testCode} - {rule.condition.replace('_', ' ')}
                      {!rule.enabled && (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                      <Badge className={getPriorityColor(rule.priority)}>
                        {rule.priority}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {rule.thresholdValue && `Threshold: ${rule.thresholdValue} • `}
                      Methods: {rule.notificationMethods.join(', ')} • 
                      Recipients: {rule.recipients.length}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => handleToggleRule(rule)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRule(rule)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">Recipients</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.recipients.map((recipient, index) => (
                        <Badge key={index} variant="outline">
                          {recipient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">Notification Methods</p>
                    <div className="flex gap-2 mt-1">
                      {rule.notificationMethods.map((method) => {
                        const methodConfig = NOTIFICATION_METHODS.find(m => m.value === method);
                        const MethodIcon = methodConfig?.icon || Bell;
                        return (
                          <div key={method} className="flex items-center gap-1 text-sm text-gray-600">
                            <MethodIcon className="h-4 w-4" />
                            {methodConfig?.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Created: {new Date(rule.createdAt).toLocaleDateString()} • 
                    Updated: {new Date(rule.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                    <p className="text-2xl font-bold">{notifications.length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingNotifications}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {notifications.length > 0 
                        ? Math.round((notifications.filter(n => n.status === 'sent').length / notifications.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Rules</p>
                    <p className="text-2xl font-bold">{rules.filter(r => r.enabled).length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notification Performance by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {NOTIFICATION_TYPES.map((type) => {
                  const typeNotifications = notifications.filter(n => n.type === type.value);
                  const sent = typeNotifications.filter(n => n.status === 'sent').length;
                  const total = typeNotifications.length;
                  const percentage = total > 0 ? (sent / total) * 100 : 0;

                  return (
                    <div key={type.value} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <type.icon className={`h-4 w-4 ${type.color}`} />
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {sent}/{total} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Creation/Edit Dialog */}
      <Dialog open={ruleDialogOpen} onOpenChange={(open) => {
        setRuleDialogOpen(open);
        if (!open) {
          setEditingRule(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit' : 'Create'} Notification Rule</DialogTitle>
            <DialogDescription>
              Set up automated notifications for specific test conditions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testCode">Test Code</Label>
              <Input
                id="testCode"
                value={ruleForm.testCode}
                onChange={(e) => setRuleForm({ ...ruleForm, testCode: e.target.value })}
                placeholder="e.g., GLUCOSE, TROP"
              />
            </div>

            <div className="space-y-2">
              <Label>Condition</Label>
              <Select 
                value={ruleForm.condition} 
                onValueChange={(value: any) => setRuleForm({ ...ruleForm, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical_high">Critical High</SelectItem>
                  <SelectItem value="critical_low">Critical Low</SelectItem>
                  <SelectItem value="abnormal">Abnormal</SelectItem>
                  <SelectItem value="completed">Test Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(ruleForm.condition === 'critical_high' || ruleForm.condition === 'critical_low') && (
              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold Value</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.01"
                  value={ruleForm.thresholdValue}
                  onChange={(e) => setRuleForm({ ...ruleForm, thresholdValue: e.target.value })}
                  placeholder="Threshold value"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={ruleForm.priority} 
                onValueChange={(value: any) => setRuleForm({ ...ruleForm, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notification Methods</Label>
              <div className="space-y-2">
                {NOTIFICATION_METHODS.map((method) => (
                  <div key={method.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={method.value}
                      checked={ruleForm.notificationMethods.includes(method.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRuleForm({
                            ...ruleForm,
                            notificationMethods: [...ruleForm.notificationMethods, method.value],
                          });
                        } else {
                          setRuleForm({
                            ...ruleForm,
                            notificationMethods: ruleForm.notificationMethods.filter(m => m !== method.value),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={method.value} className="flex items-center gap-2">
                      <method.icon className="h-4 w-4" />
                      {method.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recipients</Label>
              <div className="space-y-2">
                {ruleForm.recipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                      placeholder="Email, phone, or username"
                    />
                    {ruleForm.recipients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRecipient(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRecipient}
                >
                  Add Recipient
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={ruleForm.enabled}
                onCheckedChange={(checked) => setRuleForm({ ...ruleForm, enabled: checked })}
              />
              <Label htmlFor="enabled">Enable this rule</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRuleDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRule}>
                {editingRule ? 'Update' : 'Create'} Rule
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}