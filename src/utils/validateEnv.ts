import { cleanEnv, port, str } from "envalid";

const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    PORT: port(),
    POSTGRES_HOST: str(),
    POSTGRES_PORT: port(),
    POSTGRES_USER: str(),
    POSTGRES_PASSWORD: str(),
    POSTGRES_DB: str(),
    JWT_ACCESS_TOKEN_PRIVATE_KEY: str(),
    JWT_ACCESS_TOKEN_PUBLIC_KEY: str(),
    SUPER_ADMIN_EMAIL: str(),
    SUPER_ADMIN_PASSWORD: str(),
    CREDENTIAL_GOOGLE: str(),
    SERVICE_DRIVE_ID_RECEIPT: str(),
    SERVICE_DRIVE_ID_USER: str(),
    SERVICE_DRIVE_ID_QRCODE: str(),
  });
};

export default validateEnv;
