import { MigrationInterface, QueryRunner } from 'typeorm'
import { hashString } from '../services/bcrypt'
import config from '../config'
import { UserStatus } from '../api/user/interface'
import { Role } from '../api/role/roleModel'
import { RoleType } from '../api/role/interface'
import { User } from '../api/user/userModel'
import { UserRole } from '../api/user_role/userRoleModel'
import { generateUUID } from '../services/uuid'

export class AddAuth1704499440693 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `CREATE TABLE user_session (
        id varchar(36) NOT NULL,
        user_id varchar(255) NOT NULL,
        refresh_token varchar(255) NOT NULL,
        expires_at timestamp NOT NULL,
        status enum('Active','Expired','LoggedOut') NOT NULL DEFAULT 'Active',
        created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY FK_13275383dcdf095ee29f2b3455a (user_id),
        CONSTRAINT FK_13275383dcdf095ee29f2b3455a FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`
    )

    queryRunner.query(
      `CREATE TABLE verification_uid (
        id varchar(36) NOT NULL,
        user_id varchar(255) NOT NULL,
        type enum('Registration','ResetPassword') NOT NULL,
        created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        hash varchar(255) NOT NULL,
        uid varchar(36) NOT NULL,
        PRIMARY KEY (id),
        KEY FK_63a7c3d33457bd557224ccd88d7 (user_id),
        CONSTRAINT FK_63a7c3d33457bd557224ccd88d7 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`
    )

    //Insert super admin
    const hashedPassword = await hashString(config.SUPER_ADMIN_PASSWORD)
    const id = generateUUID()
    queryRunner.query(
      `INSERT INTO user(id, email, password, first_name, last_name, status)
      VALUES('${id}', '${config.SUPER_ADMIN_EMAIL}', '${hashedPassword}', 'Super', 'Admin', '${UserStatus.ACTIVE}')`
    )

    const [role] = await queryRunner.query(
      `SELECT id FROM role WHERE name = '${RoleType.MASTER_ADMIN}';`
    )

    await queryRunner.manager.insert(UserRole, {
      userId: id,
      roleId: role.id,
      assignedById: id
    })
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable('user_session')
    queryRunner.dropTable('verification_uid')
  }
}
