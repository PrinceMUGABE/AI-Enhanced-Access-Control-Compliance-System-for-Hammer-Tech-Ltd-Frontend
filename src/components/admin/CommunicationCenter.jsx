import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bell, Mail, MessageSquare, Calendar, CheckCircle } from 'lucide-react';

export default function CommunicationCenter() {
  const notifications = [
    { id: '1', type: 'session', title: 'Upcoming session with Dr. Amanda Foster', time: '2 hours from now', read: false, icon: Calendar },
    { id: '2', type: 'message', title: 'New message from Robert Martinez', time: '3 hours ago', read: false, icon: MessageSquare },
    { id: '3', type: 'reminder', title: 'Complete your monthly progress report', time: '5 hours ago', read: false, icon: Bell },
    { id: '4', type: 'announcement', title: 'New knowledge article published', time: '1 day ago', read: true, icon: Mail }
  ];

  const messages = [
    { id: '1', from: 'Dr. Amanda Foster', subject: 'Great job on the presentation!', preview: 'I wanted to commend you on...', time: '2 hours ago', unread: true },
    { id: '2', from: 'HR Team', subject: 'Monthly feedback survey', preview: 'Please take a moment to...', time: '1 day ago', unread: true },
    { id: '3', from: 'Robert Martinez', subject: 'Next session agenda', preview: 'For our upcoming session...', time: '2 days ago', unread: false }
  ];

  const upcomingReminders = [
    { title: 'Mentorship session', date: 'Today at 2:00 PM', type: 'session' },
    { title: 'Complete skill assessment', date: 'Tomorrow', type: 'task' },
    { title: 'Submit feedback form', date: 'Dec 25', type: 'feedback' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900 mb-2">Communication Center</h1>
        <p className="text-gray-600">Manage notifications, messages, and reminders</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Unread Notifications</p>
            <p className="text-3xl text-gray-900">{notifications.filter(n => !n.read).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Unread Messages</p>
            <p className="text-3xl text-gray-900">{messages.filter(m => m.unread).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Active Reminders</p>
            <p className="text-3xl text-gray-900">{upcomingReminders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Response Rate</p>
            <p className="text-3xl text-gray-900">94%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <Button variant="ghost" size="sm">Mark all as read</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-3 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notification.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <notification.icon className={`size-4 ${!notification.read ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Messages</CardTitle>
              <Button size="sm">Compose</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${message.unread ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-1">
                    <p className={`text-sm ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>{message.from}</p>
                    <p className="text-xs text-gray-500">{message.time}</p>
                  </div>
                  <p className={`text-sm mb-1 ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>{message.subject}</p>
                  <p className="text-xs text-gray-600">{message.preview}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
          <CardDescription>Important dates and tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {upcomingReminders.map((reminder, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <Badge variant="secondary" className="mb-3">{reminder.type}</Badge>
                <p className="text-sm text-gray-900 mb-2">{reminder.title}</p>
                <p className="text-xs text-gray-600 mb-3">{reminder.date}</p>
                <Button size="sm" variant="outline" className="w-full">
                  <CheckCircle className="size-4 mr-1" />
                  Mark Done
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}