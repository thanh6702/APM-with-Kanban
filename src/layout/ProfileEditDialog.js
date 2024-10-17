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
import departments from "../constant/departments";  // Import danh sách departments
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
    dob: yup.date().required('Date of Birth is required'),
});

const ProfileEditDialog = ({ open, onClose, profile }) => {
    // Tìm role đầu tiên từ profile
    const matchedRole = roles.find(role => role.key === profile?.roles?.[0]?.code) || {};

    // Tìm department dựa trên id của profile
    const matchedDepartment = departments.find(department => department.id === profile?.departmentId) || {};

    const formik = useFormik({
        initialValues: {
            username: profile?.userName || '',
            firstName: profile?.firstName || '',
            lastName: profile?.lastName || '',
            phoneNumber: profile?.phone || '',
            dob: profile?.dob ? new Date(profile?.dob).toISOString().substring(0, 10) : '',
            roles: matchedRole.key || '',  // Sử dụng key của role nếu tìm thấy
            departmentId: matchedDepartment.id || '',  // Sử dụng id của department nếu tìm thấy
        },
        validationSchema: validationSchema,
        enableReinitialize: true,  // Cập nhật lại form khi profile thay đổi
        onSubmit: async (values) => {
            try {
                const token = Cookies.get('token');

                // Chuẩn bị dữ liệu gửi lên API
                const submissionData = {
                    ...values,
                    dob: values.dob ? new Date(values.dob).getTime() : null,
                };

                // Gọi API để cập nhật tài khoản người dùng
                const response = await axios.put(`http://localhost:8080/user/${profile.id}`, submissionData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    alert('Profile updated successfully!');
                } else {
                    alert('Failed to update profile');
                }

                // Sau khi gọi API thành công, đóng dialog và reload lại dữ liệu profile
                onClose();
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('An error occurred while updating the profile.');
            }
        },
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Profile</DialogTitle>
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
                                id="dob"
                                name="dob"
                                label="Date of Birth"
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={formik.values.dob}
                                onChange={formik.handleChange}
                                error={formik.touched.dob && Boolean(formik.errors.dob)}
                                helperText={formik.touched.dob && formik.errors.dob}
                            />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button type="submit" color="primary" onClick={formik.handleSubmit}>
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProfileEditDialog;
