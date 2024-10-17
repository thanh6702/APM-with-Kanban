import React, {useState, useEffect, useContext} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, CircularProgress, Autocomplete, Snackbar, Alert, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import roles from "../../constant/constant";
import {ProfileContext} from "../../context/ProfileContext";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginLeft: 'auto',
    marginRight: 'auto',
}));

const formatDate = (epoch) => {
    const date = new Date(epoch);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};

const todayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
};

const MembersTab = ({ projectId, members, setMembers, fetchProject }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const { profile } = useContext(ProfileContext);

    const [isEditing, setIsEditing] = useState(false);
    const [currentMemberData, setCurrentMemberData] = useState({
        user: { id: '', name: '' },
        roleName: '',
        assignedDate: todayDate(),
        phoneNumber: '',
    });
    const [users, setUsers] = useState([]);
    const [searchField, setSearchField] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

    const fetchUsers = async (searchField = '') => {
        try {
            const token = Cookies.get('token');
            setLoading(true);
            const response = await axios.get(`http://localhost:8080/user/search`, {
                params: { searchField },
                headers: { Authorization: `Bearer ${token}` }
            });

            // Lọc người dùng đã có trong dự án
            const filteredUsers = response.data.filter(user => members === null  || !members.some(member => member.user.id === user.id));

            setUsers(filteredUsers);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (openDialog) {
            fetchUsers();
        }
    }, [openDialog]);

    useEffect(() => {
        if (searchField) {
            fetchUsers(searchField);
        } else {
            fetchUsers();
        }
    }, [searchField]);

    const handleDialogOpen = (member = null) => {
        fetchUsers();
        if (member) {
            setIsEditing(true);
            setCurrentMemberData(member);
        } else {
            setIsEditing(false);
            setCurrentMemberData({
                user: { id: '', name: '' },
                roleName: '',
                assignedDate: todayDate(),
                phoneNumber: '',
            });
        }
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setUsers([]);
        setSearchField('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentMemberData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        const token = Cookies.get('token');
        const data = {
            userId: currentMemberData.user.id,
            roleName: currentMemberData.roleName,
            assignedDate: new Date(currentMemberData.assignedDate).getTime(),
        };

        try {
            const response = await axios.put(`http://localhost:8080/project/${projectId}/add-member`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setAlert({ open: true, message: 'Thêm mới thành viên thành công', severity: 'success' });
                fetchProject(); // Call to update project data
            } else {
                setAlert({ open: true, message: 'Thêm mới thành viên thất bại', severity: 'error' });
            }
        } catch (error) {
            setAlert({ open: true, message: 'Thêm mới thành viên thất bại', severity: 'error' });
        } finally {
            handleDialogClose();
        }
    };

    const handleDelete = async (projectMemberId) => {
        const token = Cookies.get('token');
        try {
            const response = await axios.delete(`http://localhost:8080/project/project-member/${projectMemberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setAlert({ open: true, message: 'Xóa thành viên thành công', severity: 'success' });
                fetchProject(); // Call to update project data
            } else {
                setAlert({ open: true, message: 'Xóa thành viên thất bại', severity: 'error' });
            }
        } catch (error) {
            setAlert({ open: true, message: 'Xóa thành viên thất bại', severity: 'error' });
        }
    };

    const handleUserChange = (event, value) => {
        if (value) {
            setCurrentMemberData((prevData) => ({
                ...prevData,
                user: { id: value.id, name: value.name },
                phoneNumber: value.phoneNumber,
            }));
        }
    };

    const handleAlertClose = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <StyledPaper>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                    Project Members
                </Typography>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Assigned Date</TableCell>
                            <TableCell>Phone Number</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members && members.length > 0 ? (
                            members.map((member) => (
                                <TableRow key={member.user.id}>
                                    <TableCell>{member.user.name}</TableCell>
                                    <TableCell>{member.roleName}</TableCell>
                                    <TableCell>{formatDate(member.assignedDate)}</TableCell>
                                    <TableCell>{member.user.phoneNumber}</TableCell>
                                    <TableCell>
                                        {
                                            profile.roles[0]?.code === 'PM' &&
                                            <IconButton aria-label="delete" onClick={() => handleDelete(member.id)}>
                                                <DeleteIcon/>
                                            </IconButton>
                                        }
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No members found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {
                profile.roles[0]?.code === 'PM' &&
                <Button variant="contained" color="primary" onClick={() => handleDialogOpen()} style={{ marginTop: 16 }}>
                Add Member
            </Button>}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth
                    PaperProps={{
                        style: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        },
                    }}>
                <DialogTitle>{isEditing ? 'Edit Member' : 'Add Member'}</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        options={users}
                        getOptionLabel={(option) => option.name}
                        onChange={handleUserChange}
                        onInputChange={(event, newInputValue) => {
                            setSearchField(newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search User"
                                margin="dense"
                                fullWidth
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
                    />
                    <TextField
                        margin="dense"
                        label="Role"
                        name="roleName"
                        select
                        value={currentMemberData.roleName}
                        onChange={handleChange}
                        fullWidth
                    >
                        {roles.map((role, index) => (
                            <MenuItem key={index} value={role}>
                                {role}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        margin="dense"
                        label="Assigned Date"
                        name="assignedDate"
                        type="date"
                        value={currentMemberData.assignedDate}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="dense"
                        label="Phone Number"
                        name="phoneNumber"
                        value={currentMemberData.phoneNumber}
                        onChange={handleChange}
                        fullWidth
                        disabled
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
            <Snackbar open={alert.open} autoHideDuration={3000} onClose={handleAlertClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </StyledPaper>
    );
};

MembersTab.propTypes = {
    projectId: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(
        PropTypes.shape({
            user: PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
            }).isRequired,
            roleName: PropTypes.string.isRequired,
            assignedDate: PropTypes.number.isRequired,
            phoneNumber: PropTypes.string,
        })
    ).isRequired,
    setMembers: PropTypes.func.isRequired,
    fetchProject: PropTypes.func.isRequired,
};

export default MembersTab;
