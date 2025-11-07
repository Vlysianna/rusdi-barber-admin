# Rusdi Barber - Dashboard & Management Integration Guide

## Overview
This guide documents the integration between the Rusdi Barber frontend dashboard and the backend API, including navigation fixes to management pages.

## Architecture Overview

### Frontend Structure
```
rusdi-barber/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx               # Main dashboard component
│   │   ├── management/
│   │   │   ├── BookingManagement.tsx   # Booking management page
│   │   │   ├── ServiceManagement.tsx   # Service management page
│   │   │   └── StylistManagement.tsx   # Stylist management page
│   │   └── ...
│   ├── services/
│   │   ├── api.ts                      # Core API service
│   │   ├── dashboardService.ts         # Dashboard API calls
│   │   ├── healthService.ts            # Backend health checks
│   │   └── mockDashboardService.ts     # Fallback mock data
│   └── ...
```

### Backend Structure
```
rusdi-barber