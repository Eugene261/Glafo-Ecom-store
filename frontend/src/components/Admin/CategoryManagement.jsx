import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCategory, updateCategory, deleteCategory } from '../../redux/slices/categorySlice';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const CategoryManagement = () => {
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const dispatch = useDispatch();
    const categories = useSelector((state) => state.categories.categories);

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            dispatch(addCategory(newCategory.trim()));
            setNewCategory('');
        }
    };

    const handleDeleteCategory = (category) => {
        if (window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
            dispatch(deleteCategory(category));
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory({ original: category, edited: category });
    };

    const handleSaveCategory = () => {
        if (editingCategory.edited.trim() && !categories.includes(editingCategory.edited.trim())) {
            dispatch(updateCategory(editingCategory));
        }
        setEditingCategory(null);
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Category Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="New Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    size="small"
                />
                <Button variant="contained" onClick={handleAddCategory}>
                    Add Category
                </Button>
            </Box>
            <List>
                {categories.map((category) => (
                    <ListItem key={category}>
                        {editingCategory?.original === category ? (
                            <TextField
                                value={editingCategory.edited}
                                onChange={(e) => setEditingCategory({ ...editingCategory, edited: e.target.value })}
                                size="small"
                                fullWidth
                            />
                        ) : (
                            <ListItemText primary={category} />
                        )}
                        <ListItemSecondaryAction>
                            {editingCategory?.original === category ? (
                                <IconButton edge="end" onClick={handleSaveCategory}>
                                    <SaveIcon />
                                </IconButton>
                            ) : (
                                <>
                                    <IconButton edge="end" onClick={() => handleEditCategory(category)} sx={{ mr: 1 }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => handleDeleteCategory(category)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            )}
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default CategoryManagement; 