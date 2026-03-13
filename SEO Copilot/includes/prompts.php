<?php
/**
 * AI Prompts
 *
 * @package SEO_Copilot\Includes
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Expected JSON Schema:
 * {
 *   "title": "A captivating, SEO-optimized title max 60 chars",
 *   "description": "A compelling meta description max 160 chars including the keyword"
 * }
 */
define( 'SEO_COPILOT_PROMPT_GENERATE_META', "You are an expert SEO copywriter. Generate an optimized SEO meta title (max 60 characters) and meta description (max 160 characters) for the following content. Focus Keyword: %s.\n\nTitle: %s\nContent:\n%s\n\nReturn EXACTLY a valid JSON object matching this schema:\n{\n  \"title\": \"value\",\n  \"description\": \"value\"\n}" );

/**
 * Expected JSON Schema:
 * {
 *   "score": 85,
 *   "issues": [
 *     "Keyword not found in first paragraph.",
 *     "Content is too short."
 *   ]
 * }
 */
define( 'SEO_COPILOT_PROMPT_ANALYZE_CONTENT', "You are an expert SEO analyst. Analyze the following content for focus keyword optimization. Focus Keyword: %s.\n\nContent:\n%s\n\nReturn EXACTLY a valid JSON object matching this schema:\n{\n  \"score\": integer (0-100),\n  \"issues\": [\"Issue 1\", \"Issue 2\"]\n}" );

/**
 * Expected JSON Schema:
 * {
 *   "links": [
 *     {
 *       "target_title": "Title of the post to link to",
 *       "anchor_text": "Suggested anchor text found in the content",
 *       "context": "The sentence where the link should be placed"
 *     }
 *   ]
 * }
 */
define( 'SEO_COPILOT_PROMPT_SUGGEST_LINKS', "You are an expert SEO strategist. Suggest internal links from the provided content to the following list of other posts on the site.\n\nAvailable Post Titles:\n%s\n\nContent:\n%s\n\nReturn EXACTLY a valid JSON object matching this schema:\n{\n  \"links\": [\n    {\n      \"target_title\": \"value\",\n      \"anchor_text\": \"value\",\n      \"context\": \"value\"\n    }\n  ]\n}" );

/**
 * Expected JSON Schema:
 * {
 *   "@context": "https://schema.org",
 *   "@type": "Article",
 *   "headline": "...",
 *   ...
 * }
 */
define( 'SEO_COPILOT_PROMPT_SUGGEST_SCHEMA', "You are a Structured Data (JSON-LD) expert. Generate the most appropriate Schema.org JSON-LD markup for the following content and post type. Post Type: %s.\n\nContent:\n%s\n\nReturn EXACTLY the final valid JSON-LD object. Do not include formatting backticks or text blocks outside the JSON." );

/**
 * Expected JSON Schema:
 * {
 *   "assessment": "Detailed assessment of why traffic might be dropping",
 *   "action_items": [
 *     "Update statistics from 2021 to 2024",
 *     "Add a section answering user intent X"
 *   ]
 * }
 */
define( 'SEO_COPILOT_PROMPT_ANALYZE_DECAY', "You are an expert Content Refresh Strategist. Analyze this content which has experienced a drop in rankings/traffic. Data: %s.\n\nContent:\n%s\n\nReturn EXACTLY a valid JSON object matching this schema:\n{\n  \"assessment\": \"value\",\n  \"action_items\": [\"Action 1\", \"Action 2\"]\n}" );

/**
 * Expected JSON Schema:
 * {
 *   "conflicts": [
 *     {
 *       "keyword": "overlap keyword",
 *       "competing_posts": ["Post Title 1", "Post Title 2"],
 *       "recommendation": "Merge or differentiate..."
 *     }
 *   ]
 * }
 */
define( 'SEO_COPILOT_PROMPT_DETECT_CANNIBALIZATION', "You are an expert SEO analyst. Analyze the following list of posts (titles, URLs, and focus keywords) to detect keyword cannibalization.\n\nPosts Data:\n%s\n\nReturn EXACTLY a valid JSON object matching this schema:\n{\n  \"conflicts\": [\n    {\n      \"keyword\": \"value\",\n      \"competing_posts\": [\"value\"],\n      \"recommendation\": \"value\"\n    }\n  ]\n}" );

/**
 * Expected JSON Schema for SEO Brief:
 * {
 *   "recommended_title": "string",
 *   "recommended_meta_description": "string", 
 *   "recommended_word_count": number,
 *   "content_angle": "string",
 *   "target_audience": "string",
 *   "search_intent": "informational|commercial|transactional|navigational",
 *   "outline": [
 *     { "type": "H1", "text": "string", "notes": "what to cover here" }
 *   ],
 *   "must_include_keywords": ["kw1", "kw2"],
 *   "questions_to_answer": ["Q1", "Q2"],
 *   "recommended_schema_type": "string",
 *   "estimated_time_to_write": "string",
 *   "difficulty_to_rank": "Easy|Medium|Hard",
 *   "quick_win": boolean
 * }
 */
/**
 * Expected JSON Schema for Rewrite:
 * {
 *   "rewritten_text": "string",
 *   "explanation": "Why this is better"
 * }
 */
define( 'SEO_COPILOT_PROMPT_REWRITE_TEXT', "You are an expert copywriter and editor. Rewrite the following text to improve readability. Make it active, concise, and engaging without losing the original meaning. Target an 8th-grade reading level.\n\nText to rewrite:\n%s\n\nReturn EXACTLY a valid JSON object matching this schema:\n{\n  \"rewritten_text\": \"value\",\n  \"explanation\": \"value\"\n}" );

/**
 * Expected JSON Schema for Gap Analysis:
 * {
 *   "missing_topics": ["Topic 1", "Topic 2"],
 *   "missing_headings": ["H2: Specific topic"],
 *   "action_items": ["Expand on X", "Add a section for Y"],
 *   "overall_assessment": "Short paragraph analyzing the gap"
 * }
 */
define( 'SEO_COPILOT_PROMPT_ANALYZE_GAP', "You are an expert SEO Content Strategist. Compare our content with a top-ranking competitor's content to identify content gaps for the focus keyword.\n\nFocus Keyword: %s\n\nOur Content:\n%s\n\nCompetitor Data (JSON including scraped headings and text):\n%s\n\nReturn EXACTLY a valid JSON object matching this schema:\n{\n  \"missing_topics\": [\"string\"],\n  \"missing_headings\": [\"string\"],\n  \"action_items\": [\"string\"],\n  \"overall_assessment\": \"string\"\n}" );
