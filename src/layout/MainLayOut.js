import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from "@mui/material/styles";
import Cookies from 'js-cookie';
import { ProfileContext } from "../context/ProfileContext";
import ProfileEditDialog from './ProfileEditDialog';  // Import ProfileEditDialog
import Home from "../pages/homepage/Home";
import About from "../pages/homepage/About";
import Sidebar from "../pages/homepage/SideBar";
import StaffManagement from "../pages/homepage/staff/StaffManagement";
import ProjectManagement from "../pages/homepage/projects/ProjectManagement";
import ProjectDetail from "../pages/homepage/projects/ProjectDetail";
import UserStoryManagement from "../pages/homepage/userstory/UserStoryPage";
import ReleasePage from "../pages/homepage/release/ReleasePage";
import ReleaseDetail from "../pages/homepage/release/ReleaseDetail";
import SprintPage from "../pages/homepage/sprints/SprintPage";
import SprintDetail from "../pages/homepage/sprints/SprintDetail";
import TaskPage from "../pages/homepage/task/TaskPage";
import TaskDetail from "../pages/homepage/task/TaskDetail";
import Board from "../pages/homepage/board/Board";
import ReportsPage from "../pages/homepage/report/ReportPage";
import ProjectSelection from "./ProjectSelection";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'space-between',
}));

const UserProfile = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    '& > *:not(:last-child)': {
        marginRight: theme.spacing(2),
    },
}));

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
}));

function MainLayout() {
    const { profile, isLoggedIn, setIsLoggedIn, loading, currentProject, setCurrentProject } = useContext(ProfileContext);
    const [openProfileEditDialog, setOpenProfileEditDialog] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const savedProject = Cookies.get('currentProject');
        if (!currentProject && savedProject) {
            setCurrentProject(JSON.parse(savedProject));
        } else if (!currentProject && location.pathname !== '/staff-management') {
            navigate('/project-selection', { replace: true });
        }
    }, [currentProject, navigate, setCurrentProject, location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        Cookies.remove('currentProject');
        setIsLoggedIn(false);
        navigate('/');
    };

    const handleBackToProjectSelection = () => {
        setCurrentProject(null); // Clear the current project
        Cookies.remove('currentProject');
        navigate('/project-selection', { replace: true });
    };

    const isProjectSelection = location.pathname === '/project-selection';
    const isStaffManagement = location.pathname === '/staff-management';

    const handleOpenProfileEdit = () => {
        setOpenProfileEditDialog(true);
    };

    const handleCloseProfileEdit = () => {
        setOpenProfileEditDialog(false);
    };

    if (loading || !profile) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {!isProjectSelection && !isStaffManagement && <Sidebar />}
            <MainContent>
                <DrawerHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {(currentProject || isStaffManagement) && (
                            <>
                                {currentProject && (
                                    <Typography variant="h6" component="div" sx={{ marginRight: 2 }}>
                                        Current Project: {currentProject.name}
                                    </Typography>
                                )}
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleBackToProjectSelection}
                                    startIcon={<ArrowBackIcon />}
                                >
                                    Back to Project Selection
                                </Button>
                            </>
                        )}
                    </Box>
                    {profile && (
                        <UserProfile>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body1">
                                    {profile.firstName} {profile.lastName}
                                </Typography>
                                <Typography variant="body2">
                                    {profile.userName}
                                </Typography>
                            </Box>
                            <Avatar onClick={handleOpenProfileEdit} sx={{ cursor: 'pointer' }}>
                                {profile.firstName.charAt(0)}
                            </Avatar>
                            <Button variant="outlined" color="secondary" onClick={handleLogout}>
                                Logout
                            </Button>
                        </UserProfile>
                    )}
                </DrawerHeader>
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/nested-item-1" element={<Typography paragraph>Nested Item 1 Page</Typography>} />
                    <Route path="/nested-item-2" element={<Typography paragraph>Nested Item 2 Page</Typography>} />
                    <Route path="/staff-management" element={<StaffManagement />} />
                    <Route path="/project-management" element={<ProjectManagement />} />
                    <Route path="/project-management?tab=IS_MINE" element={<ProjectManagement />} />
                    <Route path="/project-management?tab=IS_MANAGED" element={<ProjectManagement />} />
                    <Route path="/project-management?tab=IS_ADMIN" element={<ProjectManagement />} />
                    <Route path="/project/:id" element={<ProjectDetail />} />
                    <Route path="/user-story-management" element={<UserStoryManagement />} />
                    <Route path="/release" element={<ReleasePage />} />
                    <Route path="/release/:id" element={<ReleaseDetail />} />
                    <Route path="/sprint-management" element={<SprintPage />} />
                    <Route path="/sprint/:id" element={<SprintDetail />} />
                    <Route path="/task-management" element={<TaskPage />} />
                    <Route path="/task/:id" element={<TaskDetail />} />
                    <Route path="/board" element={<Board />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/project-selection" element={<ProjectSelection />} />
                </Routes>
            </MainContent>
            <ProfileEditDialog open={openProfileEditDialog} onClose={handleCloseProfileEdit} profile={profile} />
        </Box>
    );
}

export default MainLayout;
