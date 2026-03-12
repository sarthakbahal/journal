# Technical Architecture Documentation

## System Overview

The AI-Assisted Journal System is designed as a scalable, microservices-ready application with clean separation of concerns. This document outlines the technical architecture and strategies for production deployment.

## Current Architecture

### 1. Frontend Architecture (React + Vite)
- **Component-Based Design**: Modular React components for reusability
- **State Management**: Local component state with useState hooks
- **API Layer**: Centralized axios client for all backend communication
- **Build Tool**: Vite for fast development and optimized production builds

### 2. Backend Architecture (Node.js + Express)
- **MVC Pattern**: Controllers handle business logic, Models define data structure, Routes define endpoints
- **Service Layer**: LLM integration abstracted into dedicated service classes
- **Middleware Stack**: CORS, rate limiting, error handling, and request parsing
- **Database Layer**: MongoDB with Mongoose ODM for schema validation

### 3. Data Flow
```
Frontend → API Layer → Express Routes → Controllers → Services → Database
                                   ↓
                              LLM Service → Groq API
```

## Scaling to 100k Users

### 1. Horizontal Scaling Strategy

**Load Balancing**
```
Internet → Load Balancer → [App Server 1, App Server 2, App Server N]
```

- Deploy multiple Express.js instances behind a load balancer (nginx, AWS ALB)
- Implement sticky sessions for user state management
- Use PM2 cluster mode for Node.js process management

**Database Scaling**
```
Application Layer → MongoDB Replica Set
                 → Read Replicas (for analytics queries)
                 → Sharding (by userId hash)
```

- **Read Replicas**: Route analytics/insights queries to read-only replicas
- **Sharding Strategy**: Shard by `userId` hash to distribute user data evenly
- **Connection Pooling**: Implement connection pooling to handle concurrent requests

**Caching Layer**
```
Application → Redis Cache → MongoDB
           → CDN (static assets)
```

- **Redis Cluster**: Distributed caching for session data and frequent queries
- **CDN**: CloudFlare/AWS CloudFront for static asset delivery
- **Application-Level Caching**: Cache user insights and frequent database queries

### 2. Infrastructure Recommendations

**Containerization & Orchestration**
- Docker containers for consistent deployment
- Kubernetes for orchestration and auto-scaling
- Helm charts for configuration management

**Cloud Architecture (AWS Example)**
```
Route 53 → CloudFront → ALB → ECS/EKS → RDS/DocumentDB
                           → ElastiCache
                           → S3 (static files)
```

**Auto-Scaling Configuration**
- CPU-based scaling: Scale when CPU > 70%
- Memory-based scaling: Scale when memory > 80%
- Queue-based scaling: Scale based on pending LLM analysis requests

### 3. Performance Optimization

**Database Optimization**
- **Indexes**: Compound index on `(userId, createdAt)` for fast user queries
- **Aggregation Pipelines**: Pre-computed insights using MongoDB aggregation
- **TTL Indexes**: Auto-expire old cache entries

**API Optimization**
- **Pagination**: Implement cursor-based pagination for large datasets
- **Field Selection**: Allow clients to specify required fields
- **Compression**: gzip compression for API responses

## LLM Cost Reduction Strategies

### 1. Intelligent Caching System

**Multi-Level Caching**
```javascript
// Cache hierarchy
1. In-Memory Cache (NodeCache) → 1 hour TTL
2. Redis Cache → 24 hour TTL  
3. Database Cache → permanent storage
```

**Cache Key Strategy**
```javascript
const cacheKey = `analysis_${sha256(text.toLowerCase().trim())}_v2`;
```

**Implementation Benefits**
- Identical text analysis cached indefinitely
- Similar content detection using text similarity algorithms
- Version-based cache invalidation for model updates

### 2. Conditional Analysis

**Smart Analysis Triggers**
```javascript
const shouldAnalyze = (text) => {
  return text.length > 50 && // Minimum meaningful content
         !containsOnlyCommonWords(text) && // Skip generic entries
         !isFromCache(text); // Skip if cached
};
```

**Batch Processing**
- Queue multiple analysis requests
- Process in batches during off-peak hours
- Reduce API calls by 40-60%

### 3. Model Selection Strategy

**Tiered Model Usage**
```javascript
const selectModel = (textLength, complexity) => {
  if (textLength < 100) return 'llama3-8b-8192'; // Fast, cheap
  if (complexity < 0.5) return 'mixtral-8x7b'; // Balanced
  return 'llama-70b'; // Complex analysis only
};
```

**Cost Optimization Results**
- **Caching**: 70-80% cache hit rate reduces API calls
- **Batching**: 50% cost reduction through batch processing
- **Model Selection**: 30% cost savings using appropriate models

### 4. Alternative LLM Strategies

**Local Model Integration**
```javascript
// Fallback to local models for basic analysis
const localAnalysis = await ollama.analyze(text, {
  model: 'llama2-7b',
  temperature: 0.3
});
```

**Hybrid Approach**
- Local models for basic emotion detection
- Cloud models for complex analysis and summaries
- 60-70% cost reduction while maintaining quality

## Repeated Analysis Caching

### 1. Redis-Based Caching Architecture

**Cache Structure**
```redis
Key: analysis:{hash}
Value: {
  emotion: "calm",
  keywords: ["nature", "peace"],
  summary: "User felt peaceful",
  timestamp: 1678901234,
  version: "v2.1"
}
TTL: 86400 seconds (24 hours)
```

**Hash Generation Strategy**
```javascript
const generateCacheKey = (text) => {
  const normalized = text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .trim();
  
  return `analysis:${crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex')
    .substring(0, 16)}`;
};
```

### 2. Intelligent Cache Management

**Cache Warming**
```javascript
// Pre-populate cache with common patterns
const commonPatterns = [
  "I feel calm and peaceful",
  "Today was stressful",
  "Nature made me feel better"
];

await warmCache(commonPatterns);
```

**Cache Analytics**
```javascript
// Monitor cache performance
const cacheStats = {
  hitRate: cache.getStats().hits / cache.getStats().requests,
  missRate: cache.getStats().misses / cache.getStats().requests,
  avgResponseTime: monitorResponseTime()
};
```

### 3. Advanced Caching Features

**Semantic Similarity Caching**
```javascript
// Cache similar content analysis
const findSimilarCache = async (text) => {
  const embedding = await generateEmbedding(text);
  const similarKeys = await redis.vectorSearch(embedding, 0.85);
  return similarKeys.length > 0 ? await redis.get(similarKeys[0]) : null;
};
```

**Distributed Cache Synchronization**
- Redis Cluster for high availability
- Cross-region replication for global deployment
- Consistent hashing for cache distribution

## Sensitive Data Protection

### 1. Data Encryption Strategy

**Encryption at Rest**
```javascript
// MongoDB field-level encryption
const journalSchema = new mongoose.Schema({
  userId: String,
  text: { 
    type: String, 
    encrypt: true // Automatic encryption
  },
  emotion: String,
  createdAt: Date
});
```

**Application-Level Encryption**
```javascript
const crypto = require('crypto');

const encryptSensitiveData = (text) => {
  const cipher = crypto.createCipher('aes-256-gcm', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    data: encrypted,
    tag: cipher.getAuthTag()
  };
};
```

### 2. Network Security

**HTTPS Enforcement**
```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
});
```

**API Security Headers**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: { maxAge: 31536000 }
}));
```

### 3. Access Control & Authentication

**JWT Implementation**
```javascript
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'journal-app',
    audience: 'journal-users'
  });
};
```

**Role-Based Access Control**
```javascript
const authorize = (roles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 4. Database Security

**MongoDB Security Configuration**
```javascript
// Connection with security options
mongoose.connect(process.env.MONGO_URI, {
  ssl: true,
  authSource: 'admin',
  retryWrites: true,
  w: 'majority',
  readPreference: 'primaryPreferred'
});
```

**Data Access Patterns**
```javascript
// Audit logging for sensitive operations
const auditLog = {
  userId: req.user.id,
  action: 'READ_JOURNAL',
  resource: entryId,
  timestamp: new Date(),
  ip: req.ip
};

await AuditLog.create(auditLog);
```

### 5. Privacy Compliance

**GDPR Compliance Features**
```javascript
// Right to be forgotten
const deleteUserData = async (userId) => {
  await Journal.deleteMany({ userId });
  await cache.del(`user:${userId}:*`);
  await auditLog.create({
    action: 'DATA_DELETION',
    userId,
    timestamp: new Date()
  });
};

// Data export
const exportUserData = async (userId) => {
  const userData = await Journal.find({ userId }).lean();
  return {
    entries: userData,
    exportDate: new Date(),
    format: 'JSON'
  };
};
```

## Monitoring & Observability

### 1. Application Metrics
- **Response Time**: API endpoint performance
- **Cache Hit Rate**: LLM caching effectiveness
- **Error Rate**: Application health monitoring
- **User Activity**: Journal creation patterns

### 2. Infrastructure Monitoring
- **CPU/Memory Usage**: Resource utilization
- **Database Performance**: Query execution time
- **Network Latency**: Regional performance
- **Cost Tracking**: LLM API usage and costs

### 3. Alerting Strategy
- **High Error Rate**: > 5% error rate
- **Slow Response**: > 2s API response time
- **Cache Miss Rate**: < 60% cache hit rate
- **LLM Costs**: Daily spend > threshold

This architecture provides a robust foundation for scaling to enterprise levels while maintaining performance, security, and cost-effectiveness.