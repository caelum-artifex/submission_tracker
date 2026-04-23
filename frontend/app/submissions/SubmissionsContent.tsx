'use client';

import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Container,
  InputAdornment,
  MenuItem,
  Pagination,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import NoteOutlinedIcon from '@mui/icons-material/NoteOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionListItem, SubmissionStatus } from '@/lib/types';

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

const STATUS_COLORS: Record<SubmissionStatus, 'default' | 'primary' | 'success' | 'error'> = {
  new: 'primary',
  in_review: 'default',
  closed: 'success',
  lost: 'error',
};

const PRIORITY_COLORS: Record<string, 'error' | 'warning' | 'default'> = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

function StatusChip({ status }: { status: SubmissionStatus }) {
  const label = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
  return <Chip label={label} color={STATUS_COLORS[status]} size="small" />;
}

function PriorityChip({ priority }: { priority: string }) {
  return (
    <Chip
      label={priority.charAt(0).toUpperCase() + priority.slice(1)}
      color={PRIORITY_COLORS[priority] ?? 'default'}
      size="small"
      variant="outlined"
    />
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 7 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton variant="text" width={j === 0 ? 160 : 80} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function SubmissionRow({ row }: { row: SubmissionListItem }) {
  return (
    <TableRow
      hover
      component={Link}
      href={`/submissions/${row.id}`}
      sx={{ cursor: 'pointer', textDecoration: 'none', '& td': { verticalAlign: 'middle' } }}
    >
      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {row.company.legalName}
        </Typography>
        {row.company.headquartersCity && (
          <Typography variant="caption" color="text.secondary" display="block">
            {row.company.headquartersCity}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2">{row.broker.name}</Typography>
      </TableCell>
      <TableCell>
        <StatusChip status={row.status} />
      </TableCell>
      <TableCell>
        <PriorityChip priority={row.priority} />
      </TableCell>
      <TableCell>
        <Typography variant="body2">{row.owner.fullName}</Typography>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title={`${row.documentCount} document${row.documentCount !== 1 ? 's' : ''}`}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <DescriptionOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">{row.documentCount}</Typography>
            </Stack>
          </Tooltip>
          <Tooltip title={`${row.noteCount} note${row.noteCount !== 1 ? 's' : ''}`}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <NoteOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">{row.noteCount}</Typography>
            </Stack>
          </Tooltip>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

export default function SubmissionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = (searchParams.get('status') ?? '') as SubmissionStatus | '';
  const brokerId = searchParams.get('brokerId') ?? '';
  const companySearch = searchParams.get('companySearch') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      if (!('page' in updates)) {
        params.delete('page');
      }
      router.push(`/submissions?${params.toString()}`);
    },
    [router, searchParams],
  );

  const filters = useMemo(
    () => ({
      status: (status as SubmissionStatus) || undefined,
      brokerId: brokerId || undefined,
      companySearch: companySearch || undefined,
    }),
    [status, brokerId, companySearch],
  );

  const submissionsQuery = useSubmissionsList(filters, page);
  const brokerQuery = useBrokerOptions();

  const totalPages = submissionsQuery.data
    ? Math.ceil(submissionsQuery.data.count / PAGE_SIZE)
    : 0;

  const hasFilters = !!(status || brokerId || companySearch);

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Submissions
          </Typography>
          <Typography color="text.secondary" mt={0.5}>
            Browse and filter incoming broker-submitted opportunities.
          </Typography>
        </Box>

        {/* Filter bar */}
        <Card variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => updateParams({ status: e.target.value })}
              size="small"
              sx={{ minWidth: 160 }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value || 'all'} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Broker"
              value={brokerId}
              onChange={(e) => updateParams({ brokerId: e.target.value })}
              size="small"
              sx={{ minWidth: 200 }}
              disabled={brokerQuery.isLoading}
              InputProps={
                brokerQuery.isLoading
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          <CircularProgress size={16} />
                        </InputAdornment>
                      ),
                    }
                  : undefined
              }
            >
              <MenuItem value="">All brokers</MenuItem>
              {brokerQuery.data?.map((broker) => (
                <MenuItem key={broker.id} value={String(broker.id)}>
                  {broker.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Search company"
              value={companySearch}
              onChange={(e) => updateParams({ companySearch: e.target.value })}
              size="small"
              sx={{ minWidth: 220 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              placeholder="Company name…"
            />

            {hasFilters && (
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                onClick={() => router.push('/submissions')}
              >
                Clear filters
              </Typography>
            )}
          </Stack>
        </Card>

        {/* Results */}
        <Box>
          {submissionsQuery.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load submissions. Please check that the backend is running and try again.
            </Alert>
          )}

          {submissionsQuery.data && !submissionsQuery.isLoading && (
            <Typography variant="body2" color="text.secondary" mb={1}>
              {submissionsQuery.data.count === 0
                ? 'No results'
                : `${submissionsQuery.data.count} submission${submissionsQuery.data.count !== 1 ? 's' : ''}`}
            </Typography>
          )}

          <Card variant="outlined" sx={{ overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Broker</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Activity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissionsQuery.isLoading && <SkeletonRows />}

                  {!submissionsQuery.isLoading &&
                    submissionsQuery.data?.results.map((row) => (
                      <SubmissionRow key={row.id} row={row} />
                    ))}

                  {!submissionsQuery.isLoading && submissionsQuery.data?.results.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary" fontWeight={500}>
                          No submissions match the current filters.
                        </Typography>
                        {hasFilters && (
                          <Typography
                            variant="body2"
                            color="primary"
                            sx={{ cursor: 'pointer', mt: 1 }}
                            onClick={() => router.push('/submissions')}
                          >
                            Clear all filters
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => updateParams({ page: String(value) })}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
