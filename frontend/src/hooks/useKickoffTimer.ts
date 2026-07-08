export function useKickoffTimer() {
  const getLiveMinutesToKickoff = (kickoffTime: Date): number => {
    const now = new Date();
    const diffMs = kickoffTime.getTime() - now.getTime();
    return Math.floor(diffMs / 60000);
  };

  return { getLiveMinutesToKickoff };
}
