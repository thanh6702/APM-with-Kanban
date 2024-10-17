import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Switch,
    Button,
    Snackbar,
    Alert,
    Chip,
    IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import Cookies from 'js-cookie';
import axios from 'axios'; // Import axios để gọi API
import EditIcon from '@mui/icons-material/Edit'; // Import Edit icon
import { ProfileContext } from "../../../context/ProfileContext";
import AddStaffDialog from "./AddStaffDialog";
import EditStaffDialog from "./EditStaffDialog"; // Import EditStaffDialog.js

const roles = [
    { key: 'ADMIN', value: 'Admin' },
    { key: 'PM', value: 'Manager' },
    { key: 'EMPLOYEE', value: 'Employee' },
];

const Container = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    marginTop: theme.spacing(4), // Thụt xuống dưới một chút
}));

const fetchStaffData = async (searchField, pageSize, pageIndex, tab, token) => {
    const response = await fetch(`http://localhost:8080/user/staff?tab=${tab}&searchField=${searchField}&pageSize=${pageSize}&pageIndex=${pageIndex}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    const data = await response.json();
    return data;
};

const formatDate = (epochMilliseconds) => {
    if (!epochMilliseconds) return 'N/A';
    return format(new Date(epochMilliseconds), 'dd/MM/yyyy');
};

// Hàm để tìm giá trị role dựa trên key
const getRoleValue = (roleKey) => {
    const role = roles.find(r => r.key === roleKey);
    return role ? role.value : 'Unknown Role';
};

const StaffManagement = () => {
    const { checkAndFetchProfile } = useContext(ProfileContext);
    const [staff, setStaff] = useState([]);
    const [searchField, setSearchField] = useState('');
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [error, setError] = useState('');
    const [openAddStaffDialog, setOpenAddStaffDialog] = useState(false);  // State để quản lý dialog
    const [openEditStaffDialog, setOpenEditStaffDialog] = useState(false);  // State để quản lý Edit dialog
    const [selectedStaff, setSelectedStaff] = useState(null);  // State để lưu nhân viên được chọn
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // success | error | warning | info

    const token = Cookies.get('token');
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get('tab') || 'ALL';

    const loadData = async () => {
        try {
            const data = await fetchStaffData(searchField, pageSize, pageIndex + 1, tab, token); // Increment pageIndex by 1 when calling API
            if (data.code === 0) {
                setStaff(data.data);
                setTotalCount(data.paging.totalCount);
                setError('');
            } else {
                setError('Failed to fetch data');
            }
        } catch (err) {
            setError('An error occurred while fetching data');
            console.error(err);
        }
    };

    useEffect(() => {
        checkAndFetchProfile();
        loadData();
    }, [searchField, pageIndex, pageSize, tab]);

    const handleSearch = (event) => {
        setSearchField(event.target.value);
        setPageIndex(0); // Reset to first page on new search
    };

    const handleChangePage = (event, newPage) => {
        setPageIndex(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setPageIndex(0); // Reset to first page on new page size
    };

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            // Gọi API để cập nhật trạng thái người dùng
            const response = await axios.put(
                `http://localhost:8080/user/${id}/update-status`,
                { isActive: !currentStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.code === 200) {
                // Cập nhật trạng thái trong giao diện nếu API thành công
                setStaff((prevStaff) =>
                    prevStaff.map((staff) =>
                        staff.id === id ? { ...staff, isActive: !currentStatus } : staff
                    )
                );
                setSnackbarMessage('User status updated successfully');
                setSnackbarSeverity('success');
            } else {
                setSnackbarMessage('Failed to update user status');
                setSnackbarSeverity('error');
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            setSnackbarMessage('Failed to update user status');
            setSnackbarSeverity('error');
        } finally {
            setSnackbarOpen(true);
        }
    };

    const handleOpenAddStaffDialog = () => {
        setOpenAddStaffDialog(true);
    };

    const handleCloseAddStaffDialog = () => {
        setOpenAddStaffDialog(false);
        loadData(); // Reload the staff data after adding a new staff member
    };

    const handleOpenEditStaffDialog = (staff) => {
        setSelectedStaff(staff);
        setOpenEditStaffDialog(true);
    };

    const handleCloseEditStaffDialog = () => {
        setOpenEditStaffDialog(false);
        setSelectedStaff(null);
        loadData(); // Reload the staff data after editing a staff member
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                    Staff Management
                </Typography>
                <Button variant="contained" color="primary" onClick={handleOpenAddStaffDialog}>
                    Add Staff
                </Button>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={3}>
                <TextField
                    label="Search"
                    variant="outlined"
                    value={searchField}
                    onChange={handleSearch}
                />
            </Box>
            {error && (
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
            )}
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                    <TableHead sx={{ backgroundColor: 'primary.light', '& .MuiTableCell-root': { fontWeight: 'bold' } }}>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Collaboration Date</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell sx={{ color: 'primary.main' }}>Gender</TableCell> {/* Làm nhẹ nhàng cột Gender */}
                            <TableCell sx={{ color: 'primary.main' }}>Role</TableCell>   {/* Làm nhẹ nhàng cột Role */}
                            <TableCell>Status</TableCell>  {/* Đặt Status ở cuối */}
                            <TableCell>Actions</TableCell> {/* Cột cho các hành động như Edit */}
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ '& tr:nth-of-type(odd)': { backgroundColor: 'grey.100' }, '& tr:hover': { backgroundColor: 'grey.200' } }}>
                        {staff.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.phone}</TableCell>
                                <TableCell>{row.email || 'N/A'}</TableCell>
                                <TableCell>{formatDate(row.collaborationDate)}</TableCell>
                                <TableCell>{row.departmentName || 'N/A'}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    <Chip
                                        label={row.gender === false || row.gender === null ? 'Female' : 'Male'}
                                        color={row.gender === false || row.gender === null ? 'secondary' : 'primary'}
                                        variant="outlined"
                                        sx={{ fontWeight: 'medium', color: 'text.secondary' }}  // Màu sắc nhẹ nhàng hơn
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                    <Chip
                                        label={getRoleValue(row.role)}
                                        color="default"
                                        variant="outlined"
                                        sx={{ fontWeight: 'medium', color: 'text.secondary' }}  // Màu sắc nhẹ nhàng hơn
                                    />
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={row.isActive}
                                        onChange={() => handleStatusToggle(row.id, row.isActive)}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenEditStaffDialog(row)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={totalCount}
                page={pageIndex}
                onPageChange={handleChangePage}
                rowsPerPage={pageSize}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
                sx={{ '& .MuiTablePagination-toolbar': { justifyContent: 'space-between' } }}
            />
            <AddStaffDialog open={openAddStaffDialog} onClose={handleCloseAddStaffDialog} />
            <EditStaffDialog open={openEditStaffDialog} onClose={handleCloseEditStaffDialog} staff={selectedStaff} />
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Set vị trí ở góc trên bên phải
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default StaffManagement;
