import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddProductMedia1764787769775 implements MigrationInterface {
  name = 'AddProductMedia1764787769775'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`product_media\` (\`id\` varchar(36) NOT NULL, \`product_id\` varchar(36) NOT NULL, \`media_id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_product_media_unique\` (\`product_id\`, \`media_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )

    await queryRunner.query(
      `ALTER TABLE \`product_media\` ADD CONSTRAINT \`FK_product_media_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )

    await queryRunner.query(
      `ALTER TABLE \`product_media\` ADD CONSTRAINT \`FK_product_media_media\` FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_media\` DROP FOREIGN KEY \`FK_product_media_media\``
    )

    await queryRunner.query(
      `ALTER TABLE \`product_media\` DROP FOREIGN KEY \`FK_product_media_product\``
    )

    await queryRunner.query(`DROP TABLE \`product_media\``)
  }
}
