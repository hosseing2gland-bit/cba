import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProfile, fetchProfiles } from '../store/slices/profilesSlice';

const ProfilesList = ({ onSelect }) => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.profiles);

  return (
    <div className="card">
      <div className="row">
        <h2>پروفایل‌ها</h2>
        <button onClick={() => dispatch(fetchProfiles())} disabled={status === 'loading'}>
          بروزرسانی
        </button>
      </div>
      {error && <p>{error}</p>}
      <div className="list">
        {items.map((profile) => (
          <div key={profile.id || profile.name} className="row">
            <div>
              <strong>{profile.name}</strong>
              <p>{profile.description}</p>
              {profile.userAgent && <span className="badge">UA: {profile.userAgent}</span>}
            </div>
            <div className="inline-actions">
              <button onClick={() => onSelect(profile)}>ویرایش</button>
              <button onClick={() => dispatch(deleteProfile(profile.id))}>حذف</button>
              <button
                onClick={async () => {
                  const payload = await window.api.downloadProfileFile(profile.id);
                  const blob = Uint8Array.from(atob(payload.base64), (c) => c.charCodeAt(0));
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(new Blob([blob], { type: 'application/json' }));
                  link.download = payload.fileName;
                  link.click();
                }}
              >
                دانلود
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p>پروفایلی یافت نشد.</p>}
      </div>
    </div>
  );
};

export default ProfilesList;
