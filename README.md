# 🚀 HiringSight - AI-Powered Hiring Intelligence Platform

> A comprehensive hiring dashboard that analyzes candidate data and provides AI-driven insights for strategic talent acquisition.

## 🌟 **Live Demo**
- **🚀 Video Demo**: [Demo](https://drive.google.com/file/d/16p0sSyaOOB2m4-dd_bSXJhl2Fv3bpj30/view?usp=sharing)

## 📊 **Project Overview**

HiringSight is an advanced hiring intelligence platform that processes 55,000+ candidate submissions to provide:
- **AI-powered candidate scoring** with 100-point algorithm based on skills, experience, and education
- **Geographic arbitrage opportunities** for cost-effective global hiring
- **Team composition optimization** with diversity metrics and chemistry analysis
- **Market intelligence** and skill demand analysis across 47+ countries
- **Real-time filtering** and search capabilities across 50+ fields
- **Interactive dashboards** with comprehensive analytics and insights

## 🏗️ **Project Structure**

```
/MercorTest
├── 📊 DATA FILES
│   ├── form-submissions.json                     # Raw candidate applications (55k+ candidates)
│   ├── form-submissions.csv                      # Same data in CSV format
│   ├── engineered_candidates_final.csv           # Processed dataset with scores & features (975 candidates)
│   ├── engineered_candidates_final_summary.json  # Statistical summary of processed data
│   └── comprehensive_hiring_insights.json        # AI-generated market intelligence (2,300+ insights)
│
├── 🔧 CONFIGURATION & DOCS
│   ├── requirements.txt                          # Python dependencies
│   ├── roadmap.md                               # Development roadmap & sprint plan
│   ├── README.md                                # This file
│   ├── .gitignore                               # Git ignore rules
│   └── test.ipynb                               # Jupyter notebook for data exploration
│
├── 🖥️ BACKEND API (FastAPI)
│   ├── backend/
│   │   ├── main.py                              # FastAPI server with 7 endpoints
│   │   └── __pycache__/                         # Python cache files
│
├── 🌐 FRONTEND (React.js)
│   ├── frontend/
│   │   ├── .gitignore                           # Frontend Git ignore rules
│   │   ├── package.json                         # Node.js dependencies & scripts
│   │   ├── README.md                            # Frontend-specific documentation
│   │   ├── tailwind.config.js                  # Tailwind CSS configuration
│   │   │
│   │   ├── public/                              # Static assets
│   │   │   ├── index.html                       # Main HTML template
│   │   │   ├── favicon.ico                      # Site icon
│   │   │   ├── manifest.json                    # PWA manifest
│   │   │   ├── robots.txt                       # SEO robots file
│   │   │   ├── logo192.png                      # App logo (192x192)
│   │   │   └── logo512.png                      # App logo (512x512)
│   │   │
│   │   └── src/                                 # React source code
│   │       ├── index.js                         # React entry point
│   │       ├── index.css                        # Global CSS with Tailwind
│   │       ├── App.js                           # Main application component with 6 tabs
│   │       ├── App.css                          # Application-specific styles
│   │       ├── App.test.js                      # Basic app tests
│   │       ├── setupTests.js                    # Test configuration
│   │       ├── reportWebVitals.js               # Performance monitoring
│   │       │
│   │       └── components/                      # React components
│   │           ├── Navbar.js                    # Two-line navigation with stats
│   │           ├── Dashboard.js                 # Main dashboard with charts
│   │           ├── CandidateExplorer.js         # Candidate search & filtering
│   │           ├── CandidateCard.js             # Individual candidate display
│   │           ├── TeamBuilder.js               # Team selection & optimization
│   │           ├── TeamChemistryAnalyzer.js     # Team chemistry analysis
│   │           ├── Compare.js       # Side-by-side candidate comparison
│   │           ├── AnalyticsDashboard.js        # Advanced analytics with charts
│   │           ├── InsightsPanel.js             # AI insights with 7 specialized tabs
│   │           ├── FilterPanel.js               # Advanced filtering controls
│   │           ├── StatCard.js                  # Metric display cards
│   │           └── LoadingSpinner.js            # Loading state component
│
└── 📜 SCRIPTS & DATA PROCESSING
    ├── Scripts/
    │   ├── feature_engineering.py               # Main data processing pipeline
    │   ├── scoring_utils.py                     # Candidate scoring algorithms
    │   ├── hiring_insights.py                   # Advanced analytics generator
    │   ├── fetch_data.py                        # Data fetching utilities
    │   └── __pycache__/                         # Python cache files
```

## 🚀 **Quick Start Guide**

### **Prerequisites**
```bash
# Required software
- Python 3.8+ 
- Node.js 16+
- npm or yarn
```

### **1. Setup Backend API**
```bash
# Navigate to project root
cd MercorTest

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
cd backend
python main.py

# Server will start on http://localhost:8000
# API documentation available at http://localhost:8000/docs
```

### **2. Setup Frontend**
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start React development server
npm start

# Application will open at http://localhost:3000
```

### **3. Access the Application**
- **Frontend Dashboard**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000

## 🔌 **API Endpoints**

### **Core Endpoints**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API status and health check |
| `/api/v1/overview` | GET | Dashboard statistics and metrics |
| `/api/v1/candidates` | GET | Filtered candidate list with pagination |
| `/api/v1/filters/options` | GET | Dynamic filter options based on data |
| `/api/v1/analytics/market` | GET | Market intelligence and salary analysis |
| `/api/v1/insights/comprehensive` | GET | AI-generated hiring insights (2,300+ insights) |
| `/api/v1/debug/data-sample` | GET | Data structure debugging info |

### **Example API Calls**
```bash
# Get overview statistics
curl http://localhost:8000/api/v1/overview

# Get top 20 candidates with score above 80
curl "http://localhost:8000/api/v1/candidates?min_score=80&limit=20"

# Get candidates from Brazil with React skills
curl "http://localhost:8000/api/v1/candidates?country=Brazil&search=React"

# Get comprehensive AI insights
curl http://localhost:8000/api/v1/insights/comprehensive
```

## 📊 **Data Pipeline Flow**

```mermaid
graph TD
    A[form-submissions.json<br/>55k+ candidates] --> B[feature_engineering.py<br/>Data Processing]
    B --> C[engineered_candidates_final.csv<br/>975 processed candidates]
    B --> D[engineered_candidates_final_summary.json<br/>Statistical summary]
    E[hiring_insights.py<br/>AI Analysis] --> F[comprehensive_hiring_insights.json<br/>2,300+ insights]
    C --> G[FastAPI Backend<br/>main.py]
    F --> G
    G --> H[React Frontend<br/>App.js]
    H --> I[HiringSight Dashboard<br/>6 tabs + navigation]
```

### **Data Processing Steps**
1. **Raw Data**: 55,000+ candidate applications in JSON format
2. **Feature Engineering**: Skills categorization, experience scoring, geographic mapping
3. **Scoring Algorithm**: Multi-factor candidate evaluation (0-100 scale)
4. **Data Reduction**: Top 975 candidates with complete profiles
5. **Market Analysis**: Skill demand, salary trends, geographic arbitrage
6. **AI Insights**: Comprehensive hiring strategy recommendations

## 🎯 **Key Features**

### **Frontend Features**
- ✅ **Two-Line Navigation** - Logo/stats on top, tabs below for clean interface
- ✅ **Interactive Dashboard** - Charts, metrics, and real-time statistics
- ✅ **Advanced Filtering** - Score range, salary, location, skills, experience level
- ✅ **Smart Search** - Multi-field search with auto-suggestions
- ✅ **Team Builder** - Visual team composition with diversity metrics
- ✅ **Team Chemistry Analysis** - Collaboration potential and recommendations
- ✅ **Candidate Comparison** - Side-by-side analysis of multiple candidates
- ✅ **AI Insights Panel** - 7 specialized tabs for strategic analysis
- ✅ **Responsive Design** - Mobile-friendly with Tailwind CSS
- ✅ **Real-time Updates** - Dynamic data loading with smooth animations

### **Backend Features**
- ✅ **FastAPI Framework** - High-performance async API with 7 endpoints
- ✅ **Dynamic Filtering** - Real-time candidate filtering with multiple criteria
- ✅ **Geographic Intelligence** - Country/continent mapping with arbitrage analysis
- ✅ **Skill Analysis** - Demand trends, scarcity metrics, premium calculations
- ✅ **Team Optimization** - Algorithm-driven team composition suggestions
- ✅ **Market Intelligence** - Salary benchmarks, geographic trends
- ✅ **Data Validation** - Comprehensive error handling and numpy type conversion
- ✅ **CORS Support** - Frontend-backend communication

### **Analytics Features**
- 📊 **Executive Summary** - High-level KPIs and strategic metrics
- 🌍 **Market Intelligence** - Geographic arbitrage and skill premiums  
- 👥 **Team Optimization** - Optimal team templates and skill combinations
- 🔥 **Skill Analysis** - Talent scarcity and market saturation
- 📍 **Geographic Insights** - Global talent distribution and timezone coverage
- 💰 **Budget Strategy** - Cost optimization scenarios and value candidates
- ⚠️ **Risk Assessment** - Skill shortage risks and concentration analysis
- 🧪 **Team Chemistry** - Collaboration potential and team dynamics

## 🛠️ **Technology Stack**

### **Backend**
- **FastAPI** - Modern Python web framework with automatic API docs
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing with proper type conversion
- **Uvicorn** - ASGI server for production deployment

### **Frontend** 
- **React 18** - UI framework with modern hooks and components
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Framer Motion** - Animation library for smooth transitions
- **Recharts** - Data visualization charts and analytics
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API communication

### **Data Processing**
- **Python** - Data pipeline and analytics
- **JSON/CSV** - Data storage formats
- **Jupyter** - Interactive data exploration in test.ipynb

## 🔍 **Data Sources**

### **Primary Dataset: engineered_candidates_final.csv**
- **Records**: 975 top candidates (processed from 55k+ applications)
- **Key Fields**: 
  - `overall_score` (0-100) - Composite candidate quality score
  - `salary_full_time` - Expected salary information
  - `country`, `continent` - Geographic location data
  - `primary_skill_category` - Main technical focus area
  - `total_skills`, `total_experiences` - Breadth metrics
  - `has_big_tech`, `has_senior_role` - Experience indicators
  - `is_full_stack` - Technical versatility flag

### **Market Intelligence: comprehensive_hiring_insights.json**
- **Executive Summary** - High-level strategic insights (2,300+ data points)
- **Market Intelligence** - Skill premiums and geographic arbitrage
- **Team Composition** - Optimal team templates and strategies
- **Risk Assessment** - Talent shortage and concentration risks
- **Budget Optimization** - Cost-effective hiring scenarios

## 📈 **Performance Metrics**

- **API Response Time**: < 200ms average
- **Data Processing**: 55k+ records processed in < 5 seconds  
- **Frontend Load Time**: < 2 seconds initial load
- **Real-time Filtering**: < 100ms filter application
- **Search Performance**: Full-text search across 50+ fields
- **Team Chemistry**: Analysis for up to 8 team members

## 🚀 **Deployment Options**

### **Local Development**
```bash
# Backend
cd backend && python main.py

# Frontend  
cd frontend && npm start
```

### **Production Deployment**
```bash
# Backend (Docker)
docker build -t hiringsight-api .
docker run -p 8000:8000 hiringsight-api

# Frontend (Build & Serve)
cd frontend
npm run build
serve -s build -l 3000
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Backend
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
DATA_PATH=../engineered_candidates_final.csv

# Frontend
REACT_APP_API_BASE=http://localhost:8000
REACT_APP_TITLE=HiringSight
```

### **Key Configuration Files**
- [`backend/main.py`](backend/main.py) - FastAPI server configuration
- [`frontend/src/App.js`](frontend/src/App.js) - Main React application
- [`frontend/tailwind.config.js`](frontend/tailwind.config.js) - Tailwind CSS setup
- [`frontend/package.json`](frontend/package.json) - Node.js dependencies

## 🎮 **Application Navigation**

### **Two-Line Navigation Structure**
1. **Top Line**: HiringSight logo + Total Candidates (975) + Avg Quality Score (68.2)
2. **Bottom Line**: Six navigation tabs with dynamic badges

### **Available Tabs**
| Tab | Description | Key Features |
|-----|-------------|--------------|
| 📊 **Dashboard** | Main overview with charts | Skills distribution, geographic data, key metrics |
| 👥 **Candidates** | Candidate exploration | Advanced filtering, search, candidate cards |
| 🚀 **Team Builder** | Team composition | Team selection, diversity metrics, optimization |
| ⚖️ **Compare** | Candidate comparison | Side-by-side analysis, detailed comparisons |
| 🧪 **Team Chemistry** | Team analysis | Collaboration potential, recommendations |
| 📈 **Analytics** | Advanced analytics | Salary analysis, skills demand heatmap |
| 🧠 **AI Insights** | Strategic insights | 7 specialized analysis tabs |

## 📚 **Documentation**
- **📹 Video Demo**: [Demo](https://drive.google.com/file/d/16p0sSyaOOB2m4-dd_bSXJhl2Fv3bpj30/view?usp=sharing)
- **API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)
- **Frontend Documentation**: [frontend/README.md](frontend/README.md)
- **Development Roadmap**: [roadmap.md](roadmap.md)
- **Data Processing**: [Scripts/feature_engineering.py](Scripts/feature_engineering.py)


*HiringSight - Transforming talent acquisition with AI-driven insights and data-driven decision making.*
