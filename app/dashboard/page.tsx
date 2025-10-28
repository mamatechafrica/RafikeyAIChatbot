"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeContext";
import {
  BarChart3,
  Clock,
  TrendingUp,
  AlertTriangle,
  User,
} from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface MetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  iconColor: string;
}

interface TableRowProps {
  topic: string;
  tags: string[];
  confidence: number;
  confidenceColor: string;
}

interface AlertItemProps {
  type: "clinic" | "article";
  text: string;
  icon: React.ReactNode;
}

const Dashboard: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("Rafikey");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // State for total conversations
  const [totalConversations, setTotalConversations] = useState<string>("...");

  // State for active users today
  const [activeUsersToday, setActiveUsersToday] = useState<string>("...");
  const [activeUsersTodayLoading, setActiveUsersTodayLoading] =
    useState<boolean>(true);
  const [activeUsersTodayError, setActiveUsersTodayError] = useState<
    string | null
  >(null);

  // State for topics
  const [topics, setTopics] = useState<
    { topic: string; confidence: number; keywords: string[] }[]
  >([]);
  const [topicsLoading, setTopicsLoading] = useState<boolean>(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  // State for sentiment analysis
  const [sentimentData, setSentimentData] = useState<
    { topic: string; confidence: number; keywords: string[] }[]
  >([]);
  const [sentimentLoading, setSentimentLoading] = useState<boolean>(true);
  const [sentimentError, setSentimentError] = useState<string | null>(null);

  useEffect(() => {
    setSentimentLoading(true);
    setSentimentError(null);
    fetch("https://rafikeybot.onrender.com/chatbot/sentiment_analysis")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sentiment analysis");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setSentimentData(data);
        } else {
          setSentimentData([]);
        }
        setSentimentLoading(false);
      })
      .catch((err) => {
        setSentimentError("Failed to load sentiment analysis");
        setSentimentData([]);
        setSentimentLoading(false);
      });
  }, []);

  useEffect(() => {
    // Fetch the count of unique thread IDs
    fetch("https://rafikeybot.onrender.com/chatbot/unique_thread_ids/count")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === "number") {
          setTotalConversations(data.count.toLocaleString());
        } else {
          setTotalConversations("0");
        }
      })
      .catch(() => setTotalConversations("0"));
  }, []);

  useEffect(() => {
    setActiveUsersTodayLoading(true);
    setActiveUsersTodayError(null);
    fetch("https://rafikeybot.onrender.com/chatbot/active_users_today")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch active users today");
        return res.json();
      })
      .then((data) => {
        // The endpoint returns: { "active_users_today": count }
        if (typeof data.active_users_today === "number") {
          setActiveUsersToday(data.active_users_today.toLocaleString());
        } else {
          setActiveUsersToday("0");
        }
        setActiveUsersTodayLoading(false);
      })
      .catch(() => {
        setActiveUsersTodayError("Failed to load");
        setActiveUsersToday("0");
        setActiveUsersTodayLoading(false);
      });
  }, []);

  useEffect(() => {
    setTopicsLoading(true);
    setTopicsError(null);
    fetch("https://rafikeybot.onrender.com/chatbot/topics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch topics");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTopics(data);
        } else {
          setTopics([]);
        }
        setTopicsLoading(false);
      })
      .catch((err) => {
        setTopicsError("Failed to load topics");
        setTopics([]);
        setTopicsLoading(false);
      });
  }, []);

  // toggleTheme is now provided by useTheme

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    trend,
    icon,
    iconColor,
  }) => (
    <div
      className={`backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
        isDarkMode
          ? "bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800/70"
          : "bg-white/80 border border-black/10 hover:bg-white/90 shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconColor}`}>{icon}</div>
      </div>
      <h3
        className={`text-sm font-medium mb-2 ${
          isDarkMode ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {title}
      </h3>
      <div
        className={`text-3xl font-bold mb-2 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </div>
      <div className="flex items-center">
        <TrendingUp
          className={`w-4 h-4 mr-1 ${
            trend === "up" ? "text-green-400" : "text-red-400"
          }`}
        />
        {/* <span className={`text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </span> */}
      </div>
    </div>
  );

  const TableRow: React.FC<TableRowProps> = ({
    topic,
    tags,
    confidence,
    confidenceColor,
  }) => (
    <tr
      className={`border-b transition-colors duration-200 hover:bg-opacity-50 ${
        isDarkMode
          ? "border-gray-700/50 hover:bg-gray-700/20"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <td className="py-4">
        <div>
          <div
            className={`text-sm font-medium mb-2 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {topic}
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-xs rounded-full ${
                  isDarkMode
                    ? "bg-gray-700/50 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </td>
      <td className="py-4 text-right">
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${confidenceColor}`}
        >
          {confidence}%
        </div>
      </td>
    </tr>
  );

  const AlertItem: React.FC<AlertItemProps> = ({ type, text, icon }) => (
    <div
      className={`flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
        isDarkMode
          ? "bg-gray-800/30 hover:bg-gray-800/50"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div
        className={`p-2 rounded-lg ${
          type === "clinic" ? "bg-pink-500/20" : "bg-blue-500/20"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {text}
        </p>
      </div>
      <button
        className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
          isDarkMode
            ? "text-blue-400 hover:bg-blue-400/10"
            : "text-blue-600 hover:bg-blue-50"
        }`}
      >
        View
      </button>
    </div>
  );

  const CircularProgress: React.FC<{
    percentage: number;
    color: string;
    label: string;
  }> = ({ percentage, color, label }) => {
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={isDarkMode ? "rgba(107,114,128,0.3)" : "rgba(0,0,0,0.1)"}
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-lg font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {percentage}%
            </span>
          </div>
        </div>
        <span
          className={`text-sm mt-2 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {label}
        </span>
      </div>
    );
  };

  // Fix: Use static sentiment values as placeholder since sentimentData does not contain sentiment summary
  // TODO: Integrate real sentiment summary data when available from backend
  const sentiment = { positive: 1, neutral: 98, negative: 1 };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
    >
      <Sidebar
        isDarkMode={isDarkMode}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "ml-0 sm:ml-16" : "ml-0 sm:ml-64"
        }`}
      >
        <Header
          isDarkMode={isDarkMode}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleTheme={toggleTheme}
          toggleSidebar={toggleSidebar}
        />

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 md:p-8">
          {/* Overview Section */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Overview
              </h2>
              {/* <select
                className={`w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode
                    ? "bg-gray-700/50 border border-gray-600/50 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select> */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <MetricCard
                title="Total Conversions"
                value={totalConversations}
                trend="up"
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                iconColor="bg-purple-500"
              />
              <MetricCard
                title="Average Response Time"
                value="0.2s"
                trend="up"
                icon={<Clock className="w-6 h-6 text-white" />}
                iconColor="bg-blue-500"
              />
              <MetricCard
                title="Active Users Today"
                value={
                  activeUsersTodayLoading
                    ? "..."
                    : activeUsersTodayError
                    ? activeUsersTodayError
                    : activeUsersToday
                }
                trend="up"
                icon={<User className="w-6 h-6 text-white" />}
                iconColor="bg-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Today's Questions */}
            <div className="lg:col-span-2">
              <div
                className={`backdrop-blur-md rounded-2xl p-4 sm:p-6 ${
                  isDarkMode
                    ? "bg-gray-800/50 border border-gray-700/50"
                    : "bg-white/80 border border-black/10 shadow-lg"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h3
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Top Topics
                  </h3>
                  {/* <div className="flex flex-col gap-2 sm:flex-row sm:space-x-4">
                    <select className={`w-full sm:w-auto px-3 py-1 rounded-lg text-sm transition-all focus:outline-none ${
                      isDarkMode
                        ? 'bg-gray-700/50 border border-gray-600/50 text-white'
                        : 'bg-gray-100 border border-gray-200 text-gray-900'
                    }`}>
                      <option>Topic</option>
                    </select>
                    <select className={`w-full sm:w-auto px-3 py-1 rounded-lg text-sm transition-all focus:outline-none ${
                      isDarkMode
                        ? 'bg-gray-700/50 border border-gray-600/50 text-white'
                        : 'bg-gray-100 border border-gray-200 text-gray-900'
                    }`}>
                      <option>Status</option>
                    </select>
                  </div> */}
                </div>

                {/* Make the topic table container scrollable with fixed height */}
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr
                        className={`border-b ${
                          isDarkMode ? "border-gray-700/50" : "border-gray-200"
                        }`}
                      >
                        <th
                          className={`text-left py-3 text-sm font-medium ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Topic
                        </th>
                        <th
                          className={`text-right py-3 text-sm font-medium ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Confidence
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <>
                        {topicsLoading ? (
                          <tr>
                            <td
                              colSpan={2}
                              className="py-6 text-center text-gray-400"
                            >
                              Loading topics...
                            </td>
                          </tr>
                        ) : topicsError ? (
                          <tr>
                            <td
                              colSpan={2}
                              className="py-6 text-center text-red-400"
                            >
                              {topicsError}
                            </td>
                          </tr>
                        ) : topics.length === 0 ? (
                          <tr>
                            <td
                              colSpan={2}
                              className="py-6 text-center text-gray-400"
                            >
                              No topics found.
                            </td>
                          </tr>
                        ) : (
                          topics.map((t, idx) => {
                            // Determine confidence color
                            let confidenceColor = "";
                            if (t.confidence >= 99) {
                              confidenceColor =
                                "bg-green-500/20 text-green-400";
                            } else if (t.confidence >= 95) {
                              confidenceColor =
                                "bg-yellow-500/20 text-yellow-400";
                            } else {
                              confidenceColor = "bg-red-500/20 text-red-400";
                            }
                            return (
                              <TableRow
                                key={t.topic + idx}
                                topic={t.topic}
                                tags={
                                  t.keywords &&
                                  Array.isArray(t.keywords) &&
                                  t.keywords.length > 0
                                    ? t.keywords
                                    : ["No tags"]
                                }
                                confidence={t.confidence}
                                confidenceColor={confidenceColor}
                              />
                            );
                          })
                        )}
                      </>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* User Sentiment Analysis */}
            <div
              className={`backdrop-blur-md rounded-2xl p-4 sm:p-6 ${
                isDarkMode
                  ? "bg-gray-800/50 border border-gray-700/50"
                  : "bg-white/80 border border-black/10 shadow-lg"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-4 sm:mb-6 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                User Sentiment Analysis
              </h3>

              {/* Prevent chart container from growing */}
              <div
                className="flex justify-center mb-6 sm:mb-8"
                style={{ flexGrow: 0 }}
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={
                        isDarkMode ? "rgba(107,114,128,0.3)" : "rgba(0,0,0,0.1)"
                      }
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={352}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                    />
                  </svg>
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        100%
                      </div>
                      <div
                        className={`text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Confidence
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-400">
                    {`${sentiment.positive}%`}
                  </div>
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Positive
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-400">
                    {`${sentiment.neutral}%`}
                  </div>
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Neutral
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">
                    {`${sentiment.negative}%`}
                  </div>
                  <div
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Negative
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attention Required */}
          <div className="mt-8">
            <div
              className={`backdrop-blur-md rounded-2xl p-4 sm:p-6 ${
                isDarkMode
                  ? "bg-gray-800/50 border border-gray-700/50"
                  : "bg-white/80 border border-black/10 shadow-lg"
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2 mb-4 sm:mb-6">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Most Asked Questions
                </h3>
              </div>
              <QuestionsList isDarkMode={isDarkMode} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

/** QuestionsList component and questions fetch logic **/
import { useState as useStateQ, useEffect as useEffectQ } from "react";
const QUESTIONS_ENDPOINT = "https://rafikeybot.onrender.com/chatbot/questions";

const QuestionsList: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [questions, setQuestions] = useStateQ<
    { question: string; frequency: number }[]
  >([]);
  const [loading, setLoading] = useStateQ(true);
  const [error, setError] = useStateQ<string | null>(null);

  useEffectQ(() => {
    setLoading(true);
    setError(null);
    fetch(QUESTIONS_ENDPOINT)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch questions");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Sort by frequency descending
          setQuestions(data.sort((a, b) => b.frequency - a.frequency));
        } else {
          setQuestions([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load questions");
        setQuestions([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-6 text-center text-gray-400">Loading questions...</div>
    );
  }
  if (error) {
    return <div className="py-6 text-center text-red-400">{error}</div>;
  }
  if (questions.length === 0) {
    return (
      <div className="py-6 text-center text-gray-400">No questions found.</div>
    );
  }
  return (
    <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto pr-2">
      {questions.map((q, idx) => (
        <div
          key={q.question + idx}
          className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
            isDarkMode
              ? "bg-gray-800/30 hover:bg-gray-800/50"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {q.question}
            </p>
            <span
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Frequency: {q.frequency}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
