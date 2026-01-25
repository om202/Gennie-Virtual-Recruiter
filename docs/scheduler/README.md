# Scheduler & Queue Architecture

## Overview

Gennie uses Laravel's queue system with a database driver for background job processing. This architecture enables asynchronous AI analysis of interview sessions without blocking the user experience.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Interview Flow                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐      ┌───────────┐      ┌──────────────┐                │
│   │ Interview│ ───► │  end()    │ ───► │ Dispatch Job │                │
│   │ Completes│      │ API call  │      │ to Queue     │                │
│   └──────────┘      └───────────┘      └──────┬───────┘                │
│                                                │                         │
│                                   ┌────────────▼────────────┐           │
│                                   │   Database Queue Table   │           │
│                                   │      (jobs table)        │           │
│                                   └────────────┬────────────┘           │
│                                                │                         │
│                                   ┌────────────▼────────────┐           │
│                                   │     Queue Worker         │           │
│                                   │  php artisan queue:listen│           │
│                                   └────────────┬────────────┘           │
│                                                │                         │
│                                   ┌────────────▼────────────┐           │
│                                   │ GenerateSessionAnalysis  │           │
│                                   │   - OpenAI API call      │           │
│                                   │   - 3 min timeout        │           │
│                                   │   - Exponential backoff  │           │
│                                   └────────────┬────────────┘           │
│                                                │                         │
│                         ┌──────────────────────┼──────────────────────┐ │
│                         ▼                      ▼                      ▼ │
│                   ┌──────────┐          ┌──────────┐          ┌────────┐│
│                   │ completed│          │  failed  │          │ retry  ││
│                   └──────────┘          └──────────┘          └────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Queue Configuration

| Setting | Value | Location |
|---------|-------|----------|
| Driver | `database` | `.env` → `QUEUE_CONNECTION=database` |
| Table | `jobs` | Auto-created by Laravel |
| Failed Jobs Table | `failed_jobs` | Auto-created by Laravel |

### 2. Jobs

#### `GenerateSessionAnalysis`
**Location:** `app/Jobs/GenerateSessionAnalysis.php`

Analyzes interview transcripts using OpenAI and generates scorecards.

| Property | Value | Purpose |
|----------|-------|---------|
| `$timeout` | 180s | 3 min max for AI processing |
| `$tries` | 3 | Maximum retry attempts |
| `$backoff` | [30, 60, 120] | Exponential backoff delays |
| `$maxExceptions` | 2 | Fail permanently after 2 exceptions |

**Flow:**
1. Check if already completed (idempotency)
2. Set status to `processing`
3. Build transcript from logs
4. Validate minimum content (3+ candidate responses, 500+ chars)
5. Call OpenAI for analysis
6. Save result and set status to `completed`

**Failure Handling:**
```php
public function failed(\Throwable $exception): void
{
    $this->session->update([
        'analysis_status' => 'failed',
        'analysis_result' => ['error' => '...', 'reason' => '...']
    ]);
}
```

---

### 3. Scheduled Commands

#### `analysis:retry-stuck`
**Location:** `app/Console/Commands/RetryStuckAnalysis.php`

Detects and retries jobs stuck in `processing` state.

**Usage:**
```bash
# Preview what would be retried
php artisan analysis:retry-stuck --dry-run

# Retry stuck jobs older than 10 minutes
php artisan analysis:retry-stuck --minutes=10
```

**Schedule:** Runs every 5 minutes automatically.

---

## Retry Logic

### Exponential Backoff

```
Attempt 1 fails → Wait 30s → Retry
Attempt 2 fails → Wait 60s → Retry  
Attempt 3 fails → Mark as FAILED permanently
```

### Failure Scenarios

| Scenario | Handling |
|----------|----------|
| OpenAI timeout | Retry with backoff |
| OpenAI rate limit | Retry with backoff |
| Invalid transcript | Mark as failed immediately |
| Insufficient content | Mark as failed with reason |
| Worker crash mid-job | Detected by scheduler, re-queued |

---

## Running the Queue

### Development

Queue worker runs automatically with `composer dev`:
```bash
composer dev
# Includes: php artisan queue:listen --tries=1
```

### Production

```bash
# Option 1: Supervisor (recommended)
# See supervisor config below

# Option 2: Manual
php artisan queue:work --daemon

# Option 3: Process pending and exit
php artisan queue:work --stop-when-empty
```

### Supervisor Configuration (Production)

```ini
[program:gennie-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/gennie/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/gennie/storage/logs/worker.log
```

---

## Scheduler Setup

### Development
Scheduler runs when you have the dev server running. No extra setup needed.

### Production

Add to crontab:
```bash
* * * * * cd /var/www/gennie && php artisan schedule:run >> /dev/null 2>&1
```

### Scheduled Tasks

| Task | Frequency | Purpose |
|------|-----------|---------|
| `analysis:retry-stuck` | Every 5 min | Recover stuck jobs |

---

## Monitoring

### Check Queue Status
```bash
# Pending jobs count
php artisan tinker --execute="echo DB::table('jobs')->count();"

# Failed jobs
php artisan queue:failed

# Retry a failed job
php artisan queue:retry {id}

# Clear all failed jobs
php artisan queue:flush
```

### Check Analysis Status
```bash
php artisan tinker --execute="
    echo 'Pending: ' . \App\Models\InterviewSession::where('analysis_status', 'pending')->count();
    echo 'Processing: ' . \App\Models\InterviewSession::where('analysis_status', 'processing')->count();
    echo 'Completed: ' . \App\Models\InterviewSession::where('analysis_status', 'completed')->count();
    echo 'Failed: ' . \App\Models\InterviewSession::where('analysis_status', 'failed')->count();
"
```

---

## Future Improvements

1. **Redis Queue**: Faster than database, better for high volume
2. **Laravel Horizon**: Dashboard for monitoring queues
3. **Separate Queues**: `high`, `default`, `low` priority
4. **Notifications**: Alert on persistent failures
