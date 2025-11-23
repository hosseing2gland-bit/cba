import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeam, inviteMember, updateRole } from '../store/slices/teamsSlice';

const TeamManager = () => {
  const dispatch = useDispatch();
  const { members, status, error } = useSelector((state) => state.teams);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    dispatch(fetchTeam());
  }, [dispatch]);

  const submitInvite = (event) => {
    event.preventDefault();
    dispatch(inviteMember(inviteEmail)).then(() => setInviteEmail(''));
  };

  return (
    <div className="card">
      <div className="row">
        <h2>تیم شما</h2>
        <button onClick={() => dispatch(fetchTeam())} disabled={status === 'loading'}>
          بروزرسانی
        </button>
      </div>
      {error && <p>{error}</p>}
      <form onSubmit={submitInvite} className="form-row">
        <input
          type="email"
          placeholder="invitee@example.com"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={status === 'loading'}>
          ارسال دعوت‌نامه
        </button>
      </form>
      <div className="list">
        {members.map((member) => (
          <div key={member.id || member.email} className="row">
            <div>
              <strong>{member.email}</strong>
              <p className="badge">نقش: {member.role}</p>
            </div>
            <select
              value={member.role}
              onChange={(event) =>
                dispatch(updateRole({ memberId: member.id, role: event.target.value }))
              }
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        ))}
        {members.length === 0 && <p>عضوی ثبت نشده است.</p>}
      </div>
    </div>
  );
};

export default TeamManager;
