---
# Backend ConfigMap (Database Configuration)
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  labels:
    app: backend
data:
  DB_HOST: "my-postgres-postgresql"  # Your PostgreSQL service name
  DB_PORT: "5432"
  DB_NAME: "myapp_db"
  DB_USER: "myapp_user"
  PORT: "8000"

---
# Backend Secret (Database Password)
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  labels:
    app: backend
type: Opaque
stringData:
  DB_PASSWORD: "StrongPassword@123"

---
# Backend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  labels:
    app: backend
    tier: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
        tier: backend
    spec:
      containers:
        - name: backend
          image: employee-backend:v1  # Replace with your image name
          imagePullPolicy: Never  # Use 'Never' for local Docker images, 'Always' for registry
          ports:
            - containerPort: 8000
              name: http
              protocol: TCP
          
          # Environment variables from ConfigMap and Secret
          env:
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: backend-config
                  key: DB_HOST
            - name: DB_PORT
              valueFrom:
                configMapKeyRef:
                  name: backend-config
                  key: DB_PORT
            - name: DB_NAME
              valueFrom:
                configMapKeyRef:
                  name: backend-config
                  key: DB_NAME
            - name: DB_USER
              valueFrom:
                configMapKeyRef:
                  name: backend-config
                  key: DB_USER
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: backend-secret
                  key: DB_PASSWORD
            - name: PORT
              valueFrom:
                configMapKeyRef:
                  name: backend-config
                  key: PORT
          
          # Resource limits
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          
          # Health checks
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3

---
# Backend Service (NodePort - accessible from localhost)
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  labels:
    app: backend
spec:
  type: NodePort
  selector:
    app: backend
  ports:
    - port: 8000
      targetPort: 8000
      nodePort: 30800  # Access backend at http://localhost:30800
      protocol: TCP
      name: http
  sessionAffinity: None