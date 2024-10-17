import React, { useState, useEffect, useContext } from 'react';
import { Box, Paper, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import Cookies from 'js-cookie';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { ProfileContext } from '../../context/ProfileContext';

const BackgroundContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#f4f6f8',
    minHeight: '100vh',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

const ColumnContainer = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    width: 300,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: 450
}));

const ColumnHeader = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const TaskItem = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[200],
}));

const ColumnsTab = ({ projectId, columns, setColumns, fetchProject, projectStatus }) => {
    const { profile } = useContext(ProfileContext);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentColumnData, setCurrentColumnData] = useState({
        id: '',
        name: '',
        min: 0,
        max: null,
        order: 0
    });
    const [errors, setErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

    const handleDialogOpen = (column = null) => {
        if (column) {
            setIsEditing(true);
            setCurrentColumnData(column);
        } else {
            setIsEditing(false);
            setCurrentColumnData({
                id: '',
                name: '',
                min: 0,
                max: null,
                order: 0
            });
        }
        setErrors({});
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let error = '';

        if (name === 'name') {
            if (!value.trim()) {
                error = 'Name cannot be empty.';
            } else if (columns.some(column => column.name === value.trim() && column.id !== currentColumnData.id)) {
                error = 'Name must be unique.';
            }
        }

        if (name === 'order') {
            const numericValue = Number(value);
            if (!Number.isInteger(numericValue) || numericValue < 1) {
                error = 'Order must be a positive integer.';
            } else {
                const maxOrder = Math.max(...columns.map(column => column.order || 0)) + 1;
                if (numericValue > maxOrder) {
                    error = `Order must be between 1 and ${maxOrder}.`;
                }
            }
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error,
        }));

        setCurrentColumnData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (Object.values(errors).some(error => error) || !currentColumnData.name.trim() || !currentColumnData.order) {
            setErrors(prevErrors => ({
                ...prevErrors,
                name: !currentColumnData.name.trim() ? 'Name cannot be empty.' : prevErrors.name,
                order: !currentColumnData.order ? 'Order cannot be empty.' : prevErrors.order,
            }));
            return;
        }

        const token = Cookies.get('token');
        const url = isEditing
            ? `http://localhost:8080/project/${projectId}/column/${currentColumnData.id}`
            : `http://localhost:8080/project/${projectId}/add-column`;

        try {
            const response = await axios({
                method: isEditing ? 'put' : 'post',
                url,
                data: currentColumnData,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                fetchProject(); // Fetch project để cập nhật dữ liệu mới
                setSnackbarMessage(isEditing ? 'Column updated successfully!' : 'Column added successfully!');
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error('Error saving column:', error);
        } finally {
            handleDialogClose();
        }
    };

    const handleDelete = async (columnId) => {
        const token = Cookies.get('token');
        try {
            const response = await axios.delete(`http://localhost:8080/project/${projectId}/column/${columnId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setColumns(prevColumns => prevColumns.filter(column => column.id !== columnId));
                setSnackbarMessage('Column deleted successfully!');
                setSnackbarOpen(true);
            } else {
                console.error('Failed to delete the column.');
            }
        } catch (error) {
            console.error('Error deleting column:', error);
        }
    };

    return (
        <BackgroundContainer>
            <Typography variant="h5" gutterBottom>
                Project Columns
            </Typography>
            <Box sx={{ display: 'flex', overflowX: 'auto', padding: 2 }}>
                {sortedColumns.map((column) => (
                    <ColumnContainer key={column.id}>
                        <ColumnHeader variant="h6">Column: {column.name}</ColumnHeader>
                        <Typography variant="body2">WIP: {column.max}</Typography>
                        <Box>
                            {column.tasks ? column.tasks.map((task) => (
                                <TaskItem key={task.id}>{task.name}</TaskItem>
                            )) : null}
                        </Box>
                        <Box display="flex" justifyContent="space-between" marginTop={15}>
                            {profile.roles[0]?.code === 'PM' &&
                                <IconButton
                                    aria-label="edit"
                                    onClick={() => handleDialogOpen(column)}
                                >
                                    <EditIcon/>
                                </IconButton>
                            }
                            {profile.roles[0]?.code === 'PM' &&
                                <IconButton
                                    aria-label="delete"
                                    onClick={() => handleDelete(column.id)}
                                    disabled={projectStatus !== 'NEW'} // Disable delete if project status is not 'NEW'
                                >
                                    <DeleteIcon/>
                                </IconButton>
                            }
                        </Box>
                    </ColumnContainer>
                ))}
            </Box>
            {profile.roles[0].code === 'PM' &&
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleDialogOpen()}
                    startIcon={<AddIcon/>}
                    style={{marginTop: 16}}
                    disabled={projectStatus !== 'NEW'} // Disable button if project status is not 'NEW'
                >
                    Add Column
                </Button>
            }
            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    },
                }}
            >
                <DialogTitle>{isEditing ? 'Edit Column' : 'Add Column'}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Name"
                        name="name"
                        value={currentColumnData.name}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name}
                        disabled={projectStatus !== 'NEW'} // Disable name field if project status is not 'NEW'
                    />
                    <TextField
                        margin="dense"
                        label="WIP"
                        name="max"
                        type="number"
                        value={currentColumnData.max}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.max}
                        helperText={errors.max}
                    />
                    <TextField
                        margin="dense"
                        label="Order"
                        name="order"
                        type="number"
                        value={currentColumnData.order}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.order}
                        helperText={errors.order}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        disabled={projectStatus !== 'NEW'} // Disable order field if project status is not 'NEW'
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Đặt vị trí ở góc trên bên phải
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </BackgroundContainer>
    );
};

export default ColumnsTab;
