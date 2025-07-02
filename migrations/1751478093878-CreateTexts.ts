import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTexts1751478093878 implements MigrationInterface {
    name = 'CreateTexts1751478093878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "texts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "content" text NOT NULL, 
                "userId" uuid NOT NULL, 
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_ce044efbc0a1872f20feca7e19f" PRIMARY KEY ("id")
            )`
        );
        await queryRunner.query(`ALTER TABLE "texts" ADD CONSTRAINT "FK_2b434bb7e2338cef909015a187d" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "texts" DROP CONSTRAINT "FK_2b434bb7e2338cef909015a187d"`);
        await queryRunner.query(`DROP TABLE "texts"`);
    }

}
