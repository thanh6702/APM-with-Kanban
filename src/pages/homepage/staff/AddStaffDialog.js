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
import axios from 'axios';  // Import axios để gọi API
import Cookies from 'js-cookie'; // Import Cookies để lấy token
import departments from "../../../constant/departments";  // Import danh sách departments

const roles = [
    { key: 'ADMIN', value: 'Admin' },
    { key: 'PM', value: 'Manager' },
    { key: 'EMPLOYEE', value: 'Employee' },
];

// Validation schema using Yup
const validationSchema = yup.object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    phoneNumber: yup.string().required('Phone number is required'),
    departmentId: yup.string().required('Department is required'),
    roles: yup.string().required('Role is required'),
    collaborationDate: yup.date().required('Collaboration Date is required'),
    gender: yup.boolean().required('Gender is required'),
});

const AddStaffDialog = ({ open, onClose }) => {
    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            dob: '',
            roles: '',
            isDirector: false,
            departmentId: '',
            collaborationDate: '',
            gender: true,  // Mặc định là nam
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                // Lấy token từ Cookies
                const token = Cookies.get('token');

                // Chuẩn bị dữ liệu gửi lên API
                const submissionData = {
                    ...values,
                    collaborationDate: values.collaborationDate ? new Date(values.collaborationDate).getTime() : null,
                };

                // Gọi API để tạo tài khoản người dùng
                const response = await axios.post('http://localhost:8080/auth/create-account', submissionData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 200) {
                    alert('User created successfully!');
                } else {
                    alert('Failed to create user');
                }

                // Sau khi gọi API thành công, đóng dialog và reload lại dữ liệu nhân viên
                onClose();
            } catch (error) {
                if (error.response && error.response.data && error.response.data.code === 40000001) {
                    alert('Email has already been existed in the system.');
                } else {
                    console.error('Error creating user:', error);
                    alert('An error occurred while creating the user.');
                }
            }
        },
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Staff</DialogTitle>
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
                                error={formik.touched.username && Boolean(formik.errors.username)}
                                helperText={formik.touched.username && formik.errors.username}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
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
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button type="submit" color="primary" onClick={formik.handleSubmit}>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddStaffDialog;
