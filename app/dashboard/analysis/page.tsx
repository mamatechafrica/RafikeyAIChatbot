"use client";
import React, { useState } from 'react';
import { useTheme } from '@/components/ThemeContext';
import {
  TrendingUp,
  Users,
  Target,
  Clock,
  MessageSquare,
  Star,
  RefreshCw,
  Activity,
  DollarSign,
  Shield,
  Network,
  Smartphone,
  Search,
  Filter
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';


interface MetricData {
  id: number;
  category: string;
  metric: string;
  definition: string;
  baseline: string;
  target: string;
  rationale: string;
  icon: React.ReactNode;
  color: string;
}

const AnalysisPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Individual metric states
  const [uss, setUss] = useState<{ USS: number | null, message?: string } | null>(null);
  const [ussLoading, setUssLoading] = useState(true);
  const [ussError, setUssError] = useState<string | null>(null);

  const [timeSpent, setTimeSpent] = useState<{ average_time_spent_minutes: number | null, sessions_count?: number } | null>(null);
  const [timeSpentLoading, setTimeSpentLoading] = useState(true);
  const [timeSpentError, setTimeSpentError] = useState<string | null>(null);

  const [engagementRate, setEngagementRate] = useState<{ engagement_rate: number | null } | null>(null);
  const [engagementRateLoading, setEngagementRateLoading] = useState(true);
  const [engagementRateError, setEngagementRateError] = useState<string | null>(null);

  const [messageCompletion, setMessageCompletion] = useState<{ message_completion_rate: number | null } | null>(null);
  const [messageCompletionLoading, setMessageCompletionLoading] = useState(true);
  const [messageCompletionError, setMessageCompletionError] = useState<string | null>(null);

  const [retention, setRetention] = useState<{ "7_day_retention": number | null, "30_day_retention": number | null } | null>(null);
  const [retentionLoading, setRetentionLoading] = useState(true);
  const [retentionError, setRetentionError] = useState<string | null>(null);

  const [activeMonthlyUsers, setActiveMonthlyUsers] = useState<{ active_monthly_users: number | null } | null>(null);
  const [activeMonthlyUsersLoading, setActiveMonthlyUsersLoading] = useState(true);
  const [activeMonthlyUsersError, setActiveMonthlyUsersError] = useState<string | null>(null);

  const [referralRate, setReferralRate] = useState<{ referral_rate: number | null, message?: string } | null>(null);
  const [referralRateLoading, setReferralRateLoading] = useState(true);
  const [referralRateError, setReferralRateError] = useState<string | null>(null);

  const [dropOffRate, setDropOffRate] = useState<{ drop_off_rate: number | null } | null>(null);
  const [dropOffRateLoading, setDropOffRateLoading] = useState(true);
  const [dropOffRateError, setDropOffRateError] = useState<string | null>(null);

  const [serviceFinderUsage, setServiceFinderUsage] = useState<{ service_finder_usage_rate: number | null, message?: string } | null>(null);
  const [serviceFinderUsageLoading, setServiceFinderUsageLoading] = useState(true);
  const [serviceFinderUsageError, setServiceFinderUsageError] = useState<string | null>(null);

  const [demographicReach, setDemographicReach] = useState<{
    total_users?: number;
    gender_breakdown?: Record<string, number>;
    age_breakdown?: Record<string, number>;
  } | null>(null);
  const [demographicReachLoading, setDemographicReachLoading] = useState(true);
  const [demographicReachError, setDemographicReachError] = useState<string | null>(null);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  // Fetch USS
  React.useEffect(() => {
    setUssLoading(true);
    fetch("https://rafikeybot.onrender.com/metrics/user_satisfaction_score")
      .then(res => res.json())
      .then(data => setUss(data))
      .catch(() => setUssError("Failed to fetch USS"))
      .finally(() => setUssLoading(false));
  }, []);

  // Fetch Time Spent Per Session
  React.useEffect(() => {
    setTimeSpentLoading(true);
    fetch("https://rafikeybot.onrender.com/metrics/time_spent_per_session")
      .then(res => res.json())
      .then(data => setTimeSpent(data))
      .catch(() => setTimeSpentError("Failed to fetch Time Spent"))
      .finally(() => setTimeSpentLoading(false));
  }, []);

  // Fetch Engagement Rate
  React.useEffect(() => {
    setEngagementRateLoading(true);
    fetch("https://rafikeybot.onrender.com/metrics/engagement_rate")
      .then(res => res.json())
      .then(data => setEngagementRate(data))
      .catch(() => setEngagementRateError("Failed to fetch Engagement Rate"))
      .finally(() => setEngagementRateLoading(false));
  }, []);

  // Fetch Message Completion Rate
  React.useEffect(() => {
    setMessageCompletionLoading(true);
    fetch("https://rafikeybot.onrender.com/metrics/message_completion_rate")
      .then(res => res.json())
      .then(data => setMessageCompletion(data))
      .catch(() => setMessageCompletionError("Failed to fetch Message Completion Rate"))
      .finally(() => setMessageCompletionLoading(false));
  }, []);

  // Fetch User Retention Rate
  React.useEffect(() => {
    setRetentionLoading(true);
    fetch("https://rafikeybot.onrender.com/metrics/user_retention_rate")
      .then(res => res.json())
      .then(data => setRetention(data))
      .catch(() => setRetentionError("Failed to fetch User Retention Rate"))
      .finally(() => setRetentionLoading(false));
  }, []);

  // Fetch Active Monthly Users
  React.useEffect(() => {
    setActiveMonthlyUsersLoading(true);
    fetch("https://rafikeybot.onrender.com/metrics/active_monthly_users")
      .then(res => res.json())
      .then(data => setActiveMonthlyUsers(data))
      .catch(() => setActiveMonthlyUsersError("Failed to fetch Active Monthly Users"))
      .finally(() => setActiveMonthlyUsersLoading(false));
  }, []);

  // Fetch Referral Rate
  React.useEffect(() => {
    setReferralRateLoading(true);
    fetch("https://rafikeybot.onrender.com/metrics/referral_rate")
      .then(res => res.json())
      .then(data => setReferralRate(data))
      .catch(() => setReferralRateError("Failed to fetch Referral Rate"))
      .finally(() => setReferralRateLoading(false));
  }, []);

  // Fetch Drop-off Rate
  React.useEffect(() => {
    setDropOffRateLoading(true);
    fetch("https://rafikeybot.onrender.com/metrics/drop_off_rate")
      .then(res => res.json())
      .then(data => setDropOffRate(data))
      .catch(() => setDropOffRateError("Failed to fetch Drop-off Rate"))
      .finally(() => setDropOffRateLoading(false));
  }, []);

  // Fetch Service Finder Usage Rate
  React.useEffect(() => {
    setServiceFinderUsageLoading(true);
    fetch("https://rafikeybot.onrender.com/metrics/service_finder_usage_rate")
      .then(res => res.json())
      .then(data => setServiceFinderUsage(data))
      .catch(() => setServiceFinderUsageError("Failed to fetch Service Finder Usage Rate"))
      .finally(() => setServiceFinderUsageLoading(false));
  }, []);

  // Fetch Demographic Reach
  React.useEffect(() => {
    setDemographicReachLoading(true);
    fetch("https://rafikeybot.onrender.com/metrics/demographic_reach")
      .then(res => res.json())
      .then(data => setDemographicReach(data))
      .catch(() => setDemographicReachError("Failed to fetch Demographic Reach"))
      .finally(() => setDemographicReachLoading(false));
  }, []);

  // Helper to get backend value for a metric
  const getMetricValue = (metric: MetricData) => {
    switch (metric.metric) {
      case "User Satisfaction Score (USS)":
        if (ussLoading) return "Loading...";
        if (ussError) return ussError;
        if (uss?.USS !== null && uss?.USS !== undefined) {
          return uss.USS;
        }
        if (uss?.message) {
          return uss.message;
        }
        return "N/A";
      case "Time Spent Per Session":
        if (timeSpentLoading) return "Loading...";
        if (timeSpentError) return timeSpentError;
        if (
          timeSpent?.average_time_spent_minutes !== null &&
          timeSpent?.average_time_spent_minutes !== undefined
        ) {
          const min = timeSpent.average_time_spent_minutes;
          const sessions = timeSpent.sessions_count;
          let avgStr = "";
          if (min >= 60) {
            const hours = Math.floor(min / 60);
            const minutes = Math.round(min % 60);
            avgStr = `${hours}h ${minutes}m`;
          } else {
            avgStr = min.toFixed(2) + " min";
          }
          if (sessions !== undefined) {
            return `${avgStr} (${sessions} sessions)`;
          }
          return avgStr;
        }
        return "N/A";
      case "Engagement Rate":
        if (engagementRateLoading) return "Loading...";
        if (engagementRateError) return engagementRateError;
        if (engagementRate?.engagement_rate !== null && engagementRate?.engagement_rate !== undefined) {
          return engagementRate.engagement_rate.toFixed(1) + "%";
        }
        return "N/A";
      case "Message Completion Rate":
        if (messageCompletionLoading) return "Loading...";
        if (messageCompletionError) return messageCompletionError;
        if (
          messageCompletion?.message_completion_rate !== null &&
          messageCompletion?.message_completion_rate !== undefined
        ) {
          return messageCompletion.message_completion_rate.toFixed(1) + "%";
        }
        return "N/A";
      case "User Retention Rate (7-day & 30-day)":
        if (retentionLoading) return "Loading...";
        if (retentionError) return retentionError;
        if (
          retention?.["7_day_retention"] !== null &&
          retention?.["7_day_retention"] !== undefined &&
          retention?.["30_day_retention"] !== null &&
          retention?.["30_day_retention"] !== undefined
        ) {
          return `7d: ${retention["7_day_retention"].toFixed(1)}%, 30d: ${retention["30_day_retention"].toFixed(1)}%`;
        }
        return "N/A";
      case "Active Monthly Users (AMU)":
        if (activeMonthlyUsersLoading) return "Loading...";
        if (activeMonthlyUsersError) return activeMonthlyUsersError;
        if (
          activeMonthlyUsers?.active_monthly_users !== null &&
          activeMonthlyUsers?.active_monthly_users !== undefined
        ) {
          return activeMonthlyUsers.active_monthly_users;
        }
        return "N/A";
      case "Referral Rate":
        if (referralRateLoading) return "Loading...";
        if (referralRateError) return referralRateError;
        if (referralRate?.referral_rate !== null && referralRate?.referral_rate !== undefined) {
          return referralRate.referral_rate.toFixed(1) + "%";
        }
        if (referralRate?.message) {
          return referralRate.message;
        }
        return "N/A";
      case "Drop-off Rate":
        if (dropOffRateLoading) return "Loading...";
        if (dropOffRateError) return dropOffRateError;
        if (
          dropOffRate?.drop_off_rate !== null &&
          dropOffRate?.drop_off_rate !== undefined
        ) {
          return dropOffRate.drop_off_rate.toFixed(1) + "%";
        }
        return "N/A";
      case "Service Finder Usage Rate":
        if (serviceFinderUsageLoading) return "Loading...";
        if (serviceFinderUsageError) return serviceFinderUsageError;
        if (serviceFinderUsage?.service_finder_usage_rate !== null && serviceFinderUsage?.service_finder_usage_rate !== undefined) {
          return serviceFinderUsage.service_finder_usage_rate.toFixed(1) + "%";
        }
        if (serviceFinderUsage?.message) {
          return serviceFinderUsage.message;
        }
        return "N/A";
      case "Demographic Reach":
        if (demographicReachLoading) return "Loading...";
        if (demographicReachError) return demographicReachError;
        if (
          demographicReach?.total_users !== undefined &&
          demographicReach?.total_users !== null
        ) {
          // Show total users and a short summary of gender breakdown
          const total = demographicReach.total_users;
          const genders = demographicReach.gender_breakdown
            ? Object.entries(demographicReach.gender_breakdown)
                .filter(([k]) => k && k !== "null")
                .map(([k, v]) => `${v} ${k}`)
                .join(", ")
            : "";
          return `${total} users${genders ? ", " + genders : ""}`;
        }
        return "N/A";
      // Add similar cases for other metrics as needed
      default:
        return "N/A";
    }
  };

  const metrics: MetricData[] = [
    {
      id: 1,
      category: 'Activation',
      metric: 'User Satisfaction Score (USS)',
      definition: 'The percentage of users who rate the chatbot as "helpful" or "very helpful" in post-interaction surveys.',
      baseline: 'TBD',
      target: '≥ 80%',
      rationale: 'Measures chatbot effectiveness and user experience.',
      icon: <Star className="w-5 h-5" />,
      color: 'bg-yellow-500'
    },
    {
      id: 2,
      category: 'Activation',
      metric: 'Time Spent Per Session',
      definition: 'The average duration (in minutes) from the first user interaction to the last within a session.',
      baseline: 'TBD',
      target: '≥ 3 minutes',
      rationale: 'Reflects the depth of user interaction and content engagement.',
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 3,
      category: 'Activation',
      metric: 'Engagement Rate',
      definition: 'The percentage of users who interact with at least three chatbot responses in a single session.',
      baseline: 'TBD',
      target: '60%+',
      rationale: 'Indicates user interest and sustained engagement.',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 4,
      category: 'Activation',
      metric: 'Message Completion Rate',
      definition: 'The percentage of chatbot conversations that successfully provide a response before the user exits.',
      baseline: 'TBD',
      target: '≥ 85%',
      rationale: 'Shows how many users receive a meaningful chatbot response before disengaging.',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 5,
      category: 'Referral',
      metric: 'Net Promoter Score (NPS)',
      definition: 'Measures user loyalty by asking, "How likely are you to recommend this chatbot to a friend?" on a scale of 1-10.',
      baseline: 'TBD',
      target: '50+',
      rationale: 'Assesses user satisfaction and likelihood to refer others.',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-indigo-500'
    },
    {
      id: 6,
      category: 'Retention',
      metric: 'User Retention Rate (7-day & 30-day)',
      definition: 'The percentage of users who return to use the chatbot within 7 and 30 days of their first interaction.',
      baseline: 'TBD',
      target: '≥ 40% (7-day), ≥ 25% (30-day)',
      rationale: 'Demonstrates the chatbot\'s ability to provide long-term value.',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'bg-pink-500'
    },
    {
      id: 7,
      category: 'Retention',
      metric: 'Active Monthly Users (AMU)',
      definition: 'The number of unique users who interact with the chatbot at least once in a given month.',
      baseline: 'TBD',
      target: '10,000+',
      rationale: 'Tracks chatbot adoption and sustained usage.',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 8,
      category: 'Referral',
      metric: 'Referral Rate',
      definition: 'The percentage of users who invite at least one other person to use the chatbot.',
      baseline: 'TBD',
      target: '≥ 15%',
      rationale: 'Measures organic growth through word-of-mouth recommendations.',
      icon: <Network className="w-5 h-5" />,
      color: 'bg-teal-500'
    },
    {
      id: 9,
      category: 'Retention',
      metric: 'Drop-off Rate',
      definition: 'The percentage of users who abandon chatbot conversations before receiving a meaningful response.',
      baseline: 'TBD',
      target: '≤ 25%',
      rationale: 'Indicates friction in the chatbot experience. Lower is better.',
      icon: <TrendingUp className="w-5 h-5 rotate-180" />,
      color: 'bg-red-500'
    },
    {
      id: 10,
      category: 'Activation',
      metric: 'Service Finder Usage Rate',
      definition: 'The percentage of chatbot users who use the service finder tool to locate clinics or SRHR services.',
      baseline: 'TBD',
      target: '≥ 20%',
      rationale: 'Tracks the chatbot\'s effectiveness in guiding users to healthcare services.',
      icon: <Search className="w-5 h-5" />,
      color: 'bg-cyan-500'
    },
    {
      id: 11,
      category: 'Retention',
      metric: 'Conversion to Services',
      definition: 'The percentage of users who visit a recommended clinic or SRHR service after interacting with the chatbot.',
      baseline: 'TBD',
      target: '≥ 10%',
      rationale: 'Measures the chatbot\'s real-world impact in driving healthcare service usage.',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-emerald-500'
    },
    {
      id: 12,
      category: 'Acquisition',
      metric: 'Demographic Reach',
      definition: 'The percentage of users from different age groups, regions, and socioeconomic backgrounds, especially underserved communities.',
      baseline: 'TBD',
      target: '50%+ rural users',
      rationale: 'Ensures inclusivity and accessibility for marginalized populations.',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-violet-500'
    },
    {
      id: 13,
      category: 'Activation',
      metric: 'AI Response Accuracy',
      definition: 'The percentage of chatbot responses validated as accurate and contextually relevant by SRHR specialists.',
      baseline: 'TBD',
      target: '≥ 90%',
      rationale: 'Tracks the chatbot\'s ability to provide reliable and fact-based information.',
      icon: <Shield className="w-5 h-5" />,
      color: 'bg-lime-500'
    },
    {
      id: 14,
      category: 'Retention',
      metric: 'AI Training Improvement Rate',
      definition: 'The percentage reduction in chatbot errors and misinterpretations over time.',
      baseline: 'TBD',
      target: '30%+ reduction',
      rationale: 'Measures improvements in chatbot intelligence and performance.',
      icon: <Activity className="w-5 h-5" />,
      color: 'bg-amber-500'
    },
    {
      id: 15,
      category: 'Revenue',
      metric: 'Cost per User Interaction',
      definition: 'The total operational costs divided by the number of chatbot interactions.',
      baseline: 'TBD',
      target: '≤ $0.10',
      rationale: 'Ensures cost-efficiency and sustainability.',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-green-600'
    },
    {
      id: 16,
      category: 'Retention',
      metric: 'Technical Uptime & Stability',
      definition: 'The percentage of time the chatbot remains operational and accessible without downtime.',
      baseline: 'TBD',
      target: '≥ 99%',
      rationale: 'Measures reliability and availability.',
      icon: <Shield className="w-5 h-5" />,
      color: 'bg-slate-500'
    },
    {
      id: 17,
      category: 'Acquisition',
      metric: 'Number of Partner Organizations Integrated',
      definition: 'The number of digital SRHR initiatives or organizations linked to the chatbot for referrals and data sharing.',
      baseline: 'TBD',
      target: '5+',
      rationale: 'Expands reach and impact through strategic collaborations.',
      icon: <Network className="w-5 h-5" />,
      color: 'bg-rose-500'
    },
    {
      id: 18,
      category: 'Retention',
      metric: 'Intervention Consolidation Rate',
      definition: 'The percentage reduction in duplication of digital SRHR efforts by leveraging the chatbot as a central information hub.',
      baseline: 'TBD',
      target: '20%+',
      rationale: 'Measures efficiency in streamlining digital SRHR services.',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'bg-fuchsia-500'
    },
    {
      id: 19,
      category: 'Acquisition',
      metric: 'Cross-Platform Reach',
      definition: 'The percentage of users engaging with the chatbot across multiple platforms (e.g., WhatsApp, Messenger, Web).',
      baseline: 'TBD',
      target: '≥ 30%',
      rationale: 'Ensures accessibility and usability across different user-preferred channels.',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'bg-sky-500'
    }
  ];

  const categories = ['All', 'Activation', 'Acquisition', 'Retention', 'Referral', 'Revenue'];

  const filteredMetrics = metrics.filter(metric => {
    const matchesCategory = selectedCategory === 'All' || metric.category === selectedCategory;
    const matchesSearch = metric.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         metric.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'Activation': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Acquisition': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Retention': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Referral': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Revenue': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

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
        <main className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1
              className={`text-3xl font-bold mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              AARRR Framework Analysis
            </h1>
            <p
              className={`text-lg ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Comprehensive metrics for measuring chatbot performance and user engagement
            </p>
          </div>

          {/* Filters and Search */}
          <div
            className={`backdrop-blur-md rounded-2xl p-6 mb-8 ${
              isDarkMode
                ? "bg-gray-800/50 border border-gray-700/50"
                : "bg-white/80 border border-black/10 shadow-lg"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105 ${
                      selectedCategory === category
                        ? "bg-purple-500 text-white"
                        : isDarkMode
                        ? "text-gray-400 hover:text-white hover:bg-gray-700/30"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                    {category === "All" && (
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          isDarkMode ? "bg-gray-600/50" : "bg-black/10"
                        }`}
                      >
                        {metrics.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? "bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400"
                      : "bg-white border border-gray-200 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMetrics.map((metric) => (
              <div
                key={metric.id}
                className={`backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                  isDarkMode
                    ? "bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800/70"
                    : "bg-white/80 border border-black/10 hover:bg-white/90 shadow-lg"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${metric.color}`}>
                    <div className="text-white">{metric.icon}</div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                      metric.category
                    )}`}
                  >
                    {metric.category}
                  </div>
                </div>

                {/* Metric Name */}
                <h3
                  className={`text-lg font-semibold mb-3 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {metric.metric}
                </h3>

                {/* Definition */}
                <p
                  className={`text-sm mb-4 leading-relaxed ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {metric.definition}
                </p>

                {/* Targets and Baseline */}
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded-lg ${
                      isDarkMode ? "bg-gray-700/30" : "bg-gray-50"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium mb-1 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Baseline (3 Months)
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {getMetricValue(metric)}
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-lg ${
                      isDarkMode ? "bg-green-500/10" : "bg-green-50"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium mb-1 ${
                        isDarkMode ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      Target
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        isDarkMode ? "text-green-300" : "text-green-700"
                      }`}
                    >
                      {metric.target}
                    </div>
                  </div>
                </div>

                {/* Rationale */}
                <div className="mt-4 pt-4 border-t border-gray-700/30">
                  <div
                    className={`text-xs font-medium mb-2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Rationale
                  </div>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {metric.rationale}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredMetrics.length === 0 && (
            <div
              className={`text-center py-12 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No metrics found</p>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AnalysisPage;