# BarLoyalty

A comprehensive bar loyalty program platform with microservices architecture, featuring Python and Spring Boot backends, Angular frontend, and complete observability stack.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Services](#services)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Observability](#observability)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Project Overview

**BarLoyalty** is a modern loyalty management system designed for bars and hospitality establishments. It provides:

- **Customer Management**: Track and manage loyalty points and customer information
- **Multi-backend Support**: Flexible microservices architecture with Python and Java
- **Real-time Analytics**: Comprehensive monitoring and observability
- **Responsive UI**: Angular-based web interface
- **Containerized Deployment**: Docker & Docker Compose ready

---

## 🏗️ Architecture

The application follows a **microservices architecture** with the following layers:

```
┌─────────────────────────────────────────────────┐
│           Frontend Layer (Angular)              │
├─────────────────────────────────────────────────┤
│         API Gateway / Load Balancer             │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌──────────────────┐ │
│  │  Spring Boot API    │  │  Python Service  │ │
│  │  (Java Backend)     │  │  (     QR      )  │ │
│  └─────────────────────┘  └──────────────────┘ │
├─────────────────────────────────────────────────┤
│          PostgreSQL Database                    │
├─────────────────────────────────────────────────┤
│    Observability Stack (Grafana/Prometheus)    │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Services

### **1. Frontend Service (FE-Angular)**

- **Framework**: Angular with TypeScript
- **Purpose**: User-facing web interface for bar staff and customers
- **Features**:
  - Responsive design with CSS
  - Component-based architecture
  - HTTP interceptors for API communication
  - Service layer for business logic
- **Port**: 4200 (development), 80 (production via Nginx)

### **2. Backend Service - Spring Boot (BE-SpringBoot)**

- **Framework**: Spring Boot (Java)
- **Purpose**: Primary REST API for business logic
- **Features**:
  - Database operations and ORM
  - Business logic processing
  - Authentication & Authorization
  - RESTful API endpoints
- **Port**: 8080
- **Build**: Maven (mvnw provided)

### **3. Backend Service - Python (BE-Python)**

- **Framework**: Python with FastAPI/Flask
- **Purpose**: Analytics, AI processing, and secondary operations
- **Features**:
  - Data analysis and reporting
  - Machine learning models
  - Asynchronous processing
- **Port**: 8000
- **Dependencies**: Managed via requirements.txt

### **4. Database (PostgreSQL)**

- **Service**: PostgreSQL relational database
- **Port**: 5432
- **Initialization**: Automatic via init.sql
- **Data Persistence**: postgres-data volume

### **5. Observability Stack**

#### **Prometheus**

- Metrics collection and time-series database
- Configuration: `observability/prometheus.yml`

#### **Grafana**

- Visualization and dashboarding
- Provisioning: Datasources and dashboards in `observability/grafana/`

#### **Loki**

- Log aggregation
- Configuration: `observability/loki-config.yaml`

#### **Tempo**

- Distributed tracing
- Configuration: `observability/tempo-config.yaml`

#### **OpenTelemetry Collector**

- Telemetry data collection and processing
- Configuration: `observability/otel-collector-config.yaml`

---

## 📦 Prerequisites

Ensure you have the following installed:

- **Docker** (v20.10+)
- **Docker Compose** (v1.29+)
- **Git**
- **Node.js** (v16+) - for development
- **Java 17+** - for Spring Boot development
- **Python 3.9+** - for Python backend development

---

## 🚀 Installation

### **1. Clone the Repository**

```bash
git clone https://github.com/yourusername/BarLoyalty.git
cd BarLoyalty
```

### **2. Verify Docker Installation**

```bash
docker --version
docker-compose --version
```

### **3. Configure Environment**

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/barloyalty
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# Services
SPRINGBOOT_PORT=8080
PYTHON_PORT=8000
ANGULAR_PORT=4200

# Observability
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
LOKI_PORT=3100
TEMPO_PORT=3200
```

---

## ▶️ Running the Application

### **Option 1: Using Docker Compose (Recommended)**

Start all services at once:

```bash
docker-compose up --build
```

**Service Access:**

- **Frontend**: http://localhost:4200
- **Spring Boot API**: http://localhost:8080
- **Python API**: http://localhost:8000
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
- **Loki**: http://localhost:3100
- **Tempo**: http://localhost:3200

Stop all services:

```bash
docker-compose down
```

### **Option 2: Running Services Individually**

#### **Start Database**

```bash
docker-compose up postgres
```

#### **Start Spring Boot Backend**

```bash
cd BE-springboot
./mvnw spring-boot:run
```

#### **Start Python Backend**

```bash
cd BE-python
pip install -r requirements.txt
python main.py
```

#### **Start Angular Frontend**

```bash
cd FE-angular
npm install
ng serve
```

#### **Start Observability Stack**

```bash
docker-compose up prometheus grafana loki tempo
```

---

## 📁 Project Structure

```
BarLoyalty/
├── README.md                          # This file
├── docker-compose.yml                 # Container orchestration
├── .env                               # Environment variables
│
├── FE-angular/                        # Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/            # Reusable components
│   │   │   ├── services/              # API services
│   │   │   ├── models/                # Data models
│   │   │   ├── interceptors/          # HTTP interceptors
│   │   │   └── app.routes.ts          # Routing configuration
│   │   ├── assets/                    # Static assets
│   │   └── styles.css                 # Global styles
│   ├── package.json                   # npm dependencies
│   ├── angular.json                   # Angular configuration
│   ├── tsconfig.json                  # TypeScript configuration
│   └── Dockerfile                     # Docker image definition
│
├── BE-springboot/                     # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/                  # Java source code
│   │   │   └── resources/             # Configuration files
│   │   └── test/                      # Unit tests
│   ├── pom.xml                        # Maven configuration
│   ├── mvnw / mvnw.cmd                # Maven wrapper
│   └── Dockerfile                     # Docker image definition
│
├── BE-python/                         # Python Backend
│   ├── main.py                        # Application entry point
│   ├── requirements.txt                # Python dependencies
│   ├── test_dummy.py                  # Test suite
│   └── Dockerfile                     # Docker image definition
│
├── postgres/                          # Database
│   └── init.sql                       # Initial database schema
│
├── postgres-data/                     # Database persistence volume
│   ├── base/                          # Database files
│   └── global/                        # Global database objects
│
└── observability/                     # Monitoring & Logging
    ├── prometheus.yml                 # Metrics configuration
    ├── loki-config.yaml               # Log aggregation config
    ├── tempo-config.yaml              # Tracing configuration
    ├── otel-collector-config.yaml     # Telemetry collector config
    └── grafana/
        └── provisioning/
            ├── dashboards/            # Grafana dashboards
            └── datasources/           # Data source definitions
```

---

## 💻 Technology Stack

| Layer          | Technology               | Version |
| -------------- | ------------------------ | ------- |
| **Frontend**   | Angular, TypeScript, CSS | Latest  |
| **Backend 1**  | Spring Boot, Java        | 17+     |
| **Backend 2**  | Python, FastAPI/Flask    | 3.9+    |
| **Database**   | PostgreSQL               | Latest  |
| **Container**  | Docker, Docker Compose   | Latest  |
| **Monitoring** | Prometheus, Grafana      | Latest  |
| **Logging**    | Loki                     | Latest  |
| **Tracing**    | Tempo, OpenTelemetry     | Latest  |

---

## 📊 Observability

The application includes a complete observability stack for monitoring, logging, and tracing:

### **Metrics Collection**

- **Prometheus** collects metrics from all services
- Scrape interval: Configurable in `observability/prometheus.yml`
- Retention: Default 15 days

### **Custom Metrics**

- **transactions.total** - Total number of completed transactions (Counter)
  - Incremented each time a transaction is successfully processed
  - Accessible via: `http://localhost:8080/actuator/prometheus`

### **Visualization**

- **Grafana** dashboards display metrics and logs
- Pre-built dashboards for each service
- Custom alert rules available

### **Log Aggregation**

- **Loki** indexes and aggregates logs
- LogQL for querying
- Integration with Grafana for visualization

### **Distributed Tracing**

- **Tempo** stores trace data
- **OpenTelemetry Collector** gathers telemetry
- End-to-end request tracing across services

---

## 🔄 Development Workflow

### **Creating a Feature**

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit with descriptive messages: `git commit -m "feat: description"`
4. Push to repository: `git push origin feature/your-feature`
5. Create a Pull Request for review

### **Running Tests**

**Frontend:**

```bash
cd FE-angular
npm test
```

**Spring Boot:**

```bash
cd BE-springboot
./mvnw test
```

**Python:**

```bash
cd BE-python
python -m pytest test_dummy.py
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Code Standards**

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Use meaningful commit messages

---

## 🐛 Troubleshooting

### **Docker Compose Won't Start**

```bash
# Clean up containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

### **Port Already in Use**

Modify the `.env` file or use:

```bash
docker-compose up --build -p 8080:8080
```

### **Database Connection Issues**

Ensure PostgreSQL is running and accessible:

```bash
docker-compose logs postgres
```

### **Frontend Not Loading**

Check Angular development server:

```bash
cd FE-angular
npm install
ng serve --host 0.0.0.0
```

---


**Happy coding! 🚀**
