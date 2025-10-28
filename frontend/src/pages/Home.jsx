import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Alert, 
  Chip,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
  Tooltip,
  Fade,
  Skeleton
} from '@mui/material';
import SearchBar from '../components/User/SearchBar';
import FAQDisplay from '../components/User/FAQDisplay';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { useFAQ } from '../contexts/FAQContext';
import searchService from '../services/searchService';
import faqService from '../services/faqService';
import { 
  HelpOutline, 
  TipsAndUpdates, 
  AutoAwesome,
  TrendingUp,
  Visibility,
  ThumbUp,
  Schedule,
  Category as CategoryIcon,
  ArrowForward,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Home = () => {
  const { faqs, loading } = useFAQ();
  const [filteredFAQs, setFilteredFAQs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: 'all' });
  const [popularQuestions, setPopularQuestions] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // Load FAQs when component mounts or faqs change
  useEffect(() => {
    handleSearch(searchQuery, filters);
  }, [faqs]);

  // Load popular questions on mount
  useEffect(() => {
    loadPopularQuestions();
  }, []);

  const loadPopularQuestions = async () => {
    try {
      setLoadingPopular(true);
      const qaHistory = await faqService.getAllAIQA();
      
      // Calculate score and sort
      const scored = qaHistory.map(qa => ({
        ...qa,
        score: (qa.views || 0) + (qa.upvotes || 0) * 5 - (qa.downvotes || 0) * 2
      }));
      
      // Sort by score and take top 10
      const sorted = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      setPopularQuestions(sorted);
    } catch (error) {
      console.error('Error loading popular questions:', error);
      setPopularQuestions([]);
    } finally {
      setLoadingPopular(false);
    }
  };

  const handleSearch = (query, filterOptions = filters) => {
    setSearchQuery(query);
    setFilters(filterOptions);

    if (!query || query.trim().length === 0) {
      // No search query, apply only filters
      let results = faqs;
      if (filterOptions.category !== 'all') {
        results = results.filter(faq => faq.category === filterOptions.category);
      }
      setFilteredFAQs(results);
    } else {
      // Apply search with ranking
      const results = searchService.advancedSearch(query, faqs, filterOptions);
      setFilteredFAQs(results);
    }
  };

  const handleAIResponse = (response) => {
    // This is called by SearchBar when AI generates an answer
    // We don't need to do anything special here
  };

  const handlePopularQuestionClick = async (qa) => {
    try {
      console.log('Clicked question:', qa);
      
      // 1. Set the question in search bar
      setSearchQuery(qa.question);
      
      // 2. Increment view count in Firebase
      await faqService.incrementAIQAViews(qa.id);
      
      // 3. Update local state to reflect new view count
      setPopularQuestions(prev => 
        prev.map(q => 
          q.id === qa.id 
            ? { ...q, views: (q.views || 0) + 1 }
            : q
        )
      );
      
      // 4. Filter FAQs based on the question
      handleSearch(qa.question, filters);
      
      // 5. Scroll to top smoothly to see the search results
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
      
      // 6. Show success message
      toast.success('Question loaded! Click "Ask AI" to see the saved answer.', {
        position: 'bottom-right',
        autoClose: 3000
      });
      
    } catch (error) {
      console.error('Error loading popular question:', error);
      toast.error('Failed to load question. Please try again.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  const getRankColor = (index) => {
    if (index === 0) return 'primary';
    if (index === 1) return 'secondary';
    if (index === 2) return 'success';
    return 'default';
  };

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '📌';
  };

  if (loading) return <LoadingSpinner message="Loading FAQs..." />;

  // FIXED: Proper logic to determine if we should show empty state
  const shouldShowEmptyState = !searchQuery && filteredFAQs.length === 0;
  const shouldShowSearchNoResults = searchQuery && filteredFAQs.length === 0;

  return (
    <Box sx={{ minHeight: '80vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <HelpOutline sx={{ fontSize: 80, color: 'white', mb: 2 }} />
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Ask Anything!
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.95)',
              mb: 4,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Type your question and get instant AI-powered answers with relevant FAQs ranked by intelligence
          </Typography>

          {/* Feature Pills */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
            <Chip
              icon={<AutoAwesome />}
              label="AI-Powered Answers"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            />
            <Chip
              icon={<TipsAndUpdates />}
              label="Smart FAQ Filtering"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            />
            <Chip
              label="Instant Results"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            />
          </Box>
        </Box>

        {/* Search Section */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            mb: 4,
            background: 'white'
          }}
        >
          <SearchBar
            faqs={faqs}
            onSearch={handleSearch}
            onFilterChange={(filterOptions) => handleSearch(searchQuery, filterOptions)}
            onAIResponse={handleAIResponse}
          />
        </Paper>

        {/* Info Section - Only show when FAQs exist and no search */}
        {!searchQuery && filteredFAQs.length > 0 && (
          <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.95)' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                    🤖 Ask AI
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type any question and click "Ask AI" to get instant, intelligent answers powered by Google Gemini
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                    🔍 Smart Filtering
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    FAQs automatically filtered and ranked by relevance using TF-IDF algorithm
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                    ⚡ Real-time
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Results update instantly with Firebase real-time synchronization
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Home;
