# Emergency Room (UGD) Module

## Overview
The Emergency Room module provides a complete workflow for managing emergency patients, from quick triage registration to patient handover to other departments.

## Architecture

### Directory Structure
```
emergency/
├── README.md                          # This file
├── types/emergency.ts                 # TypeScript type definitions
├── lib/emergency/
│   ├── triage-utils.ts               # Triage utility functions
│   ├── validation.ts                 # Zod validation schemas
│   └── api-service.ts                # Database service layer
├── hooks/
│   ├── use-er-queue.ts               # ER queue management hook
│   ├── use-quick-registration.ts     # Quick registration hook
│   └── use-handover.ts               # Patient handover hook
├── components/emergency/
│   ├── quick-registration-form.tsx   # Quick ER registration form
│   ├── handover-dialog.tsx           # Patient handover dialog
│   ├── er-queue-stats.tsx            # Queue statistics cards
│   ├── er-queue-item.tsx             # Individual queue item card
│   ├── er-queue-empty.tsx            # Empty state component
│   ├── er-queue-loading.tsx          # Loading state component
│   └── er-medical-record-form.tsx    # ER-specific medical record form
├── app/api/emergency/
│   ├── quick-register/route.ts       # Quick registration API
│   ├── complete-registration/route.ts # Complete patient data API
│   └── handover/route.ts             # Patient handover API
└── app/dashboard/emergency/
    └── page.tsx                      # ER queue dashboard page
```

## Key Features

### 1. **Quick Registration**
- Minimal data entry for urgent cases
- Triage-based prioritization (Red/Yellow/Green)
- Auto-generates MR and Visit numbers
- Can be completed later when patient stabilizes

### 2. **Triage System**
- **Red (Merah)**: Critical - Immediate attention required
- **Yellow (Kuning)**: Urgent - Needs prompt care
- **Green (Hijau)**: Non-urgent - Can wait
- Color-coded UI for instant recognition
- Priority-based queue sorting

### 3. **Real-Time Queue Management**
- Auto-refresh every 30 seconds
- Sorted by triage priority + arrival time
- Live statistics dashboard
- Patient search and filtering

### 4. **Patient Handover**
- Transfer to Outpatient (Rawat Jalan)
- Transfer to Inpatient (Rawat Inap)
- Preserves patient history
- Adds handover notes

### 5. **ER Medical Records**
- Streamlined for emergency documentation
- Vital signs tracking
- Emergency actions logging
- Disposition (discharged/admitted/referred/observation)

## Code Organization

### Types (`types/emergency.ts`)
Centralized type definitions:
- `TriageStatus`: "red" | "yellow" | "green"
- `DispositionType`: "discharged" | "admitted" | "referred" | "observation"
- `ERQueueItem`: Visit with Patient data
- `TriageStatistics`: Queue statistics
- `APIResponse`: Standard API response format

### Utilities (`lib/emergency/triage-utils.ts`)
Reusable triage logic:
- `getTriageConfig()`: Get configuration by status
- `getTriageBadgeColor()`: Badge styling classes
- `getTriageLabel()`: Human-readable label
- `getTriagePriority()`: Sort priority
- `sortByTriagePriority()`: Sort queue items
- `isValidTriageStatus()`: Type guard

### Validation (`lib/emergency/validation.ts`)
Zod schemas for API validation:
- `quickERRegistrationSchema`: Quick registration
- `completeRegistrationSchema`: Complete patient data
- `handoverSchema`: Patient handover
- `erMedicalRecordSchema`: ER medical records

### Service Layer (`lib/emergency/api-service.ts`)
Database operations:
- `createQuickERRegistration()`: Create patient + visit
- `completePatientRegistration()`: Update patient data
- `performHandover()`: Transfer patient
- `getERQueue()`: Fetch queue data

### Custom Hooks
**useERQueue**
```typescript
const {
  sortedQueue,      // Sorted queue items
  statistics,       // Triage statistics
  isLoading,        // Loading state
  lastRefresh,      // Last refresh timestamp
  refresh           // Manual refresh function
} = useERQueue({
  autoRefresh: true,
  refreshInterval: 30000
});
```

**useQuickRegistration**
```typescript
const {
  register,         // Registration function
  isSubmitting,     // Submit state
  error,            // Error message
  success           // Success state
} = useQuickRegistration(onSuccess);
```

**useHandover**
```typescript
const {
  handover,         // Handover function
  isSubmitting,     // Submit state
  error,            // Error message
  success           // Success state
} = useHandover(onSuccess);
```

## Component Usage

### ER Queue Dashboard
```typescript
import { ERQueueStats } from "@/components/emergency/er-queue-stats";
import { ERQueueItemCard } from "@/components/emergency/er-queue-item";
import { useERQueue } from "@/hooks/use-er-queue";

const { sortedQueue, statistics } = useERQueue();

return (
  <>
    <ERQueueStats statistics={statistics} />
    {sortedQueue.map((item, index) => (
      <ERQueueItemCard key={item.visit.id} item={item} index={index} />
    ))}
  </>
);
```

### Quick Registration Form
```typescript
import { QuickRegistrationForm } from "@/components/emergency/quick-registration-form";

<QuickRegistrationForm
  onSuccess={(data) => console.log("Registered:", data)}
  onCancel={() => setOpen(false)}
/>
```

### Handover Dialog
```typescript
import { HandoverDialog } from "@/components/emergency/handover-dialog";

<HandoverDialog
  open={open}
  onOpenChange={setOpen}
  visitId={visitId}
  patientName={patientName}
  onSuccess={() => refreshQueue()}
/>
```

## API Endpoints

### POST `/api/emergency/quick-register`
Quick ER registration
```json
{
  "name": "John Doe",
  "chiefComplaint": "Chest pain",
  "triageStatus": "red",
  "nik": "1234567890123456",
  "phone": "08123456789",
  "gender": "male"
}
```

### PATCH `/api/emergency/complete-registration`
Complete patient data after triage
```json
{
  "patientId": 1,
  "nik": "1234567890123456",
  "address": "Jl. Example No. 123",
  "birthDate": "1990-01-01",
  "gender": "male",
  "insuranceType": "bpjs"
}
```

### POST `/api/emergency/handover`
Transfer patient to other department
```json
{
  "visitId": 1,
  "newVisitType": "inpatient",
  "roomId": 5,
  "notes": "Patient stable, needs observation"
}
```

## Performance Optimizations

1. **Auto-refresh with debouncing**: Prevents excessive API calls
2. **Memoized sorting**: Uses `useMemo` for expensive computations
3. **Component splitting**: Small, focused components for better re-rendering
4. **Custom hooks**: Centralized state management and logic reuse
5. **Type safety**: Full TypeScript coverage prevents runtime errors
6. **Service layer separation**: Database logic separated from API routes

## Best Practices

### Type Safety
Always use TypeScript types from `types/emergency.ts`:
```typescript
import { TriageStatus, ERQueueItem } from "@/types/emergency";
```

### Utility Functions
Use centralized utilities instead of duplicating logic:
```typescript
import { getTriageLabel, sortByTriagePriority } from "@/lib/emergency/triage-utils";
```

### Error Handling
All API routes follow consistent error handling pattern:
```typescript
try {
  // ... operation
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
  } else if (error instanceof Error) {
    // Handle application errors
  } else {
    // Handle unknown errors
  }
}
```

### Form Validation
Use Zod schemas with react-hook-form:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(formSchema)
});
```

## Testing Considerations

### Unit Tests
- Utility functions in `triage-utils.ts`
- Validation schemas in `validation.ts`
- Service layer functions in `api-service.ts`

### Integration Tests
- Custom hooks with mock API responses
- Form submission flows
- API endpoint handlers

### E2E Tests
- Complete patient registration flow
- Queue dashboard updates
- Patient handover process

## Future Enhancements

1. **Real-time updates**: WebSocket support for live queue updates
2. **Analytics dashboard**: ER performance metrics
3. **Notification system**: Alert staff for critical patients
4. **Print support**: Queue tickets and patient labels
5. **Mobile optimization**: Responsive design for tablets
6. **Offline support**: PWA capabilities for unreliable connections

## Troubleshooting

### Queue not updating
- Check auto-refresh is enabled
- Verify API endpoint is accessible
- Check browser console for errors

### Triage colors not showing
- Ensure Tailwind CSS is compiled
- Check `TRIAGE_CONFIG` in `triage-utils.ts`
- Verify CSS classes are whitelisted

### Form validation errors
- Check Zod schema matches form fields
- Ensure react-hook-form resolver is configured
- Verify field names match schema keys

## Contributors

Module created and refactored following clean code principles:
- Modular architecture
- Type safety
- Performance optimization
- Code reusability
- Comprehensive documentation
