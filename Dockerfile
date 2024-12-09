FROM node:20
ENV PORT 8000
ENV NODE_ENV "production"
ENV DB_HOST "34.101.206.199"
ENV DB_USER "cloud_computing"
ENV DB_NAME "selena_database"
ENV DB_PASSWORD "rizkiganteng"
ENV EMAIL_USER "afridhoikhsan@gmail.com"
ENV EMAIL_PASSWORD "hruo yplz ammz vpyk"
ENV JWT_SECRET "G8MoIWZbYcZHVddUNDlQIbsqco8uyXoVoYgluWDaWj1hUkDfUC9nc5tC4tPqzOITKJ+EIxttOGCA6U7+Rxw3sg=="
ENV MODEL_URL "https://storage.googleapis.com/selena_model_bucket/model.json"
ENV PROJECT_ID "selena-project-443105"
ENV BUCKET_NAME "selena_model_bucket"
ENV SERVICE_ACC_KEY_PATH "./selena-project-443105-f3a5465d1af0.json"
COPY . .
RUN npm install
EXPOSE 8000
CMD [ "npm", "run", "start"]