import React, {useState, useEffect, useContext} from 'react';
import {
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    IconButton,
    CardActions,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';
import Cookies from 'js-cookie';
import {ProfileContext} from "../../../context/ProfileContext";

const ReleaseStories = ({ userStories, availableStories, releaseId, releaseStatus, onAddStory, onRemoveStory, onLoadMore }) => {
    const [selectedStory, setSelectedStory] = useState(null);
    const [status, setStatus] = useState('');
    const [open, setOpen] = useState(false);
    const [totalStoryPoints, setTotalStoryPoints] = useState(0);
    const [totalAvailablePoints, setTotalAvailablePoints] = useState(0);
    const {profile} = useContext(ProfileContext);
    useEffect(() => {
        // Reset state when releaseStatus changes
        setSelectedStory(null);
        setStatus('');
        setOpen(false);

        // Calculate total user story points for completed stories
        const completedPoints = userStories
            .filter(story => story.status === 'Completed')
            .reduce((total, story) => total + (story.userStoryPoint || 0), 0);
        setTotalStoryPoints(completedPoints);

        // Calculate total user story points for available stories
        const availablePoints = availableStories
            .reduce((total, story) => total + (story.userStoryPoint || 0), 0);
        setTotalAvailablePoints(availablePoints);
    }, [releaseStatus, userStories, availableStories]);

    const handleAddStoryToRelease = async (storyId) => {
        try {
            const token = Cookies.get('token');
            await axios.post('http://localhost:8080/release/add-story-to-release', {
                userStoryId: storyId,
                releaseId: releaseId,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            onAddStory();
        } catch (error) {
            console.error('Error adding story to release:', error);
        }
    };

    const handleRemoveStoryClick = (story) => {
        setSelectedStory(story);
        setOpen(true);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };

    const handleClose = () => {
        setOpen(false);
        setStatus('');
        setSelectedStory(null);
    };

    const handleUpdateStatus = async () => {
        if (!selectedStory || !status) return;

        try {
            const token = Cookies.get('token');
            await axios.post(`http://localhost:8080/user-story/${selectedStory.id}/delete-from-release`, {
                releaseId: releaseId,
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

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                    Available Stories
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Total Story Points: {totalAvailablePoints}
                </Typography>
                {profile.roles[0].code === 'PM' &&
                <Box sx={{ mt: 3 }}>
                    {availableStories.map((story, index) => (
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
                            {profile.roles[0].code === 'PM' &&

                                <CardActions>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleAddStoryToRelease(story.id)}
                                        sx={{backgroundColor: 'rgba(0, 123, 255, 0.1)', borderRadius: '50%'}}
                                        disabled={releaseStatus === 'New' || releaseStatus === 'Completed'}
                                    >
                                        <AddIcon/>
                                    </IconButton>
                                </CardActions>
                            }
                        </Card>
                    ))}
                </Box>
                }
                {availableStories.length >= 5 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={onLoadMore}
                            sx={{ borderRadius: '20px', padding: '10px 20px' }}
                            disabled={releaseStatus === 'Completed' || releaseStatus === 'New'}
                        >
                            Load More
                        </Button>
                    </Box>
                )}
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                    User Stories in this Release
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Total Story Points Gained: {totalStoryPoints}
                </Typography>
                    <Box sx={{mt: 3}}>
                        {userStories.map((story, index) => (
                            <Card key={index} sx={{mb: 2, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'}}>
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

                                {profile.roles[0].code === 'PM' &&
                                    <CardActions>
                                        <IconButton
                                            color="secondary"
                                            onClick={() => handleRemoveStoryClick(story)}
                                            sx={{backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: '50%'}}
                                            disabled={releaseStatus === 'Completed' || releaseStatus === 'New' || story.status === 'Completed'}
                                        >
                                            <RemoveIcon/>
                                        </IconButton>
                                    </CardActions>
                                }
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
                        >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Canceled">Canceled</MenuItem>
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
        </Grid>
    );
};

export default ReleaseStories;
