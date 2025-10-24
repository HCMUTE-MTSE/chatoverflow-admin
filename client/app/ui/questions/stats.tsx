import {
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ArrowUpIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface QuestionStatsProps {
  totalQuestions: number;
  totalAnswers: number;
  totalViews: number;
  totalUsers: number;
}

export default function QuestionStats({
  totalQuestions,
  totalAnswers,
  totalViews,
  totalUsers,
}: QuestionStatsProps) {
  const stats = [
    {
      title: "Total Questions",
      value: totalQuestions,
      icon: ChatBubbleLeftRightIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Answers",
      value: totalAnswers,
      icon: ArrowUpIcon,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Views",
      value: totalViews,
      icon: EyeIcon,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Active Users",
      value: totalUsers,
      icon: UserGroupIcon,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${stat.bg}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.title}
                  </dt>
                  <dd className={`text-2xl font-semibold ${stat.color}`}>
                    {formatNumber(stat.value)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
