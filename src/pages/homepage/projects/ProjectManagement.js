import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Typography, Box, TextField, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TablePagination, IconButton, Button, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { ProfileContext } from "../../../context/ProfileContext";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Cookies from "js-cookie";
import { styled } from "@mui/material/styles";
import CreateProjectDialog from "../../../subscreen/projects/CreateDialog";

const rolesToApiTabs = {
    EMPLOYEE: 'IS_MINE',
    PM: 'IS_MANAGED',
    ADMIN: 'IS_ADMIN',
    DIRECTOR: 'IS_DEPARTMENT',
};

const statuses = [
    { value: 'NEW', label: 'New' },
    { value: 'IN_PROGRESS', label: 'In_Progress' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FINISHED', label: 'Finished' },
];

const Container = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
}));

const ProjectManagement = () => {
    const { profile } = useContext(ProfileContext);
    const userRole = profile.roles[0].code; // Assuming the user has only one role; adjust as needed
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [projects, setProjects] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(rolesToApiTabs[userRole]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const tab = searchParams.get('tab') || rolesToApiTabs[userRole];
        setActiveTab(tab);
    }, [searchParams, userRole]);

    useEffect(() => {
        fetchProjects();
    }, [activeTab, pageIndex, pageSize, searchTerm]);

    const fetchProjects = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/project', {
                params: {
                    tab: activeTab,
                    pageIndex: pageIndex + 1,
                    pageSize,
                    searchTerm,
                },
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setProjects(response.data.data);
            setTotalCount(response.data.paging.totalCount);
        } catch (error) {
            console.error('Error fetching projects', error);
        }
    };

    const handleDelete = async (id) => {
        const projectToDelete = projects.find(project => project.id === id);
        if (projectToDelete.status !== 'NEW') {
            setAlert({ open: true, message: 'Cannot delete projects with status other than NEW', severity: 'warning' });
            return;
        }

        try {
            const token = Cookies.get('token');
            await axios.delete(`http://localhost:8080/project/${id}`, {
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Authorization': `Bearer ${token}`,
                },
            });
            fetchProjects(); // Refresh the project list after deletion
        } catch (error) {
            console.error('Error deleting project', error);
        }
    };

    const formatDate = (epoch) => {
        const date = new Date(epoch);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPageIndex(0);
    };

    const handleChangePage = (event, newPage) => {
        setPageIndex(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setPageSize(parseInt(event.target.value, 10));
        setPageIndex(0);
    };

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleProjectCreated = (severity, message) => {
        setAlert({ open: true, message, severity });
        fetchProjects();
    };

    const handleAlertClose = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Project Management
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={3}>
                <TextField
                    label="Search"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleDialogOpen}
                >
                    Add Project
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Project Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Manager</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.id} hover onClick={() => navigate(`/project/${project.id}`)}>
                                <TableCell>{project.name}</TableCell>
                                <TableCell>{project.startDate !== null ? formatDate(project.startDate) : "N/A"}</TableCell>
                                <TableCell>{project.endDate !== null ? formatDate(project.endDate) : "N/A"}</TableCell>
                                <TableCell>
                                    {statuses.find(status => status.value === project.status)?.label}
                                </TableCell>
                                <TableCell>{project.manager}</TableCell>
                                <TableCell>
                                    {project.status === 'NEW' && (
                                        <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
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
            />
            <CreateProjectDialog open={dialogOpen} onClose={handleDialogClose} onProjectCreated={handleProjectCreated} />
            <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleAlertClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProjectManagement;
