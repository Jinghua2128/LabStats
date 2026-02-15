# Welcome to LabStats 📊

[**LabStats**](https://labrats-ee791.firebaseapp.com/) is the official companion dashboard for [**LabRats**](https://github.com/Jinghua2128/LabRats), the immersive VR science education experience developed by **G²KM Studio**.

This platform is designed to help players, students, and researchers visualize their experiment data, track progress, and gain deeper insights into their performance within the virtual laboratory.

## 🌟 What is LabStats?

LabStats connects directly to the LabRats game database to provide real-time analytics. Whether you are a student tracking your improvement or an instructor monitoring class performance, LabStats provides the data you need.

### Key Features

*   **📈 Real-Time Dashboard**: See your stats update instantly as you complete experiments in VR.
*   **⏱️ Performance Tracking**: Monitor key metrics like **Total Labs Completed**, **Average Time Taken**, and **Personal Bests**.
*   **🔍 Deep Dive Analytics**: Click on any experiment entry to view detailed logs, including:
    *   Gravity settings used
    *   Distances traveled
    *   Exact duration of attempts
*   **☁️ Cloud Sync**: Your progress is automatically saved and accessible from any device.

## 🚀 How to Use

1.  **Log In**: Use your registered Email and Password to access your profile.
2.  **View Dashboard**: Upon login, you will see an overview of your performance.
3.  **Analyze Experiments**: Scroll down to the "Lab Experiments" table.
    *   **Click on a row** (e.g., "GravityLab") to open the **Details View**.
    *   Review the specific parameters of your attempts.

## ℹ️ About LabRats

**LabRats** bridges the gap between theoretical science and practical application. By simulating a fully equipped laboratory in Virtual Reality, we allow users to conduct experiments that might be too dangerous, expensive, or impossible to perform in a physical classroom.

---

# 🔥 Firebase Database Documentation

## 1. Data Types

Breakdown of key nodes and their corresponding data types.

### Root Node: `Users`

**Type:** Object (JSON Node)

Each user is stored under a unique Firebase Authentication UID.

**Reasoning:**
Using the UID as the key ensures:
- User-specific data isolation
- Direct mapping between authentication and stored data
- Fast reading without additional indexing

**Example:**
```
Users
  → [UID]
```

---

### `Labs` (Child of Users)

**Type:** Object

Each lab category (e.g., `GravityLab`) is stored under the user.

**Reasoning:**
This structure allows:
- Expansion to multiple lab subjects (e.g., `ChemistryLab`, `PhysicsLab`)
- Modular scalability without restructuring the database
- Clear separation of subject domains

---

### `Experiments` (Child of the category under Labs)

**Type:** Object

Each experiment is stored using a numeric key (e.g., `1`, `2`, `3`).

**Reasoning:**
Using numbered keys:
- Enables ordered experiment tracking
- Allows direct referencing of experiment IDs
- Supports easy iteration and expansion

---

### Experiment Data Fields

**Example:**
```json
1: {
  "Distance": 2,
  "Duration": 0.820281982421875,
  "Gravity": -9.8100004196167,
  "RecordedAtSeconds": 8.276451110839844
}
```

#### `Distance` (Child of attempt number)

**Type:** Float

Represents the drop height or experiment parameter.

**Why Float?**
- Precision is required for scientific values
- Allows decimal-based measurements

#### `Duration`

**Type:** Float

Represents time taken during the experiment.

**Why Float?**
- High precision required for timing-based replay system
- Supports time-based performance comparison

#### `Gravity`

**Type:** Float

Stores gravitational constant used during experiment.

**Why Float?**
- Allows variation for future physics simulations
- Enables experimentation with modified gravity values

#### `RecordedAtSeconds`

**Type:** Float

Timestamp relative to session start.

**Why Float instead of String timestamp?**
- Easier for mathematical comparison
- Supports analytics and performance tracking

---

### `Time_Passed` (Child of experiments, sibling of attempt number)

**Type:** Integer

Represents total cumulative time spent in the lab.

**Why Integer?**
- No need for decimal precision
- Used for general tracking rather than physics calculations

---

### `Profile` (Sibling of Labs)

#### `Email` (Child of Profile)

**Type:** String

Stores authenticated user's email.

**Why String?**
- Required for display and verification
- Used for authentication linkage

---

## 2. Data Structure Design

### Structural Overview

```
Users
└── UID
    ├── Labs
    │   └── GravityLab
    │       ├── Experiments
    │       │   ├── 1
    │       │   ├── 2
    │       │   └── ...
    │       └── Time_Passed
    └── Profile
        └── Email
```

### Design Considerations

#### 1. User-Centric Structure

Each user node contains only their own data. This ensures:
- Data isolation
- Privacy
- Clean authentication mapping
- Fast reads and writes

#### 2. Modular Lab Expansion

By nesting labs under:
```
Users → UID → Labs → LabName
```

The system supports:
- Adding new subjects without restructuring
- Future scalability (e.g., `ChemistryLab`, `BiologyLab`)
- Separation of data

This modular structure prevents database refactoring as the application grows.

#### 3. Experiment Scalability

Each experiment is stored as a node under `Experiments`.

This allows:
- Unlimited experiment additions
- Replay tracking
- Historical data analysis
- Performance comparisons

#### 4. Real-Time Efficiency

Firebase Realtime Database is optimized for:
- Low-latency writes
- Instant read updates
- Efficient synchronization across sessions

Because experiment data is relatively lightweight (floats and small objects), the database remains efficient even with large user numbers.

#### Large-Scale Usage Considerations

The structure supports large-scale usage through:
- UID-based data separation
- Flat hierarchy (avoids deeply nested queries)
- Minimal data duplication
- Small size per write

**For future scaling:**
- Cloud Functions could process analytics
- Statistics could be stored separately

---

## 3. Application Data Flow

### 1. Authentication Flow

1. User signs up or logs in via Firebase Authentication
2. Firebase generates a unique UID
3. If the user is new:
   - A `Profile` node is created
   - Default lab structure is initialized

### 2. Experiment Execution Flow

1. User starts an experiment in VR
2. Game calculates:
   - Distance
   - Duration
   - Gravity
   - Recorded time
3. On completion:
   - Data is serialized
   - Sent to Firebase using `SetValueAsync()` or `UpdateChildrenAsync()`
4. Firebase updates in real-time

### 3. Data Storage Flow

When experiment completes:
```
Users/UID/Labs/GravityLab/Experiments/[ExperimentID]
```
is written with the results.

This write is:
- Immediate
- Synced in real time

### 4. Retrieval Flow (Companion Website)

1. User logs into companion site
2. UID is verified
3. Data snapshot is requested:
   ```
   Users/UID/Labs
   ```
4. Data is parsed and:
   - Displayed
   - Compared across attempts
   - Used for progress analytics

---

## 👨‍💻 Credits

**Database Architecture & Documentation:**
- Liu GuangXuan - G²KM Studio
- Ng Kiang Hwee - G²KM Studio

**Implementation & Bug Fixes:**
- Comprehensive commenting throughout codebase
- Real-time database synchronization debugging
- Authentication flow optimization
- Dashboard data parsing and visualization enhancements

**Special Thanks:**
All contributors to the LabRats VR experience and LabStats companion platform.

---

*Powered by **G²KM Studio***
