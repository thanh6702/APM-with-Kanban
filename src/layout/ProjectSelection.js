import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Cookies from 'js-cookie';
import axios from 'axios';
import { ProfileContext } from "../context/ProfileContext";
import CreateProjectDialog from "../subscreen/projects/CreateDialog";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from '@mui/icons-material/Delete';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Tạo một theme tùy chỉnh
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#f50057',
        },
        success: {
            main: '#4caf50',
        },
        background: {
            default: '#f4f6f8',
            paper: '#ffffff',
        },
    },
    typography: {
        h4: {
            fontWeight: 600,
            color: '#333',
        },
        h6: {
            fontWeight: 500,
            color: '#555',
        },
    },
});

export default function ProjectSelection() {
    const { setCurrentProject, profile } = useContext(ProfileContext);
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const rolesToApiTabs = {
        EMPLOYEE: 'IS_MINE',
        PM: 'IS_MANAGED',
        ADMIN: 'IS_ADMIN',
    };

    const fetchProjects = async () => {
        const token = Cookies.get('token');

        if (!token) {
            navigate('/');
            return;
        }

        try {
            if (!profile || !profile.roles || profile.roles.length === 0) {
                setError('Invalid role');
                setLoading(false);
                return;
            }

            const userRole = profile.roles[0]?.code;

            if (!userRole || !rolesToApiTabs[userRole]) {
                setError('Invalid role');
                setLoading(false);
                return;
            }

            const tabParam = rolesToApiTabs[userRole];

            const response = await axios.get('http://localhost:8080/project', {
                params: { tab: tabParam },
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.status !== 200) {
                setError('Failed to fetch projects');
                setLoading(false);
                return;
            }

            const data = response.data;
            setProjects(data.data || []);
        } catch (err) {
            setError('An error occurred while fetching projects');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile && profile.roles && profile.roles.length) {
            fetchProjects();
        } else {
            setLoading(false);
            setError('Profile not loaded');
        }
    }, [navigate, profile]);

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
    };

    const handleConfirm = () => {
        if (selectedProject) {
            setCurrentProject(selectedProject);

            // Lưu project vào cookies
            Cookies.set('currentProject', JSON.stringify(selectedProject));
            const userRole = profile.roles[0]?.code;

            if (userRole && rolesToApiTabs[userRole]) {
                navigate(`/project/${selectedProject.id}`);
            } else {
                setError('Invalid role');
            }
        }
    };

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleProjectCreated = () => {
        setDialogOpen(false);
        setSelectedProject(null);
        fetchProjects(); // Cập nhật lại danh sách project sau khi tạo
    };

    const handleDelete = async (project) => {
        const token = Cookies.get('token');

        try {
            await axios.delete(`http://localhost:8080/project/${project.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setProjects((prevProjects) => prevProjects.filter(p => p.id !== project.id));
            setSelectedProject(null);
        } catch (err) {
            console.error('Error deleting project:', err);
            setError('Failed to delete project');
        }
    };

    if (loading) {
        return (
            <ThemeProvider theme={theme}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </ThemeProvider>
        );
    }

    if (error) {
        return (
            <ThemeProvider theme={theme}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
                    <Typography variant="h6" color="error">
                        {error}
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                        Go to Sign In
                    </Button>
                </Box>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, padding: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => navigate('/staff-management')}
                    >
                        Go to Staff Management
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleDialogOpen}
                    >
                        Add Project
                    </Button>
                </Box>
                <Typography variant="h4" gutterBottom>
                    Welcome To Agile Project Management Using Kanban
                </Typography>
                <Typography variant="h6" sx={{ mb: 4 }}>
                    Please select a project to continue
                </Typography>
                <List sx={{ width: '100%', maxWidth: 480, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, mb: 4 }}>
                    {projects.length > 0 ? (
                        projects.map((project) => (
                            <ListItem key={project.id} disablePadding>
                                <ListItemButton
                                    selected={selectedProject?.id === project.id}
                                    onClick={() => handleProjectSelect(project)}
                                    sx={{
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: '#e3f2fd',
                                        },
                                        '&.Mui-selected': {
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: '#1565c0',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemText primary={project.name} />
                                    {project.status === 'NEW' && (
                                        <>
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(project)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </ListItemButton>
                            </ListItem>
                        ))
                    ) : (
                        <Typography>No projects available.</Typography>
                    )}
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleConfirm}
                        sx={{ padding: '8px 24px' }}
                        disabled={!selectedProject}
                    >
                        Confirm
                    </Button>
                </Box>
                <CreateProjectDialog open={dialogOpen} onClose={handleDialogClose} onProjectCreated={handleProjectCreated} />
            </Box>
        </ThemeProvider>
    );
}
