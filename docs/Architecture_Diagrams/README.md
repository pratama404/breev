# Architecture Diagrams

This directory contains comprehensive PlantUML diagrams for the AQI Monitoring System.

## Diagram Types

### 1. System Architecture
- **system-architecture.puml**: Overall system architecture showing all layers
- **navigation-structure.puml**: Web application navigation flow

### 2. Process Diagrams
- **activity-as-is.puml**: Current manual air quality monitoring process
- **activity-to-be.puml**: Future IoT-enabled monitoring process
- **activity-qr-scan.puml**: QR code scanning feature workflow
- **activity-prediction.puml**: ML prediction generation process

### 3. Behavioral Diagrams
- **use-case.puml**: System use cases for all user types
- **sequence-sensor-data.puml**: Sensor data collection sequence
- **sequence-qr-access.puml**: QR code access sequence

### 4. Structural Diagrams
- **class-diagram.puml**: System class relationships
- **data-flow-diagram.puml**: Data flow between processes

### 5. C4 Model Diagrams
- **c4-context.puml**: System context and external dependencies
- **c4-container.puml**: High-level container architecture
- **c4-component.puml**: Web application component breakdown

### 6. Infrastructure
- **deployment.puml**: Physical and logical deployment architecture

## Viewing Diagrams

### Online Viewers
1. **PlantUML Server**: http://www.plantuml.com/plantuml/uml/
2. **PlantText**: https://www.planttext.com/

### Local Tools
1. **VS Code Extension**: PlantUML extension
2. **IntelliJ Plugin**: PlantUML integration
3. **Command Line**: 
   ```bash
   java -jar plantuml.jar *.puml
   ```

### Generate PNG/SVG
```bash
# Generate all diagrams as PNG
java -jar plantuml.jar -tpng *.puml

# Generate as SVG
java -jar plantuml.jar -tsvg *.puml
```

## Diagram Relationships

```
System Architecture (High Level)
├── C4 Context Diagram (External View)
├── C4 Container Diagram (Container View)
└── C4 Component Diagram (Component View)

Process Flow
├── Activity As-Is (Current State)
├── Activity To-Be (Future State)
├── Activity QR Scan (Feature Process)
└── Activity Prediction (ML Process)

Behavioral Models
├── Use Case Diagram (User Interactions)
├── Sequence Sensor Data (Data Flow)
└── Sequence QR Access (User Journey)

Structural Models
├── Class Diagram (Code Structure)
├── Data Flow Diagram (Process View)
└── Deployment Diagram (Infrastructure)
```

## Key Design Patterns

### 1. IoT Architecture Patterns
- **Edge Computing**: Local processing on ESP32
- **Pub/Sub Messaging**: MQTT for decoupled communication
- **Event-Driven**: Reactive data processing

### 2. Web Architecture Patterns
- **JAMstack**: JavaScript, APIs, and Markup
- **Server-Side Rendering**: Next.js SSR for performance
- **API Gateway**: Centralized API management

### 3. ML Architecture Patterns
- **Physics-Informed ML**: Constraint-based neural networks
- **Microservices**: Isolated ML service
- **Caching**: Prediction result caching

### 4. Data Architecture Patterns
- **Time Series**: Sensor data storage
- **Document Store**: Flexible schema with MongoDB
- **Real-time Processing**: Stream processing with Node-RED

## Compliance and Standards

- **IEEE 830-1998**: Software Requirements Specification
- **ISO/IEC 20922**: MQTT Protocol Standard
- **C4 Model**: Software architecture documentation
- **UML 2.5**: Unified Modeling Language

## Updates and Versioning

- Diagrams are versioned with the main codebase
- Update diagrams when architecture changes
- Maintain consistency across all diagram types
- Review diagrams during system design reviews