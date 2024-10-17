import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,
    Button, IconButton, Box, Typography, MenuItem, Select, FormControl, InputLabel,
    CircularProgress, Autocomplete
} from '@mui/material';
import Cookies from "js-cookie";
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import roles from "../../constant/constant";
import departments from "../../constant/departments";

const CreateProjectDialog = ({ open, onClose, onProjectCreated }) => {
    const [newProjectData, setNewProjectData] = useState({
        name: '',
        shortedName: '',
        description: '',
        startDate: '',
        endDate: '',
        departmentId: '',
        sprintTime: '',
        members: []
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({});
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        if (open) {
            fetchUsers('');
        }
    }, [open]);

    const fetchUsers = async (searchField = '') => {
        try {
            const token = Cookies.get('token');
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/user/search`, {
                params: { searchField },
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users', error);
        } finally {
            setLoading(false);
        }
    };
    const handleNewProjectInputChange = (e) => {
        const { name, value } = e.target;

        // Kiểm tra nếu tên trường là "sprintTime" và giá trị là số âm
        if (name === 'sprintTime' && value < 0) {
            setError((prev) => ({
                ...prev,
                [name]: 'Sprint days cannot be negative'
            }));
            return;
        }

        setNewProjectData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        setError((prev) => ({ ...prev, [name]: '' }));
    };


    const handleRoleChange = (index, event) => {
        const updatedMembers = [...newProjectData.members];
        updatedMembers[index].roleName = event.target.value;
        setNewProjectData((prevData) => ({
            ...prevData,
            members: updatedMembers
        }));
    };

    const handleUserChange = (index, event, value) => {
        const updatedMembers = [...newProjectData.members];
        if (value) {
            const isDuplicate = updatedMembers.some(member => member.userId === value.id);
            if (!isDuplicate) {
                updatedMembers[index].userId = value.id;
                updatedMembers[index].name = value.name;
                setError((prev) => ({ ...prev, [`userId_${index}`]: '' }));
            } else {
                setError((prev) => ({ ...prev, [`userId_${index}`]: 'User already added to members' }));
                return;
            }
        }
        setNewProjectData((prevData) => ({
            ...prevData,
            members: updatedMembers
        }));
    };

    const handleAddMember = () => {
        if (newProjectData.members.some(member => !member.userId || !member.roleName)) {
            setError((prev) => ({
                ...prev,
                general: 'Please complete all members before adding a new one.'
            }));
            return;
        }
        setNewProjectData((prevData) => ({
            ...prevData,
            members: [...prevData.members, { userId: '', roleName: '', name: '' }]
        }));
    };

    const handleRemoveMember = (index) => {
        const updatedMembers = newProjectData.members.filter((_, i) => i !== index);
        setNewProjectData((prevData) => ({
            ...prevData,
            members: updatedMembers
        }));
    };

    const validateFields = () => {
        const { name, shortedName, startDate, endDate, departmentId, sprintTime } = newProjectData;
        const validationErrors = {};

        if (!name) validationErrors.name = 'Project name is required';
        if (!shortedName) validationErrors.shortedName = 'Shorted name is required';
        // if (!startDate) validationErrors.startDate = 'Start date is required';
        // if (!endDate) validationErrors.endDate = 'End date is required';
        if (!departmentId) validationErrors.departmentId = 'Department is required';
        if (!sprintTime) validationErrors.sprintTime = 'Sprint days are required';

        newProjectData.members.forEach((member, index) => {
            if (!member.userId) validationErrors[`userId_${index}`] = 'User is required';
            if (!member.roleName) validationErrors[`roleName_${index}`] = 'Role is required';
        });

        setError(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleCreateProject = async () => {
        console.log('Starting validation');
        if (!validateFields()) {
            console.log('Validation failed');
            return;
        }

        const projectData = {
            ...newProjectData,
            startDate: newProjectData.startDate ? new Date(newProjectData.startDate).getTime() : null,
            endDate: newProjectData.endDate ? new Date(newProjectData.endDate).getTime() : null,
            members: newProjectData.members
                .filter(member => member.userId && member.roleName)
                .map(member => ({
                    userId: member.userId,
                    roleName: member.roleName
                }))
        };

        console.log('Prepared project data:', projectData);

        try {
            const token = Cookies.get('token');
            console.log('Token:', token);
            await axios.post('http://localhost:8080/project', projectData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Project created successfully');
            setServerError('');
            onProjectCreated();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Error creating project', error);
            setServerError('Failed to create project');
        }
    };

    const resetForm = () => {
        setNewProjectData({
            name: '',
            shortedName: '',
            description: '',
            startDate: '',
            endDate: '',
            departmentId: '',
            sprintTime: '',
            members: []
        });
        setError({});
    };

    const getAvailableUsers = () => {
        const selectedUserIds = newProjectData.members.map(member => member.userId);
        return users.filter(user => !selectedUserIds.includes(user.id));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please fill out the form below to create a new project.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Project Name"
                    name="name"
                    fullWidth
                    value={newProjectData.name}
                    onChange={handleNewProjectInputChange}
                    error={!!error.name}
                    helperText={error.name}
                />
                <TextField
                    margin="dense"
                    label="Shorted Name"
                    name="shortedName"
                    fullWidth
                    value={newProjectData.shortedName}
                    onChange={handleNewProjectInputChange}
                    error={!!error.shortedName}
                    helperText={error.shortedName}
                />
                <TextField
                    margin="dense"
                    label="Description"
                    name="description"
                    fullWidth
                    value={newProjectData.description}
                    onChange={handleNewProjectInputChange}
                />

                <TextField
                    margin="dense"
                    label="Sprint Days"
                    name="sprintTime"
                    type="number"
                    fullWidth
                    value={newProjectData.sprintTime}
                    onChange={handleNewProjectInputChange}
                    error={!!error.sprintTime}
                    helperText={error.sprintTime}
                />


                <FormControl fullWidth margin="dense" error={!!error.departmentId}>
                    <InputLabel>Department</InputLabel>
                    <Select
                        name="departmentId"
                        value={newProjectData.departmentId}
                        onChange={handleNewProjectInputChange}
                        label="Department"
                    >
                        {departments.map((department) => (
                            <MenuItem key={department.id} value={department.id}>
                                {department.name}
                            </MenuItem>
                        ))}
                    </Select>
                    {error.departmentId && <Typography variant="caption" color="error">{error.departmentId}</Typography>}
                </FormControl>

                <Box mt={2}>
                    <Typography variant="subtitle1">Members</Typography>
                    {newProjectData.members.map((member, index) => (
                        <Box key={index} display="flex" alignItems="center" mb={1}>
                            <Autocomplete
                                options={getAvailableUsers()}
                                getOptionLabel={(option) => option.name}
                                onChange={(event, value) => handleUserChange(index, event, value)}
                                isOptionEqualToValue={(option, value) => option.id === value.id} // Chỉnh sửa ở đây
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search User"
                                        margin="dense"
                                        fullWidth
                                        error={!!error[`userId_${index}`]}
                                        helperText={error[`userId_${index}`]}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                                sx={{ width: '70%', mr: 2 }}
                            />
                            <FormControl fullWidth margin="dense" error={!!error[`roleName_${index}`]}>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    name="roleName"
                                    value={member.roleName}
                                    onChange={(event) => handleRoleChange(index, event)}
                                    label="Role"
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role} value={role}>
                                            {role}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {error[`roleName_${index}`] && (
                                    <Typography variant="caption" color="error">{error[`roleName_${index}`]}</Typography>
                                )}
                            </FormControl>
                            <IconButton onClick={() => handleRemoveMember(index)} color="secondary" sx={{ ml: 1 }}>
                                <RemoveIcon />
                            </IconButton>
                        </Box>
                    ))}
                    {error.general && (
                        <Typography variant="caption" color="error">{error.general}</Typography>
                    )}
                    <IconButton onClick={handleAddMember} color="primary">
                        <AddIcon />
                    </IconButton>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleCreateProject} color="primary">
                    Create
                </Button>
            </DialogActions>
            {serverError && (
                <Box sx={{ p: 2 }}>
                    <Typography color="error">{serverError}</Typography>
                </Box>
            )}
        </Dialog>
    );
};

export default CreateProjectDialog;
