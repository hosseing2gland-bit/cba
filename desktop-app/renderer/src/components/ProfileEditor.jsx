import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveProfile } from '../store/slices/profilesSlice';

const emptyProfile = { name: '', description: '', userAgent: '' };

const ProfileEditor = ({ selectedProfile }) => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(emptyProfile);
  const { status } = useSelector((state) => state.profiles);

  useEffect(() => {
    if (selectedProfile) {
      setProfile(selectedProfile);
    } else {
      setProfile(emptyProfile);
    }
  }, [selectedProfile]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(saveProfile(profile));
  };

  return (
    <div className="card">
      <h2>{profile.id ? 'ویرایش پروفایل' : 'ایجاد پروفایل'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          نام پروفایل
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            required
          />
        </label>
        <label>
          توضیحات
          <textarea
            rows="3"
            value={profile.description}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
          />
        </label>
        <label>
          User Agent
          <input
            value={profile.userAgent}
            onChange={(e) => setProfile({ ...profile, userAgent: e.target.value })}
          />
        </label>
        <button type="submit" disabled={status === 'loading'}>
          {profile.id ? 'ذخیره تغییرات' : 'افزودن پروفایل'}
        </button>
      </form>
    </div>
  );
};

export default ProfileEditor;
