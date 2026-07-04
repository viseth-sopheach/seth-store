import { useState, useEffect } from "react";

interface FeedbackUser {
  id: number;
  name: string;
  email: string;
}

interface FeedbackResponse {
  id: number;
  subject: string;
  message: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  user?: FeedbackUser;
}

const BASE_URL = "http://127.0.0.1:8000/api/feedback";

function getHeaders() {
  const token = localStorage.getItem("skybot_token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchFeedbackList(): Promise<FeedbackResponse[]> {
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to load feedback: ${response.statusText}`);
  }

  return response.json();
}

const Feedback = () => {
  const [feedback, setFeedback] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbackList()
      .then(setFeedback)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load feedback."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading feedback…</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-md mx-auto my-4 p-4 rounded-md bg-red-50 border border-red-200">
        <p className="text-sm text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  // Empty State
  if (feedback.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed border-gray-300 rounded-lg max-w-xl mx-auto">
        <p className="text-sm text-gray-500 font-medium">No feedback submissions found yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">User Feedback</h1>
          <p className="mt-1 text-sm text-gray-500">
            A list of all recent feedback submissions sent by users.
          </p>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-hidden border border-gray-200 sm:rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap">
                  User
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap">
                  Email
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Message
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap">
                  Submitted At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedback.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {item.user?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {item.user?.email ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                    {item.subject}
                  </td>
                  {/* Gives the message cell structural safety if it spans multiple lines */}
                  <td className="px-6 py-4 text-sm text-gray-600 min-w-[240px] max-w-md break-words">
                    {item.message}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Feedback;