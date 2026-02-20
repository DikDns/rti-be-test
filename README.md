# RTI Energy Monitoring System - Backend Service

[![Node.js](https://img.shields.io/badge/Node.js-v24.12.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![InfluxDB](https://img.shields.io/badge/InfluxDB-3-purple.svg)](https://www.influxdata.com/)
[![MQTT](https://img.shields.io/badge/MQTT-Mosquitto-red.svg)](https://mqtt.org/)

## Overview

This project is a backend service developed for an Energy Monitoring System. It is designed to handle real-time IoT telemetry data ingestion from multiple energy panels, process power metrics (`kW`, `Ampere`, `Voltage`), and serve aggregated insights regarding energy usage (`kWh`) and cost (`Rp`) through RESTful APIs.

The system utilizes a modern dual-database architecture:
- **InfluxDB** for storing high-throughput, real-time time-series telemetry data.
- **PostgreSQL** for relational data such as panel metadata and structured daily/monthly usage summaries.

---

## Key Features

- **Real-time Data Ingestion:** Subscribes to MQTT topics to receive high-frequency telemetry data from simulated IoT energy panels.
- **Time-Series Optimization:** Efficiently stores and queries real-time metrics using InfluxDB v3.
- **Data Aggregation:** Calculates daily and monthly energy usage and cost from raw telemetry streams, reducing load on the frontend.
- **RESTful API:** Provides well-structured, performant endpoints for real-time dashboard data and historical usage reports.
- **Dockerized Infrastructure:** Fully containerized environment (App, PostgreSQL, InfluxDB, Mosquitto) for seamless local deployment.

---

## Architecture & System Design

The architecture follows a modular, event-driven approach. Simulated IoT panels publish data to an MQTT broker. The Node.js backend subscribes to this broker, processing incoming payloads. Raw telemetry is routed to InfluxDB, while aggregated analytics and panel statuses are persisted in PostgreSQL.

### System Architecture Diagram
![Architecture](/.images/component-diagram.webp)

---

## Database Schemas & ERD

### PostgreSQL 
Used for storing master configuration (panels) and pre-calculated reporting summaries to ensure fast API response times.
![ERD Postgresql](/.images/postgresql-schema.webp)

### InfluxDB 
Used for storing vast amounts of raw telemetry metrics efficiently.
![InfluxDB Measurement](/.images/influxdb-schema.webp)

---

## API Documentation

Detailed API documentation, including request/response examples and schemas, is available on Apidog:
👉 **[View API Documentation](https://rti-energy-monitoring.apidog.io/)**

---

## Technology Stack

- **Runtime:** Node.js (v24.12.0) & TypeScript
- **Web Framework:** Express.js 5
- **Databases:** PostgreSQL (via Drizzle ORM) & InfluxDB v3
- **Messaging:** MQTT (Mosquitto Broker)
- **Infrastructure:** Docker & Docker Compose

---

## Getting Started

### Prerequisites
Make sure you have the following installed on your local machine:
- [Docker Engine](https://docs.docker.com/engine/install/) (^29.2.1)
- [Node.js](https://nodejs.org/) (v24.12.0)
- `npm` (^11.6.2)

### Installation

1. **Clone the repository:**
   ```bash
   # HTTPS
   git clone https://github.com/DikDns/rti-be-test.git
   
   # SSH
   git clone git@github.com:DikDns/rti-be-test.git

   # GitHub CLI
   gh repo clone DikDns/rti-be-test
   
   cd rti-be-test
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the Application Locally

1. **Start the Infrastructure (Databases & Broker)**
   This spins up PostgreSQL, InfluxDB, and Mosquitto in the background.
   ```bash
   docker compose up -d
   ```

2. **Run Database Migrations & Push Schema**
   Initialize the PostgreSQL database structure using Drizzle ORM.
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. **Start the Backend Server**
   Start the main Node.js API and MQTT subscription service.
   ```bash
   npm start
   ```

4. **Start the IoT Simulator**
   In a separate terminal, run the sensor simulator to publish mock data to the MQTT broker.
   ```bash
   npm run simulator
   ```

### Stopping the Application
To gracefully tear down the Docker containers:
```bash
docker compose down
```
