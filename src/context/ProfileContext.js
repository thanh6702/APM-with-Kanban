import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const ProfileContext = createContext();

const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentProject, setCurrentProject] = useState(null); // Thêm trạng thái currentProject

    const fetchProfile = async (token) => {
        try {
            const response = await fetch('http://localhost:8080/user/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.code === 200) {
                setProfile(data.data);
                setIsLoggedIn(true);
            } else {
                console.error('Failed to fetch profile:', data);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setIsLoggedIn(false);
        }
    };

    const checkAndFetchProfile = () => {
        const token = Cookies.get('token');
        if (token) {
            fetchProfile(token);
        }
    };

    useEffect(() => {
        checkAndFetchProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, setProfile, isLoggedIn, setIsLoggedIn,checkAndFetchProfile, currentProject, setCurrentProject }}>
            {children}
        </ProfileContext.Provider>
    );
};

export { ProfileContext, ProfileProvider };
