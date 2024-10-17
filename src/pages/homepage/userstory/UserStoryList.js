import React from 'react';
import { Box, List, ListItem, ListItemText, Typography, Button, Paper } from '@mui/material';

const priorityLabels = {
    1: 'Urgent',
    2: 'High',
    3: 'Medium',
    4: 'Low'
};

const statusLabels = {
    'New': 'New',
    'In_Progress': 'In Progress',
    'Completed': 'Completed',
    'Pending': 'Pending',
    'On_Going': 'On Going',
    'Canceled': 'Canceled'

};

const UserStoryList = ({ userStories, onUpdate, onDelete }) => {
    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
                User Stories
            </Typography>
            <List>
                {userStories.map((story, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }} elevation={3}>
                        <ListItem sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ListItemText
                                primary={`User Story #${index + 1}: ${story.summary}`}
                                secondary={
                                    <>
                                        <Typography variant="body2">Priority: {priorityLabels[story.priorityLevel] || 'Unknown'} - Status: {statusLabels[story.status] || 'Unknown'}</Typography>
                                        <Typography variant="body2">Version: {story.version}</Typography>
                                        <Typography variant="body2">Acceptance Criteria: {story.acceptanceCriteria}</Typography>
                                        <Typography variant="body2">User Story Point: {story.userStoryPoint}</Typography>
                                    </>
                                }
                            />
                            {story.status === 'New' && (
                                <Box>
                                    <Button variant="outlined" color="primary" onClick={() => onUpdate(story)}>Update</Button>
                                    <Button variant="outlined" color="secondary" onClick={() => onDelete(story.id)}>Delete</Button>
                                </Box>
                            )}
                        </ListItem>
                    </Paper>
                ))}
            </List>
        </Box>
    );
};

export default UserStoryList;
