import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, Typography, Toolbar, AppBar } from '@mui/material';
import axios from 'axios';
import Cookies from "js-cookie";
import KanbanBoard from './KanbanBoard';
import { ProfileContext } from "../../../context/ProfileContext";
import ProjectSelectionPopup from "./ProjectBoard";
import TaskDialog from "../task/TaskDialog";

const Board = () => {
    const { profile } = useContext(ProfileContext);
    const [open, setOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedProjectName, setSelectedProjectName] = useState(''); // Lưu tên dự án đã chọn
    const [columns, setColumns] = useState([]);
    const [firstLoad, setFirstLoad] = useState(true);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);

    useEffect(() => {
        const savedProject = Cookies.get('currentProject');
        if (savedProject) {
            const project = JSON.parse(savedProject);
            setSelectedProject(project.id);
            setSelectedProjectName(project.name);
            fetchColumnsAndTasks(project.id);
        } else {
            fetchProjects();
        }
    }, []);

    useEffect(() => {
        if (firstLoad && projects.length > 0 && !selectedProject) {
            setOpen(true);
            setFirstLoad(false); // Đảm bảo rằng popup sẽ không xuất hiện lần sau
        }
    }, [projects, firstLoad, selectedProject]);

    const fetchProjects = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/project', {
                params: {
                    tab: 'IS_MANAGED',
                    statuses: ['IN_PROGRESS', 'PENDING', 'FINISHED'].join(','),
                },
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setProjects(response.data.data);
        } catch (error) {
            console.error('Error fetching projects', error);
        }
    };

    const fetchColumnsAndTasks = async (projectId) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:8080/project/${projectId}/column`, {
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const columnsData = response.data.data.sort((a, b) => a.order - b.order); // Sắp xếp các cột theo thứ tự
            const columnsWithTasks = await Promise.all(
                columnsData.map(async (column) => {
                    const tasksResponse = await axios.get(`http://localhost:8080/task/column/${column.id}/task`, {
                        headers: {
                            Accept: 'application/json, text/plain, */*',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    return { ...column, tasks: tasksResponse.data.data || [] };
                })
            );
            setColumns(columnsWithTasks);
        } catch (error) {
            console.error('Error fetching columns and tasks', error);
        }
    };

    const handleProjectSelect = (projectId) => {
        const selectedProject = projects.find(project => project.id === projectId);
        setSelectedProject(projectId);
        setSelectedProjectName(selectedProject.name); // Cập nhật tên dự án đã chọn
        Cookies.set('currentProject', JSON.stringify(selectedProject)); // Lưu thông tin project vào cookies
        fetchColumnsAndTasks(projectId);
        setOpen(false); // Đóng popup sau khi chọn project
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenTaskDialog = () => {
        setTaskDialogOpen(true);
    };

    const handleCloseTaskDialog = () => {
        setTaskDialogOpen(false);
    };

    const handleTaskSubmit = async (taskData) => {
        const token = Cookies.get('token');
        try {
            // Create new task
            await axios.post('http://localhost:8080/task', taskData, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            await fetchColumnsAndTasks(selectedProject); // Fetch updated tasks
            setTaskDialogOpen(false); // Close the task dialog
        } catch (error) {
            console.error('Error submitting task:', error);
        }
    };

    return (
        <Box sx={{ p: 3, position: 'relative', backgroundColor: '#eaeff1', minHeight: '100vh' }}>
            <AppBar position="static" color="transparent" elevation={0}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {selectedProjectName ? `Kanban Board For Project: ${selectedProjectName}` : 'Kanban Board For Project'}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleOpenTaskDialog} disabled={!selectedProject}>
                        Create Task
                    </Button>
                    {!selectedProject && (
                        <Button variant="contained" color="secondary" onClick={handleClickOpen}>
                            Select Project
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <ProjectSelectionPopup
                open={open}
                onClose={handleClose}
                onConfirm={handleProjectSelect}
                projects={projects}
            />
            {selectedProject && columns.length > 0 && (
                <KanbanBoard columns={columns} fetchColumnsAndTasks={fetchColumnsAndTasks} projectId={selectedProject} />
            )}
            <TaskDialog
                open={taskDialogOpen}
                onClose={handleCloseTaskDialog}
                onSubmit={handleTaskSubmit}
                task={null} // Pass null to indicate creation of a new task
            />
        </Box>
    );
};

export default Board;
