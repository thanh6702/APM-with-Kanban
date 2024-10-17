import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Select, InputLabel, FormControl, Button, Box, MenuItem } from '@mui/material';
import Cookies from 'js-cookie';
import priorityLevels from "../../../constant/PriorityLevel";

const UserStoryDialog = ({ open, onClose, onSubmit, userStory: initialUserStory }) => {
    const [userStory, setUserStory] = useState({
        id: '',
        summary: 'As ',
        priorityLevel: '',
        projectId: '',
        description: '',
        version: '',
        acceptanceCriteria: '',
        userStoryPoint: ''
    });

    useEffect(() => {
        if (initialUserStory) {
            setUserStory({
                ...initialUserStory,
                projectId: initialUserStory.projectId
            });
        } else {
            // Nếu không có userStory ban đầu, tự động gán projectId từ cookie
            const currentProject = Cookies.get('currentProject');
            if (currentProject) {
                const projectObject = JSON.parse(currentProject);
                setUserStory((prevUserStory) => ({
                    ...prevUserStory,
                    projectId: projectObject.id // Gán projectId từ cookie
                }));
            }
        }
    }, [initialUserStory]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserStory({
            ...userStory,
            [name]: value
        });
    };

    const handleSubmit = () => {
        const newUserStory = {
            ...userStory,
        };
        onSubmit(newUserStory);
    };

    // Lấy thông tin dự án từ cookie
    const currentProject = Cookies.get('currentProject');
    const projectObject = currentProject ? JSON.parse(currentProject) : null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{initialUserStory ? 'Update User Story' : 'Add New User Story'}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {initialUserStory ? 'Update the user story details.' : 'To add a new user story, please fill in the following details.'}
                </DialogContentText>
                <Box component="form" sx={{ mt: 1 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="summary"
                        label="Summary"
                        type="text"
                        fullWidth
                        value={userStory.summary}
                        onChange={handleChange}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="priority-level-label">Priority Level</InputLabel>
                        <Select
                            labelId="priority-level-label"
                            name="priorityLevel"
                            value={userStory.priorityLevel}
                            onChange={handleChange}
                        >
                            {priorityLevels.map((level) => (
                                <MenuItem key={level.priorityLevel} value={level.priorityLevel}>
                                    {level.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="project-id-label">Project</InputLabel>
                        <Select
                            labelId="project-id-label"
                            name="projectId"
                            value={userStory.projectId || ''}
                            onChange={handleChange}
                            disabled={true} // Luôn disable vì chỉ có một project từ cookie
                        >
                            {projectObject && (
                                <MenuItem value={projectObject.id}>
                                    {projectObject.name}
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        value={userStory.description}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="version"
                        label="Version"
                        type="text"
                        fullWidth
                        value={userStory.version}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="acceptanceCriteria"
                        label="Acceptance Criteria"
                        type="text"
                        fullWidth
                        value={userStory.acceptanceCriteria}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        name="userStoryPoint"
                        label="User Story Point"
                        type="number"
                        fullWidth
                        value={userStory.userStoryPoint}
                        onChange={handleChange}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    {initialUserStory ? 'Update' : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserStoryDialog;
