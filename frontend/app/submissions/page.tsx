'use client';

import { Suspense } from 'react';
import { Box, CircularProgress, Container } from '@mui/material';

import SubmissionsContent from './SubmissionsContent';

function SubmissionsPageFallback() {
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    </Container>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<SubmissionsPageFallback />}>
      <SubmissionsContent />
    </Suspense>
  );
}
