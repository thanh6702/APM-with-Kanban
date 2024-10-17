import React, {useState, useEffect, useContext} from 'react';
import { Box, Typography, Button, TextField, Grid, MenuItem, Select, FormControl, InputLabel, Paper } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import UserStoryDialog from './UserStoryDialog';
import UserStoryList from './UserStoryList';
import {ProfileContext} from "../../../context/ProfileContext";

const UserStoryManagement = () => {
    const [open, setOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [userStories, setUserStories] = useState([]);
    const [currentUserStory, setCurrentUserStory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityLevel, setPriorityLevel] = useState('');
    const [status, setStatus] = useState('');
    const { profile } = useContext(ProfileContext);

    useEffect(() => {
        fetchUserStories();
    }, [searchTerm, priorityLevel, status]);

    const fetchUserStories = async () => {
        try {
            const token = Cookies.get('token');
            const currentProject = Cookies.get('currentProject');
            const projectObject = JSON.parse(currentProject);

            // Tạo đối tượng params linh hoạt
            let params = {
                pageIndex: 1,
                pageSize: 20,
                projectId: projectObject.id,
            };

            if (searchTerm) {
                params.searchTerm = searchTerm;
            }

            if (priorityLevel) {
                params.priorityLevel = priorityLevel;
            }

            if (status) {
                params.status = status;
            }

            const response = await axios.get('http://localhost:8080/user-story', {
                params: params,
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Authorization': `Bearer ${token}`,
                },
            });

            setUserStories(response.data.data);
        } catch (error) {
            console.error('Error fetching user stories', error);
        }
    };

    const handleOpenDialog = () => setOpen(true);
    const handleCloseDialog = () => {
        setOpen(false);
        setUpdateOpen(false);
    };

    const handleSubmit = async (newUserStory) => {
        try {
            const token = Cookies.get('token');
            await axios.post('http://localhost:8080/user-story', newUserStory, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            handleCloseDialog();
            fetchUserStories();
        } catch (error) {
            console.error('Error adding user story:', error);
        }
    };

    const handleUpdate = async (updatedUserStory) => {
        try {
            const token = Cookies.get('token');
            await axios.put(`http://localhost:8080/user-story/${updatedUserStory.id}`, updatedUserStory, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            handleCloseDialog();
            fetchUserStories();
        } catch (error) {
            console.error('Error updating user story:', error);
        }
    };

    const handleDelete = async (userStoryId) => {
        try {
            const token = Cookies.get('token');
            await axios.delete(`http://localhost:8080/user-story/${userStoryId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            fetchUserStories();
        } catch (error) {
            console.error('Error deleting user story:', error);
        }
    };

    const handleUpdateClick = (userStory) => {
        setCurrentUserStory(userStory);
        setUpdateOpen(true);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                User Story Management
            </Typography>
            <Typography variant="body1" gutterBottom>
                Manage your user stories efficiently.
            </Typography>
            <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Search by Name"
                            variant="outlined"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="priority-level-label">Priority Level</InputLabel>
                            <Select
                                labelId="priority-level-label"
                                value={priorityLevel}
                                onChange={(e) => setPriorityLevel(e.target.value)}
                                label="Priority Level"
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value={1}>Urgent</MenuItem>
                                <MenuItem value={2}>High</MenuItem>
                                <MenuItem value={3}>Medium</MenuItem>
                                <MenuItem value={4}>Low</MenuItem>

                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                label="Status"
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="New">New</MenuItem>
                                <MenuItem value="In_Progress">In Progress</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                                <MenuItem value="On_Going">On Going</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    {profile.roles[0].code === 'PM' &&
                        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                            Add New User Story
                        </Button>
                    }
                </Box>
            </Paper>
            <UserStoryDialog open={open} onClose={handleCloseDialog} onSubmit={handleSubmit} />
            <UserStoryDialog open={updateOpen} onClose={handleCloseDialog} onSubmit={handleUpdate} userStory={currentUserStory} />
            <UserStoryList userStories={userStories} onUpdate={handleUpdateClick} onDelete={handleDelete} />
        </Box>
    );
};

export default UserStoryManagement;
