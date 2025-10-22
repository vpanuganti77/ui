import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import { Send, Person, AdminPanelSettings } from '@mui/icons-material';

interface Comment {
  id: string;
  comment: string;
  author: string;
  role: 'admin' | 'tenant';
  createdAt: string;
}

interface ComplaintCommentsProps {
  complaintId: string;
  comments: Comment[];
  onAddComment: (comment: string) => void;
  currentUser: {
    name: string;
    role: 'admin' | 'tenant';
  };
}

const ComplaintComments: React.FC<ComplaintCommentsProps> = ({
  complaintId,
  comments,
  onAddComment,
  currentUser
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        Comments ({comments.length})
      </Typography>

      {/* Comments List */}
      <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 3 }}>
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No comments yet. Be the first to add a comment!
          </Typography>
        ) : (
          comments.map((comment, index) => (
            <Paper
              key={comment.id}
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: comment.role === 'admin' ? '#f3f4f6' : '#e3f2fd'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: comment.role === 'admin' ? 'primary.main' : 'secondary.main'
                  }}
                >
                  {comment.role === 'admin' ? (
                    <AdminPanelSettings fontSize="small" />
                  ) : (
                    <Person fontSize="small" />
                  )}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {comment.author}
                    </Typography>
                    <Chip
                      label={comment.role === 'admin' ? 'Admin' : 'Tenant'}
                      size="small"
                      color={comment.role === 'admin' ? 'primary' : 'secondary'}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(comment.createdAt)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {comment.comment}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Box>

      {/* Add Comment Form */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Send />}
              disabled={!newComment.trim() || isSubmitting}
              size="small"
            >
              {isSubmitting ? 'Adding...' : 'Add Comment'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ComplaintComments;