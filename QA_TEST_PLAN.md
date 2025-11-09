# QA Testing Plan - Sistema de Ocorrências Urbanas
**Version**: 1.0
**Date**: 06/11/2024
**Status**: Ready for Execution

---

## Table of Contents
1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Users](#test-users)
4. [Priority 1: Critical Path Tests](#priority-1-critical-path-tests)
5. [Priority 2: Core Features](#priority-2-core-features)
6. [Priority 3: Edge Cases & Polish](#priority-3-edge-cases--polish)
7. [Test Dependencies](#test-dependencies)
8. [Test Data Management](#test-data-management)
9. [Bug Reporting](#bug-reporting)

---

## Overview

This QA plan validates the complete City Council Occurrences Management System with focus on:
- **Authentication & Authorization**: Proper role-based access control
- **Occurrence Lifecycle**: Creation → Status Updates → Resolution
- **File Upload**: Cloudinary photo upload and display
- **Notifications**: Real-time user notifications
- **Data Integrity**: Proper historical tracking and audit logs

**Total Estimated Time**: 3-4 hours (excluding bug fixes)

---

## Test Environment Setup

### Prerequisites

**Backend:**
```bash
cd "E:\Todos os projetos\Prefeitura App\backend"
npm run dev
# Should be running on http://localhost:3000
# Network: http://192.168.2.104:3000
```

**Mobile:**
```bash
cd "E:\Todos os projetos\Prefeitura App\mobile"
npm start
# Use Expo Go app or simulator
```

**Database:**
```bash
cd "E:\Todos os projetos\Prefeitura App\backend"
npm run prisma:studio
# Opens GUI on http://localhost:5555
```

### Environment Validation

Before starting tests:
- [ ] Backend responds to: http://localhost:3000/health (if available)
- [ ] Mobile app can connect to backend (check API URL in mobile/src/services/api.js)
- [ ] Prisma Studio opens successfully
- [ ] Cloudinary credentials are correct in backend/.env

---

## Test Users

### Pre-existing Users

**Super Admin:**
- Email: `krisalexandre2018@gmail.com`
- Senha: (personal password)
- Type: ADMIN
- Status: ATIVO
- isSuperAdmin: true

**VEREADOR (created 05/11):**
- Email: `vereador@teste.com`
- Senha: `123456`
- Type: VEREADOR
- Status: ATIVO

### To Be Created During Tests

**JURIDICO:**
- Email: `juridico@teste.com`
- Senha: `123456`
- Type: JURIDICO
- Status: PENDENTE → ATIVO (will be approved during test)

**Additional Test Users (Optional):**
- `vereador2@teste.com` / `123456` - For multi-vereador tests
- `juridico2@teste.com` / `123456` - For multi-juridico tests

---

## Priority 1: Critical Path Tests

### P1.1 - Cloudinary Configuration (BLOCKER)
**Estimated Time:** 15 minutes
**Prerequisites:** None
**Status:** 🔴 URGENT - Must pass before other tests

**Steps:**
1. Access Cloudinary Dashboard: https://cloudinary.com/console
2. Copy exact credentials (without quotes):
   - Cloud Name: `doalug1yw`
   - API Key: (copy from dashboard)
   - API Secret: (copy from dashboard)
3. Open `E:\Todos os projetos\Prefeitura App\backend\.env`
4. Update credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=doalug1yw
   CLOUDINARY_API_KEY=your_key_here
   CLOUDINARY_API_SECRET=your_secret_here
   ```
5. STOP backend (Ctrl+C in terminal)
6. START backend:
   ```bash
   cd "E:\Todos os projetos\Prefeitura App\backend"
   npm run dev
   ```
7. Verify backend restarted without errors
8. Check environment variables loaded:
   ```bash
   node -e "require('dotenv').config(); console.log('Cloud:', process.env.CLOUDINARY_CLOUD_NAME);"
   ```

**Expected Results:**
- Backend restarts successfully
- Cloud Name matches `doalug1yw`
- No "Invalid Signature" errors in logs

**If Test Fails:**
- Double-check no quotes in .env file
- Ensure no extra spaces before/after values
- Verify API Secret is exactly as shown in dashboard
- Try creating new API key/secret in Cloudinary dashboard

---

### P1.2 - Login Flow (All User Types)
**Estimated Time:** 10 minutes
**Prerequisites:** None
**Blocks:** All subsequent tests

**Test Cases:**

**P1.2.1 - Super Admin Login**
1. Open mobile app
2. Enter email: `krisalexandre2018@gmail.com`
3. Enter personal password
4. Tap "Entrar"

**Expected Results:**
- Login successful
- Redirects to Home screen
- "Gerenciar Usuários" button is visible (Super Admin only)
- User data shows `isSuperAdmin: true`

**P1.2.2 - VEREADOR Login**
1. Logout from app
2. Enter email: `vereador@teste.com`
3. Enter senha: `123456`
4. Tap "Entrar"

**Expected Results:**
- Login successful
- Home screen shows only this vereador's occurrences
- "Gerenciar Usuários" button NOT visible
- Can see "Nova Ocorrência" button

**P1.2.3 - PENDENTE User Login (Should Fail)**
1. Logout
2. Try to login with email for pending user (if exists)

**Expected Results:**
- Error: "Conta aguardando aprovação do administrador"
- Cannot access system

**If Test Fails:**
- Check backend logs for detailed error
- Verify JWT_SECRET is set in .env
- Verify user exists in database (Prisma Studio)
- Check network connectivity (mobile/backend on same network)

---

### P1.3 - Create JURIDICO User
**Estimated Time:** 15 minutes
**Prerequisites:** P1.2 passes
**Blocks:** P1.4, P2.2, P2.3

**Steps:**

**Part A - Register JURIDICO User**
1. Logout from mobile app
2. Tap "Cadastrar"
3. Fill form:
   - Nome: `Maria Jurídica`
   - CPF: `11122233344`
   - Email: `juridico@teste.com`
   - Senha: `123456`
   - Confirmar Senha: `123456`
   - Telefone: `11977776666`
   - Tipo: JURIDICO
4. Tap "Cadastrar"

**Expected Results:**
- Success message: "Cadastro realizado! Aguarde a aprovação do administrador."
- User created with status PENDENTE
- Cannot login yet

**Part B - Approve JURIDICO User (as Super Admin)**
1. Logout
2. Login as Super Admin (`krisalexandre2018@gmail.com`)
3. Tap "Gerenciar Usuários"
4. Verify "Maria Jurídica" appears with status PENDENTE
5. Tap on user card
6. Tap "Aprovar" button
7. Confirm approval

**Expected Results:**
- Success message: "Usuário aprovado com sucesso"
- User status changes to ATIVO
- User receives notification (check later)
- Email sent to juridico@teste.com (if email configured)

**Part C - Verify JURIDICO Can Login**
1. Logout
2. Login as `juridico@teste.com` / `123456`

**Expected Results:**
- Login successful
- Can see ALL occurrences (not just own)
- "Nova Ocorrência" button NOT visible (juridico cannot create)

**If Test Fails:**
- Check backend logs for errors
- Verify user status in Prisma Studio
- Ensure email validation passes (valid format)
- Check CPF is unique (not already used)

---

### P1.4 - Complete Occurrence Lifecycle
**Estimated Time:** 30 minutes
**Prerequisites:** P1.1 (Cloudinary), P1.2, P1.3
**Blocks:** Most Priority 2 tests

This is the MAIN critical path - validates entire system flow.

**Part A - Create Occurrence (as VEREADOR)**

1. Login as `vereador@teste.com`
2. Tap "Nova Ocorrência" button
3. Fill form:
   - Título: `Teste QA - Buraco Grande na Rua`
   - Descrição: `Buraco de aproximadamente 2 metros na Rua Principal, altura do número 500. Causando risco para veículos e pedestres.`
   - Categoria: INFRAESTRUTURA
   - Prioridade: ALTA
   - Endereço: `Rua Principal, 500 - Centro`
4. Add photos:
   - Tap "Câmera" or "Galeria"
   - Select/take 2-3 photos
   - Wait for "Otimizando imagem..." to complete
   - Verify photos appear as thumbnails
5. (Optional) Test GPS:
   - If GPS available, verify address auto-filled
   - Can manually edit if needed
6. Tap "Registrar Ocorrência"
7. Wait for upload progress
8. Should show success alert

**Expected Results:**
- "Ocorrência registrada com sucesso! A equipe jurídica foi notificada."
- Redirects to Home screen
- New occurrence appears in list with:
  - Status: PENDENTE (yellow badge)
  - Priority: ALTA (red)
  - Photos displayed correctly
  - Title and category visible
- Backend logs show:
  - Photos uploaded to Cloudinary (check URLs)
  - Histórico entry created: "CRIADA"
  - Email sent to juridico team (check logs)

**Part B - Verify Occurrence Details**

1. Tap on the created occurrence
2. Review details screen

**Expected Results:**
- All photos load from Cloudinary
- Can swipe through photo gallery
- Title, description, address all correct
- Status badge shows "Pendente"
- Priority shows "Alta" in red
- Location section shows address
- "Ver no mapa" button appears if GPS data exists
- History section shows:
  - "CRIADA" action
  - By: (vereador name)
  - Timestamp

**Part C - Update Status to EM_ANALISE (as JURIDICO)**

1. Logout
2. Login as `juridico@teste.com`
3. Verify occurrence appears in list
4. Tap on occurrence
5. Verify can see all details
6. Tap "Atualizar Status" (or similar button - check implementation)
7. Select: EM_ANALISE
8. Add comment: `Encaminhado para análise técnica da equipe de obras.`
9. Confirm

**Expected Results:**
- Success message
- Status badge changes to "Em Análise" (blue)
- History shows new entry:
  - "STATUS_ALTERADO_EM_ANALISE"
  - Comment appears
  - By: Maria Jurídica (JURIDICO)
  - Timestamp
- Notification created for vereador (verify in Part E)

**Part D - Update Status to RESOLVIDO**

1. Still as JURIDICO
2. Update status again
3. Select: RESOLVIDO
4. Add comment: `Obra concluída em 05/11/2024. Buraco foi reparado pela equipe de manutenção.`
5. Confirm

**Expected Results:**
- Status badge changes to "Resolvido" (green)
- History shows new entry
- Second notification created for vereador

**Part E - Verify Vereador Notifications**

1. Logout
2. Login as `vereador@teste.com`
3. Check notifications (bell icon or notifications screen)

**Expected Results:**
- 2 new notifications:
  1. "Status da Ocorrência Atualizado" - ... alterado para EM_ANALISE
  2. "Status da Ocorrência Atualizado" - ... alterado para RESOLVIDO
- Notifications marked as unread (badge/indicator)
- Can tap to mark as read
- Can tap notification to view occurrence details

**Part F - Verify Complete History**

1. As vereador, open the occurrence
2. Scroll to History section

**Expected Results:**
- 3 history entries (newest first):
  1. STATUS_ALTERADO_RESOLVIDO - Maria Jurídica - with comment
  2. STATUS_ALTERADO_EM_ANALISE - Maria Jurídica - with comment
  3. CRIADA - (vereador name) - original creation

**If Test Fails:**

**Photo Upload Fails:**
- Error "Invalid Signature" → Cloudinary credentials wrong (redo P1.1)
- Error "Network request failed" → Check backend is running and mobile can reach it
- Photos don't appear → Check Cloudinary dashboard for uploaded images
- Check backend logs for detailed error

**Status Update Fails:**
- Error 403 "Acesso negado" → User type permissions wrong
- Error 404 → Occurrence not found, check ID
- Status doesn't change → Check backend logs, may be database issue

**Notifications Not Created:**
- Check backend logs for errors in notification creation
- Verify notificacoes table in Prisma Studio
- Check notification service implementation

**Email Not Sent:**
- Check backend logs - email errors are logged but don't block operation
- Verify EMAIL_* variables in .env
- Email sending is async - failure won't block the operation

---

## Priority 2: Core Features

### P2.1 - User Management (Admin Functions)
**Estimated Time:** 20 minutes
**Prerequisites:** P1.2 (Admin login)

**Test Cases:**

**P2.1.1 - View All Users**
1. Login as Super Admin
2. Tap "Gerenciar Usuários"
3. Review users list

**Expected Results:**
- All users displayed with cards
- Shows: name, email, type, status
- Grouped/sorted appropriately
- Statistics section shows:
  - Total users (should be 3: admin, vereador, juridico)
  - Count by type (1 ADMIN, 1 VEREADOR, 1 JURIDICO)
  - Count by status (3 ATIVO, 0 PENDENTE)

**P2.1.2 - Filter Users**
1. Test status filters:
   - Tap "Todos"
   - Tap "Pendentes" (should show 0 or new pending users)
   - Tap "Ativos" (should show 3)
   - Tap "Inativos" (should show 0)

**Expected Results:**
- Filters work correctly
- Counts update
- Pull-to-refresh updates data

**P2.1.3 - Deactivate User**
1. Find vereador user
2. Tap on user card
3. Tap "Desativar" button
4. Add reason: "Teste de desativação"
5. Confirm

**Expected Results:**
- User status changes to INATIVO
- Notification created for user
- Statistics update (2 ATIVO, 1 INATIVO)

**P2.1.4 - Verify Inactive User Cannot Login**
1. Logout
2. Try login as `vereador@teste.com`

**Expected Results:**
- Error: "Conta desativada. Entre em contato com o administrador"
- Cannot access system

**P2.1.5 - Reactivate User**
1. Login as Super Admin
2. Go to "Gerenciar Usuários"
3. Filter: Inativos
4. Tap on vereador
5. Tap "Reativar"
6. Confirm

**Expected Results:**
- Status changes back to ATIVO
- User can login again
- Notification created

**P2.1.6 - Change User Type**
1. Create new test user (vereador2@teste.com)
2. Approve as Super Admin
3. Tap on user
4. Change type to JURIDICO
5. Confirm

**Expected Results:**
- Type updates successfully
- User gets notification
- Statistics reflect change

---

### P2.2 - Permission Boundaries
**Estimated Time:** 15 minutes
**Prerequisites:** P1.2, P1.3 (All user types created)

**Test Cases:**

**P2.2.1 - VEREADOR Cannot Access Admin Functions**
1. Login as vereador
2. Verify:
   - "Gerenciar Usuários" button NOT visible
   - Cannot access user management (even via deep link if applicable)

**P2.2.2 - VEREADOR Can Only See Own Occurrences**
1. As vereador, view Home screen
2. Count occurrences

**Expected Results:**
- Only shows occurrences created by this vereador
- Cannot see occurrences from other vereadores

**P2.2.3 - VEREADOR Cannot Update Status**
1. Open own occurrence
2. Verify no "Atualizar Status" button visible
3. (If API accessible) Try API call to update status

**Expected Results:**
- No UI to update status
- API returns 403 "Acesso negado"

**P2.2.4 - JURIDICO Can See All Occurrences**
1. Login as juridico
2. View Home screen

**Expected Results:**
- Shows ALL occurrences from all vereadores
- Can filter by vereador if filter exists
- Can filter by status, category

**P2.2.5 - JURIDICO Cannot Create Occurrences**
1. As juridico, verify:
   - "Nova Ocorrência" button NOT visible
   - Cannot access creation screen

**P2.2.6 - JURIDICO Can Update Status**
1. Open any occurrence
2. Verify "Atualizar Status" button visible
3. Can change status
4. Can add comments

**Expected Results:**
- All status updates work
- History tracked correctly
- Vereador gets notification

**P2.2.7 - ADMIN Has Full Access**
1. Login as Super Admin
2. Verify can:
   - Manage users
   - See all occurrences
   - Update statuses
   - View statistics

---

### P2.3 - Filters and Search
**Estimated Time:** 20 minutes
**Prerequisites:** P1.4 (Occurrences exist)

**Setup:** Create test data
1. Login as vereador
2. Create 4-5 more occurrences with variety:
   - Different categories (LIMPEZA, ILUMINACAO, SAUDE)
   - Different priorities (BAIXA, MEDIA, ALTA)
   - Different statuses (use juridico to update some)

**Test Cases:**

**P2.3.1 - Filter by Status**
1. Login as juridico or admin (to see all)
2. Home screen → Filter buttons
3. Test each filter:
   - "Todas" → Shows all occurrences
   - "Pendentes" → Only PENDENTE status
   - "Em Análise" → Only EM_ANALISE
   - "Resolvidas" → Only RESOLVIDO
   - "Rejeitadas" → Only REJEITADO

**Expected Results:**
- Filters work correctly
- Count matches filtered list
- Can reset filter

**P2.3.2 - Filter by Category**
1. If category filter exists in UI
2. Test filtering by each category

**Expected Results:**
- Only shows occurrences of selected category

**P2.3.3 - Filter by Priority**
1. If priority filter exists
2. Test each priority level

**Expected Results:**
- Correct occurrences shown

**P2.3.4 - Combined Filters**
1. Apply status filter: "Pendentes"
2. Apply category filter: "INFRAESTRUTURA"

**Expected Results:**
- Shows only PENDENTE + INFRAESTRUTURA occurrences
- Multiple filters work together

**P2.3.5 - Search/Sort**
1. If search exists, test searching by:
   - Title keywords
   - Description keywords
2. If sort exists, test:
   - Newest first (default)
   - Oldest first
   - Priority (high to low)

---

### P2.4 - Photo Gallery and Maps
**Estimated Time:** 15 minutes
**Prerequisites:** P1.4 (Occurrence with photos and GPS exists)

**Test Cases:**

**P2.4.1 - Photo Gallery**
1. Open occurrence with multiple photos
2. Swipe through gallery

**Expected Results:**
- Can swipe left/right through photos
- Photos load from Cloudinary URLs
- High quality images (not blurry)
- No broken image icons
- Smooth scrolling

**P2.4.2 - Google Maps Integration**
1. Open occurrence with GPS coordinates
2. Tap "Ver no mapa" button

**Expected Results:**
- Opens Google Maps (or browser)
- Shows correct location pin
- Coordinates match the occurrence location

**P2.4.3 - Manual Address Entry**
1. Create new occurrence
2. Don't allow GPS / don't wait for GPS
3. Manually type address: "Av. Paulista, 1000 - São Paulo"
4. Submit

**Expected Results:**
- Occurrence created successfully
- Address saved as typed
- No "Ver no mapa" button (no GPS coords)
- Still valid occurrence

---

### P2.5 - Notification System
**Estimated Time:** 15 minutes
**Prerequisites:** P1.4 (Notifications created)

**Test Cases:**

**P2.5.1 - View Notifications**
1. Login as vereador (who received notifications)
2. Navigate to Notifications screen (bell icon)

**Expected Results:**
- Shows list of all notifications
- Newest first
- Shows: title, message, timestamp
- Unread notifications highlighted/badged

**P2.5.2 - Unread Count**
1. Verify unread count badge on bell icon

**Expected Results:**
- Badge shows correct number of unread notifications
- Updates when notifications marked as read

**P2.5.3 - Mark as Read**
1. Tap on unread notification

**Expected Results:**
- Notification marked as read
- Visual indicator changes
- Unread count decreases

**P2.5.4 - Mark All as Read**
1. Tap "Marcar todas como lidas" button

**Expected Results:**
- All notifications marked as read
- Badge disappears
- All visual indicators update

**P2.5.5 - Notification Types**
Verify different notification types display correctly:
- APROVACAO - "Cadastro Aprovado"
- STATUS_ALTERADO - "Status da Ocorrência Atualizado"
- DESATIVACAO - "Conta Desativada"
- REATIVACAO - "Conta Reativada"
- ALTERACAO_TIPO - "Tipo de Conta Alterado"

**P2.5.6 - Admin Notifications**
1. Login as Super Admin
2. Create notification for specific user (if admin feature exists)

**Expected Results:**
- User receives custom notification
- Displays correctly

---

### P2.6 - Statistics and Reports
**Estimated Time:** 10 minutes
**Prerequisites:** P1.4, P2.3 (Multiple occurrences exist)

**Test Cases:**

**P2.6.1 - User Statistics (Admin)**
1. Login as Super Admin
2. Go to "Gerenciar Usuários"
3. Review statistics section

**Expected Results:**
- Total users: correct count
- By type: correct distribution (X ADMIN, Y VEREADOR, Z JURIDICO)
- By status: correct counts (ATIVO, PENDENTE, INATIVO)
- Numbers match actual data in Prisma Studio

**P2.6.2 - Occurrence Statistics**
1. As admin or juridico
2. If stats screen exists, navigate to it
3. Review statistics

**Expected Results:**
- Total occurrences: correct count
- By status: correct distribution
- By category: correct distribution
- By priority: correct counts
- Charts/graphs display correctly (if implemented)

**P2.6.3 - Pull to Refresh**
1. On any stats screen
2. Pull down to refresh

**Expected Results:**
- Shows loading indicator
- Data refreshes
- Updates with latest counts

---

## Priority 3: Edge Cases & Polish

### P3.1 - Occurrence Edge Cases
**Estimated Time:** 20 minutes
**Prerequisites:** P1.4

**Test Cases:**

**P3.1.1 - Create Without Photos**
1. Login as vereador
2. Create occurrence
3. Fill all fields EXCEPT photos
4. Tap submit

**Expected Results:**
- Shows confirmation: "Deseja enviar sem fotos?"
- If confirm: creates successfully
- Occurrence has no photos section
- Everything else works normally

**P3.1.2 - Maximum Photos (5)**
1. Create occurrence
2. Add 5 photos
3. Verify cannot add 6th photo

**Expected Results:**
- Shows alert: "Limite atingido. Você pode adicionar no máximo 5 fotos"
- Add photo buttons disabled/hidden
- Can still remove photos and add again

**P3.1.3 - Photo Compression**
1. Select large photo (>5MB if possible)
2. Verify "Otimizando imagem..." appears
3. Check backend logs for uploaded size

**Expected Results:**
- Shows compression indicator
- Photo uploaded successfully
- Size reduced (check Cloudinary dashboard)
- Quality still acceptable

**P3.1.4 - Remove Photo Before Upload**
1. Add 3 photos
2. Tap X on middle photo to remove
3. Photo removed from preview
4. Submit

**Expected Results:**
- Only 2 photos uploaded
- Order preserved (1st and 3rd)

**P3.1.5 - Very Long Title/Description**
1. Enter title: 200+ characters
2. Enter description: 2000+ characters
3. Submit

**Expected Results:**
- Either: accepts long text, or
- Shows validation error with character limit
- UI handles long text gracefully (wrapping, scrolling)

**P3.1.6 - Special Characters**
1. Enter title: `Buraco "grande" & perigoso (urgente!)`
2. Enter description with line breaks and special chars
3. Submit

**Expected Results:**
- Accepts special characters
- Displays correctly in list and details
- No encoding issues

**P3.1.7 - Delete Occurrence**
1. Create new occurrence (status: PENDENTE)
2. Open it
3. Tap "Excluir Ocorrência" button
4. Confirm

**Expected Results:**
- Shows confirmation dialog
- On confirm: deletes successfully
- Removed from list
- Cannot view details anymore

**P3.1.8 - Cannot Delete Non-Pending**
1. Have juridico update an occurrence to EM_ANALISE
2. Login as vereador
3. Try to delete it

**Expected Results:**
- "Excluir" button NOT visible or disabled
- If try via API: Error "Apenas ocorrências pendentes podem ser deletadas"

**P3.1.9 - Cannot Delete Other's Occurrence**
1. Create vereador2 user
2. Create occurrence as vereador
3. Login as vereador2
4. Try to access/delete vereador's occurrence

**Expected Results:**
- Cannot even see the occurrence (filtered out)
- If access via API: Error 403 "Acesso negado"

---

### P3.2 - Authentication Edge Cases
**Estimated Time:** 15 minutes

**Test Cases:**

**P3.2.1 - Invalid Credentials**
1. Enter email: `vereador@teste.com`
2. Enter wrong password: `wrong123`
3. Tap "Entrar"

**Expected Results:**
- Error: "Credenciais inválidas"
- Does not login
- Can try again

**P3.2.2 - Non-existent Email**
1. Enter email: `notexist@test.com`
2. Enter any password
3. Tap "Entrar"

**Expected Results:**
- Error: "Credenciais inválidas"
- Does not reveal if email exists (security)

**P3.2.3 - Empty Fields**
1. Leave email empty
2. Tap "Entrar"

**Expected Results:**
- Validation error
- Cannot submit

**P3.2.4 - Logout**
1. While logged in
2. Go to Profile/Settings
3. Tap "Logout"

**Expected Results:**
- Logged out successfully
- Redirects to Login screen
- Token cleared from storage
- Cannot access protected screens

**P3.2.5 - Token Expiration**
1. Login successfully
2. (Manually) Wait 2+ hours OR edit JWT_EXPIRES_IN in .env to 1m
3. Try to create occurrence

**Expected Results:**
- Error: "Token expirado" or similar
- Redirects to login
- Must login again

**P3.2.6 - Duplicate Registration**
1. Try to register with email: `vereador@teste.com` (exists)

**Expected Results:**
- Error: "CPF ou email já cadastrado"
- Cannot create duplicate account

**P3.2.7 - Invalid Email Format**
1. Register with email: `notanemail`
2. Submit

**Expected Results:**
- Validation error: "Email inválido"
- Cannot submit

**P3.2.8 - Password Mismatch**
1. Register new user
2. Senha: `123456`
3. Confirmar Senha: `123457`
4. Submit

**Expected Results:**
- Error: "Senhas não coincidem"
- Cannot submit

**P3.2.9 - CPF Validation**
1. Enter invalid CPF: `12345`
2. Submit

**Expected Results:**
- Validation error
- Should require 11 digits

---

### P3.3 - UI/UX Polish
**Estimated Time:** 15 minutes

**Test Cases:**

**P3.3.1 - Loading States**
1. During occurrence creation, verify:
   - Loading spinner shows
   - Progress percentage displays
   - Submit button disabled during upload
   - Cannot navigate away

**P3.3.2 - Pull to Refresh**
1. On Home screen
2. Pull down list

**Expected Results:**
- Shows refresh indicator
- Reloads occurrences
- Updates timestamps

**P3.3.3 - Empty States**
1. Create new vereador with no occurrences
2. Login
3. View Home

**Expected Results:**
- Shows empty state message
- Helpful text: "Você ainda não criou nenhuma ocorrência"
- Button to create first occurrence

**P3.3.4 - Error Handling**
1. Turn off backend
2. Try to create occurrence

**Expected Results:**
- Error message: "Não foi possível conectar ao servidor"
- Helpful message
- Can retry

**P3.3.5 - Offline Behavior**
1. Turn off WiFi/data
2. Try various operations

**Expected Results:**
- Graceful error messages
- App doesn't crash
- Explains connectivity issue

**P3.3.6 - Network Recovery**
1. Start operation (e.g., load occurrences)
2. Turn off network
3. Operation fails
4. Turn on network
5. Pull to refresh

**Expected Results:**
- Recovers gracefully
- Data loads after network restored

**P3.3.7 - Image Loading States**
1. On slow network
2. Open occurrence with photos

**Expected Results:**
- Shows placeholder/skeleton while loading
- Loads images progressively
- No broken image icons

**P3.3.8 - Navigation**
1. Test deep navigation:
   - Home → Occurrence Details → Back
   - Home → Create → Back (should warn if data entered)
   - Profile → Edit → Back

**Expected Results:**
- Navigation smooth
- Back button works correctly
- Confirmation on data loss

---

### P3.4 - Data Validation
**Estimated Time:** 10 minutes

**Test Cases:**

**P3.4.1 - Timestamp Accuracy**
1. Create occurrence
2. Note creation time
3. Verify in details screen

**Expected Results:**
- Timestamp in correct timezone (local time)
- Format: DD/MM/YYYY HH:MM or localized format
- Matches actual creation time

**P3.4.2 - History Order**
1. Occurrence with multiple history entries
2. View history section

**Expected Results:**
- Newest entries at top
- Chronological order
- All entries present

**P3.4.3 - User Info Accuracy**
1. In occurrence details
2. Verify vereador name matches creator
3. In history, verify user names correct

**Expected Results:**
- All user references accurate
- Names not null/undefined
- User types display correctly

**P3.4.4 - Status Color Coding**
Verify color consistency:
- PENDENTE: Yellow/Orange
- EM_ANALISE: Blue
- RESOLVIDO: Green
- REJEITADO: Red

**Expected Results:**
- Colors consistent across app
- Accessible (good contrast)
- Icons match status

---

## Test Dependencies

### Critical Dependency Chain
```
P1.1 (Cloudinary) ──> P1.4 (Lifecycle)
                      ↓
P1.2 (Login) ────────> P1.4, P2.1, P2.2
                      ↓
P1.3 (Juridico) ─────> P1.4, P2.2, P2.3
                      ↓
P1.4 (Lifecycle) ────> P2.2, P2.3, P2.4, P2.5, P3.1
```

### Parallel Tests
Can be executed simultaneously:
- P2.1 (User Management) - independent
- P3.2 (Auth Edge Cases) - independent
- P3.3 (UI/UX) - can test during other tests

### Blocking Issues
If P1.1 (Cloudinary) fails:
- Cannot test photo upload (P1.4 Part A)
- Cannot test photo gallery (P2.4)
- CAN still test: authentication, permissions, status updates, notifications

If P1.4 fails completely:
- Most Priority 2 tests blocked
- Can still test: P2.1 (User Management), P3.2 (Auth)

---

## Test Data Management

### Before Testing Session

**Recommended Database State:**
1. Keep existing users:
   - Super Admin (krisalexandre2018@gmail.com)
   - Vereador (vereador@teste.com)
2. Create fresh juridico during test
3. Start with 0-1 occurrences

**To Reset Data (if needed):**
```bash
cd "E:\Todos os projetos\Prefeitura App\backend"

# Option 1: Prisma Studio (GUI)
npm run prisma:studio
# Manually delete records from tables: ocorrencias, fotos, historicos, notificacoes

# Option 2: SQL (careful!)
# Connect to database and run:
# DELETE FROM fotos;
# DELETE FROM historicos;
# DELETE FROM notificacoes;
# DELETE FROM ocorrencias;
```

### Test Data Created During Session

**Users:**
- juridico@teste.com (P1.3)
- vereador2@teste.com (Optional - P2.1.6)

**Occurrences:**
- 1 main test occurrence (P1.4)
- 4-5 variety occurrences (P2.3 setup)
- 2-3 edge case occurrences (P3.1)

**Total:** ~6-9 occurrences by end of testing

### After Testing Session

**Options:**
1. **Keep data** - for demo/reference
2. **Clean up** - delete test users/occurrences
3. **Reset completely** - fresh database

**To preserve Super Admin only:**
```sql
-- Backup super admin
-- Then delete all other users and their data
-- Be careful with this!
```

---

## Bug Reporting

### Bug Report Template

```markdown
### Bug Title
[Short descriptive title]

**Test Case:** P1.4.2 - Create Occurrence
**Severity:** Critical / High / Medium / Low
**Environment:**
- Backend: http://localhost:3000
- Mobile: Expo Go on Android/iOS
- Date/Time: [timestamp]

**Steps to Reproduce:**
1. Login as vereador@teste.com
2. Tap "Nova Ocorrência"
3. Add photo from camera
4. Tap submit

**Expected Result:**
Occurrence created successfully with photo uploaded to Cloudinary

**Actual Result:**
Error: "Invalid Signature" from Cloudinary

**Screenshots:**
[Attach if possible]

**Backend Logs:**
```
[Paste relevant error logs]
```

**Additional Notes:**
[Any other relevant info]

**Workaround:**
[If any workaround exists]
```

### Severity Levels

**Critical:**
- System unusable
- Data loss
- Security vulnerability
- Blocks all testing

**High:**
- Major feature broken
- Blocks important tests
- No workaround available

**Medium:**
- Feature partially broken
- Workaround exists
- Affects some users

**Low:**
- Cosmetic issue
- Minor inconvenience
- Edge case

### Common Issues Reference

**"Invalid Signature" (Cloudinary):**
- **Cause:** Wrong API credentials or backend not reloaded
- **Fix:** Verify .env and restart backend (P1.1)

**"Network request failed":**
- **Cause:** Mobile can't reach backend
- **Fix:** Check API URL in mobile/src/services/api.js, ensure same network

**"Token expirado":**
- **Cause:** JWT expired (2hr default)
- **Fix:** Login again

**"Acesso negado" (403):**
- **Cause:** Permission issue
- **Fix:** Verify user type has correct permissions

**"Conta aguardando aprovação":**
- **Cause:** User status is PENDENTE
- **Fix:** Have admin approve user

**Photos don't load:**
- **Cause:** Cloudinary URL wrong or images deleted
- **Fix:** Check Cloudinary dashboard, verify URLs

**GPS not working:**
- **Cause:** Permissions denied or no GPS signal
- **Fix:** Allow location permissions, try outdoors, or use manual address

---

## Test Execution Tracking

### Recommended Execution Order

**Session 1 - Critical Path (1-1.5 hours):**
1. ✅ P1.1 - Cloudinary Configuration
2. ✅ P1.2 - Login Flow
3. ✅ P1.3 - Create JURIDICO User
4. ✅ P1.4 - Complete Occurrence Lifecycle

**Break: 15 minutes**

**Session 2 - Core Features (1.5-2 hours):**
5. ✅ P2.1 - User Management
6. ✅ P2.2 - Permission Boundaries
7. ✅ P2.3 - Filters and Search
8. ✅ P2.4 - Photo Gallery and Maps
9. ✅ P2.5 - Notification System
10. ✅ P2.6 - Statistics and Reports

**Break: 15 minutes**

**Session 3 - Edge Cases (1 hour):**
11. ✅ P3.1 - Occurrence Edge Cases
12. ✅ P3.2 - Authentication Edge Cases
13. ✅ P3.3 - UI/UX Polish
14. ✅ P3.4 - Data Validation

### Progress Tracker

Create a simple checklist file:

```
## QA Testing Progress - 06/11/2024

### Priority 1: Critical Path
- [ ] P1.1 - Cloudinary Configuration
- [ ] P1.2 - Login Flow (All User Types)
- [ ] P1.3 - Create JURIDICO User
- [ ] P1.4 - Complete Occurrence Lifecycle

### Priority 2: Core Features
- [ ] P2.1 - User Management
- [ ] P2.2 - Permission Boundaries
- [ ] P2.3 - Filters and Search
- [ ] P2.4 - Photo Gallery and Maps
- [ ] P2.5 - Notification System
- [ ] P2.6 - Statistics and Reports

### Priority 3: Edge Cases
- [ ] P3.1 - Occurrence Edge Cases
- [ ] P3.2 - Authentication Edge Cases
- [ ] P3.3 - UI/UX Polish
- [ ] P3.4 - Data Validation

### Issues Found
1. [Bug ID] - [Description] - Severity: [Level] - Status: [Open/Fixed]
```

---

## Success Criteria

### Minimum Viable (Must Pass)
- All Priority 1 tests pass (P1.1 - P1.4)
- P2.2 - Permission Boundaries pass
- No critical bugs

### Production Ready (Recommended)
- All Priority 1 & 2 tests pass
- <3 high severity bugs
- All medium/low bugs documented

### Excellent Quality (Ideal)
- All tests pass (P1, P2, P3)
- <5 total bugs
- All bugs documented with workarounds

---

## Notes

### Testing Best Practices
1. Test one feature at a time
2. Document bugs immediately
3. Take screenshots of errors
4. Check backend logs for all failures
5. Verify data in Prisma Studio when in doubt
6. Clear app cache if behavior seems inconsistent

### Mobile Testing Tips
- Keep backend terminal visible to monitor logs
- Use Expo Go "Shake device → Reload" if app freezes
- Clear AsyncStorage if auth issues persist
- Test on both simulator and physical device if possible

### Backend Testing Tips
- Monitor backend console for errors
- Check Prisma Studio to verify database state
- Test API endpoints directly (Postman/Insomnia) if mobile fails
- Restart backend after .env changes

---

## Appendix: Quick Reference

### API Endpoints
```
POST   /api/auth/register       - Register user
POST   /api/auth/login          - Login
GET    /api/auth/me             - Get current user

GET    /api/ocorrencias         - List occurrences
POST   /api/ocorrencias         - Create occurrence
GET    /api/ocorrencias/:id     - Get occurrence details
PATCH  /api/ocorrencias/:id/status - Update status
DELETE /api/ocorrencias/:id     - Delete occurrence

GET    /api/users               - List all users (admin)
GET    /api/users/pending       - List pending users (admin)
PATCH  /api/users/:id/approve   - Approve user (admin)
PATCH  /api/users/:id/deactivate - Deactivate user (admin)
PATCH  /api/users/:id/reactivate - Reactivate user (admin)

GET    /api/notificacoes        - List notifications
PATCH  /api/notificacoes/:id/read - Mark as read
PATCH  /api/notificacoes/read-all - Mark all as read
GET    /api/notificacoes/unread-count - Count unread
```

### Database Tables
- users - User accounts
- ocorrencias - Occurrence records
- fotos - Photos (linked to ocorrencias)
- historicos - Audit log for occurrences
- notificacoes - User notifications
- password_resets - Password reset tokens

### Environment Variables
```
# Backend .env
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=2h
CLOUDINARY_CLOUD_NAME=doalug1yw
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
EMAIL_FROM=...
ADMIN_EMAIL=...
```

### Useful Commands
```bash
# Backend
cd "E:\Todos os projetos\Prefeitura App\backend"
npm run dev              # Start dev server
npm run prisma:studio    # Open database GUI
npm run prisma:migrate   # Run migrations

# Mobile
cd "E:\Todos os projetos\Prefeitura App\mobile"
npm start                # Start Expo
npm run android          # Run on Android
expo start -c            # Clear cache

# List users
node list-users.js       # Custom script
```

---

**END OF QA TEST PLAN**

*Version 1.0 - 06/11/2024*
*Ready for execution - Good luck! 🚀*
