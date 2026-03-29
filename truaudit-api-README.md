# TruAudit Pro — API

C++ REST API backend for TruAudit Pro, a compliance audit management application built for organizations operating under the AS9100D / ISO 9001 quality management standard.

## Purpose

This repository contains the service layer and database integration. It handles all business logic, enforces role-based access rules, and persists data to a PostgreSQL database.

## Role in the Application

This project sits between the React frontend (`truaudit-ui`) and the PostgreSQL database. It exposes a JSON REST API that the frontend calls over HTTP. No business logic lives in the frontend — all rules around roles, audit status transitions, corrective actions, and recommendation delinquency are enforced here.

## Endpoints (MVP)

| Method | Path | Purpose |
|--------|------|---------|
| POST | /auth/login | Authenticate user, return JWT |
| POST | /audits | Create new audit |
| PUT | /audits/:id/submit | Submit audit |
| PUT | /audits/:id/review | Move to in review |
| PUT | /audits/:id/close | Close audit |
| GET | /audits | Fetch audits with filters |
| PUT | /corrective_actions/:id/resolve | Resolve corrective action |
| POST | /recommendations | Submit recommendation |
| GET | /recommendations | Fetch recommendations |
| PUT | /recommendations/:id/address | Address recommendation |
| GET | /departments | Fetch department list |

## Tech Stack

- C++ with Crow (HTTP server)
- PostgreSQL (database)
- libpqxx (database driver)
- nlohmann/json (JSON parsing)
- bcrypt (password hashing)

## Design Documents

The `/design` folder contains:

- `TruAudit_Pro_Service_Layer.docx` — all REST endpoints with sample requests, responses, and error handling
- `TruAudit_Pro_Database_Design.docx` — PostgreSQL schema, table descriptions, and relationships
