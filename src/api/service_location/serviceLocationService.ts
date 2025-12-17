import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  ICreateServiceLocation,
  IDeleteServiceLocation,
  IGetServiceLocationById,
  IListServiceLocations,
  IServiceLocationService,
  IServiceLocationsPagination,
  IUpdateServiceLocation
} from './interface'
import { ServiceLocationModel } from './serviceLocationModel'
import { UserService } from '../user/userService'
import { UserRoleService } from '../user_role/userRoleService'
import { RoleType, RoleName } from '../role/interface'
import { User } from '../user/userModel'
import { VerificationUIDService } from '../verification_uid/verificationUIDService'
import { VerificationUIDType } from '../verification_uid/interface'
import config from '../../config'
import { EmailTemplates } from '../../services/email/templates'
import { emailService } from '../../services/email'
import { ServicesService } from '../service/serviceService'

type ListServiceLocationsResponse = Awaited<
  AsyncResponse<IServiceLocationsPagination<ServiceLocationModel>>
>
type ServiceLocationResponse = Awaited<AsyncResponse<ServiceLocationModel>>
type DeleteResponse = Awaited<AsyncResponse<null>>

@autoInjectable()
export class ServiceLocationService
  implements IServiceLocationService<ServiceLocationModel>
{
  private readonly serviceLocationRepository: Repository<ServiceLocationModel>
  private readonly userService: UserService
  private readonly userRoleService: UserRoleService
  private readonly verificationUIDService: VerificationUIDService
  private readonly servicesService: ServicesService

  constructor(
    userService: UserService,
    userRoleService: UserRoleService,
    verificationUIDService: VerificationUIDService,
    servicesService: ServicesService
  ) {
    this.serviceLocationRepository =
      AppDataSource.manager.getRepository(ServiceLocationModel)
    this.userService = userService
    this.userRoleService = userRoleService
    this.verificationUIDService = verificationUIDService
    this.servicesService = servicesService
  }

  listServiceLocations = async ({
    search,
    page = 1,
    limit = 25,
    serviceId,
    queryRunner
  }: IListServiceLocations): AsyncResponse<
    IServiceLocationsPagination<ServiceLocationModel>
  > => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const currentPage = page && page > 0 ? page : 1
      const currentLimit = limit && limit > 0 ? limit : 25

      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceLocationModel)
        : this.serviceLocationRepository

      const query = repository.createQueryBuilder('service_location')

      if (serviceId) {
        query.andWhere('service_location.serviceId = :serviceId', { serviceId })
      }

      if (search) {
        const searchLike = `%${search.toLowerCase()}%`
        query.andWhere(
          '(LOWER(service_location.city) LIKE :searchLike OR LOWER(service_location.address) LIKE :searchLike OR LOWER(service_location.email) LIKE :searchLike)',
          { searchLike }
        )
      }

      const offset = (currentPage - 1) * currentLimit

      const [serviceLocations, count] = await query
        .orderBy('service_location.createdAt', 'DESC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      const response = {
        serviceLocations,
        pagination: {
          count,
          page: currentPage,
          limit: currentLimit
        },
        code
      }

      return response as unknown as ListServiceLocationsResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ListServiceLocationsResponse
  }

  getServiceLocationById = async ({
    serviceLocationId,
    queryRunner
  }: IGetServiceLocationById): AsyncResponse<ServiceLocationModel> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceLocationModel)
        : this.serviceLocationRepository

      const serviceLocation = await repository.findOne({
        where: { id: serviceLocationId },
        relations: ['user', 'service']
      })

      if (!serviceLocation) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { serviceLocation, code } as unknown as ServiceLocationResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ServiceLocationResponse
  }

  createServiceLocation = async ({
    city,
    address,
    phone,
    email,
    serviceId,
    assignedById,
    queryRunner
  }: ICreateServiceLocation): AsyncResponse<ServiceLocationModel> => {
    let code: ResponseCode = ResponseCode.OK
    const transactionQueryRunner =
      queryRunner || AppDataSource.createQueryRunner()
    let user: User
    let shouldReleaseQueryRunner = false

    try {
      if (!queryRunner) {
        await transactionQueryRunner.connect()
        await transactionQueryRunner.startTransaction()
        shouldReleaseQueryRunner = true
      }

      // Validate that the service exists
      const { service, code: serviceCode } =
        await this.servicesService.getServiceById({
          serviceId,
          queryRunner: transactionQueryRunner
        })
      if (!service) {
        if (shouldReleaseQueryRunner) {
          await transactionQueryRunner.rollbackTransaction()
          await transactionQueryRunner.release()
        }
        return { code: serviceCode }
      }

      const { user: existingUser } = await this.userService.getUserByEmail({
        email
      })

      if (!existingUser) {
        const { user: newUser, code: newUserCode } =
          await this.userService.createUser({
            firstName: city,
            lastName: 'Service Location',
            email,
            phoneNumber: phone ?? undefined,
            queryRunner: transactionQueryRunner
          })
        if (!newUser) {
          if (shouldReleaseQueryRunner) {
            await transactionQueryRunner.rollbackTransaction()
            await transactionQueryRunner.release()
          }
          return { code: newUserCode }
        }

        const { uids, code: uidCode } =
          await this.verificationUIDService.setVerificationUID({
            userId: newUser.id,
            type: VerificationUIDType.REGISTRATION,
            queryRunner: transactionQueryRunner
          })
        if (!uids) {
          if (shouldReleaseQueryRunner) {
            await transactionQueryRunner.rollbackTransaction()
            await transactionQueryRunner.release()
          }
          return { code: uidCode }
        }

        await emailService.sendEmail({
          to: email,
          template: EmailTemplates.INVITATION,
          data: {
            URL: `${config.CLIENT_BASE_URL}/register?uid=${uids.uid}/${uids.hashUID}`,
            ROLE: RoleName.SERVICE
          }
        })

        user = newUser
      } else {
        const { code: editCode } = await this.userService.editUser({
          userId: existingUser.id,
          firstName: city,
          lastName: 'Service Location',
          phoneNumber: phone ?? undefined,
          queryRunner: transactionQueryRunner
        })

        if (editCode != ResponseCode.OK) {
          if (shouldReleaseQueryRunner) {
            await transactionQueryRunner.rollbackTransaction()
            await transactionQueryRunner.release()
          }
          return { code: editCode }
        }

        user = existingUser
      }

      const { code: assignRoleCode } = await this.userRoleService.assignRole({
        userId: user.id,
        roleName: RoleType.SERVICE,
        assignedById,
        queryRunner: transactionQueryRunner
      })

      if (
        assignRoleCode != ResponseCode.OK &&
        assignRoleCode != ResponseCode.CONFLICT_USER_ROLE
      ) {
        if (shouldReleaseQueryRunner) {
          await transactionQueryRunner.rollbackTransaction()
          await transactionQueryRunner.release()
        }
        return { code: assignRoleCode }
      }

      const repository = shouldReleaseQueryRunner
        ? transactionQueryRunner.manager.getRepository(ServiceLocationModel)
        : this.serviceLocationRepository

      const serviceLocation = repository.create({
        city,
        address,
        phone: phone ?? null,
        email,
        userId: user.id,
        serviceId
      })

      const savedServiceLocation = await repository.save(serviceLocation)

      if (shouldReleaseQueryRunner) {
        await transactionQueryRunner.commitTransaction()
        await transactionQueryRunner.release()
      }

      return {
        serviceLocation: savedServiceLocation,
        code
      } as unknown as ServiceLocationResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
      if (shouldReleaseQueryRunner) {
        await transactionQueryRunner.rollbackTransaction()
        await transactionQueryRunner.release()
      }
    }

    return { code } as unknown as ServiceLocationResponse
  }

  updateServiceLocation = async ({
    serviceLocationId,
    city,
    address,
    phone,
    email,
    serviceId,
    queryRunner
  }: IUpdateServiceLocation): AsyncResponse<ServiceLocationModel> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      // If serviceId is being updated, validate that the service exists
      if (typeof serviceId !== 'undefined') {
        const { service, code: serviceCode } =
          await this.servicesService.getServiceById({
            serviceId,
            queryRunner
          })
        if (!service) {
          return { code: serviceCode }
        }
      }

      const updateData: Partial<ServiceLocationModel> = {}

      if (typeof city !== 'undefined') {
        updateData.city = city
      }

      if (typeof address !== 'undefined') {
        updateData.address = address
      }

      if (typeof phone !== 'undefined') {
        updateData.phone = phone ?? null
      }

      if (typeof email !== 'undefined') {
        updateData.email = email
      }

      if (typeof serviceId !== 'undefined') {
        updateData.serviceId = serviceId
      }

      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceLocationModel)
        : this.serviceLocationRepository

      const result = await repository
        .createQueryBuilder()
        .update(ServiceLocationModel)
        .set(updateData)
        .where('id = :serviceLocationId', { serviceLocationId })
        .execute()

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const { serviceLocation, code: getCode } =
        await this.getServiceLocationById({
          serviceLocationId,
          queryRunner
        })

      if (!serviceLocation) {
        return { code: getCode }
      }

      return { serviceLocation, code } as unknown as ServiceLocationResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ServiceLocationResponse
  }

  deleteServiceLocation = async ({
    serviceLocationId,
    queryRunner
  }: IDeleteServiceLocation): AsyncResponse<null> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceLocationModel)
        : this.serviceLocationRepository

      const result = await repository.delete({ id: serviceLocationId })

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { code } as unknown as DeleteResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as DeleteResponse
  }
}
