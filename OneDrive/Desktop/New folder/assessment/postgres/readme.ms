helm repo add bitnami https://charts.bitnami.com/bitnami

helm install my-postgresql bitnami/postgresql --version 18.2.0 --values values.yaml 
helm upgrade --install my-postgresql bitnami/postgresql --version 18.2.0 --values values.yaml
-----------------------------------------------------------------
kubectl get secret my-postgresql -n database
 -o jsonpath="{.data.postgres-password}" | base64 --decode 
srzr5m4E7T
----------------------------------------------------------------
CREATE DATABASE myapp_db;
CREATE USER myapp_user WITH PASSWORD 'mynewpassword';
GRANT ALL PRIVILEGES ON DATABASE myapp_db TO myapp_user;

\c myapp_db
 psql --host my-postgresql -U myapp_user -d myapp_db -p 5432
 ----------------------------------------------------------
 psql --host my-postgresql -U myapp_user -d myapp_db -p 5432

 rlY5wyeomE

 GRANT CREATE ON SCHEMA public TO myapp_user;
 GRANT ALL ON SCHEMA public TO myapp_user;

 -------------------------
 https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml