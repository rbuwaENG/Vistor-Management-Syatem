# Visitor Management System (VMS)

A microservices-based Visitor Management System designed for apartment complexes to streamline visitor access, improve security, and ensure traceability. The system empowers residents to invite visitors digitally, allows security personnel to verify entry in real-time, and gives administrators control over the entire system via an intuitive dashboard.

## 🚀 Features

- **Resident App**: Create and manage visitor invitations with QR codes or access links.
- **Security App**: Scan and verify QR codes for entry authorization.
- **Admin Dashboard**: Manage users, monitor system activity, and generate reports.
- **Microservices Architecture**: Scalable and loosely coupled services for user, visitor, security, and notifications.
- **Real-time Communication**: Integrated with Firebase for instant alerts and messaging.
- **Cloud Deployment**: Containerized deployment on AWS using Docker and ECS Fargate.

## 🏗 Architecture

Built with Spring Boot and React/Flutter frontend clients. The architecture includes:

- **Eureka Discovery Server**
- **Spring Cloud Gateway**
- **Admin Service**
- **Visitor Service**
- **Security Service**
- **Notification Service**
- **Firebase Firestore & Messaging**

### 🏠 Apartment Holder App

- Login and dashboard to manage visitor invitations
- Shareable QR codes or links
- Track invite history

### 🚧 Security App

- Real-time scanning and validation of QR codes
- Visitor details and access logs
- Live dashboard of visitor activity

### 🧑‍💼 Manager Dashboard

- Register and manage apartment holders and security personnel
- View visitor stats and user activity
- Enable/disable user access

## ⚙ Deployment

### 🐳 Docker + AWS ECS (Fargate)

- Microservices containerized via Docker
- Images stored on **Amazon ECR**
- Deployed using **AWS ECS Fargate**
- Infrastructure includes **CloudWatch**, **IAM**, **VPC**, and **Secrets Manager**

### CI/CD Pipeline

- Automated with GitHub Actions / AWS CodePipeline
- Builds Docker images on push, pushes to ECR, and updates ECS tasks

## 🔒 Security

- Role-based access control
- IAM-based permissions and secure credential management
- HTTPS, security groups, and VPC networking

## 📂 Source Code

GitHub Repository: [https://github.com/rbuwaENG/Vistor-Management-Syatem](https://github.com/rbuwaENG/Vistor-Management-Syatem)

## ❗ Challenges Faced

- Designing Firestore access rules for different user roles
- Cross-platform QR generation and validation
- Simulating microservice communication on serverless Firebase backend

## 📚 References

- Visitor Management System Design and Implementation (ISL, 2022)
- Bootstrapped Firebase Guides
- Firebase Firestore and Cloud Messaging Docs
