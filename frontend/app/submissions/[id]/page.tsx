'use client';

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import { Contact, Document, NoteDetail, SubmissionStatus } from '@/lib/types';

const STATUS_COLORS: Record<SubmissionStatus, 'default' | 'primary' | 'success' | 'error'> = {
  new: 'primary',
  in_review: 'default',
  closed: 'success',
  lost: 'error',
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: 'New',
  in_review: 'In Review',
  closed: 'Closed',
  lost: 'Lost',
};

const PRIORITY_COLORS: Record<string, 'error' | 'warning' | 'default'> = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
      {count !== undefined && (
        <Chip label={count} size="small" sx={{ height: 20, fontSize: 12 }} />
      )}
    </Box>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="body1" fontWeight={600}>
              {contact.name}
            </Typography>
          </Box>
          {contact.role && (
            <Typography variant="body2" color="text.secondary">
              {contact.role}
            </Typography>
          )}
          <Divider />
          {contact.email && (
            <Box display="flex" alignItems="center" gap={1}>
              <EmailOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <MuiLink href={`mailto:${contact.email}`} variant="body2">
                {contact.email}
              </MuiLink>
            </Box>
          )}
          {contact.phone && (
            <Box display="flex" alignItems="center" gap={1}>
              <PhoneOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">{contact.phone}</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function DocumentRow({ doc }: { doc: Document }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      py={1.5}
      px={2}
      sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <ArticleOutlinedIcon sx={{ color: 'text.secondary' }} />
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {doc.fileUrl ? (
              <MuiLink href={doc.fileUrl} target="_blank" rel="noopener noreferrer" underline="hover">
                {doc.title}
              </MuiLink>
            ) : (
              doc.title
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {doc.docType}
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </Typography>
    </Box>
  );
}

function NoteItem({ note }: { note: NoteDetail }) {
  return (
    <Box py={2} sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { border: 0 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
        <Typography variant="body2" fontWeight={600}>
          {note.authorName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(note.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
        {note.body}
      </Typography>
    </Box>
  );
}

function DetailSkeleton() {
  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="80%" sx={{ mt: 2 }} />
          <Skeleton variant="text" width="75%" />
        </CardContent>
      </Card>
      <Card variant="outlined">
        <CardContent>
          <Skeleton variant="text" width="30%" height={32} />
          <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    </Stack>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';

  const { data: submission, isLoading, isError } = useSubmissionDetail(submissionId);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack spacing={4}>
        {/* Back navigation */}
        <Box>
          <MuiLink
            component={Link}
            href="/submissions"
            underline="none"
            display="flex"
            alignItems="center"
            gap={0.5}
            color="text.secondary"
            sx={{ '&:hover': { color: 'primary.main' } }}
          >
            <ArrowBackIcon fontSize="small" />
            <Typography variant="body2">Back to submissions</Typography>
          </MuiLink>
        </Box>

        {isError && (
          <Alert severity="error">
            Failed to load submission. The record may not exist or the backend is unavailable.
          </Alert>
        )}

        {isLoading && <DetailSkeleton />}

        {submission && (
          <>
            {/* Header / Summary card */}
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {submission.company.legalName}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                      {submission.company.industry && (
                        <Chip label={submission.company.industry} size="small" variant="outlined" />
                      )}
                      {submission.company.headquartersCity && (
                        <Chip
                          label={submission.company.headquartersCity}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={STATUS_LABELS[submission.status]}
                      color={STATUS_COLORS[submission.status]}
                    />
                    <Chip
                      label={submission.priority.charAt(0).toUpperCase() + submission.priority.slice(1)}
                      color={PRIORITY_COLORS[submission.priority] ?? 'default'}
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                      BROKER
                    </Typography>
                    <Typography variant="body1">{submission.broker.name}</Typography>
                    {submission.broker.primaryContactEmail && (
                      <MuiLink href={`mailto:${submission.broker.primaryContactEmail}`} variant="body2">
                        {submission.broker.primaryContactEmail}
                      </MuiLink>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                      OWNER
                    </Typography>
                    <Typography variant="body1">{submission.owner.fullName}</Typography>
                    <MuiLink href={`mailto:${submission.owner.email}`} variant="body2">
                      {submission.owner.email}
                    </MuiLink>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                      CREATED
                    </Typography>
                    <Typography variant="body2">
                      {new Date(submission.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                      LAST UPDATED
                    </Typography>
                    <Typography variant="body2">
                      {new Date(submission.updatedAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Grid>
                  {submission.summary && (
                    <Grid size={12}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                        SUMMARY
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                        {submission.summary}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Contacts */}
            <Box>
              <SectionHeader title="Contacts" count={submission.contacts.length} />
              {submission.contacts.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No contacts on record for this submission.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {submission.contacts.map((contact) => (
                    <Grid key={contact.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <ContactCard contact={contact} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* Documents */}
            <Box>
              <SectionHeader title="Documents" count={submission.documents.length} />
              {submission.documents.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No documents uploaded yet.
                </Typography>
              ) : (
                <Card variant="outlined" sx={{ overflow: 'hidden' }}>
                  {submission.documents.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} />
                  ))}
                </Card>
              )}
            </Box>

            {/* Notes */}
            <Box>
              <SectionHeader title="Notes" count={submission.notes.length} />
              {submission.notes.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No notes have been added yet.
                </Typography>
              ) : (
                <Card variant="outlined" sx={{ px: 2 }}>
                  {submission.notes.map((note) => (
                    <NoteItem key={note.id} note={note} />
                  ))}
                </Card>
              )}
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
}
