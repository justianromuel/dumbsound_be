'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
        */
        await queryInterface.bulkInsert(
            "users",
            [
                {
                    email: "admin@mail.com",
                    password: "$2b$10$swtZ7Bzo9xx2UlVSntdmAeMG6CtxXjpdGk7lTpxWuMX6c0GJTEOMm", //123456
                    name: "admin",
                    status: "admin",
                    gender: "male",
                    phone: "081212345678",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    }
};
