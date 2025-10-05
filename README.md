# 👻 GhostDev - Personalized Code Intelligence

> An AI-powered VS Code extension that provides context-aware code suggestions based on your own GitHub repositories.

## 🌟 Overview

GhostDev is not another "vibe coding" tool. It's a sophisticated code assistant that learns from **your** coding patterns and repositories to provide personalized suggestions and refinements. By analyzing your selected GitHub repositories, GhostDev understands your coding style and project architecture to deliver contextually relevant improvements.

---

## 🎯 Key Features

```mermaid
mindmap
  root((GhostDev))
    Project Setup
      Project Naming
      Description Input
      Tech Stack Selection
      GitHub Integration
    AI-Powered Generation
      Boilerplate Structure
      Directory Generation
      File Scaffolding
      Commit Message Suggestion
    Smart Code Refinement
      Git Diff Tracking
      Automated Suggestions
      Accept/Reject/Modify
    Customization
      Custom Prompts
      Prompt Configuration
      Fine-tuned Control
```

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "User Interaction Layer"
        A[VS Code Extension UI] --> B[Project Configuration]
        A --> C[File Watcher]
        A --> D[Git Integration]
    end
    
    subgraph "Core Processing"
        B --> E[GitHub API Client]
        E --> F[Repository Fetcher]
        F --> G[Context Builder]
        
        C --> H[Git Diff Tracker]
        H --> I[Change Analyzer]
        
        D --> J[Commit Monitor]
        J --> H
    end
    
    subgraph "AI Engine"
        G --> K[Gemini API]
        I --> K
        L[Custom Prompts] --> K
        
        K --> M[Structure Generator]
        K --> N[Code Refinement Engine]
        K --> O[Comment Suggester]
    end
    
    subgraph "Output Layer"
        M --> P[Directory Creator]
        N --> Q[Suggestion Panel]
        O --> Q
        
        Q --> R[Accept/Reject/Modify]
        R --> S[Code Updater]
    end
    
    style K fill:#FF6B6B
    style A fill:#4ECDC4
    style Q fill:#95E1D3
```

---

## 📊 Workflow Diagram

```mermaid
flowchart TD
    Start([User Opens Extension]) --> A[Enter Project Details]
    A --> B[Project Name]
    A --> C[Project Description]
    A --> D[Select Tech Stack]
    
    D --> E{GitHub Connected?}
    E -->|No| F[Connect GitHub Account]
    F --> G
    E -->|Yes| G[Fetch User Repositories]
    
    G --> H[Display Repository List]
    H --> I[User Selects Reference Repos]
    I --> J[Click OK/Generate]
    
    J --> K[API Call to Gemini]
    K --> L[Generate Boilerplate Structure]
    L --> M[Create Directory Structure]
    M --> N[Files Generated]
    
    N --> O[User Writes Code]
    O --> P[User Commits Code]
    P --> Q[User Stages New Changes]
    
    Q --> R[Git Add Detected]
    R --> S[GhostDev Triggered]
    S --> T[Calculate Git Diff]
    T --> U[Staged vs Last Commit]
    
    U --> V{Custom Prompts Exist?}
    V -->|Yes| W[Load .ghostdev/prompts.json]
    V -->|No| X[Use Default Prompts]
    
    W --> Y[API Call with Context]
    X --> Y
    
    Y --> Z[Gemini Analyzes Changes]
    Z --> AA[Generate Suggestions]
    AA --> AB[Display in UI]
    
    AB --> AC{User Action?}
    AC -->|Accept| AD[Apply Changes]
    AC -->|Reject| AE[Discard Suggestions]
    AC -->|Modify| AF[Edit & Apply]
    
    AD --> O
    AE --> O
    AF --> O
    
    style K fill:#FFD93D
    style Y fill:#FFD93D
    style Z fill:#FF6B6B
    style S fill:#6BCB77
```

---

## 🔄 Extension Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Inactive
    Inactive --> Initializing: Extension Loaded
    
    Initializing --> ProjectSetup: User Activates
    ProjectSetup --> ConfiguringGitHub: Connects GitHub
    ConfiguringGitHub --> SelectingRepos: Auth Success
    SelectingRepos --> GeneratingStructure: User Confirms
    
    GeneratingStructure --> Monitoring: Structure Created
    
    Monitoring --> AnalyzingChanges: Git Add Detected
    AnalyzingChanges --> GeneratingSuggestions: Diff Calculated
    GeneratingSuggestions --> AwaitingUserAction: Suggestions Ready
    
    AwaitingUserAction --> ApplyingChanges: Accept
    AwaitingUserAction --> Monitoring: Reject
    AwaitingUserAction --> ModifyingSuggestions: Modify
    
    ModifyingSuggestions --> ApplyingChanges: Confirm
    ApplyingChanges --> Monitoring: Changes Applied
    
    Monitoring --> [*]: Extension Closed
```

---

## 🎨 Feature Breakdown

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'pieStrokeWidth': '2px'}}}%%
pie title GhostDev Features Distribution
    "Project Initialization" : 25
    "Code Generation" : 20
    "Git Integration" : 30
    "AI Suggestions" : 20
    "Customization" : 5
```

---

## 📋 Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant VSCode
    participant GhostDev
    participant GitHub
    participant Gemini
    participant FileSystem

    User->>VSCode: Open Extension
    VSCode->>GhostDev: Activate Extension
    
    User->>GhostDev: Enter Project Details
    GhostDev->>GitHub: Request Repository List
    GitHub-->>GhostDev: Return Repositories
    
    User->>GhostDev: Select Repos & Confirm
    GhostDev->>Gemini: Generate Structure Request
    Note over Gemini: Analyzes repos + tech stack
    Gemini-->>GhostDev: Directory Structure JSON
    
    GhostDev->>FileSystem: Create Directories & Files
    FileSystem-->>User: Boilerplate Ready
    
    User->>FileSystem: Write Code & Commit
    User->>VSCode: Git Add (Stage Changes)
    
    VSCode->>GhostDev: File Watcher Triggered
    GhostDev->>VSCode: Get Git Diff
    VSCode-->>GhostDev: Diff Data
    
    GhostDev->>FileSystem: Check Custom Prompts
    FileSystem-->>GhostDev: prompts.json (if exists)
    
    GhostDev->>Gemini: Analyze Changes + Context
    Gemini-->>GhostDev: Code Suggestions
    
    GhostDev->>User: Display Suggestions
    User->>GhostDev: Accept/Reject/Modify
    GhostDev->>FileSystem: Apply Changes (if accepted)
```

---

## 🛠️ Component Architecture

```mermaid
graph LR
    subgraph "Extension Core"
        A[Extension.ts<br/>Entry Point]
        B[Command Handler]
        C[Configuration Manager]
    end
    
    subgraph "GitHub Integration"
        D[Auth Provider]
        E[Repository Service]
        F[API Client]
    end
    
    subgraph "Git Operations"
        G[File Watcher]
        H[Diff Calculator]
        I[Stage Monitor]
    end
    
    subgraph "AI Services"
        J[Prompt Builder]
        K[Gemini Client]
        L[Response Parser]
    end
    
    subgraph "UI Components"
        M[Webview Provider]
        N[Suggestion Panel]
        O[Quick Pick Menus]
    end
    
    A --> B
    A --> C
    B --> D
    B --> G
    
    D --> E
    E --> F
    
    G --> H
    H --> I
    
    I --> J
    C --> J
    J --> K
    K --> L
    
    L --> M
    M --> N
    B --> O
    
    style A fill:#FF6B6B
    style K fill:#FFD93D
    style N fill:#95E1D3
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- VS Code (latest version)
- GitHub account
- Gemini API key

### Step-by-Step Setup

```mermaid
graph TD
    A[Clone Repository] --> B[Step 1: Create launch.json]
    B --> C[Step 2: Install Dependencies]
    C --> D[Step 3: Launch Extension]
    
    B --> B1[Create .vscode folder]
    B1 --> B2[Add launch.json configuration]
    
    C --> C1[Run npm install]
    C1 --> C2[Wait for dependencies]
    
    D --> D1[Open extension.ts]
    D1 --> D2[Press F5]
    D2 --> D3[Extension Development Host Opens]
    
    style B fill:#4ECDC4
    style C fill:#95E1D3
    style D fill:#6BCB77
```

#### **Step 1: Create Launch Configuration**

Create `.vscode/launch.json` in your project root:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}"
      ],
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "npm: compile"
    },
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": [
        "${workspaceFolder}/out/test/**/*.js"
      ],
      "preLaunchTask": "npm: compile"
    }
  ]
}
```

#### **Step 2: Install Dependencies**

```bash
npm install
```

#### **Step 3: Launch Extension**

1. Open `extension.ts`
2. Press `F5` to start debugging
3. A new VS Code window will open with your extension loaded

---

## 🎯 Custom Prompts Configuration

GhostDev supports custom prompts through a configuration file located at `.ghostdev/prompts.json` in your project root.

### Configuration Structure

```mermaid
classDiagram
    class CustomPrompts {
        +string suggestComment
        +string getCodeRefinements
        +string generateFileStructure
    }
    
    class suggestComment {
        Used for: Comment generation
        Context: Current code context
        Output: Inline comments
    }
    
    class getCodeRefinements {
        Used for: Code improvement suggestions
        Context: Git diff + repo patterns
        Output: Refinement suggestions
    }
    
    class generateFileStructure {
        Used for: Initial project structure
        Context: Tech stack + selected repos
        Output: Directory tree JSON
    }
    
    CustomPrompts --> suggestComment
    CustomPrompts --> getCodeRefinements
    CustomPrompts --> generateFileStructure
```

### Example Configuration

Create `.ghostdev/prompts.json`:

```typescript
{
  "suggestComment": "Analyze the code and suggest meaningful comments that explain complex logic, following JSDoc style for functions.",
  
  "getCodeRefinements": "Review the staged changes and suggest improvements focusing on: performance optimization, code readability, error handling, and adherence to best practices from the reference repositories.",
  
  "generateFileStructure": "Generate a project structure that follows industry standards for the selected tech stack, incorporating patterns observed in the reference repositories."
}
```

---

## 📊 Prompt Usage Flow

```mermaid
flowchart LR
    A[User Action] --> B{Prompt Type?}
    
    B -->|Initial Setup| C[generateFileStructure]
    B -->|Code Changes| D[getCodeRefinements]
    B -->|Documentation| E[suggestComment]
    
    C --> F{Custom Prompt?}
    D --> F
    E --> F
    
    F -->|Yes| G[Load from prompts.json]
    F -->|No| H[Use Default Prompt]
    
    G --> I[Merge with Context]
    H --> I
    
    I --> J[Send to Gemini]
    J --> K[Return AI Response]
    
    style C fill:#FFB6B9
    style D fill:#FEC8D8
    style E fill:#FFDFD3
    style J fill:#FFD93D
```

---

## 🔍 Git Integration Details

```mermaid
gantt
    title Git Operations Timeline
    dateFormat X
    axisFormat %s
    
    section File Changes
    User writes code        :0, 10
    User stages changes     :10, 12
    
    section GhostDev Detection
    File watcher triggered  :12, 13
    Calculate diff          :13, 15
    
    section AI Processing
    Build context           :15, 16
    API call to Gemini      :16, 20
    Parse response          :20, 21
    
    section User Interaction
    Display suggestions     :21, 25
    User reviews            :25, 30
    Apply changes           :30, 32
    Suggest commit on terminal :32, 34
```


## 🎭 User Interaction States

```mermaid
stateDiagram-v2
    direction LR
    
    [*] --> ViewingSuggestions: Suggestions Generated
    
    ViewingSuggestions --> Reviewing: User Opens Panel
    Reviewing --> Accepting: Click Accept
    Reviewing --> Rejecting: Click Reject
    Reviewing --> Modifying: Click Modify
    
    Accepting --> Applied: Changes Applied
    Rejecting --> Discarded: Suggestions Discarded
    Modifying --> Editing: Open Editor
    
    Editing --> Applied: Save Changes
    
    Applied --> [*]: Return to Code
    Discarded --> [*]: Return to Code
    
    note right of Reviewing
        User can review each
        suggestion individually
    end note
```

## 📦 Extension Structure

```
ghostdev/
├── 📁 src/
│   ├── 📄 extension.ts          # Entry point
│   ├── 📄 git.d.ts    
│   ├── 📁 assets/
│   │   ├── techStackData.ts
│   ├── 📁 utils/
│   │   ├── githubUtils.ts
│   │   ├── geminiUtils.ts
│   │   ├── promptUtils.ts
│   │   ├── terminalUtils.ts
│   │   └── gitUtils.ts
├── 📁 .vscode/
│   └── 📄 launch.json
├── 📄 package.json
├── 📄 .env
├── 📄 tsconfig.json
└── 📄 README.md
```

---

## 🚀 Quick Start Guide

```mermaid
journey
    title GhostDev First-Time User Journey
    section Setup
      Install Extension: 3: User
      Configure GitHub: 4: User
      Add API Key: 3: User
    section First Project
      Create New Project: 5: User
      Select Repositories: 5: User
      Generate Structure: 5: System
    section Development
      Write Code: 5: User
      Stage Changes: 4: User
      Review Suggestions: 5: User, System
      Apply Refinements: 5: User
    section Advanced
      Add Custom Prompts: 4: User
      Fine-tune Settings: 4: User
```

---

## 💡 Best Practices

```mermaid
mindmap
  root((Best Practices))
    Repository Selection
      Choose Similar Projects
      Include Style Guides
      Quality Over Quantity
    Custom Prompts
      Be Specific
      Include Context
      Test Iterations
    Git Workflow
      Commit Frequently
      Stage Intentionally
      Review Suggestions
    Code Quality
      Accept Wisely
      Modify When Needed
      Learn Patterns
```

---

## 🤝 Contributing

We welcome contributions! Please follow this workflow:

```mermaid
gitGraph
    commit id: "Initial"
    branch feature
    checkout feature
    commit id: "Add Feature"
    commit id: "Write Tests"
    commit id: "Update Docs"
    checkout main
    merge feature
    commit id: "Release"
```

---

## 📝 License

MIT License - see LICENSE file for details


## 🎉 Acknowledgments

Built with:
- 🤖 Google Gemini AI
- 🐙 GitHub API
- 💻 VS Code Extension API
- ⚡ TypeScript

---

<div align="center">

**Made with love by MDGSpace**

[⭐ Star us on GitHub](#) | [🚀 Get Started](#setup-instructions) | [📖 Documentation](#)

</div>