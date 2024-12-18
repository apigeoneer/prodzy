export function timeAgo(date) {
    const now = new Date();
    const diff = (now - date) / 1000; // difference in seconds
    if (diff < 60) {
      return "just now";
    } else if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  }
  