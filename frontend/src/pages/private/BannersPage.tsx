import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Alert,
    Switch,
    FormControlLabel,
    Card,
    CardMedia,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { bannerApi } from '../../services/api.js';
import type { Banner, CreateBannerDto } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const BannersPage: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [imagePreview, setImagePreview] = useState<string>('');

    const [formData, setFormData] = useState<CreateBannerDto>({
        title: '',
        subtitle: '',
        imageUrl: '',
        linkUrl: '',
        isActive: true,
        sortOrder: 0,
    });

    const loadingRef = useRef(false);

    useEffect(() => {
        if (loadingRef.current) return;
        loadBanners();
    }, []);

    const loadBanners = async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        try {
            setLoading(true);
            const data = await bannerApi.getBanners();
            setBanners(data || []);
            setError('');
        } catch (err: any) {
            console.error('Error loading banners:', err);
            setError('Failed to load banners');
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    };

    const compressImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }

                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedBase64);
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Image file is too large. Please select an image smaller than 10MB.');
                return;
            }

            try {
                const compressedBase64 = await compressImage(file);
                setFormData({ ...formData, imageUrl: compressedBase64 });
                setImagePreview(compressedBase64);
                setError('');
            } catch (err) {
                setError('Failed to process image');
                console.error(err);
            }
        }
    };

    const handleOpenDialog = (banner?: Banner) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title,
                subtitle: banner.subtitle || '',
                imageUrl: banner.imageUrl,
                linkUrl: banner.linkUrl || '',
                isActive: banner.isActive,
                sortOrder: banner.sortOrder,
            });
            setImagePreview(banner.imageUrl);
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                subtitle: '',
                imageUrl: '',
                linkUrl: '',
                isActive: true,
                sortOrder: 0,
            });
            setImagePreview('');
        }
        setDialogOpen(true);
        setError('');
        setSuccess('');
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingBanner(null);
        setImagePreview('');
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');

            if (!formData.title.trim()) {
                setError('Title is required');
                return;
            }

            if (!formData.imageUrl) {
                setError('Image is required');
                return;
            }

            const submitData = {
                title: formData.title,
                subtitle: formData.subtitle || undefined,
                imageUrl: formData.imageUrl,
                linkUrl: formData.linkUrl || undefined,
                isActive: formData.isActive,
                sortOrder: formData.sortOrder,
            };

            if (editingBanner) {
                await bannerApi.updateBanner(editingBanner.id, submitData);
                setSuccess('Banner updated successfully');
            } else {
                await bannerApi.createBanner(submitData);
                setSuccess('Banner created successfully');
            }

            handleCloseDialog();
            setTimeout(loadBanners, 300);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save banner');
        }
    };

    const handleDelete = async () => {
        if (!bannerToDelete) return;
        try {
            await bannerApi.deleteBanner(bannerToDelete);
            setDeleteDialogOpen(false);
            setBannerToDelete(null);
            loadBanners();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete banner');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>Banners</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Add Banner
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Image</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Subtitle</TableCell>
                            <TableCell>Link</TableCell>
                            <TableCell>Order</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {banners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No banners found</TableCell>
                            </TableRow>
                        ) : (
                            banners.map((banner) => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        <CardMedia
                                            component="img"
                                            image={banner.imageUrl}
                                            alt={banner.title}
                                            sx={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell>{banner.title}</TableCell>
                                    <TableCell>{banner.subtitle || '-'}</TableCell>
                                    <TableCell>{banner.linkUrl || '-'}</TableCell>
                                    <TableCell>{banner.sortOrder}</TableCell>
                                    <TableCell>
                                        <Switch checked={banner.isActive} disabled />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleOpenDialog(banner)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => { setBannerToDelete(banner.id); setDeleteDialogOpen(true); }} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Subtitle"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Link URL"
                                value={formData.linkUrl}
                                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                placeholder="e.g., /products/sunglasses"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Sort Order"
                                value={formData.sortOrder}
                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="banner-image-upload"
                                type="file"
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="banner-image-upload">
                                <Button variant="outlined" component="span" fullWidth>
                                    Upload Image
                                </Button>
                            </label>
                            {imagePreview && (
                                <Box sx={{ mt: 2 }}>
                                    <Card>
                                        <CardMedia
                                            component="img"
                                            image={imagePreview}
                                            alt="Preview"
                                            sx={{ maxHeight: 300, objectFit: 'contain' }}
                                        />
                                    </Card>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.title || !formData.imageUrl}>
                        {editingBanner ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Banner</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this banner? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
