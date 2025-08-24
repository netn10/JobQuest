# Learning Resources

## Overview

The Learning Resources feature allows users to add and manage educational content to their learning journey. Users can manually add resources or use the AI-powered URL analysis to automatically extract information from learning resource URLs.

## Features

### Manual Resource Addition
Users can manually add learning resources by filling out a form with:
- Title
- Description
- URL
- Type (Article, Video, Tutorial, Course, Book, Project, Podcast)
- Difficulty Level (Beginner, Intermediate, Advanced, Expert)
- Estimated Time (in minutes)
- Tags (comma-separated)
- Source

### AI-Powered URL Analysis
The system includes an intelligent URL analysis feature that automatically extracts information from learning resource URLs.

#### How it Works
1. User pastes a URL into the form
2. Clicks the search/analyze button
3. The system uses OpenAI to analyze the URL content
4. Form fields are automatically populated with extracted information

#### Supported URL Types
- **YouTube URLs**: Automatically classified as VIDEO type
- **Documentation sites** (react.dev, docs, etc.): Classified as ARTICLE or TUTORIAL
- **Course platforms** (Udemy, Coursera, etc.): Classified as COURSE
- **GitHub repositories**: Classified as PROJECT
- **Podcast platforms**: Classified as PODCAST

#### Analysis Capabilities
The AI analyzer extracts:
- **Title**: From the page content or URL
- **Description**: Brief summary of the resource content
- **Type**: Appropriate resource type based on platform/content
- **Difficulty**: Estimated difficulty level
- **Estimated Time**: Based on content length and complexity
- **Tags**: Relevant keywords and topics
- **Source**: Platform or website name

### Resource Management
- Track learning progress
- Mark resources as started, in progress, or completed
- Add personal notes and ratings
- Filter and search resources by type, difficulty, and status

## API Endpoints

### GET /api/learning/resources
Retrieves learning resources with optional filtering.

**Query Parameters:**
- `userId`: User ID for personalized progress
- `type`: Filter by resource type
- `difficulty`: Filter by difficulty level
- `status`: Filter by completion status
- `search`: Search in title, description, and tags

### POST /api/learning/resources
Creates new resources or updates learning progress.

**For creating resources:**
```json
{
  "action": "create",
  "userId": "user_id",
  "title": "Resource Title",
  "description": "Resource description",
  "url": "https://example.com",
  "type": "ARTICLE",
  "difficulty": "BEGINNER",
  "estimatedTime": 30,
  "tags": ["tag1", "tag2"],
  "source": "Source Name"
}
```

### POST /api/learning/analyze-url
Analyzes a URL to extract learning resource information.

**Request:**
```json
{
  "url": "https://example.com/learning-resource"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "title": "Extracted Title",
    "description": "Resource description",
    "type": "ARTICLE",
    "difficulty": "BEGINNER",
    "estimatedTime": 30,
    "tags": ["tag1", "tag2"],
    "source": "Source Name"
  }
}
```

## Usage Examples

### Adding a YouTube Tutorial
1. Paste YouTube URL: `https://www.youtube.com/watch?v=example`
2. Click analyze button
3. System automatically detects it as a VIDEO type
4. Form is populated with extracted information
5. Review and adjust if needed
6. Save the resource

### Adding a Documentation Article
1. Paste documentation URL: `https://react.dev/learn/example`
2. Click analyze button
3. System detects it as an ARTICLE or TUTORIAL
4. Form is populated with extracted information
5. Save the resource

## Error Handling

The system includes comprehensive error handling:
- Invalid URL format validation
- OpenAI API error fallbacks
- User-friendly error messages via toast notifications
- Graceful degradation when analysis fails

## Future Enhancements

Potential improvements for the learning resources feature:
- Batch URL analysis for multiple resources
- Integration with popular learning platforms
- Automatic progress tracking based on URL visits
- Personalized difficulty recommendations
- Social sharing of learning resources
- Integration with calendar for scheduling learning sessions
