import React, { useState, useContext } from 'react';
import { Box, Card, CardContent, Typography, Paper, Grid, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem, Button, TextField, Divider, Tooltip } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import UpdateIcon from '@mui/icons-material/Update';
import WorkIcon from '@mui/icons-material/Work';
import moment from 'moment';
import { ProfileContext } from '../../../context/ProfileContext';
import TaskDialog from "../task/TaskDialog";
import Worklog from "../task/WorkLog";

const KanbanBoard = ({ columns, fetchColumnsAndTasks, projectId }) => {
    const { profile } = useContext(ProfileContext);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [worklogDialogOpen, setWorklogDialogOpen] = useState(false); // New state for worklog dialog
    const [commentContent, setCommentContent] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [initialTask, setInitialTask] = useState(null);

    const handleOpenDialog = (task) => {
        setSelectedTask(task);
        setDialogOpen(true);
    };

    const handleOpenCommentsDialog = (task) => {
        setSelectedTask({
            ...task,
            comments: task.comments || [], // Ensure comments is always an array
        });
        setCommentContent(''); // Reset comment content when opening the dialog
        setEditCommentId(null); // Reset edit mode
        setCommentsDialogOpen(true);
    };

    const handleOpenWorklogDialog = (task) => {
        setSelectedTask(task);
        setWorklogDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedTask(null);
        setSelectedStatus('');
    };

    const handleCloseCommentsDialog = () => {
        setCommentsDialogOpen(false);
        setSelectedTask(null);
        setCommentContent(''); // Reset comment content
        setEditCommentId(null); // Reset edit mode
    };

    const handleCloseWorklogDialog = () => {
        setWorklogDialogOpen(false);
        setSelectedTask(null);
    };

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
    };

    const handleUpdateStatus = async () => {
        if (!selectedTask || !selectedStatus) return;

        try {
            const token = Cookies.get('token');
            await axios.put(
                `http://localhost:8080/task/${selectedTask.id}/update-column`,
                { columnId: selectedStatus },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );
            fetchColumnsAndTasks(projectId); // Reload the tasks after updating the status
            handleCloseDialog();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const token = Cookies.get('token');
            await axios.delete(`http://localhost:8080/task/${taskId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            fetchColumnsAndTasks(projectId); // Reload the tasks after deletion
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const isLastColumn = (taskColumnId) => {
        if (!columns || columns.length === 0) return false;
        const lastColumnId = columns[columns.length - 1].id;
        return taskColumnId === lastColumnId;
    };

    const isFirstColumn = (taskColumnId) => {
        if (!columns || columns.length === 0) return false;
        const firstColumnId = columns[0].id;
        return taskColumnId === firstColumnId;
    };

    const handleAddOrEditComment = async () => {
        setSubmitting(true);
        const token = Cookies.get('token');

        try {
            if (editCommentId) {
                // Update existing comment
                await axios.put(
                    `http://localhost:8080/task/comment/${editCommentId}/update`,
                    { comment: commentContent },
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }
                );
                setSelectedTask((prevTask) => ({
                    ...prevTask,
                    comments: prevTask.comments.map(comment =>
                        comment.id === editCommentId ? { ...comment, content: commentContent } : comment
                    ),
                }));
            } else {
                // Add new comment
                const response = await axios.post(
                    `http://localhost:8080/task/${selectedTask.id}/add-comment`,
                    { comment: commentContent },
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }
                );
                if (response.data.code === 200) {
                    const newComment = response.data.data;
                    setSelectedTask((prevTask) => ({
                        ...prevTask,
                        comments: [...(prevTask.comments || []), {
                            ...newComment,
                            user: {
                                ...newComment.user,
                                name: newComment.user.name || 'Unknown User'
                            }
                        }],
                    }));
                } else {
                    console.error('Error adding comment:', response.data);
                }
            }
            setCommentContent(''); // Clear the input after adding/editing a comment
            setEditCommentId(null); // Exit edit mode
        } catch (error) {
            console.error('Error adding/updating comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditComment = (comment) => {
        setEditCommentId(comment.id);
        setCommentContent(comment.content);
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const token = Cookies.get('token');
            await axios.delete(`http://localhost:8080/task/delete-comment/${commentId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setSelectedTask((prevTask) => ({
                ...prevTask,
                comments: prevTask.comments.filter(comment => comment.id !== commentId),
            }));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    // Open task dialog for creating a new task
    const handleOpenTaskDialog = () => {
        setInitialTask(null);
        setTaskDialogOpen(true);
    };

    // Open task dialog for editing an existing task
    const handleEditTask = (task) => {
        setInitialTask(task);
        setTaskDialogOpen(true);
    };

    const handleCloseTaskDialog = () => {
        setTaskDialogOpen(false);
    };

    const handleTaskSubmit = async (taskData) => {
        const token = Cookies.get('token');
        try {
            if (initialTask) {
                // Update existing task
                await axios.put(`http://localhost:8080/task/${initialTask.id}`, taskData, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            } else {
                // Create new task
                await axios.post('http://localhost:8080/task', taskData, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            }
            await fetchColumnsAndTasks(projectId); // Reload the tasks after task creation or update
            handleCloseTaskDialog(); // Close the task dialog
        } catch (error) {
            console.error('Error submitting task:', error);
        }
    };

    return (
        <Box display="flex" justifyContent="space-between" p={2}>
            {columns.map((column) => (
                <Paper key={column.id} elevation={3} sx={{ width: '24%', padding: 2, backgroundColor: '#f4f6f8' }}>
                    <Typography variant="h6" gutterBottom>
                        {column.name}
                    </Typography>
                    {column.tasks && column.tasks.length > 0 ? (
                        column.tasks.map((task) => (
                            <Card key={task.id} variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Name: {task.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Description: {task.description}
                                    </Typography>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <Typography variant="body2">
                                                Created by: {task.userResponse.name}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                Start Date: {moment(task.startDate).format('YYYY-MM-DD')}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2">
                                                End Date: {task.endDate !== null ? moment(task.endDate).format('YYYY-MM-DD') : 'N/A'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Tooltip title="Update Task Status">
                                        <IconButton
                                            onClick={() => handleOpenDialog(task)}
                                            sx={{ mt: 2 }}
                                            disabled={isLastColumn(column.id)}
                                        >
                                            <UpdateIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="View/Add Comments">
                                        <IconButton
                                            onClick={() => handleOpenCommentsDialog(task)}
                                            sx={{ mt: 2 }}
                                        >
                                            <CommentIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="View Worklog">
                                        <IconButton
                                            onClick={() => handleOpenWorklogDialog(task)}
                                            sx={{ mt: 2 }}
                                            disabled={isLastColumn(column.id)}
                                        >
                                            <WorkIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Task">
                                        <IconButton
                                            onClick={() => handleEditTask(task)}
                                            sx={{ mt: 2 }}
                                            disabled={isLastColumn(column.id) || task.userResponse.id !== profile.id} // Disable edit if it's in the last column or not created by the logged-in user
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Task">
                                        <IconButton
                                            onClick={() => handleDeleteTask(task.id)}
                                            sx={{ mt: 2 }}
                                            disabled={!isFirstColumn(column.id) || task.userResponse.id !== profile.id} // Disable delete if it's not in the first column or not created by the logged-in user
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            No tasks available
                        </Typography>
                    )}
                </Paper>
            ))}

            <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>Update Status</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            label="Status"
                        >
                            {columns.map((col) => (
                                <MenuItem key={col.id} value={col.id}>
                                    {col.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
                    <Button onClick={handleUpdateStatus} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={commentsDialogOpen} onClose={handleCloseCommentsDialog} fullWidth maxWidth="sm">
                <DialogTitle>Comments for {selectedTask?.title}</DialogTitle>
                <DialogContent>
                    {selectedTask?.comments && selectedTask.comments.length > 0 ? (
                        selectedTask.comments.map((comment, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="body2" color="textSecondary">
                                    {comment.user ? comment.user.name : 'Unknown User'} ({moment(comment.createdAt).format('YYYY-MM-DD HH:mm')})
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                    {comment.content}
                                </Typography>
                                {comment.user?.id === profile?.id && (
                                    <Box sx={{ display: 'flex', mt: 1 }}>
                                        <Tooltip title="Edit Comment">
                                            <IconButton onClick={() => handleEditComment(comment)} size="small">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Comment">
                                            <IconButton onClick={() => handleDeleteComment(comment.id)} size="small">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                                {index < selectedTask.comments.length - 1 && <Divider sx={{ my: 2 }} />}
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            No comments available
                        </Typography>
                    )}
                    <TextField
                        label={editCommentId ? "Edit comment" : "Add a comment"}
                        fullWidth
                        multiline
                        rows={4}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        variant="outlined"
                        sx={{ mt: 2 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={handleAddOrEditComment}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : editCommentId ? 'Update Comment' : 'Add Comment'}
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCommentsDialog} color="primary">Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={worklogDialogOpen} onClose={handleCloseWorklogDialog} fullWidth maxWidth="md">
                <DialogTitle>Worklog for {selectedTask?.name}</DialogTitle>
                <DialogContent>
                    {selectedTask && <Worklog taskId={selectedTask.id} canEdit={profile && selectedTask.userResponse?.id === profile.id} taskName={selectedTask.name} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseWorklogDialog} color="primary">Close</Button>
                </DialogActions>
            </Dialog>

            <TaskDialog
                open={taskDialogOpen}
                onClose={handleCloseTaskDialog}
                onSubmit={handleTaskSubmit}
                task={initialTask}
            />
        </Box>
    );
};

export default KanbanBoard;
