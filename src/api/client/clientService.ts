import { ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { RoleName, RoleType } from '../role/interface'
import { UserService } from '../user/userService'
import { UserRoleService } from '../user_role/userRoleService'
import { IClientService, ICreateClient, IEditUser } from './interface'
import { User } from '../user/userModel'
import { VerificationUIDService } from '../verification_uid/verificationUIDService'
import { VerificationUIDType } from '../verification_uid/interface'
import config from '../../config'
import { EmailTemplates } from '../../services/email/templates'
import { autoInjectable } from 'tsyringe'
import { emailService } from '../../services/email'
import { Repository } from 'typeorm'
import { ClientProductPrice } from './clientProductPriceModel'
import { ProductsService } from '../products/productsService'
import { ProductPrice } from '../products/productPriceModel'
import { Product } from '../products/productsModel'
import { ProductStatus, AcquisitionType } from '../products/interface'

@autoInjectable()
export class ClientService implements IClientService {
  private readonly userService: UserService
  private readonly userRoleService: UserRoleService
  private readonly verificationUIDService: VerificationUIDService
  private readonly clientProductPriceRepository: Repository<ClientProductPrice>
  private readonly productsService: ProductsService
  private readonly productPriceRepository: Repository<ProductPrice>
  private readonly productRepository: Repository<Product>

  constructor(
    userService: UserService,
    userRoleService: UserRoleService,
    verificationUIDService: VerificationUIDService,
    productsService: ProductsService
  ) {
    this.userService = userService
    this.userRoleService = userRoleService
    this.verificationUIDService = verificationUIDService
    this.productsService = productsService
    this.clientProductPriceRepository =
      AppDataSource.manager.getRepository(ClientProductPrice)
    this.productPriceRepository =
      AppDataSource.manager.getRepository(ProductPrice)
    this.productRepository = AppDataSource.manager.getRepository(Product)
  }

  private validatePriceTiers(
    tiers: Array<{
      minQuantity: number
      maxQuantity?: number | null
      price: number
    }>
  ): { valid: boolean; error?: string } {
    // Sort tiers by minQuantity
    const sortedTiers = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity)

    for (let i = 0; i < sortedTiers.length; i++) {
      const current = sortedTiers[i]

      // Validate maxQuantity >= minQuantity if provided
      if (
        current.maxQuantity !== null &&
        current.maxQuantity !== undefined &&
        current.maxQuantity < current.minQuantity
      ) {
        return {
          valid: false,
          error: `Price tier at index ${i} has maxQuantity less than minQuantity`
        }
      }

      // Check for overlaps with next tier
      if (i < sortedTiers.length - 1) {
        const next = sortedTiers[i + 1]
        const currentMax = current.maxQuantity ?? Infinity

        if (currentMax >= next.minQuantity) {
          return {
            valid: false,
            error: `Price tiers overlap: tier ending at ${currentMax} overlaps with tier starting at ${next.minQuantity}`
          }
        }
      }
    }

    return { valid: true }
  }

  createClient = async ({
    firstName,
    lastName,
    email,
    phoneNumber,
    location,
    assignedById,
    productPrices,
    companyName,
    pin,
    street
  }: ICreateClient) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()
    let user: User

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { user: existingUser } = await this.userService.getUserByEmail({
        email
      })

      let sendEmail = false
      if (!existingUser) {
        const { user: newUser, code: newUserCode } =
          await this.userService.createUser({
            firstName,
            lastName,
            email,
            phoneNumber,
            location,
            companyName,
            pin,
            street,
            queryRunner
          })
        if (!newUser) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: newUserCode }
        }

        const { uids, code: uidCode } =
          await this.verificationUIDService.setVerificationUID({
            userId: newUser.id,
            type: VerificationUIDType.REGISTRATION,
            queryRunner
          })
        if (!uids) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: uidCode }
        }

        await emailService.sendEmail({
          to: email,
          template: EmailTemplates.INVITATION,
          data: {
            URL: `${config.CLIENT_BASE_URL}/register?uid=${uids.uid}/${uids.hashUID}`,
            ROLE: RoleName.CLIENT
          }
        })

        user = newUser
      } else {
        const { code: editCode } = await this.userService.editUser({
          userId: existingUser.id,
          firstName,
          lastName,
          phoneNumber,
          companyName,
          pin,
          street
        })

        if (editCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: editCode }
        }

        user = existingUser
        sendEmail = true
      }

      const { code: assignRoleCode } = await this.userRoleService.assignRole({
        userId: user.id,
        roleName: RoleType.CLIENT,
        assignedById,
        queryRunner
      })

      if (
        assignRoleCode != ResponseCode.OK &&
        assignRoleCode != ResponseCode.CONFLICT_USER_ROLE
      ) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: assignRoleCode }
      }

      // Create client product prices if provided
      if (productPrices && productPrices.length > 0) {
        const clientProductPriceRepository =
          queryRunner.manager.getRepository(ClientProductPrice)

        for (const productPrice of productPrices) {
          // Validate price tiers
          const validation = this.validatePriceTiers(productPrice.prices)
          if (!validation.valid) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: ResponseCode.BAD_REQUEST }
          }

          // Create price records
          const priceRecords = productPrice.prices.map((price) =>
            clientProductPriceRepository.create({
              clientId: user.id,
              productId: productPrice.productId,
              minQuantity: price.minQuantity,
              maxQuantity: price.maxQuantity ?? null,
              price: price.price
            })
          )

          try {
            await clientProductPriceRepository.save(priceRecords)
          } catch (saveErr: any) {
            logger.error({
              code: ResponseCode.SERVER_ERROR,
              message: 'Failed to save client product prices',
              stack: saveErr.stack
            })
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: ResponseCode.SERVER_ERROR }
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
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
    }

    return { code }
  }

  editClient = async ({
    userId,
    firstName,
    lastName,
    phoneNumber,
    location,
    productPrices,
    companyName,
    pin,
    street
  }: IEditUser) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { code: editUserCode } = await this.userService.editUser({
        userId,
        firstName,
        lastName,
        phoneNumber,
        location: location as string | null,
        companyName,
        pin,
        street
      })

      if (editUserCode != ResponseCode.OK) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: editUserCode }
      }

      // Handle product prices if provided
      if (productPrices !== undefined) {
        const clientProductPriceRepository =
          queryRunner.manager.getRepository(ClientProductPrice)

        // Delete all existing prices for this client
        await clientProductPriceRepository.delete({ clientId: userId })

        // Create new prices if provided
        if (productPrices && productPrices.length > 0) {
          for (const productPrice of productPrices) {
            // Validate price tiers
            const validation = this.validatePriceTiers(productPrice.prices)
            if (!validation.valid) {
              await queryRunner.rollbackTransaction()
              await queryRunner.release()
              return { code: ResponseCode.BAD_REQUEST }
            }

            // Create price records
            const priceRecords = productPrice.prices.map((price) =>
              clientProductPriceRepository.create({
                clientId: userId,
                productId: productPrice.productId,
                minQuantity: price.minQuantity,
                maxQuantity: price.maxQuantity ?? null,
                price: price.price
              })
            )

            try {
              await clientProductPriceRepository.save(priceRecords)
            } catch (saveErr: any) {
              logger.error({
                code: ResponseCode.SERVER_ERROR,
                message: 'Failed to save client product prices',
                stack: saveErr.stack
              })
              await queryRunner.rollbackTransaction()
              await queryRunner.release()
              return { code: ResponseCode.SERVER_ERROR }
            }
          }
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
      return { code: editUserCode }
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

  deleteClient = async ({ userId }: { userId: string }) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { code: deleteCode } = await this.userService.anonymizeUser({
        userId
      })

      return { code: deleteCode }
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

  bulkDeleteClients = async ({ userIds }: { userIds: string[] }) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      for (const userId of userIds) {
        const { code: deleteCode } = await this.userService.anonymizeUser({
          userId
        })

        if (deleteCode !== ResponseCode.OK) {
          return { code: deleteCode }
        }
      }

      return { code: ResponseCode.OK }
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

  getAllClientProductPrices = async (clientId: string) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      // Get all products with their default prices (excluding deleted, only buy products)
      const allProducts = await this.productRepository.find({
        where: {
          status: ProductStatus.ACTIVE,
          acquisitionType: AcquisitionType.BUY
        },
        relations: ['prices'],
        order: { id: 'ASC' }
      })

      // Get client-specific prices
      const clientPrices = await this.clientProductPriceRepository.find({
        where: { clientId },
        relations: ['product'],
        order: { productId: 'ASC', minQuantity: 'ASC' }
      })

      // Create a map of client prices by productId
      const clientPricesMap = new Map<string, ClientProductPrice[]>()
      clientPrices.forEach((price) => {
        if (!clientPricesMap.has(price.productId)) {
          clientPricesMap.set(price.productId, [])
        }
        clientPricesMap.get(price.productId)!.push(price)
      })

      // Build result: use client prices if available, otherwise use default prices
      const result = allProducts.map((product) => {
        const clientPricesForProduct = clientPricesMap.get(product.id)

        // If client has custom prices, use those
        if (clientPricesForProduct && clientPricesForProduct.length > 0) {
          return {
            productId: product.id,
            productName: product.name || '',
            size: product.size || null,
            prices: clientPricesForProduct.map((price) => ({
              id: price.id,
              minQuantity: price.minQuantity,
              maxQuantity: price.maxQuantity ?? null,
              price: price.price,
              createdAt: price.createdAt,
              updatedAt: price.updatedAt
            }))
          }
        }

        // Otherwise, use default product prices
        const defaultPrices = (product.prices || []).sort(
          (a, b) => a.minQuantity - b.minQuantity
        )

        return {
          productId: product.id,
          productName: product.name || '',
          size: product.size || null,
          prices: defaultPrices.map((price) => ({
            id: price.id,
            minQuantity: price.minQuantity,
            maxQuantity: price.maxQuantity ?? null,
            price: price.price,
            createdAt: price.createdAt,
            updatedAt: price.updatedAt
          }))
        }
      })

      return {
        data: result,
        code
      }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
      return { code }
    }
  }
}
