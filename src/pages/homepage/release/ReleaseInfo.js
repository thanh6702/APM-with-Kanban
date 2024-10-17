import React, {useState, useEffect, useContext} from 'react';
import {
    Card,
    CardContent,
    Grid,
    TextField,
    Divider,
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';
import Cookies from 'js-cookie';
import {ProfileContext} from "../../../context/ProfileContext";

const ReleaseInfo = ({ release, onSave, isEditMode }) => {
    const [editRelease, setEditRelease] = useState({
        title: release.title,
        description: release.description,
        name: release.name,
        startDate: new Date(release.startDate).toISOString().split('T')[0],
        endDate: new Date(release.endDate).toISOString().split('T')[0],
        projectId: release.project.id,
        projectName: release.project.name,
        status: release.status
    });
    const {profile } = useContext(ProfileContext);
    const [isEditing, setIsEditing] = useState(isEditMode);

    useEffect(() => {
        setEditRelease({
            title: release.title,
            description: release.description,
            name: release.name,
            startDate: new Date(release.startDate).toISOString().split('T')[0],
            endDate: new Date(release.endDate).toISOString().split('T')[0],
            projectId: release.project.id,
            projectName: release.project.name,
            status: release.status
        });
    }, [release]);
    useEffect(() => {
        // Update edit mode based on isEditMode prop
        setIsEditing(isEditMode);
    }, [isEditMode]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditRelease((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleEditSave = async () => {
        try {
            const token = Cookies.get('token');
            await axios.put(`http://localhost:8080/release/${release.id}`, {
                ...editRelease,
                startDate: new Date(editRelease.startDate).getTime(),
                endDate: new Date(editRelease.endDate).getTime(),
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setIsEditing(false);
            onSave();
        } catch (error) {
            console.error('Error updating release details:', error);
        }
    };

    return (
        <Card>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Title"
                            name="title"
                            value={editRelease.title}
                            onChange={handleEditChange}
                            fullWidth
                            margin="normal"
                            disabled={!isEditing}
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={editRelease.description}
                            onChange={handleEditChange}
                            fullWidth
                            margin="normal"
                            disabled={!isEditing}
                        />
                        <TextField
                            label="Name"
                            name="name"
                            value={editRelease.name}
                            onChange={handleEditChange}
                            fullWidth
                            margin="normal"
                            disabled={!isEditing}
                        />
                        <TextField
                            label="Start Date"
                            name="startDate"
                            type="date"
                            value={editRelease.startDate}
                            onChange={handleEditChange}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            disabled={!isEditing}
                        />
                        <TextField
                            label="End Date"
                            name="endDate"
                            type="date"
                            value={editRelease.endDate}
                            onChange={handleEditChange}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            disabled={!isEditing}
                        />
                        <TextField
                            label="Project"
                            name="projectId"
                            value={editRelease.projectName}
                            onChange={handleEditChange}
                            fullWidth
                            margin="normal"
                            disabled
                        />

                    </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                {profile.roles[0].code === 'PM' && <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                    {isEditing ? (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon/>}
                            onClick={handleEditSave}
                            sx={{borderRadius: '20px', padding: '10px 20px'}}
                        >
                            Save
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon/>}
                            onClick={handleEditToggle}
                            disabled={editRelease.status !== 'New'}
                            sx={{borderRadius: '20px', padding: '10px 20px'}}
                        >
                            Edit
                        </Button>
                    )}
                </Box>
                }
            </CardContent>
        </Card>
    );
};

export default ReleaseInfo;
