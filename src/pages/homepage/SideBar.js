import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // New Icon for Back Button
import { ProfileContext } from "../../context/ProfileContext";
import logo from "../../public/images/logo.jpeg";

const drawerWidth = 280;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
    }),
}));

const CustomListItemButton = styled(ListItemButton)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

export default function Sidebar() {
    const theme = useTheme();
    const { profile, setCurrentProject, currentProject,  } = useContext(ProfileContext);
    const navigate = useNavigate();

    const [open, setOpen] = React.useState(false);
    const [nestedOpen, setNestedOpen] = React.useState(false);
    const [staffNestedOpen, setStaffNestedOpen] = React.useState(false);


    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const handleNestedToggle = () => {
        setNestedOpen(!nestedOpen);
    };

    const handleStaffNestedToggle = () => {
        setStaffNestedOpen(!staffNestedOpen);
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleBackToProjectSelection = () => {
        setCurrentProject(null); // Clear current project
        navigate('/project-selection', { replace: true }); // Navigate back to project selection
    };

    return (
        <Drawer variant="permanent" open={open}>
            <DrawerHeader>
                <IconButton onClick={handleDrawerToggle}>
                    {open === false ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </DrawerHeader>
            <Divider />
            <Box display="flex" justifyContent="center" my={2}>
                <img src={logo} alt="Logo" width={open ? 200 : 50} />
            </Box>
            <List>
                <CustomListItemButton onClick={() => handleNavigation(`/project/${currentProject.id}`)}>
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Product Information" />
                </CustomListItemButton>
                <CustomListItemButton onClick={() => handleNavigation('/user-story-management')}>
                    <ListItemIcon>
                        <ListAltIcon />
                    </ListItemIcon>
                    <ListItemText primary="Product Backlog" />
                </CustomListItemButton>
                {/* New Link for Release Management */}
                <CustomListItemButton onClick={() => handleNavigation('/release')}>
                    <ListItemIcon>
                        <PlaylistAddCheckIcon />
                    </ListItemIcon>
                    <ListItemText primary="Release Management" />
                </CustomListItemButton>
                {/* New Link for Sprint Management */}
                <CustomListItemButton onClick={() => handleNavigation('/sprint-management')}>
                    <ListItemIcon>
                        <DirectionsRunIcon />
                    </ListItemIcon>
                    <ListItemText primary="Sprint Management" />
                </CustomListItemButton>
                {/* New Link for Task Management */}
                <CustomListItemButton onClick={() => handleNavigation('/task-management')}>
                    <ListItemIcon>
                        <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Task Management" />
                </CustomListItemButton>
                {/* New Link for Board */}
                <CustomListItemButton onClick={() => handleNavigation('/board')}>
                    <ListItemIcon>
                        <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Kanban Board" />
                </CustomListItemButton>
                {profile.roles[0].code === 'PM' &&
                    <CustomListItemButton onClick={() => handleNavigation('/reports')}>
                        <ListItemIcon>
                            <AssessmentIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Reports"/>
                    </CustomListItemButton>

                }
            </List>
            <Divider />
        </Drawer>
    );
}
