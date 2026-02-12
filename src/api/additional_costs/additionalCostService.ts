import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  IBulkDeleteAdditionalCosts,
  ICreateAdditionalCost,
  IDeleteAdditionalCost,
  IGetAdditionalCostById,
  IListAdditionalCosts,
  IAdditionalCostService,
  IAdditionalCostsPagination,
  IUpdateAdditionalCost
} from './interface'
import { AdditionalCost } from './additionalCostModel'

type ListAdditionalCostsResponse = Awaited<
  AsyncResponse<IAdditionalCostsPagination>
>
type AdditionalCostResponse = Awaited<AsyncResponse<AdditionalCost>>
type DeleteAdditionalCostResponse = Awaited<AsyncResponse<null>>

@autoInjectable()
export class AdditionalCostsService implements IAdditionalCostService {
  private readonly additionalCostRepository: Repository<AdditionalCost>

  constructor() {
    this.additionalCostRepository =
      AppDataSource.manager.getRepository(AdditionalCost)
  }

  listAdditionalCosts = async ({
    search,
    page = 1,
    limit = 25,
    methodOfPayment,
    billingType,
    acquisitionType,
    queryRunner
  }: IListAdditionalCosts): AsyncResponse<IAdditionalCostsPagination> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const currentPage = page && page > 0 ? page : 1
      const currentLimit = limit && limit > 0 ? limit : 25

      const repository = queryRunner
        ? queryRunner.manager.getRepository(AdditionalCost)
        : this.additionalCostRepository

      const query = repository.createQueryBuilder('additionalCost')

      if (search) {
        const searchLike = `%${search.toLowerCase()}%`
        query.andWhere('LOWER(additionalCost.name) LIKE :searchLike', {
          searchLike
        })
      }

      if (methodOfPayment) {
        query.andWhere('additionalCost.methodOfPayment = :methodOfPayment', {
          methodOfPayment
        })
      }

      if (billingType) {
        query.andWhere('additionalCost.billingType = :billingType', {
          billingType
        })
      }

      if (acquisitionType) {
        query.andWhere('additionalCost.acquisitionType = :acquisitionType', {
          acquisitionType
        })
      }

      const offset = (currentPage - 1) * currentLimit

      const [additionalCosts, count] = await query
        .orderBy('additionalCost.createdAt', 'DESC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      const response = {
        additionalCosts,
        pagination: {
          count,
          page: currentPage,
          limit: currentLimit
        },
        code
      }

      return response as unknown as ListAdditionalCostsResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ListAdditionalCostsResponse
  }

  getAdditionalCostById = async ({
    additionalCostId,
    queryRunner
  }: IGetAdditionalCostById): AsyncResponse<AdditionalCost> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(AdditionalCost)
        : this.additionalCostRepository

      const additionalCost = await repository.findOne({
        where: { id: additionalCostId }
      })

      if (!additionalCost) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { additionalCost, code } as unknown as AdditionalCostResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as AdditionalCostResponse
  }

  createAdditionalCost = async ({
    name,
    methodOfPayment,
    billingType,
    acquisitionType,
    price,
    calculationStatus,
    maxPieces,
    enableUpload,
    queryRunner
  }: ICreateAdditionalCost): AsyncResponse<AdditionalCost> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const manager = queryRunner ? queryRunner.manager : AppDataSource.manager

      const repository = manager.getRepository(AdditionalCost)

      const additionalCost = repository.create({
        name,
        methodOfPayment,
        billingType,
        acquisitionType,
        price,
        calculationStatus,
        maxPieces,
        enableUpload: enableUpload ?? false
      })

      const savedAdditionalCost = await repository.save(additionalCost)

      return {
        additionalCost: savedAdditionalCost,
        code
      } as unknown as AdditionalCostResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as AdditionalCostResponse
  }

  updateAdditionalCost = async ({
    additionalCostId,
    name,
    methodOfPayment,
    billingType,
    acquisitionType,
    price,
    calculationStatus,
    maxPieces,
    enableUpload,
    queryRunner
  }: IUpdateAdditionalCost): AsyncResponse<AdditionalCost> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const manager = queryRunner ? queryRunner.manager : AppDataSource.manager

      const repository = manager.getRepository(AdditionalCost)

      const existingAdditionalCost = await repository.findOne({
        where: { id: additionalCostId }
      })

      if (!existingAdditionalCost) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const updateData: Partial<AdditionalCost> = {}

      if (typeof name !== 'undefined') {
        updateData.name = name
      }
      if (typeof methodOfPayment !== 'undefined') {
        updateData.methodOfPayment = methodOfPayment
      }
      if (typeof billingType !== 'undefined') {
        updateData.billingType = billingType
      }
      if (typeof acquisitionType !== 'undefined') {
        updateData.acquisitionType = acquisitionType
      }
      if (typeof price !== 'undefined') {
        updateData.price = price
      }
      if (typeof calculationStatus !== 'undefined') {
        updateData.calculationStatus = calculationStatus
      }
      if (typeof maxPieces !== 'undefined') {
        updateData.maxPieces = maxPieces
      }
      if (typeof enableUpload !== 'undefined') {
        updateData.enableUpload = enableUpload
      }

      if (Object.keys(updateData).length > 0) {
        await repository
          .createQueryBuilder()
          .update(AdditionalCost)
          .set(updateData)
          .where('id = :additionalCostId', { additionalCostId })
          .execute()
      }

      const updatedAdditionalCost = await repository.findOne({
        where: { id: additionalCostId }
      })

      if (!updatedAdditionalCost) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return {
        additionalCost: updatedAdditionalCost,
        code
      } as unknown as AdditionalCostResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as AdditionalCostResponse
  }

  deleteAdditionalCost = async ({
    additionalCostId,
    queryRunner
  }: IDeleteAdditionalCost): AsyncResponse<null> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(AdditionalCost)
        : this.additionalCostRepository

      const result = await repository.delete({ id: additionalCostId })

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { code } as unknown as DeleteAdditionalCostResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as DeleteAdditionalCostResponse
  }

  bulkDeleteAdditionalCosts = async ({
    additionalCostIds
  }: IBulkDeleteAdditionalCosts): AsyncResponse<null> => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (const additionalCostId of additionalCostIds) {
        const deleteResult = await this.deleteAdditionalCost({
          additionalCostId,
          queryRunner
        })

        if (deleteResult.code !== ResponseCode.OK) {
          code = deleteResult.code
          await queryRunner.rollbackTransaction()
          await queryRunner.release()

          return { code } as unknown as DeleteAdditionalCostResponse
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

    return { code } as unknown as DeleteAdditionalCostResponse
  }
}
