# QA Test Flow - Visual Guide
**Date:** 06/11/2024

---

## Test Execution Flow Diagram

```
START
  ↓
┌─────────────────────────────────────────────┐
│  P1.1 - CLOUDINARY CONFIGURATION (15min)   │ ← BLOCKER - Must pass first
│  - Copy credentials from dashboard          │
│  - Update backend/.env                      │
│  - Restart backend manually                 │
└─────────────────────────────────────────────┘
  ↓
  ✅ PASS → Continue
  ❌ FAIL → FIX IMMEDIATELY (all photo tests blocked)
  ↓
┌─────────────────────────────────────────────┐
│  P1.2 - LOGIN FLOW (10min)                 │
│  - Test Super Admin login                   │
│  - Test VEREADOR login                      │
│  - Test PENDENTE login (should fail)        │
└─────────────────────────────────────────────┘
  ↓
  ✅ PASS → Continue
  ❌ FAIL → FIX (blocks all subsequent tests)
  ↓
┌─────────────────────────────────────────────┐
│  P1.3 - CREATE JURIDICO USER (15min)       │
│  - Register juridico@teste.com              │
│  - Approve as admin                         │
│  - Verify can login                         │
└─────────────────────────────────────────────┘
  ↓
  ✅ PASS → Continue to critical path
  ❌ FAIL → Cannot test status updates
  ↓
┌─────────────────────────────────────────────┐
│  P1.4 - OCCURRENCE LIFECYCLE (30min)       │ ← CRITICAL TEST
│  Part A: Create as VEREADOR (with photos)  │
│  Part B: Verify details & photos            │
│  Part C: Update to EM_ANALISE (JURIDICO)   │
│  Part D: Update to RESOLVIDO (JURIDICO)    │
│  Part E: Verify notifications (VEREADOR)   │
│  Part F: Verify complete history           │
└─────────────────────────────────────────────┘
  ↓
  ✅ ALL PARTS PASS → Priority 1 COMPLETE ✅
  ❌ ANY PART FAILS → Document & decide if can continue
  ↓
  │
  ├─── ✅ Continue to Priority 2
  │
  └─── ❌ Stop & fix critical issues
  │
  ↓
┌──────────────────────────────────────────────────────────┐
│               PRIORITY 2: CORE FEATURES                  │
│                    (Can run in parallel)                 │
└──────────────────────────────────────────────────────────┘
  ↓
  ┌────────────────┐  ┌─────────────────┐  ┌────────────────┐
  │   P2.1 (20m)   │  │   P2.2 (15m)    │  │   P2.3 (20m)   │
  │ User Mgmt      │  │  Permissions    │  │ Filters/Search │
  │ (Admin only)   │  │  (All roles)    │  │ (Setup needed) │
  └────────────────┘  └─────────────────┘  └────────────────┘
          ↓                    ↓                     ↓
  ┌────────────────┐  ┌─────────────────┐  ┌────────────────┐
  │   P2.4 (15m)   │  │   P2.5 (15m)    │  │   P2.6 (10m)   │
  │ Photo Gallery  │  │  Notifications  │  │   Statistics   │
  │    & Maps      │  │                 │  │                │
  └────────────────┘  └─────────────────┘  └────────────────┘
          ↓                    ↓                     ↓
          └────────────────────┴─────────────────────┘
                              ↓
                    Priority 2 Complete
                              ↓
┌──────────────────────────────────────────────────────────┐
│           PRIORITY 3: EDGE CASES & POLISH                │
│                  (Can run in parallel)                   │
└──────────────────────────────────────────────────────────┘
  ↓
  ┌────────────────┐  ┌─────────────────┐
  │   P3.1 (20m)   │  │   P3.2 (15m)    │
  │  Occurrence    │  │ Authentication  │
  │  Edge Cases    │  │   Edge Cases    │
  └────────────────┘  └─────────────────┘
          ↓                    ↓
  ┌────────────────┐  ┌─────────────────┐
  │   P3.3 (15m)   │  │   P3.4 (10m)    │
  │   UI/UX        │  │      Data       │
  │   Polish       │  │   Validation    │
  └────────────────┘  └─────────────────┘
          ↓                    ↓
          └────────────────────┘
                     ↓
          All Tests Complete
                     ↓
          Generate Test Report
                     ↓
                    END
```

---

## Critical Dependencies

### What Blocks What

```
P1.1 (Cloudinary)
  ↓ BLOCKS
  ├── P1.4 Part A (Create with photos)
  ├── P1.4 Part B (Verify photos)
  └── P2.4 (Photo Gallery)

P1.2 (Login)
  ↓ BLOCKS
  ├── ALL other tests (need authentication)

P1.3 (JURIDICO User)
  ↓ BLOCKS
  ├── P1.4 Part C (Status update to EM_ANALISE)
  ├── P1.4 Part D (Status update to RESOLVIDO)
  ├── P2.2 (JURIDICO permissions)
  └── P2.3 (Filter all occurrences)

P1.4 (Occurrence Lifecycle)
  ↓ BLOCKS
  ├── P2.2 (Need occurrences to test permissions)
  ├── P2.3 (Need occurrences to test filters)
  ├── P2.4 (Need occurrence with photos/GPS)
  ├── P2.5 (Need notifications from status updates)
  └── P3.1 (Need occurrences for edge cases)
```

---

## Alternative Test Paths

### If Cloudinary Fails (P1.1 ❌)

Can still test:
```
P1.2 ✅ Login Flow
  ↓
P1.3 ✅ Create JURIDICO User
  ↓
P1.4 (Modified) ⚠️ Occurrence Lifecycle WITHOUT photos
  - Part A: Create without photos
  - Part C, D, E, F: Status updates & notifications still work
  ↓
P2.1 ✅ User Management
P2.2 ✅ Permission Boundaries
P2.3 ⚠️ Filters (limited without varied data)
P2.5 ✅ Notification System
P2.6 ✅ Statistics
P3.2 ✅ Auth Edge Cases
P3.3 ✅ UI/UX Polish
P3.4 ✅ Data Validation

Cannot test:
❌ P2.4 - Photo Gallery (no photos)
❌ P3.1 - Photo edge cases (max photos, compression, etc.)
```

### If P1.4 Completely Fails

Can still test:
```
P2.1 ✅ User Management (independent)
P3.2 ✅ Auth Edge Cases (independent)
P3.3 ✅ Some UI/UX tests (loading, errors, etc.)

Cannot test:
❌ P2.2 - Permission Boundaries (need occurrences)
❌ P2.3 - Filters (need occurrences)
❌ P2.4 - Photo Gallery (need occurrences)
❌ P2.5 - Notifications (need status updates)
❌ P2.6 - Occurrence statistics (need occurrences)
❌ P3.1 - Occurrence Edge Cases (need occurrence feature)
```

---

## User Switching Flow

### Quick Reference for Switching Between Users

```
┌─────────────────────────────────────────────────────┐
│                   SUPER ADMIN                       │
│  Email: krisalexandre2018@gmail.com                 │
│  Use for:                                           │
│  - Manage Users (approve, deactivate, reactivate)   │
│  - View all occurrences                             │
│  - Test admin-only features                         │
│  - Emergency fixes                                  │
└─────────────────────────────────────────────────────┘
              ↓ Logout / Login ↓
┌─────────────────────────────────────────────────────┐
│                    VEREADOR                         │
│  Email: vereador@teste.com / 123456                 │
│  Use for:                                           │
│  - Create occurrences                               │
│  - Upload photos                                    │
│  - View notifications                               │
│  - Test vereador-only features                      │
│  - Test permission boundaries                       │
└─────────────────────────────────────────────────────┘
              ↓ Logout / Login ↓
┌─────────────────────────────────────────────────────┐
│                    JURIDICO                         │
│  Email: juridico@teste.com / 123456                 │
│  Use for:                                           │
│  - View all occurrences                             │
│  - Update status                                    │
│  - Add comments to history                          │
│  - Test juridico-only features                      │
│  - Test permission boundaries                       │
└─────────────────────────────────────────────────────┘
```

---

## Test Data Creation Flow

### Building Test Data Progressively

```
Session Start
  │
  ├─ Existing Users:
  │   ├─ Super Admin ✓
  │   └─ Vereador ✓
  │
  ↓
P1.3 - Create JURIDICO
  │
  └─ Users: Admin ✓, Vereador ✓, Juridico ✓
  │
  ↓
P1.4 - Create First Occurrence
  │
  └─ Occurrences: 1 (with photos, full lifecycle)
  │
  ↓
P2.3 Setup - Create Varied Occurrences
  │
  ├─ Category: LIMPEZA
  ├─ Category: ILUMINACAO
  ├─ Category: SAUDE
  ├─ Priority: BAIXA
  ├─ Priority: MEDIA
  ├─ Priority: ALTA
  └─ Different statuses
  │
  └─ Occurrences: ~6 total
  │
  ↓
P3.1 - Create Edge Case Occurrences
  │
  ├─ Occurrence without photos
  ├─ Occurrence with max photos (5)
  ├─ Occurrence with long text
  └─ Occurrence for deletion test
  │
  └─ Occurrences: ~9 total
  │
  ↓
Session End
  │
  └─ Final State:
      ├─ Users: 3-5 (Admin, Vereador(s), Juridico(s))
      ├─ Occurrences: 6-10
      ├─ Photos: 15-20 (on Cloudinary)
      ├─ Notifications: 10-15
      └─ History Entries: 20-30
```

---

## Recommended Testing Schedule

### Session 1: Critical Path (90 minutes)
**Goal:** Validate system is fundamentally working

```
Time        Task                    Duration    Notes
─────────────────────────────────────────────────────────
09:00       Setup & Start           10min       Start servers
09:10       P1.1 Cloudinary         15min       BLOCKER
09:25       P1.2 Login Flow         10min       All users
09:35       P1.3 Create JURIDICO    15min       Setup for P1.4
09:50       --- Break ---           10min       Coffee!
10:00       P1.4 Part A-B           15min       Create & verify
10:15       P1.4 Part C-D           10min       Status updates
10:25       P1.4 Part E-F           5min        Notifications
10:30       Review & Document       10min       Any issues?
10:40       --- Session 1 END ---
```

**Decision Point:**
- ✅ All P1 Pass → Continue to Session 2
- ❌ Any P1 Fail → Fix critical issues before continuing

---

### Session 2: Core Features (90 minutes)
**Goal:** Validate all main features work correctly

```
Time        Task                    Duration    Notes
─────────────────────────────────────────────────────────
11:00       P2.1 User Mgmt          20min       Admin features
11:20       P2.2 Permissions        15min       Role boundaries
11:35       --- Break ---           10min
11:45       P2.3 Setup              10min       Create test data
11:55       P2.3 Filters            10min       Test filtering
12:05       P2.4 Photos & Maps      15min       Gallery, GPS
12:20       P2.5 Notifications      15min       Full notification flow
12:35       P2.6 Statistics         10min       Verify counts
12:45       Review & Document       10min
12:55       --- Session 2 END ---
```

**Decision Point:**
- ✅ Most P2 Pass → System is production-ready
- ⚠️ Some P2 Fail → Document, decide if blockers
- ❌ Many P2 Fail → Need more development

---

### Session 3: Edge Cases (60 minutes)
**Goal:** Polish and validate edge cases

```
Time        Task                    Duration    Notes
─────────────────────────────────────────────────────────
14:00       P3.1 Occurrence Edge    20min       Create variations
14:20       P3.2 Auth Edge          15min       Security tests
14:35       P3.3 UI/UX Polish       15min       User experience
14:50       P3.4 Data Validation    10min       Accuracy checks
15:00       Final Review            15min       Summary
15:15       Write Test Report       30min       Document findings
15:45       --- Session 3 END ---
```

**Total Time:** ~4 hours including breaks

---

## Quick Test Status Colors

Use these visual indicators during testing:

```
✅ PASS    - Test passed completely
❌ FAIL    - Test failed, bug found
⚠️ PARTIAL - Test partially passed (some issues)
⏸️ BLOCKED  - Cannot run (dependency failed)
⏭️ SKIPPED  - Intentionally skipped (document reason)
🔧 FIXED   - Bug was fixed and retested
📝 NOTED   - Issue noted but not blocking
```

---

## Risk Assessment

### High Risk Areas (Test Carefully)

```
🔴 HIGH RISK
├── Photo Upload (Cloudinary integration)
│   ├── Credential errors
│   ├── Network issues
│   └── File size/format problems
│
├── Permission System
│   ├── Unauthorized access
│   ├── Data leakage between users
│   └── Missing authorization checks
│
└── Notification Delivery
    ├── Not created
    ├── Wrong user
    └── Missing information

🟡 MEDIUM RISK
├── Status Updates
│   ├── History not tracked
│   └── Notifications not sent
│
├── GPS/Location
│   ├── Permission issues
│   └── Inaccurate coordinates
│
└── Filters/Search
    ├── Wrong results
    └── Performance issues

🟢 LOW RISK
├── UI Polish
├── Loading states
└── Color schemes
```

---

## Common Test Scenarios Quick Reference

### Scenario 1: Happy Path (Everything Works)
```
1. Admin approves vereador → ✅
2. Vereador creates occurrence with photos → ✅
3. Photos upload to Cloudinary → ✅
4. Juridico receives email notification → ✅
5. Juridico updates status → ✅
6. Vereador receives notification → ✅
7. History tracked correctly → ✅
```

### Scenario 2: Cloudinary Issues
```
1. Create occurrence with photos → ❌
   Error: "Invalid Signature"

Fix:
- Check .env credentials
- Restart backend
- Verify Cloudinary dashboard
- Retry upload
```

### Scenario 3: Permission Violation
```
1. Vereador tries to approve users → ❌
   Error: 403 "Acesso negado"

Expected: System correctly blocks unauthorized action ✅
```

### Scenario 4: Offline Mobile App
```
1. Turn off WiFi
2. Try to create occurrence → ❌
   Error: "Não foi possível conectar ao servidor"

Expected: Graceful error message (not crash) ✅
```

### Scenario 5: Invalid Input
```
1. Create occurrence without title → ❌
   Error: "Por favor, informe o título"

Expected: Validation prevents invalid data ✅
```

---

## Test Completion Criteria

### Minimum (Can Release with Issues)
- [ ] All P1 tests pass (Critical Path)
- [ ] P2.2 passes (Permissions working)
- [ ] No data loss bugs
- [ ] No security vulnerabilities
- [ ] < 5 high severity bugs (documented)

### Standard (Ready for Production)
- [ ] All P1 tests pass
- [ ] All P2 tests pass (or documented exceptions)
- [ ] < 3 high severity bugs
- [ ] < 10 medium severity bugs
- [ ] All critical workflows documented

### Excellent (High Quality Release)
- [ ] All tests pass (P1, P2, P3)
- [ ] < 5 total bugs (all low severity)
- [ ] Performance acceptable
- [ ] UI polish complete
- [ ] Full documentation

---

## Emergency Procedures

### If Backend Crashes During Testing
```
1. Check terminal for error logs
2. Screenshot error (for bug report)
3. Restart backend: npm run dev
4. Check Prisma Studio (data integrity)
5. Resume testing from last checkpoint
```

### If Mobile App Freezes
```
1. Shake device → Reload
2. If still frozen: Force close app
3. Clear Expo cache: expo start -c
4. Restart Expo Go
5. Resume testing
```

### If Database Corrupted
```
1. Stop backend
2. Backup database (if possible)
3. Run: npx prisma migrate reset
4. Recreate test users
5. Resume testing from beginning
```

### If Tests Taking Too Long
```
Priority order for limited time:
1. P1.1, P1.2, P1.4 (minimum viable)
2. P2.2 (permissions - security)
3. P2.1 (user management)
4. P2.5 (notifications)
5. Skip P3 if time constrained
```

---

**END OF TEST FLOW GUIDE**

*Use this alongside QA_TEST_PLAN.md and QA_CHECKLIST.md*
*Version 1.0 - 06/11/2024*
