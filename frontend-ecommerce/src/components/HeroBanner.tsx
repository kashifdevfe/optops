import { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Banner } from '../types';

interface HeroBannerProps {
    banners: Banner[];
}

export const HeroBanner = ({ banners }: HeroBannerProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    if (!banners || banners.length === 0) {
        return null;
    }

    const currentBanner = banners[currentIndex];

    return (
        <Box
            sx={{
                position: 'relative',
                height: { xs: '60vh', md: '80vh' },
                width: '100%',
                overflow: 'hidden',
                backgroundColor: '#000',
            }}
        >
            {/* Background Image */}
            <Box
                component="img"
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.7, // darken for text readability
                    transition: 'opacity 0.5s ease-in-out',
                }}
            />

            {/* Gradient Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
                }}
            />

            {/* Content */}
            <Container
                maxWidth="lg"
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: '#fff',
                    zIndex: 2,
                }}
            >
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        fontSize: { xs: '2.5rem', md: '4rem' },
                    }}
                >
                    {currentBanner.title}
                </Typography>
                {currentBanner.subtitle && (
                    <Typography
                        variant="h5"
                        sx={{
                            mb: 4,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                            fontSize: { xs: '1.2rem', md: '1.5rem' },
                            fontWeight: 300,
                        }}
                    >
                        {currentBanner.subtitle}
                    </Typography>
                )}
                {currentBanner.linkUrl && (
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate(currentBanner.linkUrl!)}
                        sx={{
                            bgcolor: 'primary.main',
                            color: '#000',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                                bgcolor: 'primary.light',
                            },
                        }}
                    >
                        Shop Now
                    </Button>
                )}
            </Container>

            {/* Navigation Controls only if multiple banners */}
            {banners.length > 1 && (
                <>
                    <IconButton
                        onClick={handlePrev}
                        sx={{
                            position: 'absolute',
                            left: 20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.3)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                            display: { xs: 'none', md: 'flex' },
                        }}
                    >
                        <ArrowBackIosNewIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleNext}
                        sx={{
                            position: 'absolute',
                            right: 20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.3)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
                            display: { xs: 'none', md: 'flex' },
                        }}
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>

                    {/* Indicators */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 30,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 1,
                        }}
                    >
                        {banners.map((_, index) => (
                            <Box
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: index === currentIndex ? 'primary.main' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s',
                                }}
                            />
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
};
