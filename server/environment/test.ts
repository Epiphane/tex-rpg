import { Environment } from ".";

// Test specific configuration
// ===========================
export default {
    sequelize: {
        uri: 'sqlite://',
        storage: 'test.sqlite',
        // logging: false,
        options: {
            storage: 'test.sqlite',
            define: {
                timestamps: false,
            },
        },
    },

    seedDB: true,
    allowCaching: false,
    jwtSecret: 'test',
} as Partial<Environment>;
