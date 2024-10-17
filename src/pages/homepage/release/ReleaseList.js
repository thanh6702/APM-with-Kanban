import React, {useContext} from 'react';
import { Box, List, ListItem, ListItemText, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {ProfileContext} from "../../../context/ProfileContext";

const ReleaseList = ({ releases, onUpdate, onDelete }) => {
    const navigate = useNavigate();
    const { profile } = useContext(ProfileContext);

    const handleItemClick = (id) => {
        navigate(`/release/${id}`);
    };
    const handleUpdateClick = (id) => {
        navigate(`/release/${id}?edit=true`); // Add query parameter to indicate edit mode
    };
    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
                Releases
            </Typography>
            <List>
                {releases.map((release, index) => (
                    <ListItem
                        key={release.id}
                        sx={{
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            mb: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                            backgroundColor: release.status === 'In_Progress' ? '#e0f7fa' : 'transparent',
                            '&:hover': {
                                backgroundColor: release.status === 'In_Progress' ? '#b2ebf2' : '#f0f0f0',
                            },
                        }}
                        onClick={() => handleItemClick(release.id)}
                    >
                        <ListItemText
                            primary={`Release #${index + 1}: ${release.name}`}
                            secondary={
                                <>
                                    <div>Description: {release.description}</div>
                                    <div>Project: {release.project.name}</div>
                                    <div>Gained User Story Point: {release.totalPoint}</div>
                                    <div>Start Date: {new Date(release.startDate).toLocaleDateString()}</div>
                                    <div>End Date: {new Date(release.endDate).toLocaleDateString()}</div>
                                    <div>Status: {release.status}</div>
                                </>
                            }
                        />
                        {release.status === 'New' && profile.roles[0].code === 'PM' && (
                            <Box>
                                <Button variant="outlined" color="primary"   onClick={(e) => { e.stopPropagation(); handleUpdateClick(release.id); }}>Update</Button>
                                <Button variant="outlined" color="secondary" onClick={(e) => { e.stopPropagation(); onDelete(release.id); }}>Delete</Button>
                            </Box>
                        )}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default ReleaseList;
