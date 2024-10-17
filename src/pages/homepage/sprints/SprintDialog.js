import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, Button, Box, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';

const SprintDialog = ({ open, onClose, onSubmit, sprint: initialSprint }) => {
    const [sprint, setSprint] = useState({
        name: '',
        description: '',
        goal: '',
        startDate: '',
        endDate: '',
        projectId: '',
        releaseId: ''
    });
    const [releases, setReleases] = useState([]);
    const [isReleaseDisabled, setIsReleaseDisabled] = useState(true);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

    // Get project information from cookies
    const currentProject = JSON.parse(Cookies.get('currentProject') || '{}');

    useEffect(() => {
        if (initialSprint) {
            setSprint({
                ...initialSprint,
                startDate: new Date(initialSprint.startDate).toISOString().split('T')[0],
                endDate: new Date(initialSprint.endDate).toISOString().split('T')[0],
                projectId: initialSprint.projectId || currentProject.id, // Use projectId from sprint or cookies
            });
            if (initialSprint.projectId || currentProject.id) {
                fetchReleases(initialSprint.projectId || currentProject.id);
                setIsReleaseDisabled(false);
            }
        } else {
            // For new sprint, use project from cookies
            setSprint((prevSprint) => ({
                ...prevSprint,
                projectId: currentProject.id,
            }));
            fetchReleases(currentProject.id);
            setIsReleaseDisabled(false);
        }
    }, [initialSprint]);

    const fetchReleases = async (projectId) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/release', {
                params: { projectId },
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.status === 200) {
                setReleases(response.data.data);
            } else {
                const errorMessage = response.data.message || 'Failed to fetch releases.';
                setAlert({ open: true, message: errorMessage, severity: 'error' });
            }
        } catch (error) {
            console.error('Error fetching releases', error);
            const errorMessage = error.response?.data?.message || 'Failed to fetch releases.';
            setAlert({ open: true, message: errorMessage, severity: 'error' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSprint({
            ...sprint,
            [name]: value
        });
    };

    const handleSubmit = async () => {
        const formattedSprint = {
            ...sprint,
            startDate: new Date(sprint.startDate).getTime(),
            endDate: new Date(sprint.endDate).getTime()
        };

        try {
            const response = await onSubmit(formattedSprint); // Ensure this returns a promise
            if (response && response.status === 200) {
                onClose(); // Close dialog if submission is successful
            } else {
                const errorMessage = response.data.message || 'Failed to submit sprint.';
                setAlert({ open: true, message: errorMessage, severity: 'error' });
            }
        } catch (error) {
            console.error('Submission error:', error);

            // Check for the specific error code and map the message
            if (error.response && error.response.data && error.response.data.code === 40000006) {
                setAlert({
                    open: true,
                    message: 'Sprints date is invalid. Please check the start and end dates.',
                    severity: 'error'
                });
            } else {
                const errorMessage = error.response?.data?.message || 'An error occurred during submission.';
                setAlert({ open: true, message: errorMessage, severity: 'error' });
            }
        }
    };


    const handleAlertClose = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>{initialSprint ? 'Update Sprint' : 'Add New Sprint'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {initialSprint ? 'Update the sprint details.' : 'To add a new sprint, please fill in the following details.'}
                    </DialogContentText>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Name"
                            type="text"
                            fullWidth
                            value={sprint.name}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            value={sprint.description}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            name="goal"
                            label="Goal"
                            type="text"
                            fullWidth
                            value={sprint.goal}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            name="startDate"
                            label="Start Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={sprint.startDate}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="dense"
                            name="projectName"
                            label="Project"
                            type="text"
                            fullWidth
                            value={currentProject.name} // Show project name from cookies
                            disabled // Disable this field
                        />
                        <FormControl fullWidth margin="dense" disabled={isReleaseDisabled}>
                            <InputLabel id="release-id-label">Release</InputLabel>
                            <Select
                                labelId="release-id-label"
                                name="releaseId"
                                value={sprint.releaseId}
                                onChange={handleChange}
                            >
                                {releases.map((release) => (
                                    <MenuItem key={release.id} value={release.id}>
                                        {release.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">Cancel</Button>
                    <Button onClick={handleSubmit} color="primary">{initialSprint ? 'Update' : 'Add'}</Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={alert.open}
                autoHideDuration={8000}
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                    '& .MuiAlert-root': {
                        fontSize: '1.2rem',
                    },
                }}
            >
                <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default SprintDialog;
