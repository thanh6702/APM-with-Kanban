import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    CircularProgress,
    TextField,
    ListItem,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    List,
    ListItemText,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import TaskDialog from './TaskDialog';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from "../../../context/ProfileContext";

const priorities = [
    { value: 'URGENT', label: 'Urgent' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
];

const TaskPage = () => {
    const { profile } = useContext(ProfileContext);
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [users, setUsers] = useState([]);
    const [statusColumns, setStatusColumns] = useState([]);
    const [filterUser, setFilterUser] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingStatusColumns, setLoadingStatusColumns] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });

    const filterProject = JSON.parse(Cookies.get('currentProject')).id;

    useEffect(() => {
        fetchUsers();
        fetchStatusColumns();
        fetchTasks();
    }, [filterUser, filterStatus, filterPriority, filterStartDate, filterEndDate, searchTerm]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/user/search', {
                params: { projectId: filterProject },
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setUsers(response.data || []);
            setLoadingUsers(false);
        } catch (error) {
            console.error('Error fetching users', error);
            setLoadingUsers(false);
        }
    };

    const fetchStatusColumns = async () => {
        setLoadingStatusColumns(true);
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:8080/project/${filterProject}/column`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setStatusColumns(response.data.data || []);
            setLoadingStatusColumns(false);
        } catch (error) {
            console.error('Error fetching status columns', error);
            setLoadingStatusColumns(false);
        }
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');

            const startDateEpoch = filterStartDate ? Date.parse(filterStartDate) : null;
            const endDateEpoch = filterEndDate ? Date.parse(filterEndDate) : null;

            const response = await axios.get('http://localhost:8080/task', {
                params: {
                    projectId: filterProject,
                    userId: filterUser || null,
                    statusId: filterStatus || null,
                    priority: filterPriority || null,
                    startDate: startDateEpoch || null,
                    endDate: endDateEpoch || null,
                    searchTerm,
                },
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setTasks(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        }
    };

    const handleUpdateTask = (task) => {
        navigate(`/task/${task.id}`, { state: { isEditing: true } });
    };

    const handleDeleteTask = async (task) => {
        try {
            const token = Cookies.get('token');
            await axios.delete(`http://localhost:8080/task/${task.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setTasks(tasks.filter(t => t.id !== task.id));
            setAlert({ open: true, message: 'Task deleted successfully.', severity: 'success' });
        } catch (error) {
            console.error('Error deleting task:', error);
            setAlert({ open: true, message: 'Failed to delete task.', severity: 'error' });
        }
    };

    const handleTaskClick = (taskId) => {
        navigate(`/task/${taskId}`);
    };

    const handleFilterUserChange = (event) => {
        setFilterUser(event.target.value);
    };

    const handleFilterStatusChange = (event) => {
        setFilterStatus(event.target.value);
    };

    const handleFilterPriorityChange = (event) => {
        setFilterPriority(event.target.value);
    };

    const handleFilterStartDateChange = (event) => {
        setFilterStartDate(event.target.value);
    };

    const handleFilterEndDateChange = (event) => {
        setFilterEndDate(event.target.value);
    };

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDialogOpen = () => {
        setCurrentTask(null);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleDialogSubmit = async (task) => {
        try {
            const token = Cookies.get('token');
            if (currentTask) {
                await axios.put(`http://localhost:8080/task/${currentTask.id}`, task, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
            } else {
                await axios.post('http://localhost:8080/task', task, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
            }
            fetchTasks();
            setDialogOpen(false);
        } catch (error) {
            console.error(`Error ${currentTask ? 'updating' : 'adding'} task:`, error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Task Management
            </Typography>
            <Typography variant="body1" gutterBottom>
                Manage your tasks effectively with the filters and options below.
            </Typography>
            <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4} md={2}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            value={filterStatus}
                            onChange={handleFilterStatusChange}
                            label="Status"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {loadingStatusColumns ? (
                                <MenuItem disabled>Loading...</MenuItem>
                            ) : (
                                statusColumns.map((status) => (
                                    <MenuItem key={status.id} value={status.id}>
                                        {status.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel id="user-filter-label">User</InputLabel>
                        <Select
                            labelId="user-filter-label"
                            value={filterUser}
                            onChange={handleFilterUserChange}
                            label="User"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {loadingUsers ? (
                                <MenuItem disabled>Loading...</MenuItem>
                            ) : (
                                users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={2}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel id="priority-filter-label">Priority</InputLabel>
                        <Select
                            labelId="priority-filter-label"
                            value={filterPriority}
                            onChange={handleFilterPriorityChange}
                            label="Priority"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {priorities.map((priority) => (
                                <MenuItem key={priority.value} value={priority.value}>
                                    {priority.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        variant="outlined"
                        label="Start Date"
                        type="date"
                        fullWidth
                        value={filterStartDate}
                        InputLabelProps={{ shrink: true }}
                        onChange={handleFilterStartDateChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        variant="outlined"
                        label="End Date"
                        type="date"
                        fullWidth
                        value={filterEndDate}
                        InputLabelProps={{ shrink: true }}
                        onChange={handleFilterEndDateChange}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        variant="outlined"
                        label="Search"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                    />
                </Grid>
                <Grid item xs={12} md={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary" onClick={handleDialogOpen}>
                        Add New Task
                    </Button>
                </Grid>
            </Grid>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <List>
                    {tasks && tasks.length > 0 ? (
                        tasks.map((task, index) => {
                            const canEdit = task.userResponse.id === profile.id && statusColumns.find(column => column.name === task.status)?.order === Math.min(...statusColumns.map(col => col.order));
                            const canDelete = canEdit;

                            return (
                                <ListItem
                                    key={task.id}
                                    sx={{
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        mb: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.3s',
                                        '&:hover': { backgroundColor: '#f0f0f0' },
                                    }}
                                    onClick={() => handleTaskClick(task.id)}
                                >
                                    <ListItemText
                                        primary={`Task #${index + 1}: ${task.name}`}
                                        secondary={
                                            <>
                                                <div>Description: {task.description}</div>
                                                <div>Status: {task.status}</div>
                                                <div>Priority: {task.priority}</div>
                                                <div>Estimated End Date: {new Date(task.estimatedEndDate).toLocaleDateString()}</div>
                                            </>
                                        }
                                    />
                                    <Box>
                                        {canEdit && (
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={(e) => { e.stopPropagation(); handleUpdateTask(task); }}
                                            >
                                                Update
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                                                sx={{ ml: 1 }}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </Box>
                                </ListItem>
                            );
                        })
                    ) : (
                        <Typography variant="body1">No tasks available.</Typography>
                    )}
                </List>
            )}
            <TaskDialog
                open={dialogOpen}
                onClose={handleDialogClose}
                onSubmit={handleDialogSubmit}
                task={currentTask}
            />
            <Snackbar open={alert.open} autoHideDuration={6000} onClose={() => setAlert({ ...alert, open: false })}>
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TaskPage;
