const requiredInAllEnvironments = ['MONGODB_URI'];
const requiredInProduction = ['JWT_SECRET', 'FRONTEND_URL'];

const placeholderChecks = [
  {
    key: 'JWT_SECRET',
    isInvalid: (value) =>
      !value || value.length < 16 || value.includes('change_this') || value.includes('your_'),
    message: 'JWT_SECRET must be a strong non-placeholder secret before production deploy.',
  },
  {
    key: 'SMTP_USER',
    isInvalid: (value) => value && value.includes('your_email'),
    message: 'SMTP_USER still looks like a placeholder.',
  },
  {
    key: 'SMTP_PASS',
    isInvalid: (value) => value && value.includes('your_app_password'),
    message: 'SMTP_PASS still looks like a placeholder.',
  },
];

export const validateEnv = () => {
  const missing = requiredInAllEnvironments.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === 'production') {
    missing.push(...requiredInProduction.filter((key) => !process.env[key]));
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${[...new Set(missing)].join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production') {
    const invalid = placeholderChecks
      .filter(({ key, isInvalid }) => isInvalid(process.env[key]))
      .map(({ message }) => message);

    if (invalid.length > 0) {
      throw new Error(`Unsafe production environment configuration: ${invalid.join(' ')}`);
    }
  }
};

export default validateEnv;
