# AWS Integration Checklist

## S3

### Access Control

- Are bucket policies using least-privilege access? No `s3:*` or `Principal: *` unless the bucket is intentionally public.
- Is S3 Object Ownership set to "bucket owner enforced" (default) to disable ACLs?
- Are presigned URLs used for client-side uploads/downloads instead of making objects public?
  - Presigned URLs should have short expiration times (5-15 minutes for uploads, longer for download links if needed)
  - Are presigned URL permissions scoped to specific objects (not entire buckets)?

### Encryption

- Is server-side encryption enabled? SSE-S3 is the default and sufficient for most cases. Use SSE-KMS when you need custom key management or audit trails on key usage.
- Is HTTPS enforced for all S3 access? Check the bucket policy for a condition denying non-SSL requests.

### Lifecycle & Cost

- Are lifecycle rules configured to transition infrequently accessed objects to cheaper storage classes (S3 Infrequent Access, Glacier)?
- Is there an expiration rule for temporary uploads (e.g., incomplete multipart uploads older than 7 days)?
- Are versioning and lifecycle rules aligned? Versioning without expiration for old versions is a cost trap.

### Application Integration

- Is the S3 SDK configured with proper error handling and retries?
- Are file uploads validated on the server (file type, size limits) before generating presigned URLs?
- Is the CORS configuration on the bucket restrictive to only the application's origins?

## Cognito

### User Pool Configuration

- Is MFA enabled (at minimum: optional for regular users, required for admin roles)?
- Is the password policy strong (minimum length 12+, require mixed case, numbers, symbols)?
- Is adaptive authentication enabled to flag risky sign-in attempts?
- Are unused app clients removed?
- Is account recovery configured appropriately (email/SMS verification)?

### Token Handling

- Are Cognito tokens stored securely (HTTP-only cookies, not localStorage)?
- Is token refresh handled automatically before expiration?
- Is the access token validated on the backend using Cognito's JWKS endpoint (not by decoding the JWT without verification)?
- Are token scopes and claims used for authorization — not just the presence of a valid token?
- Is the ID token used only for identity information (not as an API authorization token)?

### Security

- Is a WAF web ACL configured on the Cognito User Pool for DDoS protection?
- Are pre-authentication and post-authentication Lambda triggers used for custom security logic (IP allowlisting, logging, etc.)?
- Are sign-up and sign-in API calls rate-limited at the application level (in addition to Cognito's built-in limits)?

## RDS (PostgreSQL)

### Instance Configuration

- Is Multi-AZ enabled for production? Without it, a single AZ failure takes down the database.
- Is the instance class appropriate for the workload? Check CPU and memory utilization in CloudWatch — consistently over 80% means the instance is undersized.
- Is storage auto-scaling enabled?

### Security

- Is `rds.force_ssl = 1` set in the parameter group to enforce TLS connections?
- Is encryption at rest enabled (should be enabled at creation — can't be added later without recreating)?
- Is the RDS instance in a private subnet (not publicly accessible)?
- Are security groups restricting database access to only the application's security group?

### Backups & Recovery

- Are automated backups enabled with an appropriate retention period (30 days recommended for production)?
- Is the backup window during off-peak hours?
- Has a restore been tested recently? Backups are only useful if you can restore them.

### Performance

- Is a custom parameter group used (not the default)? Important settings:
  - `shared_buffers`: ~25% of available memory
  - `max_connections`: Sized for the application's connection pool + headroom
  - `log_min_duration_statement`: Set to a threshold (e.g., 1000ms) to log slow queries
- Is Performance Insights enabled for identifying query bottlenecks?
- Are read replicas used for read-heavy workloads?

### Connection Pooling

- Is PgBouncer (or similar) deployed between the application and RDS? Important: AWS RDS Proxy does NOT work well with Prisma because of prepared statement pinning.
- Is the pool size configured based on the RDS instance's `max_connections` setting?

## IAM

### Least Privilege

- Are IAM roles and policies scoped to specific resources and actions? Look for `"Action": "*"` or `"Resource": "*"` in policies — these are overly permissive.
- Does each service (Lambda, ECS task, etc.) have its own IAM role with only the permissions it needs?
- Are there any long-lived access keys in use? Prefer IAM roles with temporary credentials.

### Access Key Hygiene

- Are access keys rotated regularly?
- Are access keys never hardcoded in source code, Docker images, or CI/CD config? Check for `.env` files, Docker build args, and CI secrets.
- Are unused IAM users and roles cleaned up?

### Cross-Account & External Access

- If using multiple AWS accounts (dev/staging/prod), are cross-account roles configured with proper trust policies?
- Is IAM Access Analyzer enabled to identify resources shared with external accounts?

## Secrets Management

### Where Secrets Live

- **Database credentials**: Should be in Secrets Manager with automatic rotation, not in environment variables or Parameter Store.
- **API keys and tokens**: Secrets Manager for high-value keys, Parameter Store (SecureString) for lower-risk configuration.
- **Feature flags and config**: Parameter Store (standard, free tier) with hierarchical paths (`/app/prod/feature/...`).

### Best Practices

- Are secrets fetched at application startup and cached in memory (not fetched on every request)?
- Is there a rotation policy for database credentials?
- Are secrets different across environments? The same database password in dev and prod is a security incident waiting to happen.

## Networking

### VPC Configuration

- Is the application deployed in a VPC with proper subnet segmentation?
  - Public subnets: Load balancers only
  - Private subnets: Application servers, database
  - Isolated subnets (optional): Database if no outbound internet needed
- Are NAT Gateways configured for private subnets that need outbound internet access?

### VPC Endpoints

- Are VPC endpoints configured for frequently used AWS services (S3, Secrets Manager, SQS, SNS)? This keeps traffic off the public internet and reduces costs.

### Security Groups

- Is the security group strategy layered?
  - ALB security group: Allow inbound 80/443 from the internet
  - App security group: Allow inbound only from ALB security group
  - DB security group: Allow inbound only from App security group
- Are SSH/RDP ports (22, 3389) restricted? Never open to 0.0.0.0/0.

## CloudFront

- Is CloudFront configured for static assets (JS, CSS, images)?
- Are cache behaviors configured per path pattern?
  - `/_next/static/*`: Long cache TTL (immutable assets with content hashes)
  - `/api/*`: No cache (or short cache for cacheable endpoints)
  - Static pages: Cache with revalidation
- Is HTTPS enforced (viewer protocol policy: redirect HTTP to HTTPS)?
- Is Origin Access Control (OAC) configured to restrict S3 access to CloudFront only?
- Are security headers added via CloudFront Functions?
