import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateOrdersModel1765730290290 implements MigrationInterface {
  name = 'UpdateOrdersModel1765730290290'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_f08b33fb0793b5617a4e0a7f2e\` ON \`order\``
    )
    await queryRunner.query(
      `CREATE TABLE \`order_product\` (\`id\` varchar(36) NOT NULL, \`order_id\` varchar(255) NOT NULL, \`product_id\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`price\` decimal(10,4) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_c1485ff3203bb824ec178c1524\` (\`order_id\`, \`product_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `CREATE TABLE \`order_service\` (\`id\` varchar(36) NOT NULL, \`order_id\` varchar(255) NOT NULL, \`service_id\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`price\` decimal(10,4) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_3a0bb8e8408e24ea40bdfbb035\` (\`order_id\`, \`service_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD \`acquisition_type\` enum ('rent', 'buy') NOT NULL DEFAULT 'buy'`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD \`customer_id\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD \`event_id\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD \`location\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD \`contact_person\` varchar(128) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD \`contact_person_contact\` varchar(255) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD UNIQUE INDEX \`IDX_f9180f384353c621e8d0c414c1\` (\`order_number\`)`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` CHANGE \`customer_name\` \`customer_name\` varchar(128) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` CHANGE \`notes\` \`notes\` text NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_product\` ADD CONSTRAINT \`FK_ea143999ecfa6a152f2202895e2\` FOREIGN KEY (\`order_id\`) REFERENCES \`order\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_product\` ADD CONSTRAINT \`FK_400f1584bf37c21172da3b15e2d\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_service\` ADD CONSTRAINT \`FK_92306ede85b90b1302d31caa5c8\` FOREIGN KEY (\`order_id\`) REFERENCES \`order\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`order_service\` ADD CONSTRAINT \`FK_4fcbf562c2169c74f62380f50b0\` FOREIGN KEY (\`service_id\`) REFERENCES \`service\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD CONSTRAINT \`FK_cd7812c96209c5bdd48a6b858b0\` FOREIGN KEY (\`customer_id\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD CONSTRAINT \`FK_394b0d7613180ebee9028e9aaa1\` FOREIGN KEY (\`event_id\`) REFERENCES \`event_model\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order\` DROP FOREIGN KEY \`FK_394b0d7613180ebee9028e9aaa1\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` DROP FOREIGN KEY \`FK_cd7812c96209c5bdd48a6b858b0\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order_service\` DROP FOREIGN KEY \`FK_4fcbf562c2169c74f62380f50b0\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order_service\` DROP FOREIGN KEY \`FK_92306ede85b90b1302d31caa5c8\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order_product\` DROP FOREIGN KEY \`FK_400f1584bf37c21172da3b15e2d\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order_product\` DROP FOREIGN KEY \`FK_ea143999ecfa6a152f2202895e2\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` CHANGE \`notes\` \`notes\` text NULL DEFAULT 'NULL'`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` CHANGE \`customer_name\` \`customer_name\` varchar(128) NULL DEFAULT 'NULL'`
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` DROP INDEX \`IDX_f9180f384353c621e8d0c414c1\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` DROP COLUMN \`contact_person_contact\``
    )
    await queryRunner.query(
      `ALTER TABLE \`order\` DROP COLUMN \`contact_person\``
    )
    await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`location\``)
    await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`event_id\``)
    await queryRunner.query(`ALTER TABLE \`order\` DROP COLUMN \`customer_id\``)
    await queryRunner.query(
      `ALTER TABLE \`order\` DROP COLUMN \`acquisition_type\``
    )
    await queryRunner.query(
      `DROP INDEX \`IDX_3a0bb8e8408e24ea40bdfbb035\` ON \`order_service\``
    )
    await queryRunner.query(`DROP TABLE \`order_service\``)
    await queryRunner.query(
      `DROP INDEX \`IDX_c1485ff3203bb824ec178c1524\` ON \`order_product\``
    )
    await queryRunner.query(`DROP TABLE \`order_product\``)
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_f08b33fb0793b5617a4e0a7f2e\` ON \`order\` (\`order_number\`)`
    )
  }
}
