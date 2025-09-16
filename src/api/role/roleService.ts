import { ResponseCode } from '../../interface'
import { IGetRole, IRoleService } from './interface'
import { AppDataSource } from '../../services/typeorm'
import { Repository } from 'typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { Role } from './roleModel'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class RoleService implements IRoleService {
  private readonly roleRepository: Repository<Role>

  constructor() {
    this.roleRepository = AppDataSource.manager.getRepository(Role)
  }

  getRole = async ({ roleName, queryRunner }: IGetRole) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const role = await this.roleRepository
        .createQueryBuilder('role', queryRunner)
        .where('role.name = :roleName', { roleName })
        .getOne()
      if (!role) {
        return { code: ResponseCode.ROLE_NOT_FOUND }
      }

      return { role, code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }
}
