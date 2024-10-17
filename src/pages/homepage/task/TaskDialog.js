import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, Button, Box, CircularProgress, Autocomplete } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';

const TaskDialog = ({ open, onClose, onSubmit, task: initialTask }) => {
    const [task, setTask] = useState({
        name: '',
        description: '',
        userId: '',
        priorityLevel: '',
        estimatedEndDate: '',
        userStoryId: ''
    });
    const [priorityLevels] = useState([
        { name: 'URGENT', priorityLevel: 1 },
        { name: 'HIGH', priorityLevel: 2 },
        { name: 'MEDIUM', priorityLevel: 3 },
        { name: 'LOW', priorityLevel: 4 }
    ]);
    const [releases, setReleases] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [userStories, setUserStories] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedRelease, setSelectedRelease] = useState('');
    const [selectedSprint, setSelectedSprint] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchField, setSearchField] = useState('');

    // Lấy thông tin project từ cookies
    const currentProject = JSON.parse(Cookies.get('currentProject') || '{}');

    useEffect(() => {
        if (open) {
            fetchReleases(currentProject.id);
            fetchUsers();
        }
        if (initialTask) {
            setTask({
                ...initialTask,
                estimatedEndDate: new Date(initialTask.estimatedEndDate).toISOString().split('T')[0],
            });
            if (initialTask.releaseId) {
                setSelectedRelease(initialTask.releaseId);
                fetchSprints(initialTask.releaseId);
            }
            if (initialTask.sprintId) {
                setSelectedSprint(initialTask.sprintId);
                fetchUserStories(initialTask.sprintId);
            }
        }
    }, [open, initialTask]);

    const fetchReleases = async (projectId) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/release', {
                params: { projectId },
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setReleases(response.data.data);
        } catch (error) {
            console.error('Error fetching releases', error);
        }
    };

    const fetchSprints = async (releaseId) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/sprint', {
                params: { releaseId },
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setSprints(response.data.data);
        } catch (error) {
            console.error('Error fetching sprints', error);
        }
    };

    const fetchUserStories = async (sprintId) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/user-story/by-sprint', {
                params: { sprintId },
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setUserStories(response.data.data);
        } catch (error) {
            console.error('Error fetching user stories', error);
        }
    };

    const fetchUsers = async (searchField = '') => {
        setLoadingUsers(true);
        const currentProject = JSON.parse(Cookies.get('currentProject') || '{}');

        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/user/search', {
                params: { searchField, projectId : currentProject.id},
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (searchField) {
            fetchUsers(searchField);
        } else {
            fetchUsers();
        }
    }, [searchField]);

    const handleReleaseChange = (e) => {
        const releaseId = e.target.value;
        setSelectedRelease(releaseId);
        setSelectedSprint('');
        setUserStories([]);
        setTask({ ...task, userStoryId: '' });
        fetchSprints(releaseId);
    };

    const handleSprintChange = (e) => {
        const sprintId = e.target.value;
        setSelectedSprint(sprintId);
        setTask({ ...task, userStoryId: '' });
        fetchUserStories(sprintId);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask({ ...task, [name]: value });
    };

    const handleUserChange = (event, value) => {
        if (value) {
            setTask({ ...task, userId: value.id });
        }
    };

    const handleSubmit = () => {
        const formattedTask = {
            ...task,
            estimatedEndDate: new Date(task.estimatedEndDate).getTime(),
        };
        onSubmit(formattedTask);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{initialTask ? 'Update Task' : 'Add New Task'}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {initialTask ? 'Update the task details.' : 'To add a new task, please fill in the following details.'}
                </DialogContentText>
                <Box component="form" sx={{ mt: 1 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Name"
                        type="text"
                        fullWidth
                        value={task.name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        value={task.description}
                        onChange={handleChange}
                    />
                    {loadingUsers ? (
                        <CircularProgress size={24} />
                    ) : (
                        <Autocomplete
                            options={users}
                            getOptionLabel={(option) => option.name}
                            onChange={handleUserChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="User"
                                    margin="dense"
                                    fullWidth
                                    onChange={(event) => setSearchField(event.target.value)}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    )}
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="priority-level-label">Priority Level</InputLabel>
                        <Select
                            labelId="priority-level-label"
                            name="priorityLevel"
                            value={task.priorityLevel}
                            onChange={handleChange}
                        >
                            {priorityLevels.map((level) => (
                                <MenuItem key={level.priorityLevel} value={level.name}>
                                    {level.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="estimatedEndDate"
                        label="Estimated End Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={task.estimatedEndDate}
                        onChange={handleChange}
                    />
                    <FormControl fullWidth margin="dense" disabled>
                        <InputLabel id="project-id-label">Project</InputLabel>
                        <Select
                            labelId="project-id-label"
                            name="projectId"
                            value={currentProject.id}
                        >
                            <MenuItem value={currentProject.id}>
                                {currentProject.name}
                            </MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense" disabled={releases.length === 0}>
                        <InputLabel id="release-id-label">Release</InputLabel>
                        <Select
                            labelId="release-id-label"
                            name="releaseId"
                            value={selectedRelease}
                            onChange={handleReleaseChange}
                        >
                            {releases.map((release) => (
                                <MenuItem key={release.id} value={release.id}>
                                    {release.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense" disabled={sprints.length === 0}>
                        <InputLabel id="sprint-id-label">Sprint</InputLabel>
                        <Select
                            labelId="sprint-id-label"
                            name="sprintId"
                            value={selectedSprint}
                            onChange={handleSprintChange}
                        >
                            {sprints.map((sprint) => (
                                <MenuItem key={sprint.id} value={sprint.id}>
                                    {sprint.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense" disabled={userStories.length === 0}>
                        <InputLabel id="user-story-id-label">User Story</InputLabel>
                        <Select
                            labelId="user-story-id-label"
                            name="userStoryId"
                            value={task.userStoryId}
                            onChange={handleChange}
                        >
                            {userStories.map((story) => (
                                <MenuItem key={story.id} value={story.id}>
                                    {story.summary}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancel</Button>
                <Button onClick={handleSubmit} color="primary">{initialTask ? 'Update' : 'Add'}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskDialog;
