import React, {useState, useEffect, useContext} from 'react';
import {
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    MenuItem, CardActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';
import Cookies from 'js-cookie';
import IconButton from "@mui/material/IconButton";
import {ProfileContext} from "../../../context/ProfileContext";

const SprintStories = ({ userStories, availableStories, sprintId, sprintStatus, onAddStory, onRemoveStory, onLoadMore }) => {
    const [available, setAvailable] = useState(availableStories);
    const [selectedStory, setSelectedStory] = useState(null);
    const [status, setStatus] = useState('');
    const [open, setOpen] = useState(false);
    const [confirmComplete, setConfirmComplete] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [totalCompletedPoints, setTotalCompletedPoints] = useState(0);
    const [totalAvailablePoints, setTotalAvailablePoints] = useState(0);
    const {profile} = useContext(ProfileContext);
    useEffect( () => {
        setAvailable(availableStories);

        // Calculate total points for completed stories in the sprint
        const completedPoints = userStories
            .filter(story => story.status === 'Completed')
            .reduce((total, story) => total + (story.userStoryPoint || 0), 0);
        setTotalCompletedPoints(completedPoints);

        // Calculate total points for available stories
        const availablePoints = availableStories
            .reduce((total, story) => total + (story.userStoryPoint || 0), 0);
        setTotalAvailablePoints(availablePoints);
    }, [availableStories, userStories]);

    const fetchAvailableStories = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:8080/sprint/${sprintId}/available-stories`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            setAvailable(response.data.data);
        } catch (error) {
            console.error('Error fetching available stories:', error);
        }
    };

    const handleAddStoryToSprint = async (storyId) => {
        try {
            const token = Cookies.get('token');
            await axios.post('http://localhost:8080/sprint/add-user-story-to-sprint', {
                userStoryId: storyId,
                sprintId: sprintId,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            onAddStory();
        } catch (error) {
            console.error('Error adding story to sprint:', error);
        }
    };

    const handleCancelStoryClick = (story) => {
        setSelectedStory(story);
        setConfirmCancel(true);
    };

    const handleConfirmCancelStory = async () => {
        if (!selectedStory) return;

        try {
            const token = Cookies.get('token');
            await axios.post(`http://localhost:8080/user-story/${selectedStory.id}/update-status`, {
                status: 'Canceled',
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setConfirmCancel(false);
            onRemoveStory(); // Refresh the list after the story is canceled
        } catch (error) {
            console.error('Error canceling story:', error);
        }
    };

    const handleCompleteStoryClick = (story) => {
        setSelectedStory(story);
        setConfirmComplete(true);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };

    const handleClose = () => {
        setOpen(false);
        setConfirmComplete(false);
        setConfirmCancel(false);
        setStatus('');
        setSelectedStory(null);
    };

    const handleUpdateStatus = async () => {
        if (!selectedStory || !status) return;

        try {
            const token = Cookies.get('token');
            await axios.post(`http://localhost:8080/user-story/${selectedStory.id}/delete-from-sprint`, {
                sprintId: sprintId,
                status: status,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            handleClose();
            onRemoveStory();
        } catch (error) {
            console.error('Error updating story status:', error);
        }
    };

    const handleCompleteStory = async () => {
        if (!selectedStory) return;

        try {
            const token = Cookies.get('token');
            await axios.put(`http://localhost:8080/user-story/${selectedStory.id}/complete`, {
                sprintId: sprintId,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            handleClose();
            onRemoveStory();
        } catch (error) {
            console.error('Error completing story:', error);
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                    Available Stories
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Total Story Points: {totalAvailablePoints}
                </Typography>
                <Box sx={{ mt: 3 }}>
                    {available.map((story, index) => (
                        <Card key={index} sx={{ mb: 2, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
                            <CardContent>
                                <Typography variant="h6">
                                    User Story #{index + 1}: {story.summary}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Priority: {story.priorityLevel} - Status: {story.status}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Story Points: {story.userStoryPoint || 'N/A'}
                                </Typography>
                            </CardContent>
                            {profile.roles[0].code === 'PM' && (
                                <CardActions sx={{ justifyContent: 'space-between' }}>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleAddStoryToSprint(story.id)}
                                        sx={{ backgroundColor: 'rgba(0, 123, 255, 0.1)', borderRadius: '50%' }}
                                        disabled={sprintStatus === 'Completed' || sprintStatus === 'New'}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                    {story.status === 'Pending' && (
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={() => handleCancelStoryClick(story)}
                                            sx={{ alignSelf: 'flex-end' }}
                                        >
                                            Cancel Story
                                        </Button>
                                    )}
                                </CardActions>
                            )}

                        </Card>
                    ))}
                </Box>
                {available.length >= 5 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={onLoadMore}
                            sx={{ borderRadius: '20px', padding: '10px 20px' }}
                            disabled={sprintStatus === 'Completed' || sprintStatus === 'New'}
                        >
                            Load More
                        </Button>
                    </Box>
                )}
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                    User Stories in this Sprint
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Total Story Points Gained: {totalCompletedPoints}
                </Typography>
                <Box sx={{ mt: 3 }}>
                    {userStories.map((story, index) => (
                        <Card key={index} sx={{ mb: 2, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
                            <CardContent>
                                <Typography variant="h6">
                                    User Story #{index + 1}: {story.summary}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Priority: {story.priorityLevel} - Status: {story.status}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Story Points: {story.userStoryPoint || 'N/A'}
                                </Typography>
                            </CardContent>
                            {profile.roles[0].code === 'PM' && (
                                <CardActions>
                                    <IconButton
                                        color="success"
                                        onClick={() => handleCompleteStoryClick(story)}
                                        sx={{ backgroundColor: 'rgba(0, 255, 0, 0.1)', borderRadius: '50%' }}
                                        disabled={sprintStatus === 'Completed' || story.status === 'Completed'}
                                    >
                                        <CheckIcon />
                                    </IconButton>
                                </CardActions>
                            )}

                        </Card>
                    ))}
                </Box>
            </Grid>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Update User Story Status</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please select the new status for the user story.
                    </DialogContentText>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            onChange={handleStatusChange}
                            disabled={sprintStatus === 'Completed'}
                        >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Canceled">Canceled</MenuItem>
                            <MenuItem value="On_Going">On Going</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" sx={{ borderRadius: '20px', padding: '10px 20px' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateStatus} color="primary" sx={{ borderRadius: '20px', padding: '10px 20px' }}>
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={confirmComplete} onClose={handleClose}>
                <DialogTitle>Complete User Story</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to mark this user story as completed?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" sx={{ borderRadius: '20px', padding: '10px 20px' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleCompleteStory} color="primary" sx={{ borderRadius: '20px', padding: '10px 20px' }}>
                        Complete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={confirmCancel} onClose={handleClose}>
                <DialogTitle>Cancel User Story</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to cancel this user story?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" sx={{ borderRadius: '20px', padding: '10px 20px' }}>
                        No
                    </Button>
                    <Button onClick={handleConfirmCancelStory} color="secondary" sx={{ borderRadius: '20px', padding: '10px 20px' }}>
                        Yes, Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default SprintStories;
