import React, {useState, useEffect, useContext, Profiler} from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Divider,
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

const SprintInfo = ({ sprint, onSave, isEditMode }) => {
    const durationDays = 7; // Set the fixed number of days between startDate and endDate
    const { profile } = useContext(ProfileContext);
    // Calculate the number of days between startDate and endDate
    const getDurationDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
        return duration;
    };

    // Calculate endDate based on startDate and durationDays
    const calculateEndDate = (startDate, durationDays) => {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + durationDays);
        return endDate.toISOString().split('T')[0];
    };

    // Initial values
    const initialStartDate = new Date(sprint.startDate).toISOString().split('T')[0];
    const initialEndDate = new Date(sprint.endDate).toISOString().split('T')[0];

    const [editSprint, setEditSprint] = useState({
        name: sprint.name,
        description: sprint.description,
        goal: sprint.goal,
        startDate: initialStartDate,
        endDate: initialEndDate,
        status: sprint.status,
    });
    const [isEditing, setIsEditing] = useState(isEditMode);

    useEffect(() => {
        // Update state when sprint prop changes
        const newEndDate = calculateEndDate(sprint.startDate, durationDays);
        setEditSprint({
            name: sprint.name,
            description: sprint.description,
            goal: sprint.goal,
            startDate: new Date(sprint.startDate).toISOString().split('T')[0],
            endDate: newEndDate,
            status: sprint.status,
        });
    }, [sprint]);

    useEffect(() => {
        // Update edit mode based on isEditMode prop
        setIsEditing(isEditMode);
    }, [isEditMode]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        // If startDate changes, calculate a new endDate
        setEditSprint((prevData) => {
            const newStartDate = name === 'startDate' ? value : prevData.startDate;
            const newEndDate = name === 'startDate'
                ? calculateEndDate(value, durationDays)
                : prevData.endDate;

            return {
                ...prevData,
                [name]: value,
                endDate: newEndDate,
            };
        });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleEditSave = async () => {
        try {
            const token = Cookies.get('token');
            await axios.put(`http://localhost:8080/sprint/${sprint.id}`, {
                ...editSprint,
                startDate: new Date(editSprint.startDate).getTime(),
                endDate: new Date(editSprint.endDate).getTime(),
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setIsEditing(false);
            onSave();
        } catch (error) {
            console.error('Error updating sprint details:', error);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Sprint Information
                </Typography>
                <TextField
                    label="Name"
                    name="name"
                    value={editSprint.name}
                    onChange={handleEditChange}
                    fullWidth
                    margin="normal"
                    disabled={!isEditing}
                />
                <TextField
                    label="Description"
                    name="description"
                    value={editSprint.description}
                    onChange={handleEditChange}
                    fullWidth
                    margin="normal"
                    disabled={!isEditing}
                />
                <TextField
                    label="Goal"
                    name="goal"
                    value={editSprint.goal}
                    onChange={handleEditChange}
                    fullWidth
                    margin="normal"
                    disabled={!isEditing}
                />
                <TextField
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={editSprint.startDate}
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
                    value={editSprint.endDate}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    margin="normal"
                    disabled
                />
                <FormControl fullWidth margin="normal" disabled={!isEditing}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        name="status"
                        value={editSprint.status}
                        onChange={handleEditChange}
                    >
                        {editSprint.status === 'New' && <MenuItem value="New">New</MenuItem>}
                        <MenuItem value="On_going">On Going</MenuItem>
                        <MenuItem value="In_Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                </FormControl>
                <Divider sx={{ my: 2 }} />
                {profile.roles[0].code === 'PM' && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {isEditing ? (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                onClick={handleEditSave}
                                sx={{ borderRadius: '20px', padding: '10px 20px' }}
                            >
                                Save
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<EditIcon />}
                                onClick={handleEditToggle}
                                disabled={!isEditMode && editSprint.status !== 'New'}
                            >
                                Edit
                            </Button>
                        )}
                    </Box>
                )}

            </CardContent>
        </Card>
    );
};

export default SprintInfo;
