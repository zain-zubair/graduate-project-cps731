'use client'
import supabase from '@/lib/client';
import { useState } from 'react';

export default function NotificationButton({ recipientId }){
    const [loading, setLoading] = useState(false);
    
    const handleSendNotification = async () => {
        try {
          setLoading(true);
    
          // Get recipient's email
          const { data: recipient, error: recipientError } = await supabase
            .from('users')
            .select('email')
            .eq('id', recipientId)
            .single();
    
          if (recipientError || !recipient) {
            throw new Error('Could not find recipient');
          }
    
          // Send email via Gmail
          const response = await fetch('/api/notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: recipient.email,
              subject: 'New Notification',
              message: 'You have a new notification!'
            }),
          });
    
          if (!response.ok) {
            throw new Error('Failed to send notification');
          }
    
          alert('Notification sent successfully!');
        } catch (error) {
          console.error('Error:', error);
          alert('Failed to send notification');
        } finally {
          setLoading(false);
        }
      };
    
      return (
        <button
          onClick={handleSendNotification}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
      );
}