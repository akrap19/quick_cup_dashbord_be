import { Role } from '../api/role/roleModel'
import { User } from '../api/user/userModel'
import { UserRole } from '../api/user_role/userRoleModel'
import { UserSession } from '../api/user_session/userSessionModel'
import { VerificationUID } from '../api/verification_uid/verificationUIDModel'
import { Media } from '../api/media/mediaModel'
import { ApiKey } from '../api/auth/apiKeyModel'
export const models = [
  Role,
  User,
  UserRole,
  UserSession,
  VerificationUID,
  Media,
  ApiKey
]
