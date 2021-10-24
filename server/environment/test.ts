import { Environment } from ".";

// Test specific configuration
// ===========================
export default {
    sequelize: {
        uri: 'sqlite://',
        logging: false,
        options: {
            logging: false,
            storage: 'test.sqlite',
            define: {
                timestamps: false,
            },
        },
    },

    seedDB: true,
    allowCaching: false,
} as Partial<Environment>;
