import { UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface UserAvatarProps {
  user?: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  } | null;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const iconSizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export default function UserAvatar({
  user,
  size = "md",
  showName = false,
}: UserAvatarProps) {
  const sizeClass = sizeClasses[size];
  const iconSizeClass = iconSizeClasses[size];

  // Generate a consistent color based on user ID or name
  const getAvatarColor = (input: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];

    const hash = input.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  const avatarContent = () => {
    if (user?.avatar) {
      return (
        <Image
          src={user.avatar}
          alt={user.name || "User"}
          width={size === "sm" ? 24 : size === "md" ? 32 : 40}
          height={size === "sm" ? 24 : size === "md" ? 32 : 40}
          className="rounded-full object-cover"
        />
      );
    }

    if (user?.name) {
      const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const colorClass = getAvatarColor(user._id || user.name);

      return (
        <div
          className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center text-white font-medium ${
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
          }`}
        >
          {initials}
        </div>
      );
    }

    return (
      <div
        className={`${sizeClass} bg-gray-300 rounded-full flex items-center justify-center`}
      >
        <UserIcon className={`${iconSizeClass} text-gray-600`} />
      </div>
    );
  };

  if (showName) {
    return (
      <div className="flex items-center space-x-2">
        {avatarContent()}
        <span className="font-medium text-gray-900">
          {user?.name || "Anonymous"}
        </span>
      </div>
    );
  }

  return avatarContent();
}
