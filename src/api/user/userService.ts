import { ResponseCode } from '../../interface'
import {
  IUserService,
  ICreateUser,
  IGetUserById,
  IGetUserByEmail,
  UserStatus,
  IVerifyUser,
  IDeleteUser,
  IEditUserPassword,
  IChangeUserEmail,
  IEditUser,
  IVerifyUserEmail,
  IGetUsers
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { User } from './userModel'
import { Brackets, Repository } from 'typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { randomBytes } from 'node:crypto'
import { compare, hashString } from '../../services/bcrypt'
import { VerificationUIDService } from '../verification_uid/verificationUIDService'
import { VerificationUIDType } from '../verification_uid/interface'
import { EmailTemplates } from '../../services/email/templates'
import config from '../../config'
import { emailService } from '../../services/email'
import { RoleType } from '../role/interface'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class UserService implements IUserService {
  private readonly userRepository: Repository<User>
  private readonly verificationUIDService: VerificationUIDService

  constructor(verificationUIDService: VerificationUIDService) {
    this.userRepository = AppDataSource.manager.getRepository(User)
    this.verificationUIDService = verificationUIDService
  }

  createUser = async ({
    firstName,
    lastName,
    phoneNumber,
    email,
    location,
    queryRunner
  }: ICreateUser) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let insertResult = await this.userRepository
        .createQueryBuilder('user', queryRunner)
        .insert()
        .into(User)
        .values([{ firstName, lastName, email, phoneNumber, location }])
        .execute()

      if (insertResult.raw.affectedRows !== 1) {
        return { code: ResponseCode.FAILED_INSERT }
      }

      const userId = insertResult.identifiers[0].id

      const user = await this.userRepository
        .createQueryBuilder('user', queryRunner)
        .where('user.id = :userId', { userId })
        .getOne()

      if (!user) {
        return { code: ResponseCode.USER_NOT_FOUND }
      }

      return { user, code }
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

  getUserById = async ({
    userId,
    allUsers,
    role,
    queryRunner
  }: IGetUserById) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.userRepository
        .createQueryBuilder('user', queryRunner)
        .leftJoinAndSelect('user.userRoles', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('user.id = :userId', { userId })

      if (role) {
        query.andWhere('role.name = :roleName', { roleName: role })
      }

      if (!allUsers) {
        query.andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      }

      const user = await query.getOne()

      if (!user) {
        return { code: ResponseCode.USER_NOT_FOUND }
      }

      return { user, code }
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

  getUsers = async ({ search, page, limit, role }: IGetUsers) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userRoles', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .andWhere('user.status != :deletedStatus', {
          deletedStatus: UserStatus.DELETED
        })

      if (role) {
        query.andWhere('role.name = :roleName', { roleName: role })
      }

      if (search) {
        const searchLike = `%${search}%`

        query.andWhere(
          new Brackets((qb) => {
            qb.orWhere('user.firstName LIKE :firstName', {
              firstName: searchLike
            })
              .orWhere('user.lastName LIKE :lastName', { lastName: searchLike })
              .orWhere('user.email LIKE :email', { email: searchLike })
          })
        )
      }

      const offset = (page - 1) * limit
      const [users, count] = await query
        .skip(offset)
        .take(limit)
        .getManyAndCount()

      if (!users) {
        return { code: ResponseCode.USER_NOT_FOUND }
      }

      return {
        userData: {
          users,
          pagination: {
            count,
            page,
            limit
          }
        },
        code
      }
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

  getUserByEmail = async ({ email, queryRunner }: IGetUserByEmail) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const user = await this.userRepository
        .createQueryBuilder('user', queryRunner)
        .where('user.email = :email', { email })
        .getOne()
      if (!user) {
        return { code: ResponseCode.USER_NOT_FOUND }
      }

      return { user, code }
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

  verifyUser = async ({ userId, password }: IVerifyUser) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) {
        return { code: ResponseCode.USER_NOT_FOUND }
      }

      user.password = password
      user.status = UserStatus.ACTIVE
      await this.userRepository.save(user)

      return { user, code }
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

  anonymizeUser = async ({ userId, queryRunner }: IDeleteUser) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const hash = randomBytes(10).toString('hex')

      const user = await this.userRepository.findOne({ where: { id: userId } })
      if (!user) {
        return { code: ResponseCode.USER_NOT_FOUND }
      }

      const { code: userCode } = await this.editUser({
        userId,
        email: hash + '-deleted@email.com',
        password: null,
        firstName: 'deleted',
        lastName: 'deleted',
        status: UserStatus.DELETED,
        queryRunner
      })

      return { code: userCode }
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

  editUser = async ({
    userId,
    email,
    newEmail,
    password,
    firstName,
    lastName,
    phoneNumber,
    status,
    location,
    queryRunner
  }: IEditUser) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      await this.userRepository
        .createQueryBuilder('user', queryRunner)
        .update(User)
        .set({
          email,
          newEmail,
          password,
          firstName,
          lastName,
          phoneNumber,
          location: location as string | undefined,
          status
        })
        .where('user.id = :userId', { userId })
        .execute()

      return { code }
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

  editUserPassword = async ({
    userId,
    password,
    newPassword
  }: IEditUserPassword) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { user, code: userCode } = await this.getUserById({
        userId
      })
      if (!user) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: userCode }
      }

      if (!user.password) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.USER_NOT_CONFIRMED }
      }

      const matches = await compare(password, user.password!)
      if (!matches) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.WRONG_PASSWORD }
      }

      const hashedPassword = await hashString(newPassword)

      const { code: editCode } = await this.editUser({
        userId,
        password: hashedPassword,
        queryRunner
      })

      if (editCode != ResponseCode.OK) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: editCode }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()

      return { code }
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  changeUserEmail = async ({ userId, email }: IChangeUserEmail) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { code: editCode } = await this.editUser({
        userId,
        newEmail: email
      })
      if (editCode != ResponseCode.OK) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: editCode }
      }

      const { uids, code: uidCode } =
        await this.verificationUIDService.setVerificationUID({
          userId,
          type: VerificationUIDType.CHANGE_EMAIL
        })
      if (!uids) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: uidCode }
      }

      // send email with confirmation link to new email address
      try {
        await emailService.sendEmail({
          to: email,
          template: EmailTemplates.EMAIL_CONFIRMATION,
          data: {
            URL: `${config.CLIENT_BASE_URL}/validate-email?uid=${uids.uid}/${uids.hashUID}`
          }
        })
      } catch (emailErr: any) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        code = ResponseCode.SERVER_ERROR
        logger.error({
          code,
          message: 'Failed to send email confirmation',
          stack: emailErr.stack
        })
        return { code }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()

      return { code }
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  verifyUserEmail = async ({ uid, hashUid }: IVerifyUserEmail) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { verificationUID, code: verificationUIDCode } =
        await this.verificationUIDService.verifyUID({
          uid,
          hashUid,
          type: VerificationUIDType.CHANGE_EMAIL
        })

      if (!verificationUID) {
        return { code: verificationUIDCode }
      }

      const { user, code: userCode } = await this.getUserById({
        userId: verificationUID.userId,
        allUsers: true
      })

      if (!user) {
        return { code: userCode }
      }

      const { code } = await this.editUser({
        userId: user.id,
        email: user.newEmail!,
        newEmail: null
      })

      await this.verificationUIDService.clearVerificationUID({
        userId: user.id,
        type: VerificationUIDType.CHANGE_EMAIL
      })

      return { userId: user.id, code }
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
