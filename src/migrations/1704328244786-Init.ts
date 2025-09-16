import { MigrationInterface, QueryRunner } from 'typeorm'
import { RoleType } from '../api/role/interface'
import { UserStatus } from '../api/user/interface'

export class Init1704328244786 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `CREATE TABLE barnahus ( 
        id varchar(36) NOT NULL,
        name varchar(36) NOT NULL,
        location varchar(127) NOT NULL,
        created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`
    )

    queryRunner.query(
      `CREATE TABLE user (
        id varchar(36) NOT NULL,
        email varchar(255) NOT NULL,
        password varchar(255) DEFAULT NULL,
        first_name varchar(36) NOT NULL,
        last_name varchar(36) NOT NULL,
        phone_number varchar(14) NULL,
        status enum('Created','Active','Deleted') NOT NULL DEFAULT 'Created',
        created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`
    )

    queryRunner.query(
      `CREATE TABLE role (
            id varchar(36) NOT NULL,
            name varchar(255) NOT NULL,
            created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            PRIMARY KEY (id)
          ) ENGINE=InnoDB;`
    )

    queryRunner.query(
      `CREATE TABLE user_role (
        id varchar(36) NOT NULL,
        user_id varchar(255) NOT NULL,
        role_id varchar(255) NOT NULL,
        assigned_by_id varchar(255) NULL,
        created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY IDX_f634684acb47c1a158b83af515 (user_id, role_id),
        KEY FK_d0e5815877f7395a198a4cb0a46 (user_id),
        KEY FK_32a6fc2fcb019d8e3a8ace0f55f (role_id),
        KEY FK_9cbb77db19b830dbda4f8ee33d6 (assigned_by_id),
        CONSTRAINT FK_32a6fc2fcb019d8e3a8ace0f55f FOREIGN KEY (role_id) REFERENCES role (id) ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT FK_9cbb77db19b830dbda4f8ee33d6 FOREIGN KEY (assigned_by_id) REFERENCES user (id) ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT FK_d0e5815877f7395a198a4cb0a46 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB;`
    )

    //Insert all defined roles
    Object.values(RoleType).forEach((value) => {
      queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('role')
        .values({ name: value })
        .execute()
    })
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable('barnahus')
    queryRunner.dropTable('user')
    queryRunner.dropTable('role')
    queryRunner.dropTable('userRole')
  }
}
