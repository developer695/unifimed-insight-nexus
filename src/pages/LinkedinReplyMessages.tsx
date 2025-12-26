"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { Loader2, ExternalLink, Mail, MailOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LinkedInMessage {
  id: string;
  lead_id: string;
  lead_name: string | null;
  lead_email: string | null;
  lead_profile_url: string | null;
  campaign_name: string | null;
  conversation_id: string;
  message_body: string;
  is_reply: boolean | null;
  status: string | null;
  timestamp: string;
  created_at: string | null;
}

const LinkedinReplyMessages = () => {
  const [messages, setMessages] = useState<LinkedInMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }

      const { data, error: fetchError } = await supabase
        .from('linkedin_high_tier_messages')
        .select('*')
        .order('timestamp', { ascending: false });

      if (fetchError) throw fetchError;
      setMessages(data || []);

    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMessageStatus = async (messageId: string, currentStatus: string | null) => {
    try {
      setUpdatingId(messageId);
      
      const newStatus = currentStatus === 'read' ? 'unread' : 'read';

      const { error: updateError } = await supabase
        .from('linkedin_high_tier_messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (updateError) throw updateError;

      // Update local state
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, status: newStatus } : msg
        )
      );

    } catch (err) {
      console.error('Error updating message status:', err);
      alert('Failed to update message status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProfileClick = (profileUrl: string | null) => {
    if (!profileUrl) return;
    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = (status: string | null) => {
    const isRead = status === 'read';
    return (
      <Badge 
        variant={isRead ? "default" : "destructive"}
        className={isRead ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
      >
        {isRead ? (
          <>
            <MailOpen className="h-3 w-3 mr-1" />
            Read
          </>
        ) : (
          <>
            <Mail className="h-3 w-3 mr-1" />
            Unread
          </>
        )}
      </Badge>
    );
  };

  const unreadCount = messages.filter(msg => msg.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchMessages}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LinkedIn Reply Messages</h1>
          <p className="text-muted-foreground mt-1">
            Manage high-tier LinkedIn message replies
          </p>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-lg px-4 py-2">
              {unreadCount} Unread
            </Badge>
          )}
          <Button onClick={fetchMessages} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No messages found
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((message) => (
                    <TableRow 
                      key={message.id}
                      className={message.status === 'unread' ? 'bg-red-50 dark:bg-red-950/10' : 'bg-green-50 dark:bg-green-950/10'}
                    >
                      <TableCell>
                        {getStatusBadge(message.status)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {message.lead_name || '-'}
                      </TableCell>
                      <TableCell>{message.lead_email || '-'}</TableCell>
                      <TableCell>
                        {message.campaign_name ? (
                          <Badge variant="outline">{message.campaign_name}</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={message.message_body}>
                          {message.message_body}
                        </div>
                      </TableCell>
                      <TableCell>
                        {message.lead_profile_url ? (
                          <button
                            onClick={() => handleProfileClick(message.lead_profile_url)}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            View Profile
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(message.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleMessageStatus(message.id, message.status)}
                          disabled={updatingId === message.id}
                        >
                          {updatingId === message.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : message.status === 'read' ? (
                            'Mark Unread'
                          ) : (
                            'Mark Read'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkedinReplyMessages;