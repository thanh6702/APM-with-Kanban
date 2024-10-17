import React, { useState, useContext, useEffect } from 'react';
import { Box, Grid, Paper, TextField, Button, MenuItem, FormControl, InputLabel, Select, Alert } from '@mui/material';
import { styled } from "@mui/material/styles";
import Cookies from "js-cookie";
import axios from 'axios';
import { ProfileContext } from "../../context/ProfileContext";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginLeft: 'auto',
    marginRight: 'auto',
}));

const StyledCardContent = styled(Box)(({ theme }) => ({
    '& .MuiGrid-item': {
        marginBottom: theme.spacing(2),
    },
}));

const formatDate = (epoch) => {
    if (!epoch) return '';
    const date = new Date(epoch);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
};

const parseDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

const statuses = [
    { value: 'NEW', label: 'New' },
    { value: 'IN_PROGRESS', label: 'In_Progress' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FINISHED', label: 'Finished' },
];

const GeneralInformationTab = ({ project, setProject }) => {
    const { profile } = useContext(ProfileContext);
    const [isEditing, setIsEditing] = useState(false);
    const [warning, setWarning] = useState('');
    const [updateData, setUpdateData] = useState({
        name: '',
        shortedName: '',
        description: '',
        startDate: '',
        endDate: '',
        departmentName: '',
        status: '',
        manager: '',
        sprintTime: '' // Thêm cột Sprint Days
    });
    const [startDateInput, setStartDateInput] = useState('');
    const [endDateInput, setEndDateInput] = useState('');

    useEffect(() => {
        setUpdateData({
            name: project.name,
            shortedName: project.shortedName,
            description: project.description,
            startDate: formatDate(project.startDate),
            endDate: formatDate(project.endDate),
            departmentName: project.departmentName,
            status: project.status,
            manager: project.manager,
            sprintTime: project.sprintTime || '' // Set giá trị cho Sprint Days
        });
        setStartDateInput(formatDateForInput(formatDate(project.startDate)));
        setEndDateInput(formatDateForInput(formatDate(project.endDate)));
    }, [project]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Kiểm tra nếu tên trường là "sprintTime" và giá trị là số âm
        if (name === 'sprintTime' && value < 0) {
            setWarning('Sprint days cannot be negative.');
            return;
        } else {
            setWarning(''); // Clear warning if the value is valid
        }

        setUpdateData((prevData) => ({
            ...prevData,
            [name]: value
        }));

        if (name === 'startDate' || name === 'endDate') {
            const startDate = name === 'startDate' ? new Date(value) : new Date(startDateInput);
            const endDate = name === 'endDate' ? new Date(value) : new Date(endDateInput);

            if (startDate >= endDate) {
                setWarning('Ngày bắt đầu không thể sau hoặc bằng ngày kết thúc.');
            } else {
                setWarning('');
            }

            if (name === 'startDate') {
                setStartDateInput(value);
            } else {
                setEndDateInput(value);
            }
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const token = Cookies.get('token');
            await axios.put(`http://localhost:8080/project/update-general/${project.id}`, {
                ...updateData,
                startDate: startDateInput ? new Date(startDateInput).getTime() : null,
                endDate: endDateInput ? new Date(endDateInput).getTime() : null,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setIsEditing(false);
            setProject((prevData) => ({
                ...prevData,
                ...updateData,
                startDate: startDateInput ? new Date(startDateInput).getTime() : null,
                endDate: endDateInput ? new Date(endDateInput).getTime() : null
            }));
        } catch (error) {
            console.error('Error updating project', error);
        }
    };

    const editableStatuses = statuses.filter(status => status.value !== 'NEW');

    return (
        <StyledPaper>
            <StyledCardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Project Name"
                            name="name"
                            value={updateData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing || project.status !== 'NEW'}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Shorted Name"
                            name="shortedName"
                            value={updateData.shortedName}
                            onChange={handleInputChange}
                            disabled={!isEditing || project.status !== 'NEW'}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={updateData.description}
                            onChange={handleInputChange}
                            disabled={!isEditing || project.status !== 'NEW'}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            name="startDate"
                            type="date"
                            value={startDateInput}
                            onChange={handleInputChange}
                            disabled // Vô hiệu hóa trường Start Date trong mọi tình huống
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="End Date"
                            name="endDate"
                            type="date"
                            value={endDateInput}
                            onChange={handleInputChange}
                            disabled // Vô hiệu hóa trường End Date trong mọi tình huống
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    {warning && (
                        <Grid item xs={12}>
                            <Alert severity="warning">{warning}</Alert>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Sprint Days"
                            name="sprintTime"
                            type="number"
                            value={updateData.sprintTime}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Department"
                            name="departmentName"
                            value={updateData.departmentName}
                            onChange={handleInputChange}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth disabled={!isEditing}>
                            <InputLabel shrink>Status</InputLabel>
                            <Select
                                name="status"
                                value={updateData.status}
                                onChange={handleInputChange}
                                notched
                                label="Status"
                            >
                                {(project.status === 'NEW' ? statuses : editableStatuses).map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Manager"
                            name="manager"
                            value={updateData.manager}
                            onChange={handleInputChange}
                            disabled
                        />
                    </Grid>
                </Grid>
                <Box mt={3} display="flex" justifyContent="flex-end">
                    {project.managerId === profile.id && project.status !== 'FINISHED' && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={isEditing ? handleSave : handleEdit}
                            disabled={warning}
                        >
                            {isEditing ? 'Save' : 'Edit'}
                        </Button>
                    )}
                </Box>
            </StyledCardContent>
        </StyledPaper>
    );
};

export default GeneralInformationTab;