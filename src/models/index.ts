import { Role } from '../api/role/roleModel'
import { User } from '../api/user/userModel'
import { UserRole } from '../api/user_role/userRoleModel'
import { UserSession } from '../api/user_session/userSessionModel'
import { VerificationUID } from '../api/verification_uid/verificationUIDModel'
import { Media } from '../api/media/mediaModel'
import { ApiKey } from '../api/auth/apiKeyModel'
import { Product } from '../api/products/productsModel'
import { ProductMedia } from '../api/products/productsMediaModel'
import { ProductPrice } from '../api/products/productPriceModel'
import { ProductServicePrice } from '../api/products/productServicePriceModel'
import { ClientProductPrice } from '../api/client/clientProductPriceModel'
import { ServiceModel } from '../api/service/serviceModel'
import { ServicePrice } from '../api/service/servicePriceModel'
import { ServiceLocationModel } from '../api/service_location/serviceLocationModel'
import { EventModel } from '../api/events/eventsModel'
import { Order } from '../api/orders/ordersModel'
import { OrderProduct } from '../api/orders/orderProductModel'
import { OrderService } from '../api/orders/orderServiceModel'
import { OrderAdditionalCost } from '../api/orders/orderAdditionalCostModel'
import { AdditionalCost } from '../api/additional_costs/additionalCostModel'
import { ProductState } from '../api/product_state/productStateModel'

export const models = [
  Role,
  User,
  UserRole,
  UserSession,
  VerificationUID,
  Media,
  ApiKey,
  Product,
  ProductMedia,
  ProductPrice,
  ProductServicePrice,
  ClientProductPrice,
  Order,
  OrderProduct,
  OrderService,
  OrderAdditionalCost,
  AdditionalCost,
  ServiceModel,
  ServicePrice,
  ServiceLocationModel,
  EventModel,
  ProductState
]
