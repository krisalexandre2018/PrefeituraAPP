# QA Testing Checklist - Quick Reference
**Date:** 06/11/2024
**Tester:** _______________
**Start Time:** ___:___  |  **End Time:** ___:___

---

## Pre-Test Setup

- [ ] Backend running on http://localhost:3000
- [ ] Mobile app connected to backend
- [ ] Prisma Studio accessible
- [ ] Test users available (admin, vereador)
- [ ] Cloudinary credentials verified

---

## Priority 1: Critical Path (MUST PASS)

### P1.1 - Cloudinary Configuration ⏱️ 15min
- [ ] Credentials copied from dashboard
- [ ] Updated in backend/.env (no quotes)
- [ ] Backend restarted manually
- [ ] Environment variables verified
- [ ] **Result:** ✅ PASS / ❌ FAIL
- **Notes:** _______________________________________________

---

### P1.2 - Login Flow ⏱️ 10min

**P1.2.1 - Super Admin Login**
- [ ] Login successful
- [ ] "Gerenciar Usuários" button visible
- [ ] isSuperAdmin: true
- [ ] **Result:** ✅ PASS / ❌ FAIL

**P1.2.2 - VEREADOR Login**
- [ ] Login successful (vereador@teste.com / 123456)
- [ ] Only sees own occurrences
- [ ] "Gerenciar Usuários" NOT visible
- [ ] "Nova Ocorrência" button visible
- [ ] **Result:** ✅ PASS / ❌ FAIL

**P1.2.3 - PENDENTE Login (Should Fail)**
- [ ] Error: "Conta aguardando aprovação"
- [ ] Cannot access system
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

### P1.3 - Create JURIDICO User ⏱️ 15min

**Part A - Register**
- [ ] Registration form filled (juridico@teste.com)
- [ ] Success message shown
- [ ] User created with status PENDENTE
- [ ] Cannot login yet
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Part B - Approve (as Admin)**
- [ ] Found in "Gerenciar Usuários"
- [ ] Approval successful
- [ ] Status changed to ATIVO
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Part C - Login as JURIDICO**
- [ ] Login successful (juridico@teste.com / 123456)
- [ ] Can see ALL occurrences
- [ ] "Nova Ocorrência" NOT visible
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

### P1.4 - Complete Occurrence Lifecycle ⏱️ 30min

**Part A - Create Occurrence (as VEREADOR)**
- [ ] Form filled completely
- [ ] 2-3 photos added
- [ ] Photos optimized (compression message shown)
- [ ] Address entered (GPS or manual)
- [ ] Submit successful
- [ ] Success message: "Ocorrência registrada com sucesso!"
- [ ] Occurrence appears in list
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Occurrence ID:** _______________

**Part B - Verify Details**
- [ ] All photos load from Cloudinary
- [ ] Can swipe through gallery
- [ ] Title, description, address correct
- [ ] Status badge: "Pendente" (yellow)
- [ ] Priority badge: "Alta" (red)
- [ ] "Ver no mapa" button (if GPS data)
- [ ] History shows "CRIADA" entry
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Part C - Update to EM_ANALISE (as JURIDICO)**
- [ ] Occurrence visible to juridico
- [ ] Status updated successfully
- [ ] Comment added to history
- [ ] Badge changed to "Em Análise" (blue)
- [ ] History entry created
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Part D - Update to RESOLVIDO**
- [ ] Status updated to RESOLVIDO
- [ ] Comment added
- [ ] Badge changed to "Resolvido" (green)
- [ ] History entry created
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Part E - Verify Notifications (as VEREADOR)**
- [ ] 2 notifications received
- [ ] Notification 1: EM_ANALISE update
- [ ] Notification 2: RESOLVIDO update
- [ ] Unread badge shown
- [ ] Can mark as read
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Part F - Verify Complete History**
- [ ] 3 history entries total
- [ ] Order: newest first
- [ ] All comments present
- [ ] User names correct
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

**Overall P1.4 Result:** ✅ PASS / ❌ FAIL

---

## Priority 2: Core Features

### P2.1 - User Management ⏱️ 20min

**P2.1.1 - View All Users**
- [ ] All users displayed
- [ ] Statistics correct (total, by type, by status)
- [ ] **Result:** ✅ PASS / ❌ FAIL

**P2.1.2 - Filter Users**
- [ ] Status filters work (Todos, Pendentes, Ativos, Inativos)
- [ ] Counts update correctly
- [ ] Pull-to-refresh works
- [ ] **Result:** ✅ PASS / ❌ FAIL

**P2.1.3 - Deactivate User**
- [ ] User deactivated successfully
- [ ] Notification created
- [ ] Statistics updated
- [ ] **Result:** ✅ PASS / ❌ FAIL

**P2.1.4 - Inactive Cannot Login**
- [ ] Error: "Conta desativada"
- [ ] Cannot access system
- [ ] **Result:** ✅ PASS / ❌ FAIL

**P2.1.5 - Reactivate User**
- [ ] User reactivated successfully
- [ ] Can login again
- [ ] **Result:** ✅ PASS / ❌ FAIL

**P2.1.6 - Change User Type**
- [ ] Type updated successfully
- [ ] Notification created
- [ ] Statistics reflect change
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

### P2.2 - Permission Boundaries ⏱️ 15min

- [ ] VEREADOR cannot access admin functions
- [ ] VEREADOR only sees own occurrences
- [ ] VEREADOR cannot update status
- [ ] JURIDICO can see all occurrences
- [ ] JURIDICO cannot create occurrences
- [ ] JURIDICO can update status
- [ ] ADMIN has full access
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

### P2.3 - Filters and Search ⏱️ 20min

**Setup: Create 4-5 varied occurrences**
- [ ] Test data created

**Filter Tests:**
- [ ] Filter by status (all options)
- [ ] Filter by category (if implemented)
- [ ] Filter by priority (if implemented)
- [ ] Combined filters work
- [ ] Search works (if implemented)
- [ ] Sort works (if implemented)
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

### P2.4 - Photo Gallery and Maps ⏱️ 15min

- [ ] Can swipe through photo gallery
- [ ] Photos load from Cloudinary
- [ ] High quality images (not blurry)
- [ ] Google Maps opens correctly
- [ ] Coordinates match location
- [ ] Manual address works (no GPS)
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

### P2.5 - Notification System ⏱️ 15min

- [ ] Notifications list displays
- [ ] Unread count badge correct
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Different notification types display correctly
- [ ] Tapping notification opens relevant screen
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

### P2.6 - Statistics and Reports ⏱️ 10min

- [ ] User statistics correct
- [ ] Occurrence statistics correct
- [ ] Charts/graphs display (if implemented)
- [ ] Pull to refresh updates stats
- [ ] Numbers match Prisma Studio data
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Priority 3: Edge Cases & Polish

### P3.1 - Occurrence Edge Cases ⏱️ 20min

- [ ] Create without photos (with confirmation)
- [ ] Maximum 5 photos enforced
- [ ] Photo compression works
- [ ] Remove photo before upload
- [ ] Very long title/description handled
- [ ] Special characters accepted
- [ ] Delete occurrence (PENDENTE only)
- [ ] Cannot delete EM_ANALISE/RESOLVIDO
- [ ] Cannot delete other's occurrence
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

### P3.2 - Authentication Edge Cases ⏱️ 15min

- [ ] Invalid credentials rejected
- [ ] Non-existent email handled
- [ ] Empty fields validated
- [ ] Logout works completely
- [ ] Token expiration handled
- [ ] Duplicate registration blocked
- [ ] Invalid email format rejected
- [ ] Password mismatch caught
- [ ] CPF validation works
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

### P3.3 - UI/UX Polish ⏱️ 15min

- [ ] Loading states show correctly
- [ ] Pull to refresh works
- [ ] Empty states helpful
- [ ] Error handling graceful
- [ ] Offline behavior acceptable
- [ ] Network recovery works
- [ ] Image loading states smooth
- [ ] Navigation smooth and correct
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

### P3.4 - Data Validation ⏱️ 10min

- [ ] Timestamps accurate and localized
- [ ] History order correct (newest first)
- [ ] User info accuracy verified
- [ ] Status colors consistent
- [ ] All data displays correctly
- [ ] **Result:** ✅ PASS / ❌ FAIL

**Notes:** _______________________________________________

---

## Summary

### Test Results
- **Total Tests Executed:** _____ / 14
- **Passed:** _____
- **Failed:** _____
- **Blocked:** _____
- **Skipped:** _____

### Priority Breakdown
- **P1 (Critical):** _____ / 4 passed
- **P2 (Core):** _____ / 6 passed
- **P3 (Edge Cases):** _____ / 4 passed

### Severity of Issues Found
- **Critical:** _____
- **High:** _____
- **Medium:** _____
- **Low:** _____

### Overall Status
- [ ] ✅ **PASS** - System is production ready
- [ ] ⚠️ **PASS WITH ISSUES** - Minor bugs found but system functional
- [ ] ❌ **FAIL** - Critical bugs block system usage

---

## Issues Log

### Issue #1
**Title:** _______________________________________________
**Test Case:** P___.___ - _______________
**Severity:** Critical / High / Medium / Low
**Description:** _______________________________________________
**Status:** Open / In Progress / Fixed / Won't Fix

---

### Issue #2
**Title:** _______________________________________________
**Test Case:** P___.___ - _______________
**Severity:** Critical / High / Medium / Low
**Description:** _______________________________________________
**Status:** Open / In Progress / Fixed / Won't Fix

---

### Issue #3
**Title:** _______________________________________________
**Test Case:** P___.___ - _______________
**Severity:** Critical / High / Medium / Low
**Description:** _______________________________________________
**Status:** Open / In Progress / Fixed / Won't Fix

---

### Issue #4
**Title:** _______________________________________________
**Test Case:** P___.___ - _______________
**Severity:** Critical / High / Medium / Low
**Description:** _______________________________________________
**Status:** Open / In Progress / Fixed / Won't Fix

---

### Issue #5
**Title:** _______________________________________________
**Test Case:** P___.___ - _______________
**Severity:** Critical / High / Medium / Low
**Description:** _______________________________________________
**Status:** Open / In Progress / Fixed / Won't Fix

---

## Recommendations

### Must Fix Before Production
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Should Fix Soon
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Nice to Have
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## Tester Sign-off

**Tester Name:** _______________________________________________
**Date Completed:** _____ / _____ / _____
**Total Time:** _____ hours _____ minutes

**Signature:** _______________________________________________

---

## Reviewer Sign-off (if applicable)

**Reviewer Name:** _______________________________________________
**Date Reviewed:** _____ / _____ / _____

**Signature:** _______________________________________________

---

**END OF CHECKLIST**
