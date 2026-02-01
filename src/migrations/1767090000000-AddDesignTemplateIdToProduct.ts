import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDesignTemplateIdToProduct1767090000000
  implements MigrationInterface
{
  name = 'AddDesignTemplateIdToProduct1767090000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD \`design_template_id\` varchar(36) NULL`
    )
    await queryRunner.query(
      `ALTER TABLE \`product\` ADD CONSTRAINT \`FK_product_design_template\` FOREIGN KEY (\`design_template_id\`) REFERENCES \`media\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_product_design_template\``
    )
    await queryRunner.query(
      `ALTER TABLE \`product\` DROP COLUMN \`design_template_id\``
    )
  }
}

