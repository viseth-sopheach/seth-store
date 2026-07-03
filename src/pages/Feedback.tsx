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
          err instanceof Error ? err.message : "Failed to load feedback.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (feedback.length === 0)
    return <p className="text-sm text-gray-500">No feedback yet.</p>;

  return (
    <div className="w-1/2 overflow-x-auto align-center ">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Username</th>
            <th className="border px-4 py-2 text-left">Email</th>
            <th className="border px-4 py-2 text-left">Subject</th>
            <th className="border px-4 py-2 text-left">Message</th>
            <th className="border px-4 py-2 text-left">Created At</th>
          </tr>
        </thead>

        <tbody>
          {feedback.length > 0 ? (
            feedback.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{item.user?.name ?? "—"}</td>
                <td className="border px-4 py-2">{item.user?.email ?? "—"}</td>
                <td className="border px-4 py-2">{item.subject}</td>
                <td className="border px-4 py-2">{item.message}</td>
                <td className="border px-4 py-2">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                className="border px-4 py-4 text-center text-gray-500"
              >
                No feedback found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Feedback;
