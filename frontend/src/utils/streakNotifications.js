export const showStreakNotification = (streakData, showToast) => {
  if (!streakData || !showToast) return;
  
  const { count, longest_streak } = streakData;
  
  if (count === 1) {
    // First day of streak
    showToast({
      variant: "success",
      title: "🔥 Streak started!",
      subtitle: "Keep creating study materials to build your streak!",
    });
  } else if (count % 30 === 0) {
    // Monthly milestone (special celebration)
    showToast({
      variant: "success",
      title: `🚀 ${count} day streak!`,
      subtitle: `Incredible! That's ${count / 30} month${count / 30 > 1 ? 's' : ''} of consistent studying!`,
    });
  } else if (count % 7 === 0) {
    // Weekly milestone
    showToast({
      variant: "success",
      title: `🔥 ${count} day streak!`,
      subtitle: `Amazing! That's ${count / 7} week${count / 7 > 1 ? 's' : ''} of consistent studying!`,
    });
  } else if (count === longest_streak && count > 1) {
    // New personal record
    showToast({
      variant: "success",
      title: "🏆 New personal record!",
      subtitle: `${count} days in a row - you're on fire!`,
    });
  } else if (count > 1) {
    // Regular streak day
    showToast({
      variant: "success",
      title: `🔥 Day ${count} streak!`,
      subtitle: "Keep up the great work!",
    });
  }
};

export const getStreakNotificationData = (streakData) => {
  if (!streakData) return null;
  
  const { count, longest_streak } = streakData;
  
  if (count === 1) {
    return {
      title: "🔥 Streak started!",
      subtitle: "Keep creating study materials to build your streak!"
    };
  } else if (count % 30 === 0) {
    return {
      title: `🚀 ${count} day streak!`,
      subtitle: `Incredible! That's ${count / 30} month${count / 30 > 1 ? 's' : ''} of consistent studying!`
    };
  } else if (count % 7 === 0) {
    return {
      title: `🔥 ${count} day streak!`,
      subtitle: `Amazing! That's ${count / 7} week${count / 7 > 1 ? 's' : ''} of consistent studying!`
    };
  } else if (count === longest_streak && count > 1) {
    return {
      title: "🏆 New personal record!",
      subtitle: `${count} days in a row - you're on fire!`
    };
  } else if (count > 1) {
    return {
      title: `🔥 Day ${count} streak!`,
      subtitle: "Keep up the great work!"
    };
  }
  
  return null;
};

export const trackActivityAndNotify = async (showToast, suppressNotification = false) => {
  try {
    // Import here to avoid circular dependencies
    const { trackStudyActivity } = await import('../services/authService');
    
    const streakResult = await trackStudyActivity();
    
    // Show streak notification only if not suppressed and streak was updated
    if (!suppressNotification && streakResult?.streak_updated && streakResult?.streak) {
      showStreakNotification(streakResult.streak, showToast);
    }
    
    return streakResult;
  } catch (error) {
    console.warn('Streak tracking failed:', error);
    return null;
  }
};

export const getStreakDisplayInfo = (streakData) => {
  if (!streakData) {
    return {
      emoji: '💤',
      text: 'No streak',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100'
    };
  }
  
  const { status, count } = streakData;
  
  if (status?.is_active && !status?.is_at_risk) {
    return {
      emoji: '🔥',
      text: `${count} day streak`,
      color: 'text-green-700',
      bgColor: 'bg-green-100'
    };
  } else if (status?.is_at_risk) {
    return {
      emoji: '⚠️',
      text: `${count} day streak (at risk)`,
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100'
    };
  } else {
    return {
      emoji: '💤',
      text: 'Start a streak!',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    };
  }
};

export const getStreakMotivationalMessage = (count) => {
  if (count === 0) return "Start your learning journey today!";
  if (count === 1) return "Great start! Keep it up tomorrow!";
  if (count < 7) return `${count} days strong! You're building momentum!`;
  if (count < 30) return `${count} days! You're forming a solid habit!`;
  if (count < 100) return `${count} days! You're a learning machine!`;
  return `${count} days! You're absolutely incredible!`;
};

export const createCombinedSuccessMessage = (baseTitle, baseSubtitle, streakResult) => {
  let enhancedTitle = baseTitle;
  let enhancedSubtitle = baseSubtitle;
  
  if (streakResult?.streak_updated && streakResult?.streak) {
    const streakNotification = getStreakNotificationData(streakResult.streak);
    if (streakNotification) {
      // Combine streak celebration with success message
      enhancedTitle = `${streakNotification.title} • ${baseTitle}`;
      
      // Optionally enhance subtitle too (uncomment if you want this)
      // enhancedSubtitle = `${baseSubtitle} ${streakNotification.subtitle}`;
    }
  }
  
  return {
    title: enhancedTitle,
    subtitle: enhancedSubtitle
  };
};