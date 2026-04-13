import { Link } from "react-router-dom";

export interface MentionedUser {
  userId: number;
  userName: string;
}

export function renderContent(content: string, mentionedUsers: MentionedUser[] = []) {
  const mentionMap = new Map(
    mentionedUsers.map((user) => [user.userName.toLowerCase(), user.userId])
  );
  const parts = content.split(/([#@][A-Za-z0-9_]+)/g);

  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      const tag = part.slice(1).toLowerCase();
      return (
        <Link key={i} to={`/search?tag=${tag}`} className="text-primary font-semibold hover:underline">
          {part}
        </Link>
      );
    }

    if (part.startsWith("@")) {
      const username = part.slice(1).toLowerCase();
      const userId = mentionMap.get(username);
      if (userId) {
        return (
          <Link key={i} to={`/profile/${userId}`} className="text-primary font-semibold hover:underline">
            {part}
          </Link>
        );
      }
    }

    return part;
  });
}
