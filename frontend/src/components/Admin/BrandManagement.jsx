import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBrand, updateBrand, deleteBrand } from '../../redux/slices/brandSlice';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const BrandManagement = () => {
    const [newBrand, setNewBrand] = useState('');
    const [editingBrand, setEditingBrand] = useState(null);
    const dispatch = useDispatch();
    const brands = useSelector((state) => state.brands.brands);

    const handleAddBrand = (e) => {
        e.preventDefault();
        if (newBrand.trim() && !brands.includes(newBrand.trim())) {
            dispatch(addBrand(newBrand.trim()));
            setNewBrand('');
        }
    };

    const handleDeleteBrand = (brand) => {
        if (window.confirm(`Are you sure you want to delete the brand "${brand}"?`)) {
            dispatch(deleteBrand(brand));
        }
    };

    const handleEditBrand = (brand) => {
        setEditingBrand({ original: brand, edited: brand });
    };

    const handleSaveBrand = () => {
        if (editingBrand.edited.trim() && !brands.includes(editingBrand.edited.trim())) {
            dispatch(updateBrand(editingBrand));
        }
        setEditingBrand(null);
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Brand Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    label="New Brand"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    size="small"
                />
                <Button variant="contained" onClick={handleAddBrand}>
                    Add Brand
                </Button>
            </Box>
            <List>
                {brands.map((brand) => (
                    <ListItem key={brand}>
                        {editingBrand?.original === brand ? (
                            <TextField
                                value={editingBrand.edited}
                                onChange={(e) => setEditingBrand({ ...editingBrand, edited: e.target.value })}
                                size="small"
                                fullWidth
                            />
                        ) : (
                            <ListItemText primary={brand} />
                        )}
                        <ListItemSecondaryAction>
                            {editingBrand?.original === brand ? (
                                <IconButton edge="end" onClick={handleSaveBrand}>
                                    <SaveIcon />
                                </IconButton>
                            ) : (
                                <>
                                    <IconButton edge="end" onClick={() => handleEditBrand(brand)} sx={{ mr: 1 }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => handleDeleteBrand(brand)}>
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

export default BrandManagement; 