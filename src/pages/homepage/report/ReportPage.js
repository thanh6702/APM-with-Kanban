import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Typography, Toolbar, AppBar, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Tab, Tabs } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Add as AddIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ProfileContext } from '../../../context/ProfileContext';
import ProjectSelectionPopup from '../board/ProjectBoard';
import BurnDownChart from "./BurnDownPage"; // Reusing the ProjectSelectionPopup from Board

const ReportsPage = () => {
    const { profile } = useContext(ProfileContext);
    const [open, setOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedProjectName, setSelectedProjectName] = useState('');
    const [projectDetails, setProjectDetails] = useState(null);
    const [projectReport, setProjectReport] = useState(null);
    const [firstLoad, setFirstLoad] = useState(true);
    const [dates, setDates] = useState([]);
    const [userMetrics, setUserMetrics] = useState([]);
    const [burnDownData, setBurnDownData] = useState([]);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const savedProject = Cookies.get('currentProject');
        if (savedProject) {
            const project = JSON.parse(savedProject);
            setSelectedProject(project.id);
            setSelectedProjectName(project.name);
            fetchProjectDetails(project.id);
        } else {
            fetchProjects();
        }
    }, []);

    useEffect(() => {
        if (firstLoad && projects.length > 0 && !selectedProject) {
            setOpen(true);
            setFirstLoad(false);
        }
    }, [projects, firstLoad, selectedProject]);

    const fetchProjects = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/project', {
                params: {
                    tab: 'IS_MANAGED',
                    statuses: ['IN_PROGRESS', 'PENDING', 'FINISHED'].join(',')
                },
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    Authorization: `Bearer ${token}`
                }
            });
            setProjects(response.data.data);
        } catch (error) {
            console.error('Error fetching projects', error);
        }
    };

    const fetchProjectDetails = async (projectId) => {
        try {
            const token = Cookies.get('token');
            const projectResponse = await axios.get(`http://localhost:8080/project/${projectId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            setProjectDetails(projectResponse.data.data);

            const reportResponse = await axios.get(`http://localhost:8080/project/${projectId}/report`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            setProjectReport(reportResponse.data.data);

            // Fetch burn down data
            const burnDownResponse = await axios.get(`http://localhost:8080/project/${projectId}/point`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            setBurnDownData(burnDownResponse.data.data.sprints);
        } catch (error) {
            console.error('Error fetching project details or report', error);
        }
    };

    const fetchProjectReportForAllUser = async (projectId, date) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:8080/project/${projectId}/report-all-user`, {
                params: { date: date.valueOf() },
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.data.userResponses;
        } catch (error) {
            console.error('Error fetching project report for all users', error);
            return [];
        }
    };

    const handleProjectSelect = async (projectId) => {
        const selectedProject = projects.find(project => project.id === projectId);
        setSelectedProject(projectId);
        setSelectedProjectName(selectedProject.name);
        Cookies.set('currentProject', JSON.stringify(selectedProject)); // Save project to cookies
        await fetchProjectDetails(projectId);
        setOpen(false);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddDate = async (newDate) => {
        if (dates.find(date => date.valueOf() === newDate.valueOf())) {
            return; // Date already exists
        }
        const metrics = await fetchProjectReportForAllUser(selectedProject, newDate);
        setDates(prevDates => [...prevDates, newDate].sort((a, b) => a - b));
        setUserMetrics(prevMetrics => {
            const updatedMetrics = prevMetrics.map(metric => {
                const userMetric = metrics.find(m => m.userId === metric.userId);
                if (userMetric) {
                    return { ...metric, [newDate.valueOf()]: userMetric };
                }
                return { ...metric, [newDate.valueOf()]: { cycleTime: 0, leadTime: 0 } };
            });
            metrics.forEach(userMetric => {
                if (!updatedMetrics.find(m => m.userId === userMetric.userId)) {
                    updatedMetrics.push({
                        userId: userMetric.userId,
                        userName: projectDetails.members.find(m => m.user.id === userMetric.userId).user.name,
                        roleName: projectDetails.members.find(m => m.user.id === userMetric.userId).roleName,
                        [newDate.valueOf()]: userMetric
                    });
                }
            });
            return updatedMetrics;
        });
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ p: 3, position: 'relative', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 3, backgroundColor: '#ffffff', borderBottom: '1px solid #ddd' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, color: '#000' }}>
                        {selectedProjectName ? `Reports For Project: ${selectedProjectName}` : 'Reports For Project'}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleClickOpen}>
                        Select Project
                    </Button>
                </Toolbar>
            </AppBar>
            <ProjectSelectionPopup
                open={open}
                onClose={handleClose}
                onConfirm={handleProjectSelect}
                projects={projects}
            />
            {projectDetails && projectReport && (
                <Box>
                    <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                        <Tab label="Metrics" />
                        <Tab label="Burn Down Chart" />
                    </Tabs>
                    {tabValue === 0 && (
                        <Box>
                            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f4f6f8', border: '1px solid #ddd' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Project Metrics
                                </Typography>
                                <Typography variant="body1">Project Cycle Time: {projectReport.cycleTime} hours</Typography>
                                <Typography variant="body1">Project Lead Time: {projectReport.leadTime} hours</Typography>
                            </Paper>
                            <Paper sx={{ p: 3, backgroundColor: '#f4f6f8', border: '1px solid #ddd' }}>
                                <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                    <Grid item>
                                        <Typography variant="h6">Project Members and Metrics</Typography>
                                    </Grid>
                                    <Grid item>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label="Select Date"
                                                onChange={date => handleAddDate(date)}
                                                renderInput={(params) => <Button {...params} variant="outlined" startIcon={<AddIcon />} />}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                </Grid>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><Typography fontWeight="bold">Name</Typography></TableCell>
                                                <TableCell><Typography fontWeight="bold">Role</Typography></TableCell>
                                                {dates.map(date => (
                                                    <TableCell key={date.valueOf()}><Typography fontWeight="bold">{date.format('DD/MM/YYYY')}</Typography></TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {projectDetails.members.map((member) => (
                                                <TableRow key={member.id}>
                                                    <TableCell>{member.user.name}</TableCell>
                                                    <TableCell>{member.roleName}</TableCell>
                                                    {dates.map(date => {
                                                        const userMetric = userMetrics.find(m => m.userId === member.user.id);
                                                        const metrics = userMetric ? userMetric[date.valueOf()] : { cycleTime: 0, leadTime: 0 };
                                                        return (
                                                            <TableCell key={date.valueOf()}>
                                                                <Typography>
                                                                    Cycle: {metrics?.cycleTime ?? 0.0} hours
                                                                    <br />
                                                                    Lead: {metrics?.leadTime ?? 0.0} hours
                                                                </Typography>
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Box>
                    )}
                    {tabValue === 1 && <BurnDownChart data={burnDownData} />}
                </Box>
            )}
        </Box>
    );
};

export default ReportsPage;
