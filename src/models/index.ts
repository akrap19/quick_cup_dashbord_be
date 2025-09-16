import { Barnahus } from '../api/barnahus/barnahusModel'
import { BarnahusLanguage } from '../api/language/languageModel'
import { EmailTemplate } from '../api/email_template/emailTemplateModel'
import { DynamicMessages } from '../api/messages/messageModel'
import { Role } from '../api/role/roleModel'
import { User } from '../api/user/userModel'
import { UserRole } from '../api/user_role/userRoleModel'
import { UserRoleBarnahus } from '../api/user_role_barnahus/userRoleBarnahusModel'
import { UserSession } from '../api/user_session/userSessionModel'
import { VerificationUID } from '../api/verification_uid/verificationUIDModel'
import { Media } from '../api/media/mediaModel'
import { Room } from '../api/room/roomModel'
import { RoomTranslation } from '../api/room_translation/roomTranslationModel'
import { RoomImage } from '../api/room/roomImageModel'
import { About } from '../api/about/aboutModel'
import { AboutImage } from '../api/about/aboutImageModel'
import { AboutTranslation } from '../api/about_translation/aboutTranslationModel'
import { Staff } from '../api/staff/staffModel'
import { StaffImage } from '../api/staff/staffImageModel'
import { StaffTranslation } from '../api/staff_translation/staffTranslationModel'
import { Case } from '../api/case/caseModel'
import { Template } from '../api/template/templateModel'
import { TemplateRoom } from '../api/template/templateRoomModel'
import { TemplateAbout } from '../api/template/templateAboutModel'
import { TemplateStaff } from '../api/template/templateStaffModel'
import { OnboardingSection } from '../api/onboarding_section/onboardingSectionModel'
import { CaseAbout } from '../api/case/caseAboutModel'
import { CaseAboutImage } from '../api/case/caseAboutImageModel'
import { CaseRoom } from '../api/case/caseRoomModel'
import { CaseRoomImage } from '../api/case/caseRoomImageModel'
import { CaseStaff } from '../api/case/caseStaffModel'
import { CaseStaffImage } from '../api/case/caseStaffImageModel'
import { AboutNote } from '../api/note/aboutNoteModel'
import { RoomNote } from '../api/note/roomNoteModel'
import { StaffNote } from '../api/note/staffNoteModel'
import { ApiKey } from '../api/auth/apiKeyModel'
export const models = [
  Role,
  User,
  UserRole,
  UserRoleBarnahus,
  Barnahus,
  UserSession,
  VerificationUID,
  DynamicMessages,
  BarnahusLanguage,
  EmailTemplate,
  Media,
  Room,
  RoomImage,
  RoomTranslation,
  About,
  AboutImage,
  AboutTranslation,
  Staff,
  StaffImage,
  StaffTranslation,
  Case,
  Template,
  TemplateRoom,
  TemplateAbout,
  TemplateStaff,
  OnboardingSection,
  CaseAbout,
  CaseAboutImage,
  CaseRoom,
  CaseRoomImage,
  CaseStaff,
  CaseStaffImage,
  AboutNote,
  RoomNote,
  StaffNote,
  ApiKey
]
