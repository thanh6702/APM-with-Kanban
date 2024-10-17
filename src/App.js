import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayOut';
import SignInSide from './pages/login/SignInSide';
import {ProfileProvider} from "./context/ProfileContext"; // Import trang đăng nhập

function App() {
    return (
        <Router>
            <ProfileProvider>
                <Routes>
                    <Route path="/" element={<SignInSide/>}/>
                    <Route path="/*" element={<MainLayout/>}/>
                </Routes>
            </ProfileProvider>
        </Router>
    );
}

export default App;
