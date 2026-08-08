export function getRelativeTimeString(dateIsoString: string): string {
  try {
    const date = new Date(dateIsoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 30) {
      return 'Just now';
    }
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return 'Yesterday';
    }
    if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch (err) {
    return 'Recently';
  }
}

export function formatTimeWindow(fromIso: string, untilIso: string): string {
  try {
    const fromDate = new Date(fromIso);
    const untilDate = new Date(untilIso);

    const isSameDay =
      fromDate.toDateString() === untilDate.toDateString();

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    const fromTimeStr = fromDate.toLocaleTimeString(undefined, timeOptions);
    const untilTimeStr = untilDate.toLocaleTimeString(undefined, timeOptions);

    if (isSameDay) {
      const dayStr = fromDate.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      return `${dayStr}, ${fromTimeStr} - ${untilTimeStr}`;
    } else {
      const fromDayStr = fromDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      const untilDayStr = untilDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      return `${fromDayStr} ${fromTimeStr} to ${untilDayStr} ${untilTimeStr}`;
    }
  } catch (err) {
    return `${fromIso} - ${untilIso}`;
  }
}

export function isExpired(untilIso: string): boolean {
  try {
    return new Date(untilIso).getTime() < new Date().getTime();
  } catch {
    return false;
  }
}
