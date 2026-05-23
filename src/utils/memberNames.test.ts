import { describe, expect, it } from 'vitest';
import { annotateMemberNames, createMemberNameMap, getMemberDisplayName } from '@/utils/memberNames';

describe('memberNames', () => {
  it('annotates member-scoped items with the matching display name', () => {
    const memberNameMap = createMemberNameMap([
      { id: 'member-1', name: 'Asha' },
      { id: 'member-2', name: 'Rohan' },
    ]);

    expect(
      annotateMemberNames(
        [
          { id: 'item-1', member_id: 'member-1' },
          { id: 'item-2', member_id: 'member-2' },
        ],
        memberNameMap
      )
    ).toEqual([
      { id: 'item-1', member_id: 'member-1', member_name: 'Asha' },
      { id: 'item-2', member_id: 'member-2', member_name: 'Rohan' },
    ]);
  });

  it('returns the fallback label for missing members and supports empty collections', () => {
    const memberNameMap = createMemberNameMap([{ id: 'member-1', name: 'Asha' }]);

    expect(getMemberDisplayName('missing-member', memberNameMap, 'Patient')).toBe('Patient');
    expect(
      annotateMemberNames([{ id: 'item-1', member_id: 'missing-member' }], memberNameMap, 'Patient')
    ).toEqual([{ id: 'item-1', member_id: 'missing-member', member_name: 'Patient' }]);
    expect(annotateMemberNames([], memberNameMap)).toEqual([]);
  });
});
