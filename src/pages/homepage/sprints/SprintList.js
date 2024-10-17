import React, {useContext} from 'react';
import { Box, List, ListItem, ListItemText, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {ProfileContext} from "../../../context/ProfileContext";

const SprintList = ({ sprints, onUpdate, onDelete }) => {
    const navigate = useNavigate();
    const {profile } = useContext(ProfileContext);
    const handleItemClick = (id) => {
        navigate(`/sprint/${id}`);
    };

    const handleUpdateClick = (id) => {
        navigate(`/sprint/${id}?edit=true`); // Add query parameter to indicate edit mode
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
                Sprints
            </Typography>
            <List>
                {sprints && sprints.length > 0 ? (
                    sprints.map((sprint, index) => (
                        <ListItem
                            key={sprint.id}
                            sx={{
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                mb: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s',
                                backgroundColor: sprint.status === 'In_Progress' ? '#e0f7fa' : 'transparent',
                                '&:hover': {
                                    backgroundColor: sprint.status === 'In_Progress' ? '#b2ebf2' : '#f0f0f0',
                                },
                            }}
                            onClick={() => handleItemClick(sprint.id)}
                        >
                            <ListItemText
                                primary={`Sprint #${index + 1}: ${sprint.name}`}
                                secondary={
                                    <>
                                        <div>Description: {sprint.description}</div>
                                        <div>Gained Point: {sprint.totalPoint}</div>
                                        <div>Goal: {sprint.goal}</div>
                                        <div>Start Date: {new Date(sprint.startDate).toLocaleDateString()}</div>
                                        <div>End Date: {new Date(sprint.endDate).toLocaleDateString()}</div>
                                        <div>Status: {sprint.status}</div>
                                    </>
                                }
                            />
                            <Box>
                                {sprint.status === 'New' && profile.roles[0].code === 'PM' && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={(e) => { e.stopPropagation(); handleUpdateClick(sprint.id); }}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={(e) => { e.stopPropagation(); onDelete(sprint.id); }}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </ListItem>
                    ))
                ) : (
                    <Typography variant="body1">No sprints available.</Typography>
                )}
            </List>
        </Box>
    );
};

export default SprintList;
