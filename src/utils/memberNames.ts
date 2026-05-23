interface MemberIdentity {
  id: string;
  name: string;
}

interface MemberScopedEntity {
  member_id: string;
  member_name?: string;
}

export function createMemberNameMap<T extends MemberIdentity>(members: T[]): Map<string, string> {
  return new Map(members.map((member) => [member.id, member.name]));
}

export function getMemberDisplayName(
  memberId: string,
  memberNameMap: ReadonlyMap<string, string>,
  fallback = 'Unknown patient'
): string {
  return memberNameMap.get(memberId) ?? fallback;
}

export function annotateMemberNames<T extends MemberScopedEntity>(
  items: T[],
  memberNameMap: ReadonlyMap<string, string>,
  fallback?: string
): T[] {
  return items.map((item) => ({
    ...item,
    member_name: getMemberDisplayName(item.member_id, memberNameMap, fallback),
  }));
}
