# Loretto School of Childhood — Digital Platform

## Overview

Multi-branch Nigerian school digital platform with three client applications:
- **Admin Dashboard** (Next.js, port 3001) — teachers, accountants, management, Super Admin
- **Student Dashboard** (Next.js, port 3002) — assessments, CBTs, e-library
- **Mobile App** (Expo/React Native) — parent mobile app
- **Cloud Functions** (Firebase) — backend logic

## Architecture

- **Monorepo:** Turborepo with npm workspaces
- **Namespace:** `@loretto/` for all internal packages
- **Backend:** Firebase (Auth, Firestore, Cloud Functions, Storage)
- **Firebase SDK:** Firebase JS SDK shared via `@loretto/firebase-config`
- **Internal packages:** Turborepo "Internal Packages" pattern (no build step, consuming apps transpile directly)

## Dev Commands

```bash
npm run dev          # Start all apps (admin :3001, student :3002, mobile :8081)
npm run build        # Build all apps
npm run lint         # Lint all packages
npm run type-check   # Type-check all packages
npm run emulators    # Start Firebase emulators
```

## Project Structure

```
apps/
  admin-dashboard/   # Next.js 15, App Router, Tailwind v4, port 3001
  student-dashboard/ # Next.js 15, App Router, Tailwind v4, port 3002
  mobile/            # Expo (managed), Expo Router
  functions/         # Firebase Cloud Functions (TypeScript)

packages/
  shared-types/      # TypeScript interfaces (User, School, Application, Module, roles)
  firebase-config/   # Firebase init, auth/firestore/storage instances, hooks
  shared-ui/         # Common web components (shared by both dashboards)
  eslint-config/     # Shared ESLint configs (base, next, react-native)
  typescript-config/ # Shared tsconfigs (base, nextjs, react-native, functions)
```

## Firestore Data Model

```
/schools/{schoolId}                    — branch info, settings, term dates
  /announcements/{announcementId}      — school-wide announcements

/users/{userId}                        — ALL user types (role discriminator field)
  /notifications/{notificationId}      — per-user notifications

/applications/{applicationId}          — parent registration applications

/modules/{moduleId}                    — feature module definitions

/featureAssignments/{assignmentId}     — links modules to users/roles/schools
```

## Roles

| Role | Sub-roles | Platform |
|------|-----------|----------|
| `super_admin` | — | Admin Dashboard |
| `admin` | `teacher`, `accountant`, `management` | Admin Dashboard |
| `parent` | — | Mobile App |
| `student` | — | Student Dashboard |

- Students always have a `parentId`
- Parents have a `childrenIds[]` array
- Firebase Auth custom claims carry `role`, `adminSubRole`, `schoolIds`

## Modular Feature System

Data-driven module system (no redeployment needed):
1. Create document in `/modules` (name, route, targetRoles, icon)
2. Admin assigns via `/featureAssignments` (per-user, per-role, or per-school)
3. Client `useModules` hook resolves visible modules on login
4. Navigation renders dynamically

## Onboarding Flow

Parent applies (public form) → Admin reviews → Approves/Rejects → On approval: Firebase Auth accounts created for parent + children → Custom claims set → Users can log in

## Environment Variables

Both dashboards use `NEXT_PUBLIC_` prefix. Mobile uses `EXPO_PUBLIC_` prefix.

Required:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `USE_FIREBASE_EMULATORS` (set to "true" for local dev)

## Phase Roadmap

- **Phase 1:** Foundation (monorepo, all apps compiling, Firebase connected) ✅
- **Phase 2:** Authentication (Firebase Auth, role-based guards, login/signup flows)
- **Phase 3:** Application & Onboarding (parent application form, admin review, account provisioning)
- **Phase 4:** Modules (dynamic feature system, initial modules)
