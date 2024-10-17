import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, Button, Box
} from '@mui/material';
import Cookies from 'js-cookie';

const ReleaseDialog = ({ open, onClose, onSubmit, release: initialRelease }) => {
    const [release, setRelease] = useState({
        title: '',
        description: '',
        name: '',
        startDate: '',
        endDate: '',
        projectId: ''
    });

    // Retrieve project information from cookies
    const currentProject = Cookies.get('currentProject');
    const projectObject = currentProject ? JSON.parse(currentProject) : null;

    useEffect(() => {
        // Only set state if initialRelease is provided or if the dialog is intended for a new release
        if (initialRelease) {
            setRelease({
                ...initialRelease,
                startDate: new Date(initialRelease.startDate).toISOString().split('T')[0],
                endDate: new Date(initialRelease.endDate).toISOString().split('T')[0],
            });
        } else if (projectObject && open) {
            // Only set project ID when the dialog is open and the projectObject is available
            setRelease((prevRelease) => ({
                ...prevRelease,
                projectId: projectObject.id, // Set projectId from cookies
            }));
        }
    }, [initialRelease, projectObject, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRelease({
            ...release,
            [name]: value
        });
    };

    const handleSubmit = () => {
        const formattedRelease = {
            ...release,
            startDate: new Date(release.startDate).getTime(),
            endDate: new Date(release.endDate).getTime()
        };
        onSubmit(formattedRelease);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{initialRelease ? 'Update Release' : 'Add New Release'}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {initialRelease ? 'Update the release details.' : 'To add a new release, please fill in the following details.'}
                </DialogContentText>
                <Box component="form" sx={{ mt: 1 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="title"
                        label="Title"
                        type="text"
                        fullWidth
                        value={release.title}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        value={release.description}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="name"
                        label="Name"
                        type="text"
                        fullWidth
                        value={release.name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="startDate"
                        label="Start Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={release.startDate}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="endDate"
                        label="End Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={release.endDate}
                        onChange={handleChange}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="project-id-label">Project</InputLabel>
                        <Select
                            labelId="project-id-label"
                            name="projectId"
                            value={release.projectId}
                            onChange={handleChange}
                            disabled // Disable Select
                        >
                            {projectObject && (
                                <MenuItem value={projectObject.id}>
                                    {projectObject.name}
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    {initialRelease ? 'Update' : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReleaseDialog;
