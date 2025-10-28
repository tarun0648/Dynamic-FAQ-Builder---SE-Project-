class SearchService {
  constructor() {
    this.stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'what', 'when', 'where', 'who', 'how'
    ]);
  }

  // Tokenize and clean text
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  // Calculate term frequency
  calculateTF(term, tokens) {
    const count = tokens.filter(token => token === term).length;
    return count / tokens.length;
  }

  // Calculate inverse document frequency
  calculateIDF(term, documents) {
    const docsWithTerm = documents.filter(doc => 
      this.tokenize(doc.question + ' ' + doc.answer + ' ' + (doc.tags?.join(' ') || ''))
        .includes(term)
    ).length;
    
    return Math.log(documents.length / (docsWithTerm + 1));
  }

  // Calculate TF-IDF score
  calculateTFIDF(term, tokens, documents) {
    const tf = this.calculateTF(term, tokens);
    const idf = this.calculateIDF(term, documents);
    return tf * idf;
  }

  // Calculate cosine similarity
  cosineSimilarity(vec1, vec2) {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    
    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
  }

  // Rank FAQs based on search query
  rankFAQs(query, faqs) {
    if (!query || query.trim().length === 0) {
      return faqs;
    }

    const queryTokens = this.tokenize(query);
    const uniqueQueryTerms = [...new Set(queryTokens)];

    // Calculate scores for each FAQ
    const scoredFAQs = faqs.map(faq => {
      const faqText = `${faq.question} ${faq.answer} ${faq.tags?.join(' ') || ''}`;
      const faqTokens = this.tokenize(faqText);
      
      // Calculate TF-IDF scores
      let totalScore = 0;
      
      uniqueQueryTerms.forEach(term => {
        const tfidf = this.calculateTFIDF(term, faqTokens, faqs);
        totalScore += tfidf;
      });

      // Boost score if query terms appear in question (higher relevance)
      const questionTokens = this.tokenize(faq.question);
      const questionBoost = uniqueQueryTerms.filter(term => 
        questionTokens.includes(term)
      ).length * 2;

      // Boost score if exact phrase match
      const exactMatchBoost = faqText.toLowerCase().includes(query.toLowerCase()) ? 3 : 0;

      // Category match boost
      const categoryBoost = faq.category && 
        this.tokenize(faq.category).some(token => queryTokens.includes(token)) ? 1.5 : 0;

      // Tag match boost
      const tagBoost = faq.tags?.some(tag => 
        queryTokens.includes(tag.toLowerCase())
      ) ? 1.5 : 0;

      // Popularity boost (based on views and helpful votes)
      const popularityBoost = Math.log((faq.views || 0) + 1) * 0.1 + 
                             ((faq.helpful || 0) - (faq.notHelpful || 0)) * 0.2;

      const finalScore = totalScore + questionBoost + exactMatchBoost + 
                        categoryBoost + tagBoost + popularityBoost;

      return {
        ...faq,
        relevanceScore: finalScore
      };
    });

    // Filter out FAQs with very low relevance (score < 0.1)
    const relevantFAQs = scoredFAQs.filter(faq => faq.relevanceScore > 0.1);

    // Sort by relevance score
    return relevantFAQs.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // Fuzzy search for typos and similar words
  fuzzySearch(query, faqs, threshold = 0.7) {
    const queryTokens = this.tokenize(query);
    
    return faqs.filter(faq => {
      const faqText = this.tokenize(`${faq.question} ${faq.answer} ${faq.tags?.join(' ') || ''}`);
      
      return queryTokens.some(queryToken => {
        return faqText.some(faqToken => {
          const similarity = this.stringSimilarity(queryToken, faqToken);
          return similarity >= threshold;
        });
      });
    });
  }

  // Calculate string similarity (Levenshtein distance based)
  stringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Levenshtein distance calculation
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  // Get search suggestions
  getSearchSuggestions(query, faqs, limit = 5) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const suggestions = new Set();

    faqs.forEach(faq => {
      // Check question
      if (faq.question.toLowerCase().includes(lowerQuery)) {
        suggestions.add(faq.question);
      }

      // Check tags
      faq.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // Advanced search with filters
  advancedSearch(query, faqs, filters = {}) {
    let results = this.rankFAQs(query, faqs);

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      results = results.filter(faq => 
        faq.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply tag filter
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(faq =>
        filters.tags.some(tag => 
          faq.tags?.some(faqTag => 
            faqTag.toLowerCase() === tag.toLowerCase()
          )
        )
      );
    }

    // Apply date filter
    if (filters.dateFrom) {
      results = results.filter(faq => 
        faq.createdAt?.toDate() >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      results = results.filter(faq => 
        faq.createdAt?.toDate() <= new Date(filters.dateTo)
      );
    }

    return results;
  }

  // Highlight search terms in text
  highlightSearchTerms(text, query) {
    if (!query || !text) return text;

    const tokens = this.tokenize(query);
    let highlightedText = text;

    tokens.forEach(token => {
      const regex = new RegExp(`\\b${token}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, match => 
        `<mark class="bg-yellow-200 px-1 rounded">${match}</mark>`
      );
    });

    return highlightedText;
  }
}

export default new SearchService();
