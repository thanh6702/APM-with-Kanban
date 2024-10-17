import React, {useState, useEffect, useContext} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    Button
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import qs from 'qs';
import SprintInfo from './SprintInfo';
import SprintStories from './SprintStories';
import SprintDialog from './SprintDialog';
import {ProfileContext} from "../../../context/ProfileContext";

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const SprintDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const [sprint, setSprint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userStories, setUserStories] = useState([]);
    const [availableStories, setAvailableStories] = useState([]);
    const [page, setPage] = useState(1);
    const [tabValue, setTabValue] = useState(0);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const {profile} = useContext(ProfileContext);
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        setIsEditMode(queryParams.get('edit') === 'true');
    }, [location.search]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const reloadUserStories = async () => {
        await fetchSprintDetail();
        await fetchAvailableStories();
    };
    const fetchSprintDetail = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:8080/sprint/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setSprint(response.data.data);
            setUserStories(response.data.data.userStories);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sprint detail:', error);
            setLoading(false);
        }
    };

    const fetchAvailableStories = async () => {
        try {
            const token = Cookies.get('token');
            const statusList = ['New', 'On_Going', 'Pending'];
            const response = await axios.get('http://localhost:8080/user-story', {
                params: {
                    pageIndex: page,
                    pageSize: 5,
                    status: statusList,
                    sprintId: id
                },
                paramsSerializer: params => {
                    return qs.stringify(params, { arrayFormat: 'repeat' });
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setAvailableStories(response.data.data);
        } catch (error) {
            console.error('Error fetching available stories:', error);
        }
    };

    useEffect(() => {
        fetchSprintDetail();
    }, [id]);

    useEffect(() => {
        fetchAvailableStories();
    }, [page]);

    const handleStatusChange = async (event) => {
        const newStatus = event.target.value;
        try {
            const token = Cookies.get('token');
            await axios.post(`http://localhost:8080/sprint/${id}/update-status`, {
                status: newStatus,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setSprint((prevSprint) => ({
                ...prevSprint,
                status: newStatus,
            }));
            setAlert({ open: true, message: 'Status updated successfully.', severity: 'success' });
        } catch (error) {
            console.error('Error updating sprint status:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update status.';
            setAlert({ open: true, message: errorMessage, severity: 'error' });
        }
    };

    const handleAlertClose = () => {
        setAlert({ ...alert, open: false });
    };

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleDialogSubmit = async (newSprint) => {
        try {
            const token = Cookies.get('token');
            if (sprint) {
                await axios.put(`http://localhost:8080/sprint/${sprint.id}`, newSprint, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } else {
                await axios.post('http://localhost:8080/sprint', newSprint, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
            fetchSprintDetail();
            setDialogOpen(false);
            setAlert({ open: true, message: `Sprint ${sprint ? 'updated' : 'added'} successfully.`, severity: 'success' });
        } catch (error) {
            console.error(`Error ${sprint ? 'updating' : 'adding'} sprint:`, error);
            setAlert({ open: true, message: `Failed to ${sprint ? 'update' : 'add'} sprint.`, severity: 'error' });
        }
    };

    if (loading) {
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
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Sprint: {sprint ? sprint.name : 'No Sprint Found'}
            </Typography>
            {sprint && (
                <>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={sprint.status}
                            onChange={handleStatusChange}
                            label="Status"
                            sx={{
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                },
                            }}
                            disabled={sprint.status === 'Completed'}
                        >
                            {sprint.status === 'New' && <MenuItem value="New">New</MenuItem>}
                            <MenuItem value="On_going">On Going</MenuItem>
                            <MenuItem value="In_Progress">In Progress</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                    </FormControl>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="General Information" />
                        <Tab label="Stories" />
                    </Tabs>
                    <TabPanel value={tabValue} index={0}>
                        <SprintInfo
                            sprint={sprint}
                            onSave={fetchSprintDetail}
                            isEditMode={isEditMode}
                        />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <SprintStories
                            userStories={userStories}
                            availableStories={availableStories}
                            sprintId={id}
                            sprintStatus={sprint.status}
                            onAddStory={reloadUserStories}
                            onRemoveStory={() => {
                                fetchSprintDetail();
                                fetchAvailableStories();
                            }}
                            onLoadMore={() => setPage(page + 1)}
                        />
                    </TabPanel>
                </>
            )}
            {!sprint  &&  (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                    }}
                >
                    <Button variant="contained" color="primary" onClick={handleDialogOpen}>
                        Add New Sprint
                    </Button>
                </Box>
            )}
            <Snackbar
                open={alert.open}
                autoHideDuration={8000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                    '& .MuiAlert-root': {
                        fontSize: '1.2rem',
                    },
                }}
            >
                <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
            <SprintDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                onSubmit={handleDialogSubmit}
                sprint={sprint}
            />
        </Box>
    );
};

export default SprintDetail;
