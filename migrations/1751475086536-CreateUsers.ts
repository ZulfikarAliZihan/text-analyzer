import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1751475086536 implements MigrationInterface {
    name = 'CreateUsers1751475086536'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "name" character varying(100) NOT NULL, 
                "password" character varying NOT NULL, 
                "username" character varying(200) NOT NULL, 
                "email" character varying(200) NOT NULL, 
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                CONSTRAINT "username" UNIQUE ("username"), 
                CONSTRAINT "email" UNIQUE ("email"), 
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
