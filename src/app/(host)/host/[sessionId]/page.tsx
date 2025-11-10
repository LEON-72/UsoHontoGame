'use client';

import { use } from 'react';
import { HostManagementPage } from '@/components/pages/HostManagementPage';
import { useHostAccess } from '@/hooks/useHostAccess';

/**
 * Host Management Route (Cookie-based authentication)
 * Uses host cookie to verify access instead of query parameter
 */
export default function HostPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const { isHost, isLoading, error } = useHostAccess(sessionId);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Access denied - not host
  if (!isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-4 text-red-600">Access Denied</h1>
          <p className="text-center text-gray-600">
            You do not have permission to access this page.
          </p>
          <p className="text-center text-gray-500 text-sm mt-4">
            Only the session host can access the management page.
          </p>
        </div>
      </div>
    );
  }

  // Host management view - Simple placeholder for MVP
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">Host Management</h1>

          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-center text-green-700 font-medium">
              You are the host of this session
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Session Information</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <span className="font-medium">Session ID:</span>{' '}
                <span className="font-mono text-lg">{sessionId}</span>
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Host Controls</h2>
            <p className="text-gray-600 text-sm">
              Host management features will be available here in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
