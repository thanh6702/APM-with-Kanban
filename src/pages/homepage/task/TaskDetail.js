import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Typography,
    TextField,
    Button,
    IconButton,
    Avatar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Grid
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import {ProfileContext} from "../../../context/ProfileContext";
import Worklog from "./WorkLog";

const TaskDetail = () => {
    const { id } = useParams();
    const { profile } = useContext(ProfileContext);
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [columns, setColumns] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editCommentContent, setEditCommentContent] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [users, setUsers] = useState([]);
    const [lowestStatus, setLowestStatus] = useState(null);
    const [highestStatus, setHighestStatus] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        fetchTaskDetail();
        fetchColumns();
    }, [id]);

    useEffect(() => {
        if (task) {
            fetchUsers();
        }
    }, [task]);

    const fetchTaskDetail = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:8080/task/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setTask(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching task detail:', error);
            setLoading(false);
        }
    };

    const fetchColumns = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(`http://localhost:8080/task/${id}/column`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const columnsData = response.data.data.sort((a, b) => a.order - b.order);
            setColumns(columnsData);
            setLowestStatus(columnsData.reduce((min, column) => column.order < min.order ? column : min, columnsData[0]));
            setHighestStatus(columnsData.reduce((max, column) => column.order > max.order ? column : max, columnsData[0]));
        } catch (error) {
            console.error('Error fetching columns:', error);
        }
    };

    const fetchUsers = async (searchField = '') => {
        setLoadingUsers(true);
        try {
            const token = Cookies.get('token');
            const response = await axios.get('http://localhost:8080/user/search', {
                params: { searchField },
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const saveChanges = async () => {
        try {
            const token = Cookies.get('token');
            await axios.put(
                `http://localhost:8080/task/${id}`,
                { ...task },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );
            fetchTaskDetail(); // Fetch lại thông tin task sau khi lưu thành công
            setAlert({ open: true, message: 'Changes saved successfully', severity: 'success' });
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving changes:', error);
            setAlert({ open: true, message: 'Failed to save changes', severity: 'error' });
        }
    };

    const handleAddComment = async () => {
        setSubmitting(true);
        try {
            const token = Cookies.get('token');
            const response = await axios.post(
                `http://localhost:8080/task/${id}/add-comment`,
                { comment: commentContent },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );
            if (response.data.code === 200) {
                const newComment = response.data.data;
                setTask(prevTask => ({
                    ...prevTask,
                    comments: [...prevTask.comments, {
                        ...newComment,
                        user: {
                            ...newComment.user,
                            name: newComment.user.name || 'Unknown User'
                        }
                    }]
                }));
                setCommentContent('');
                setAlert({ open: true, message: 'Comment added successfully', severity: 'success' });
            } else {
                console.error('Error adding comment:', response.data);
                setAlert({ open: true, message: 'Failed to add comment', severity: 'error' });
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            setAlert({ open: true, message: 'Failed to add comment', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditComment = (comment) => {
        setEditCommentContent(comment.content);
        setEditCommentId(comment.id);
        setDialogOpen(true);
    };

    const handleUpdateComment = async () => {
        try {
            const token = Cookies.get('token');
            await axios.put(
                `http://localhost:8080/task/comment/${editCommentId}/update`,
                { comment: editCommentContent },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );
            setTask(prevTask => ({
                ...prevTask,
                comments: prevTask.comments.map(comment => comment.id === editCommentId ? { ...comment, content: editCommentContent } : comment)
            }));
            setDialogOpen(false);
            setAlert({ open: true, message: 'Comment updated successfully', severity: 'success' });
        } catch (error) {
            console.error('Error updating comment:', error);
            setAlert({ open: true, message: 'Failed to update comment', severity: 'error' });
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const token = Cookies.get('token');
            await axios.delete(`http://localhost:8080/task/delete-comment/${commentId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setTask(prevTask => ({
                ...prevTask,
                comments: prevTask.comments.filter(comment => comment.id !== commentId)
            }));
            setAlert({ open: true, message: 'Comment deleted successfully', severity: 'success' });
        } catch (error) {
            console.error('Error deleting comment:', error);
            setAlert({ open: true, message: 'Failed to delete comment', severity: 'error' });
        }
    };

    const handleColumnChange = async (event) => {
        const columnId = event.target.value;
        try {
            const token = Cookies.get('token');
            await axios.put(
                `http://localhost:8080/task/${id}/update-column`,
                { columnId },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );
            setTask(prevTask => ({ ...prevTask, status: columns.find(column => column.id === columnId).name }));
            setAlert({ open: true, message: 'Status updated successfully', severity: 'success' });
        } catch (error) {
            console.error('Error updating status:', error);
            setAlert({ open: true, message: 'Failed to update status', severity: 'error' });
        }
    };

    const handleInputChange = (field, value) => {
        setTask(prevTask => ({ ...prevTask, [field]: value }));
    };

    const handleAssignToChange = async (event) => {
        const userId = event.target.value;
        const user = users.find(user => user.id === userId);
        try {
            const token = Cookies.get('token');
            await axios.put(
                `http://localhost:8080/task/${id}`,
                { userResponse: user },
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );
            setTask(prevTask => ({
                ...prevTask,
                userResponse: user
            }));
            setAlert({ open: true, message: 'Assigned user updated successfully', severity: 'success' });
        } catch (error) {
            console.error('Error updating assigned user:', error);
            setAlert({ open: true, message: 'Failed to update assigned user', severity: 'error' });
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            saveChanges();
        } else {
            setIsEditing(true);
        }
    };

    const handleTabChange = (event, newIndex) => {
        setTabIndex(newIndex);
    };

    const isTaskCompleted = task && task.endDate !== null;
    const canEdit = task && columns.find(column => column.name === task.status)?.order === lowestStatus?.order && task.userResponse.id === profile.id;
    const canUpdateStatus = task && columns.find(column => column.name === task.status)?.order !== highestStatus?.order;

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {task ? (
                <Card sx={{ width: '100%', mx: 'auto', p: 2 }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tab label="Detail" />
                        <Tab label="Worklog" />
                    </Tabs>
                    <Divider />
                    {tabIndex === 0 && (
                        <CardContent>
                            <Grid container spacing={2} sx={{ my: 2 }}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={columns.find(column => column.name === task.status)?.id || ''}
                                            onChange={handleColumnChange}
                                            label="Status"
                                            disabled={!canUpdateStatus}
                                        >
                                            {columns.map(column => (
                                                <MenuItem key={column.id} value={column.id}>{column.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Assigned To</InputLabel>
                                        <Select
                                            value={task.userResponse ? task.userResponse.id : ''}
                                            onChange={handleAssignToChange}
                                            onOpen={() => fetchUsers()}
                                            onClose={() => setUsers([])}
                                            label="Assigned To"
                                            disabled={isTaskCompleted || !isEditing}
                                        >
                                            {loadingUsers ? (
                                                <MenuItem disabled>Loading...</MenuItem>
                                            ) : (
                                                users.map(user => (
                                                    <MenuItem key={user.id} value={user.id}>{user.name} ({user.phoneNumber})</MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Name"
                                        fullWidth
                                        value={task.name}
                                        variant="outlined"
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Description"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={task.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        variant="outlined"
                                        disabled={isTaskCompleted || !isEditing || task.userResponse.id !== profile.id}
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        fullWidth
                                        value={task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleInputChange('startDate', new Date(e.target.value).getTime())}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="End Date"
                                        type="date"
                                        fullWidth
                                        value={task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleInputChange('endDate', new Date(e.target.value).getTime())}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Estimated End Date"
                                        type="date"
                                        fullWidth
                                        value={task.estimatedEndDate ? new Date(task.estimatedEndDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleInputChange('estimatedEndDate', new Date(e.target.value).getTime())}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        disabled={isTaskCompleted || !isEditing}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        color="primary"
                                        onClick={toggleEdit}
                                        disabled={!canEdit}
                                    >
                                        {isEditing ? <SaveIcon /> : <EditIcon />}
                                        {isEditing ? 'Save' : 'Edit'}
                                    </Button>
                                </Grid>
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Comments
                            </Typography>
                            {task.comments && task.comments.map(comment => (
                                <Box key={comment.id} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Avatar sx={{ mr: 2 }}>{comment.user && comment.user.name ? comment.user.name.charAt(0) : 'U'}</Avatar>
                                        <Typography variant="body2" color="textSecondary">
                                            {comment.user && comment.user.name ? comment.user.name : 'Unknown User'}
                                        </Typography>
                                        <IconButton onClick={() => handleEditComment(comment)} disabled={isTaskCompleted}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteComment(comment.id)} disabled={isTaskCompleted}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body1">
                                        {comment.content}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                </Box>
                            ))}
                            <TextField
                                label="Add a comment"
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
                                onClick={handleAddComment}
                                disabled={submitting || isTaskCompleted}
                            >
                                {submitting ? 'Submitting...' : 'Add Comment'}
                            </Button>
                        </CardContent>
                    )}
                    {tabIndex === 1 && (
                        <Worklog taskId={id} canEdit={profile && task && profile.id === task.userResponse?.id && columns.find(column => column.name === task.status)?.order !== highestStatus?.order} taskName={task.name}  />
                    )}

                </Card>
            ) : (
                <Typography variant="body1">Task not found.</Typography>
            )}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Comment</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="primary">Cancel</Button>
                    <Button onClick={handleUpdateComment} color="primary">Update</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TaskDetail;
