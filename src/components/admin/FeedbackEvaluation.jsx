import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, MessageSquare, Plus } from 'lucide-react';

export default function FeedbackEvaluation() {
  const recentFeedback = [
    { id: '1', from: 'Dr. Amanda Foster', type: 'Mentor Feedback', rating: 5, date: '2024-12-18', comment: 'Excellent progress on React patterns. Shows great understanding.' },
    { id: '2', from: 'Robert Martinez', type: 'Session Review', rating: 4, date: '2024-12-15', comment: 'Good engagement. Could improve on asking follow-up questions.' },
    { id: '3', from: 'HR Team', type: '90-Day Review', rating: 5, date: '2024-12-10', comment: 'Outstanding performance. Exceeded expectations in all areas.' }
  ];

  const pendingSurveys = [
    { title: 'Mentorship Program Satisfaction', dueDate: '2024-12-25', responses: 0 },
    { title: 'Monthly Progress Check-in', dueDate: '2024-12-30', responses: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Feedback & Evaluation</h1>
          <p className="text-gray-600">View feedback and complete evaluations</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="size-4 mr-2" />
          Create Survey
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Avg. Rating</p>
            <p className="text-3xl text-gray-900">4.7/5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Feedback</p>
            <p className="text-3xl text-gray-900">{recentFeedback.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Surveys</p>
            <p className="text-3xl text-gray-900">{pendingSurveys.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
            <CardDescription>Feedback received from mentors and peers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFeedback.map((feedback) => (
                <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">{feedback.from}</p>
                      <Badge variant="secondary" className="text-xs">{feedback.type}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: feedback.rating }).map((_, i) => (
                        <Star key={i} className="size-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{feedback.comment}</p>
                  <p className="text-xs text-gray-500">{feedback.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Surveys */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Surveys</CardTitle>
            <CardDescription>Surveys and evaluations awaiting your response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingSurveys.map((survey, index) => (
                <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm text-gray-900">{survey.title}</h4>
                    <MessageSquare className="size-4 text-yellow-600" />
                  </div>
                  <p className="text-xs text-gray-600 mb-3">Due: {survey.dueDate}</p>
                  <Button size="sm" className="w-full">Complete Survey</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}