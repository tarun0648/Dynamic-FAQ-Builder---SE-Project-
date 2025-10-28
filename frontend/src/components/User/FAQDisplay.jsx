import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  ExpandMore,
  SmartToy,
  Visibility,
  Category
} from '@mui/icons-material';
import { useFAQ } from '../../contexts/FAQContext';
import geminiService from '../../services/geminiService';
import { toast } from 'react-toastify';

const FAQDisplay = ({ faq, searchQuery }) => {
  const [expanded, setExpanded] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const { incrementViews, markAsHelpful, markAsNotHelpful } = useFAQ();

  const handleExpand = () => {
    if (!expanded) {
      incrementViews(faq.id);
    }
    setExpanded(!expanded);
  };

  const handleGetAIResponse = async () => {
    setAiModalOpen(true);
    setLoadingAI(true);
    
    try {
      const response = await geminiService.generateResponse(searchQuery || faq.question, {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        tags: faq.tags
      });
      setAiResponse(response);
    } catch (error) {
      toast.error('Failed to get AI response');
      console.error(error);
    } finally {
      setLoadingAI(false);
    }
  };

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  return (
    <>
      <Card
        sx={{
          mb: 2,
          transition: 'all 0.3s',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{ fontWeight: 600, flex: 1, cursor: 'pointer' }}
              onClick={handleExpand}
              dangerouslySetInnerHTML={{ __html: highlightText(faq.question) }}
            />
            <IconButton
              onClick={handleExpand}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }}
            >
              <ExpandMore />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {faq.category && (
              <Chip
                icon={<Category />}
                label={faq.category}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {faq.tags?.map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
            {faq.relevanceScore && (
              <Chip
                label={`${Math.round(faq.relevanceScore * 100)}% Match`}
                size="small"
                color="success"
                variant="filled"
              />
            )}
          </Box>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Typography
              variant="body1"
              sx={{ mb: 2, color: 'text.secondary', lineHeight: 1.7 }}
              dangerouslySetInnerHTML={{ __html: highlightText(faq.answer) }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility fontSize="small" /> {faq.views || 0} views
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => markAsHelpful(faq.id)}
                  sx={{ color: 'success.main' }}
                >
                  <ThumbUp fontSize="small" />
                </IconButton>
                <Typography variant="caption">{faq.helpful || 0}</Typography>
                <IconButton
                  size="small"
                  onClick={() => markAsNotHelpful(faq.id)}
                  sx={{ color: 'error.main' }}
                >
                  <ThumbDown fontSize="small" />
                </IconButton>
                <Typography variant="caption">{faq.notHelpful || 0}</Typography>
              </Box>

              <Button
                variant="contained"
                size="small"
                startIcon={<SmartToy />}
                onClick={handleGetAIResponse}
                sx={{
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Get AI Response
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* AI Response Modal */}
      <Dialog
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy />
          AI-Enhanced Response
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {loadingAI ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Generating AI response...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                Original Question:
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                {faq.question}
              </Typography>
              
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                AI-Enhanced Answer:
              </Typography>
              <Typography
                variant="body1"
                sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}
              >
                {aiResponse}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FAQDisplay;
