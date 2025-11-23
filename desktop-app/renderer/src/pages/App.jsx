import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthForms from '../components/AuthForms';
import ProfileEditor from '../components/ProfileEditor';
import ProfilesList from '../components/ProfilesList';
import TeamManager from '../components/TeamManager';
import { fetchProfiles } from '../store/slices/profilesSlice';
import { refresh } from '../store/slices/authSlice';

const App = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    if (auth.accessToken) {
      dispatch(fetchProfiles());
    }
  }, [auth.accessToken, dispatch]);

  useEffect(() => {
    if (auth.refreshToken) {
      const id = setInterval(() => dispatch(refresh()), 5 * 60 * 1000);
      return () => clearInterval(id);
    }
    return undefined;
  }, [auth.refreshToken, dispatch]);

  return (
    <div>
      <h1>مدیریت پروفایل مرورگر</h1>
      <div className="container">
        <AuthForms />
        <ProfileEditor selectedProfile={selectedProfile} />
        <ProfilesList onSelect={setSelectedProfile} />
        <TeamManager />
      </div>
    </div>
  );
};

export default App;
