import React, {useState, useEffect, useContext} from 'react';
import {useLocation, useParams} from 'react-router-dom';
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
    Alert
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import qs from 'qs';
import ReleaseInfo from './ReleaseInfo';
import ReleaseStories from './ReleaseStories';
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

const ReleaseDetail = () => {
    const { id } = useParams();
    const [release, setRelease] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userStories, setUserStories] = useState([]);
    const [availableStories, setAvailableStories] = useState([]);
    const [page, setPage] = useState(1);
    const [tabValue, setTabValue] = useState(0);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const location = useLocation();
    const [isEditMode, setIsEditMode] = useState(false);
    const { profile } = useContext(ProfileContext);
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        setIsEditMode(queryParams.get('edit') === 'true');
    },[location.search]);
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const fetchReleaseDetail = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:8080/release/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setRelease(response.data.data);
            setUserStories(response.data.data.userStories);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching release detail:', error);
            setLoading(false);
        }
    };

    const fetchAvailableStories = async () => {
        try {
            const token = Cookies.get('token');
            const currentProject = Cookies.get('currentProject');
            const projectObject = currentProject ? JSON.parse(currentProject) : null;

            const statusList = ['New', 'Pending'];
            const response = await axios.get('http://localhost:8080/user-story', {
                params: {
                    pageIndex: page,
                    pageSize: 5,
                    status: statusList,
                    projectId: projectObject.id,
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
        fetchReleaseDetail();
    }, [id]);

    useEffect(() => {
        fetchAvailableStories();
    }, [page]);

    const handleStatusChange = async (event) => {
        const newStatus = event.target.value;
        try {
            const token = Cookies.get('token');
            await axios.post(`http://localhost:8080/release/${id}/update-status`, {
                status: newStatus,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setRelease((prevRelease) => ({
                ...prevRelease,
                status: newStatus,
            }));
            setAlert({ open: true, message: 'Status updated successfully.', severity: 'success' });
        } catch (error) {
            console.error('Error updating release status:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update status.';
            setAlert({ open: true, message: errorMessage, severity: 'error' });
        }
    };

    const handleAlertClose = () => {
        setAlert({ ...alert, open: false });
    };

    const reloadUserStories = async () => {
        await fetchReleaseDetail();
        await fetchAvailableStories();
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

    if (!release) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Typography variant="h6">Release not found</Typography>
            </Box>
        );
    }

    const isReleaseCompleted = release.status === 'Completed';

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Release: {release.title}
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                    value={release.status}
                    onChange={handleStatusChange}
                    label="Status"
                    sx={{
                        '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                    }}
                    disabled={isReleaseCompleted}
                >
                    {release.status === 'New' && <MenuItem value="New">New</MenuItem>}
                    <MenuItem value="On_Going">On Going</MenuItem>
                    <MenuItem value="In_Progress">In Progress</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                </Select>
            </FormControl>
            <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="General Information" />
                <Tab label="Stories" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
                <ReleaseInfo release={release} onSave={fetchReleaseDetail} isEditMode={isEditMode} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <ReleaseStories
                    userStories={userStories}
                    availableStories={availableStories}
                    releaseId={id}
                    releaseStatus={release.status}
                    onAddStory={reloadUserStories}
                    onRemoveStory={reloadUserStories}
                    onLoadMore={fetchAvailableStories}
                />
            </TabPanel>
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
        </Box>
    );
};

export default ReleaseDetail;
