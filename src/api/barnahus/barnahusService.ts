import { ResponseCode } from '../../interface'
import {
  IBarnahusService,
  IBulkDeleteBarnahuses,
  ICreateBarnahus,
  IDeleteBarnahus,
  IEditBarnahus,
  IGenerateLocationCode,
  IGetAssignableBarnahuses,
  IGetBarnahusById,
  IGetBarnahusByLocationCode,
  IGetBarnahuses,
  IGetMasterAdminsBarnahus,
  ISearchBarnahusLocations
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { Repository } from 'typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { Barnahus } from './barnahusModel'
import { RoleName, RoleType } from '../role/interface'
import { searchPlaces } from '../../services/google'
import { SearchPlacesType } from '../../services/google/interface'
import { UserStatus } from '../user/interface'
import { VerificationUIDService } from '../verification_uid/verificationUIDService'
import { EmailTemplateService } from '../email_template/emailTemplateService'
import { VerificationUIDType } from '../verification_uid/interface'
import { EmailTemplates } from '../email_template/interface'
import config from '../../config'
import { UserRoleBarnahusService } from '../user_role_barnahus/userRoleBarnahusService'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class BarnahusService implements IBarnahusService {
  private readonly barnahusRepository: Repository<Barnahus>
  private readonly userRoleBarnahusService: UserRoleBarnahusService
  private readonly verificationUIDService: VerificationUIDService
  private readonly emailTemplateService: EmailTemplateService

  constructor(
    userRoleBarnahusService: UserRoleBarnahusService,
    verificationUIDService: VerificationUIDService,
    emailTemplateService: EmailTemplateService
  ) {
    this.barnahusRepository = AppDataSource.manager.getRepository(Barnahus)
    this.userRoleBarnahusService = userRoleBarnahusService
    this.verificationUIDService = verificationUIDService
    this.emailTemplateService = emailTemplateService
  }

  createBarnahus = async ({
    name,
    location,
    userId,
    assignedById
  }: ICreateBarnahus) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { locationCode, code: locationCodeCode } =
        await this.generateLocationCode({ location })
      if (!locationCode) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: locationCodeCode }
      }

      let insertResult = await this.barnahusRepository
        .createQueryBuilder('barnahus', queryRunner)
        .insert()
        .into(Barnahus)
        .values([{ name, location, locationCode }])
        .execute()

      if (insertResult.raw.affectedRows !== 1) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_INSERT }
      }

      const barnahusId = insertResult.identifiers[0].id

      if (userId && assignedById) {
        const { userRole, code: userRoleBarnahusCode } =
          await this.userRoleBarnahusService.assignUserRoleToBarnahus({
            userId,
            role: RoleType.MASTER_ADMIN,
            barnahusId,
            assignedById,
            queryRunner
          })

        if (!userRole) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: userRoleBarnahusCode }
        }

        //Send delayed verification email if user has not yet been verified
        if (userRole.user.status == UserStatus.CREATED) {
          const { uids, code: uidCode } =
            await this.verificationUIDService.setVerificationUID({
              userId: userRole.userId,
              type: VerificationUIDType.REGISTRATION,
              queryRunner
            })
          if (!uids) {
            return { code: uidCode }
          }

          await this.emailTemplateService.sendEmail({
            to: userRole.user.email,
            template: EmailTemplates.INVITATION,
            data: {
              URL: `${config.BASE_URL}/register?uid=${uids.uid}/${uids.hashUID}`,
              ROLE: RoleName.MASTER_ADMIN
            }
          })
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()

      return { code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })

      await queryRunner.rollbackTransaction()
      await queryRunner.release()
    }

    return { code }
  }

  getBarnahusById = async ({ barnahusId }: IGetBarnahusById) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let barnahus = await this.barnahusRepository
        .createQueryBuilder('barnahus')
        .leftJoinAndSelect('barnahus.userRoleBarnahuses', 'userRoleBarnahus')
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRole.user', 'user')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('barnahus.id = :barnahusId', { barnahusId })
        .getOne()
      if (!barnahus) {
        return { code: ResponseCode.BARNAHUS_NOT_FOUND }
      }

      return { barnahus, code }
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

  getBarnahusByLocationCode = async ({
    locationCode
  }: IGetBarnahusByLocationCode) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let barnahus = await this.barnahusRepository
        .createQueryBuilder('barnahus')
        .leftJoinAndSelect('barnahus.userRoleBarnahuses', 'userRoleBarnahus')
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRole.user', 'user')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('barnahus.locationCode = :locationCode', { locationCode })
        .getOne()
      if (!barnahus) {
        return { code: ResponseCode.BARNAHUS_NOT_FOUND }
      }

      return { barnahus, code }
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

  getMasterAdminsBarnahus = async ({ id }: IGetMasterAdminsBarnahus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let barnahus = await this.barnahusRepository
        .createQueryBuilder('barnahus')
        .leftJoinAndSelect('barnahus.userRoleBarnahuses', 'userRoleBarnahus')
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRole.user', 'user')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('role.name = :roleName', { roleName: RoleType.MASTER_ADMIN })
        .andWhere('user.id = :id', { id })
        .getOne()

      if (!barnahus) {
        return { code: ResponseCode.BARNAHUS_NOT_FOUND }
      }

      return { barnahus, code }
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

  getBarnahuses = async ({ search, page, limit }: IGetBarnahuses) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.barnahusRepository
        .createQueryBuilder('barnahus')
        .leftJoinAndSelect('barnahus.userRoleBarnahuses', 'userRoleBarnahus')
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRole.user', 'user')
        .leftJoinAndSelect('userRole.role', 'role')

      if (search) {
        const searchLike = `%${search}%`
        query.andWhere('barnahus.name LIKE :name', { name: searchLike })
      }

      const offset = (page - 1) * limit

      const [barnahuses, count] = await query
        .skip(offset)
        .take(limit)
        .getManyAndCount()

      if (!barnahuses) {
        return { code: ResponseCode.BARNAHUS_NOT_FOUND }
      }

      return {
        barnahusData: {
          barnahuses,
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

  getAssignableBarnahuses = async ({ search }: IGetAssignableBarnahuses) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = await this.barnahusRepository
        .createQueryBuilder('barnahus')
        .leftJoinAndSelect('barnahus.userRoleBarnahuses', 'userRoleBarnahus')
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRole.user', 'user')
        .leftJoinAndSelect('userRole.role', 'role')

      if (search) {
        const searchLike = `%${search}%`

        query.andWhere('barnahus.name LIKE :name', {
          name: searchLike
        })
      }

      let barnahuses = await query.getMany()

      barnahuses = barnahuses.filter(
        (barnahus) =>
          !barnahus.userRoleBarnahuses.find(
            (userRoleBarnahus) =>
              userRoleBarnahus.userRole.role.name == RoleType.MASTER_ADMIN
          )
      )

      if (!barnahuses) {
        return { code: ResponseCode.BARNAHUS_NOT_FOUND }
      }

      return { barnahuses, code }
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

  editBarnahus = async ({
    barnahusId,
    name,
    location,
    adminId,
    assignedById
  }: IEditBarnahus) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      // edit barnahus
      const barnahusEditResult = await this.barnahusRepository
        .createQueryBuilder()
        .update(Barnahus)
        .set({
          name: name,
          location: location
        })
        .where('barnahus.id = :barnahusId', { barnahusId })
        .execute()

      if (barnahusEditResult.affected !== 1) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_EDIT }
      }

      if (adminId) {
        const { userRoleBarnahuses, code: userRoleBarnahusesCode } =
          await this.userRoleBarnahusService.getUserRoleBarnahusesByRole({
            role: RoleType.MASTER_ADMIN,
            barnahusId
          })

        if (!userRoleBarnahuses) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: userRoleBarnahusesCode }
        }

        if (userRoleBarnahuses[0]?.id) {
          const { code: editUserRoleBarnahusCode } =
            await this.userRoleBarnahusService.editUserRoleBarnahus({
              userId: adminId,
              role: RoleType.MASTER_ADMIN,
              userRoleBarnahusId: userRoleBarnahuses[0]?.id,
              queryRunner
            })

          if (editUserRoleBarnahusCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: ResponseCode.FAILED_EDIT }
          }
        } else {
          const { userRole, code: userRoleBarnahusCode } =
            await this.userRoleBarnahusService.assignUserRoleToBarnahus({
              userId: adminId,
              role: RoleType.MASTER_ADMIN,
              barnahusId,
              assignedById,
              queryRunner
            })

          if (!userRole) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: userRoleBarnahusCode }
          }

          //Send delayed verification email if user has not yet been verified
          if (userRole.user.status == UserStatus.CREATED) {
            const { uids, code: uidCode } =
              await this.verificationUIDService.setVerificationUID({
                userId: userRole.userId,
                type: VerificationUIDType.REGISTRATION,
                queryRunner
              })
            if (!uids) {
              return { code: uidCode }
            }

            await this.emailTemplateService.sendEmail({
              to: userRole.user.email,
              template: EmailTemplates.INVITATION,
              data: {
                URL: `${config.BASE_URL}/register?uid=${uids.uid}/${uids.hashUID}`,
                ROLE: RoleName.MASTER_ADMIN
              }
            })
          }
        }
      } else {
        const { barnahus } = await this.getBarnahusById({
          barnahusId
        })

        let userId

        if (barnahus) {
          for (const data of barnahus?.userRoleBarnahuses) {
            if (
              data.userRole.role.name ===
              RoleName.MASTER_ADMIN.split(' ').join('')
            ) {
              userId = data.userRole.userId
            }
          }
        }
        if (userId) {
          const { code } =
            await this.userRoleBarnahusService.deleteUserRoleBarnahus({
              userId: userId,
              role: RoleType.MASTER_ADMIN,
              barnahusId
            })

          if (code != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: code }
          }
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
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

  deleteBarnahus = async ({ barnahusId, queryRunner }: IDeleteBarnahus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const deleteResult = await this.barnahusRepository
        .createQueryBuilder('barnahus', queryRunner)
        .delete()
        .from(Barnahus)
        .where('id = :barnahusId', { barnahusId })
        .execute()

      if (deleteResult.affected !== 1) {
        return { code: ResponseCode.GONE }
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

  bulkDeleteBarnahuses = async ({ barnahusIds }: IBulkDeleteBarnahuses) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (const barnahusId of barnahusIds) {
        const deleteResult = await this.deleteBarnahus({
          barnahusId,
          queryRunner
        })

        if (deleteResult.code != ResponseCode.OK) {
          code = deleteResult.code
          await queryRunner.rollbackTransaction()
          await queryRunner.release()

          return { code }
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })

      await queryRunner.rollbackTransaction()
      await queryRunner.release()
    }

    return { code }
  }

  searchBarnahusLocations = async ({ search }: ISearchBarnahusLocations) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const searchResults = await searchPlaces(search, SearchPlacesType.cities)
      if (!searchResults) {
        return { code: ResponseCode.FAILED_DEPENDENCY }
      }

      let locations = []
      for (let searchResult of searchResults) {
        let location = {
          id: searchResult.place_id,
          name: searchResult.description,
          locationCode: ''
        }

        const { locationCode } = await this.generateLocationCode({
          location: searchResult.description
        })
        if (locationCode) {
          location.locationCode = locationCode
        }

        locations.push(location)
      }

      return { locations, code }
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

  getBarnahusLocations = async () => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let barnahuses = await this.barnahusRepository
        .createQueryBuilder('barnahus')
        .getMany()

      let locations: string[] = []

      for (let barnahus of barnahuses) {
        if (!locations.find((location) => location == barnahus.location)) {
          locations.push(barnahus.location)
        }
      }

      return { locations, code }
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

  generateLocationCode = async ({
    location,
    queryRunner
  }: IGenerateLocationCode) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let locationPath = location.split(', ')
      let city = locationPath[0]
      let country = locationPath[locationPath.length - 1]

      let countryCode = country.substring(0, 2).toUpperCase()
      let cityCode = city.substring(0, 2).toUpperCase()

      let baseLocationCode = `${countryCode}-${cityCode}`

      let numBarnahusesOnLocation = await this.barnahusRepository
        .createQueryBuilder('barnahus', queryRunner)
        .where('barnahus.locationCode LIKE :baseLocationCode', {
          baseLocationCode: `%${baseLocationCode}%`
        })
        .getCount()

      let locationCode = `${baseLocationCode}-${numBarnahusesOnLocation + 1}`
      return { locationCode, code }
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
