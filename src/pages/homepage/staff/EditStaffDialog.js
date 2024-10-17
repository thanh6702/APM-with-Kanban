import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    Grid,
    MenuItem,
    InputLabel,
    Select,
    FormControl
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import Cookies from 'js-cookie';
import departments from "../../../constant/departments";  // Import danh sách departments

const roles = [
    { key: 'ADMIN', value: 'Admin' },
    { key: 'PM', value: 'Manager' },
    { key: 'EMPLOYEE', value: 'Employee' },
];

// Validation schema using Yup
const validationSchema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    phoneNumber: yup.string().required('Phone number is required'),
    departmentId: yup.string().required('Department is required'),
    roles: yup.string().required('Role is required'),
    collaborationDate: yup.date().required('Collaboration Date is required'),
    gender: yup.boolean().required('Gender is required'),
});

const EditStaffDialog = ({ open, onClose, staff }) => {
    // Find role based on staff key
    const matchedRole = roles.find(role => role.key === staff?.role) || {};

    // Find department based on staff name
    const matchedDepartment = departments.find(department => department.name.trim() === staff?.departmentName?.trim()) || {};

    const formik = useFormik({
        initialValues: {
            username: staff?.email || '',
            firstName: staff?.firstName || '',
            lastName: staff?.lastName || '',
            phoneNumber: staff?.phone || '',
            dob: staff?.dob || '',
            roles: matchedRole.key || '',  // Use role key if found
            isDirector: staff?.isDirector || false,
            departmentId: matchedDepartment.id || '',  // Use department id if found
            collaborationDate: staff?.collaborationDate ? new Date(staff.collaborationDate).toISOString().split('T')[0] : '',
            gender: staff?.gender ?? true,  // Default to male if gender is not defined
        },
        validationSchema: validationSchema,
        enableReinitialize: true,  // Reinitialize form when staff changes
        onSubmit: async (values) => {
            try {
                const token = Cookies.get('token');

                // Prepare data to send to API
                const submissionData = {
                    ...values,
                    collaborationDate: values.collaborationDate ? new Date(values.collaborationDate).getTime() : null,
                };

                // Call API to update user account
                const response = await axios.put(`http://localhost:8080/user/${staff.id}`, submissionData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    alert('User updated successfully!');
                } else {
                    alert('Failed to update user');
                }

                // Close dialog and reload staff data
                onClose();
            } catch (error) {
                console.error('Error updating user:', error);
                alert('An error occurred while updating the user.');
            }
        },
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogContent>
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="username"
                                name="username"
                                label="Username"
                                value={formik.values.username}
                                onChange={formik.handleChange}
                                disabled  // Disable the username field
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="firstName"
                                name="firstName"
                                label="First Name"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                helperText={formik.touched.firstName && formik.errors.firstName}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="lastName"
                                name="lastName"
                                label="Last Name"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                helperText={formik.touched.lastName && formik.errors.lastName}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="phoneNumber"
                                name="phoneNumber"
                                label="Phone Number"
                                value={formik.values.phoneNumber}
                                onChange={formik.handleChange}
                                error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                                helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="role-label">Role</InputLabel>
                                <Select
                                    labelId="role-label"
                                    id="roles"
                                    name="roles"
                                    value={formik.values.roles}
                                    onChange={formik.handleChange}
                                    error={formik.touched.roles && Boolean(formik.errors.roles)}
                                    label="Role"
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role.key} value={role.key}>
                                            {role.value}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="department-label">Department</InputLabel>
                                <Select
                                    labelId="department-label"
                                    id="departmentId"
                                    name="departmentId"
                                    value={formik.values.departmentId}
                                    onChange={formik.handleChange}
                                    error={formik.touched.departmentId && Boolean(formik.errors.departmentId)}
                                    label="Department"
                                >
                                    {departments.map((dept) => (
                                        <MenuItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="collaborationDate"
                                name="collaborationDate"
                                label="Collaboration Date"
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={formik.values.collaborationDate}
                                onChange={formik.handleChange}
                                error={formik.touched.collaborationDate && Boolean(formik.errors.collaborationDate)}
                                helperText={formik.touched.collaborationDate && formik.errors.collaborationDate}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="gender-label">Gender</InputLabel>
                                <Select
                                    labelId="gender-label"
                                    id="gender"
                                    name="gender"
                                    value={formik.values.gender}
                                    onChange={formik.handleChange}
                                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                                    label="Gender"
                                >
                                    <MenuItem value={true}>Male</MenuItem>
                                    <MenuItem value={false}>Female</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <DialogActions>
                        <Button onClick={onClose} color="secondary">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary">
                            Update
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditStaffDialog;
