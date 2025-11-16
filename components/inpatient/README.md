# Inpatient Care (Rawat Inap) Module

## Overview
The Inpatient Care module provides comprehensive management for hospitalized patients, including room management, bed assignments, vital signs monitoring, integrated progress notes (CPPT), and medical materials tracking.

## Architecture

### Directory Structure
```
inpatient/
├── README.md                          # This file
├── types/inpatient.ts                 # TypeScript type definitions
├── lib/inpatient/
│   ├── room-utils.ts                 # Room utility functions
│   ├── vitals-utils.ts               # Vital signs calculations & validations
│   ├── validation.ts                 # Zod validation schemas
│   └── api-service.ts                # Database service layer
├── hooks/
│   ├── use-rooms.ts                  # Room management hook
│   ├── use-vitals.ts                 # Vital signs hook
│   ├── use-cppt.ts                   # CPPT operations hook
│   └── use-materials.ts              # Material tracking hook
├── app/api/
│   ├── rooms/
│   │   ├── route.ts                  # Room CRUD API
│   │   └── assign/route.ts           # Bed assignment API
│   ├── vitals/route.ts               # Vital signs API
│   ├── cppt/route.ts                 # CPPT API
│   └── materials/route.ts            # Material usage API
└── app/dashboard/inpatient/
    └── rooms/page.tsx                # Room dashboard page
```

## Database Schema

### Tables (Already Implemented)
- **`rooms`** - Hospital room master data
  - Room number, type, bed count, daily rate
  - Floor, building, facilities
  - Availability tracking

- **`bed_assignments`** - Patient-bed tracking
  - Visit-room-bed linking
  - Assignment and discharge timestamps
  - Notes and assignment history

- **`vitals_history`** - Vital signs timeline
  - Temperature, BP, pulse, respiratory rate
  - SpO2, weight, height, BMI (auto-calculated)
  - Pain scale, consciousness level
  - Audit trail (recorded by, recorded at)

- **`cppt`** - Integrated Progress Notes
  - SOAP format (Subjective, Objective, Assessment, Plan)
  - Author tracking (doctor/nurse)
  - Progress notes and instructions
  - Chronological timeline

- **`material_usage`** - Medical supplies tracking
  - Material name, quantity, unit
  - Pricing (unit price, total price)
  - Usage tracking (used by, used at)
  - Ready for billing integration

## Key Features

### 1. **Room Management**
✅ Complete CRUD operations for rooms
✅ Real-time occupancy tracking
✅ Visual occupancy dashboard with color coding
✅ Statistics (total rooms, available, occupied, full)
✅ Filter by status and room type
✅ Auto-refresh support

### 2. **Bed Assignment**
✅ Assign patients to specific beds
✅ Validate bed availability before assignment
✅ Prevent double-booking
✅ Auto-update room occupancy
✅ Discharge tracking
✅ Link visits to rooms

### 3. **Vital Signs Monitoring**
✅ Comprehensive vital signs recording
✅ Auto-calculated BMI
✅ Timeline tracking (multiple recordings per day)
✅ Validation functions for normal ranges
✅ Status indicators (low/normal/high)
✅ Audit trail (who recorded when)

### 4. **CPPT (Integrated Progress Notes)**
✅ Shared documentation for doctors and nurses
✅ SOAP format support
✅ Role-based entries (doctor/nurse)
✅ Chronological timeline
✅ Instructions for nursing staff
✅ Complete communication trail

### 5. **Material/Supply Tracking**
✅ Record medical supplies usage
✅ Auto-calculated total costs
✅ Quantity and unit tracking
✅ Billing-ready data
✅ Usage history
✅ Cost aggregation

## Refactored Architecture

### Type System (`types/inpatient.ts`)
Complete TypeScript coverage with:
- Entity types (Room, VitalSigns, CPPT, MaterialUsage)
- Input types for API calls
- Response types
- Enum types (RoomStatus, AuthorRole, etc.)
- Extended types (RoomWithOccupancy)
- Statistics types

```typescript
import { Room, VitalSigns, CPPT } from "@/types/inpatient";
```

### Utility Functions

**Room Utils** (`lib/inpatient/room-utils.ts`):
```typescript
import {
  getRoomStatusConfig,
  getRoomCardClasses,
  calculateRoomStatistics,
  filterRoomsByStatus,
  formatCurrency
} from "@/lib/inpatient/room-utils";
```

**Vital Signs Utils** (`lib/inpatient/vitals-utils.ts`):
```typescript
import {
  calculateBMI,
  getBMICategory,
  formatBloodPressure,
  getBloodPressureCategory,
  getTemperatureStatus,
  getPulseStatus,
  getOxygenSaturationStatus,
  getPainScaleDescription,
  areVitalsNormal
} from "@/lib/inpatient/vitals-utils";
```

### Validation Schemas (`lib/inpatient/validation.ts`)
Centralized Zod schemas:
```typescript
import {
  roomSchema,
  vitalSignsSchema,
  cpptSchema,
  materialUsageSchema
} from "@/lib/inpatient/validation";
```

### Service Layer (`lib/inpatient/api-service.ts`)
Database operations separated from API routes:
```typescript
import {
  getAllRoomsWithOccupancy,
  createRoom,
  assignBedToPatient,
  recordVitalSigns,
  createCPPTEntry,
  recordMaterialUsage
} from "@/lib/inpatient/api-service";
```

### Custom Hooks

**useRooms**
```typescript
const {
  rooms,              // All rooms
  sortedRooms,        // Sorted by room number
  statistics,         // Calculated statistics
  isLoading,          // Loading state
  error,              // Error state
  refresh             // Manual refresh
} = useRooms({
  autoRefresh: true,
  refreshInterval: 60000
});
```

**useVitals**
```typescript
const {
  recordVitals,       // Record function
  fetchVitals,        // Fetch history
  isSubmitting,       // Submit state
  error,              // Error state
  success             // Success state
} = useVitals();
```

**useCPPT**
```typescript
const {
  createEntry,        // Create CPPT entry
  fetchEntries,       // Fetch entries
  isSubmitting,       // Submit state
  error,              // Error state
  success             // Success state
} = useCPPT();
```

**useMaterials**
```typescript
const {
  recordUsage,        // Record usage
  fetchUsage,         // Fetch history with total
  isSubmitting,       // Submit state
  error,              // Error state
  success             // Success state
} = useMaterials();
```

## API Endpoints

### Room Management
- `GET /api/rooms` - Get all rooms with occupancy
- `POST /api/rooms` - Create new room
- `PATCH /api/rooms` - Update room

### Bed Assignment
- `POST /api/rooms/assign` - Assign patient to bed
- `PATCH /api/rooms/assign` - Discharge patient from bed

### Vital Signs
- `POST /api/vitals` - Record vital signs
- `GET /api/vitals?visitId=X` - Get vital signs history

### CPPT
- `POST /api/cppt` - Create progress note
- `GET /api/cppt?visitId=X` - Get progress notes

### Material Usage
- `POST /api/materials` - Record material usage
- `GET /api/materials?visitId=X` - Get usage history with total cost

## Usage Examples

### Room Dashboard
```typescript
import { useRooms } from "@/hooks/use-rooms";
import { calculateRoomStatistics } from "@/lib/inpatient/room-utils";

const { rooms, isLoading } = useRooms({ autoRefresh: true });
const stats = calculateRoomStatistics(rooms);
```

### Record Vital Signs
```typescript
import { useVitals } from "@/hooks/use-vitals";

const { recordVitals, isSubmitting, success } = useVitals();

await recordVitals({
  visitId: 1,
  temperature: "37.5",
  bloodPressureSystolic: 120,
  bloodPressureDiastolic: 80,
  pulse: 75,
  respiratoryRate: 18,
  oxygenSaturation: "98",
  recordedBy: "nurse-123"
});
```

### Create CPPT Entry
```typescript
import { useCPPT } from "@/hooks/use-cppt";

const { createEntry } = useCPPT();

await createEntry({
  visitId: 1,
  authorId: "doctor-123",
  authorRole: "doctor",
  subjective: "Patient complains of headache",
  objective: "BP 130/85, Temp 37.2°C",
  assessment: "Mild hypertension",
  plan: "Monitor BP, continue medication",
  progressNote: "Patient showing improvement",
  instructions: "Check BP every 4 hours"
});
```

## Utility Function Examples

### BMI Calculation
```typescript
import { calculateBMI, getBMICategoryID } from "@/lib/inpatient/vitals-utils";

const bmi = calculateBMI("170", "70"); // "24.22"
const category = getBMICategoryID(bmi); // "Normal"
```

### Blood Pressure Status
```typescript
import { getBloodPressureCategoryID } from "@/lib/inpatient/vitals-utils";

const status = getBloodPressureCategoryID(140, 90); // "Tinggi Tahap 1"
```

### Room Statistics
```typescript
import { calculateRoomStatistics } from "@/lib/inpatient/room-utils";

const stats = calculateRoomStatistics(rooms);
// {
//   total: 20,
//   available: 5,
//   partial: 10,
//   full: 5,
//   totalBeds: 50,
//   occupiedBeds: 35,
//   occupancyRate: 70
// }
```

## Performance Optimizations

✅ **Service Layer Separation** - Database logic isolated from API routes
✅ **Custom Hooks** - Reusable state management
✅ **Type Safety** - Full TypeScript coverage prevents runtime errors
✅ **Utility Functions** - Centralized calculations and validations
✅ **Auto-refresh** - Configurable polling for real-time updates
✅ **Memoization Ready** - Hooks designed for React optimization
✅ **Error Handling** - Consistent error patterns across all APIs

## Best Practices

### Type Safety
Always import and use types:
```typescript
import { VitalSignsInput, CPPT } from "@/types/inpatient";
```

### Use Service Layer
Don't write database queries in API routes:
```typescript
// ✅ Good
import { recordVitalSigns } from "@/lib/inpatient/api-service";
const vitals = await recordVitalSigns(data);

// ❌ Bad
const vitals = await db.insert(vitalsHistory).values(...);
```

### Use Utility Functions
Don't duplicate logic:
```typescript
// ✅ Good
import { calculateBMI } from "@/lib/inpatient/vitals-utils";
const bmi = calculateBMI(height, weight);

// ❌ Bad
const bmi = (weight / ((height/100) * (height/100))).toFixed(2);
```

### Use Custom Hooks
Don't write API calls directly in components:
```typescript
// ✅ Good
const { rooms, isLoading } = useRooms();

// ❌ Bad
const [rooms, setRooms] = useState([]);
useEffect(() => { fetch("/api/rooms")... }, []);
```

## Room Dashboard Features

✅ **Visual Status Indicators**
- Green border: Empty rooms
- Yellow border: Partially occupied
- Red border: Full rooms
- Gray border: Maintenance

✅ **Statistics Cards**
- Total rooms count
- Available rooms (green)
- Partially occupied (yellow)
- Overall occupancy rate (blue)

✅ **Filtering**
- All rooms
- Available only
- Occupied only
- Full only

✅ **Room Cards Display**
- Room number and type
- Bed occupancy (X/Y beds)
- Occupancy progress bar
- Location (building, floor)
- Daily rate with IDR formatting
- Status badge
- Detail button

## Billing Integration

The module is designed for seamless billing integration:

### Room Charges
- Daily rates tracked in `rooms.dailyRate`
- Admission and discharge dates in `visits`
- Auto-calculate: `days * dailyRate`

### Material Charges
- All usage tracked in `material_usage`
- Total cost pre-calculated
- Ready to aggregate for billing

### API for Billing Module
```typescript
GET /api/materials?visitId=X
// Returns: { materials: [], totalCost: "150000.00" }

GET /api/rooms
// Get room info including dailyRate for calculation
```

## Future Enhancements

- [ ] Vital signs charts and trends
- [ ] Alerts for abnormal vitals
- [ ] CPPT templates for common conditions
- [ ] Material inventory integration
- [ ] Room assignment optimization
- [ ] Bed availability notifications
- [ ] PDF export for CPPT
- [ ] Multi-bed room visualization
- [ ] Nurse call system integration
- [ ] Medication administration records (MAR)

## Testing Considerations

### Unit Tests
- Utility functions (BMI calculation, BP categorization)
- Validation schemas
- Service layer functions

### Integration Tests
- API endpoints with mock database
- Custom hooks with mock fetch
- Form submissions

### E2E Tests
- Room assignment workflow
- Vital signs recording
- CPPT creation
- Material usage tracking

## Related Modules

**Dependencies:**
- Emergency Module (ER → Inpatient handover)
- Registration Module (Patient admission)

**Integration Points:**
- Billing Module (room charges, material costs)
- Pharmacy Module (medication administration)

## Contributors

Module created with clean architecture principles:
- Modular design
- Type safety
- Service layer separation
- Reusable hooks
- Comprehensive utilities
- Centralized validation
- Complete documentation
