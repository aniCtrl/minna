import { useMemo } from "react";

export function useMembers(room) {
  return useMemo(() => {
    if (!room?.members) {
      return [];
    }

    return Object.entries(room.members).map(([uid, member]) => ({
      uid,
      ...member,
    }));
  }, [room]);
}