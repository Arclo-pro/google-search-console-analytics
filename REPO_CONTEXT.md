# google-search-console-analytics - ARQLO GSC Data Aggregation

## Role
**Helper Service** - Google Search Console data aggregation and analytics

## Intended Responsibilities
- Integrate with Google Search Console API
- Aggregate search performance data
- Track clicks, impressions, CTR, and position metrics
- Analyze query performance over time
- Identify trending queries and opportunities
- Detect search performance anomalies
- Provide GSC data to other ARQLO services

## Integration Points

### Database
- **Access**: Yes (via Drizzle ORM)
- **Tables**: Unknown (needs inspection)
- **Connection**: Via `DATABASE_URL` environment variable

### Queue
- **Uses queue-client**: Unknown (needs verification)
- **Pattern**: Likely HTTP-invoked for data requests

### KBase
- **Writes to kbase_events**: Unknown (needs verification)

### HTTP
- **Exposes REST API**: Yes (Express server)
- **Pattern**: Provides GSC data to workers and Hermes

## Service Name
`gsc-analytics` or `search-console`

## Always-On Runtime
**Yes** - Must be available for GSC data requests

## Key Files
- **Server**: Express REST API
- **Database Config**: `drizzle.config.ts`
- **Entry Point**: Unknown (needs inspection)

## Architecture Pattern
**Express REST + Drizzle ORM**:
- Express API server
- Drizzle ORM for database operations
- Google Search Console API integration

## Intended Capabilities
- GSC API data fetching
- Search query performance tracking
- Click and impression aggregation
- CTR (Click-Through Rate) analysis
- Average position tracking
- Query trend analysis
- Page-level search performance
- Device and country segmentation

## GSC Metrics Tracked (Expected)
- **Clicks**: Total clicks from search results
- **Impressions**: Total times pages appeared in search
- **CTR**: Click-through rate (clicks / impressions)
- **Position**: Average position in search results
- **Query**: Search terms triggering pages
- **Page**: URLs receiving search traffic
- **Device**: Desktop, mobile, tablet breakdown
- **Country**: Geographic performance

## Dependencies
- **Other Repos**:
  - Provides data to: Multiple workers needing GSC insights
  - Should write to: Woker-Knowledge-Base (kbase_events)
- **External**: Express, Drizzle ORM, googleapis (Google Search Console API)

## Environment Variables
- `DATABASE_URL` - Postgres connection string
- `PORT` - Express server port
- `GOOGLE_SERVICE_ACCOUNT_KEY` - GSC API credentials (JSON key)
- `GOOGLE_SITE_URL` - Website URL registered in GSC

## Maturity Level
**Level 1-2**: Functional service with Drizzle ORM integration

## Known Gaps
- **H4**: Needs code audit to verify full functionality
- **C1**: Integration pattern unclear (HTTP-only or queue-based)
- **L4**: No README or documentation
- Unclear how data is consumed by other services
