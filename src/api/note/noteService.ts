import { ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { Repository, UpdateResult } from 'typeorm'
import { autoInjectable } from 'tsyringe'
import {
  ICreateNote,
  IDeleteNotes,
  IEditNote,
  IGetNotes,
  INoteLimited,
  INoteService,
  NoteType
} from './interface'
import { AboutNote } from './aboutNoteModel'
import { RoomNote } from './roomNoteModel'
import { StaffNote } from './staffNoteModel'

@autoInjectable()
export class NoteService implements INoteService {
  private readonly aboutNoteRepository: Repository<AboutNote>
  private readonly roomNoteRepository: Repository<RoomNote>
  private readonly staffNoteRepository: Repository<StaffNote>

  constructor() {
    this.aboutNoteRepository = AppDataSource.manager.getRepository(AboutNote)
    this.roomNoteRepository = AppDataSource.manager.getRepository(RoomNote)
    this.staffNoteRepository = AppDataSource.manager.getRepository(StaffNote)
  }

  createNote = async ({ contentId, type, note }: ICreateNote) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      if (type == NoteType.ABOUT) {
        let insertResult = await this.aboutNoteRepository
          .createQueryBuilder('aboutNote', queryRunner)
          .insert()
          .into(AboutNote)
          .values([
            {
              caseAboutId: contentId,
              note
            }
          ])
          .execute()
        if (insertResult.raw.affectedRows !== 1) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          code = ResponseCode.FAILED_INSERT
        }
      }

      if (type == NoteType.ROOM) {
        let insertResult = await this.roomNoteRepository
          .createQueryBuilder('roomNote', queryRunner)
          .insert()
          .into(RoomNote)
          .values([
            {
              caseRoomId: contentId,
              note
            }
          ])
          .execute()
        if (insertResult.raw.affectedRows !== 1) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          code = ResponseCode.FAILED_INSERT
        }
      }

      if (type == NoteType.STAFF) {
        let insertResult = await this.staffNoteRepository
          .createQueryBuilder('staffNote', queryRunner)
          .insert()
          .into(StaffNote)
          .values([
            {
              caseStaffId: contentId,
              note
            }
          ])
          .execute()
        if (insertResult.raw.affectedRows !== 1) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          code = ResponseCode.FAILED_INSERT
        }
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

  getNotes = async ({ caseId }: IGetNotes) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let notesLimited: INoteLimited[] = []

      let aboutNotes = await this.aboutNoteRepository
        .createQueryBuilder('aboutNote')
        .leftJoinAndSelect('aboutNote.caseAbout', 'caseAbout')
        .where('caseAbout.caseId = :caseId', { caseId })
        .getMany()

      for (let note of aboutNotes) {
        notesLimited.push({
          noteId: note.id,
          contentId: note.caseAboutId,
          title: note.caseAbout.title!,
          note: note.note,
          type: NoteType.ABOUT,
          writtenAt: note.createdAt
        })
      }

      let roomNotes = await this.roomNoteRepository
        .createQueryBuilder('roomNote')
        .leftJoinAndSelect('roomNote.caseRoom', 'caseRoom')
        .where('caseRoom.caseId = :caseId', { caseId })
        .getMany()

      for (let note of roomNotes) {
        notesLimited.push({
          noteId: note.id,
          contentId: note.caseRoomId,
          title: note.caseRoom.title!,
          note: note.note,
          type: NoteType.ROOM,
          writtenAt: note.createdAt
        })
      }

      let staffNotes = await this.staffNoteRepository
        .createQueryBuilder('staffNote')
        .leftJoinAndSelect('staffNote.caseStaff', 'caseStaff')
        .where('caseStaff.caseId = :caseId', { caseId })
        .getMany()

      for (let note of staffNotes) {
        notesLimited.push({
          noteId: note.id,
          contentId: note.caseStaffId,
          title: note.caseStaff.title!,
          note: note.note,
          type: NoteType.STAFF,
          writtenAt: note.createdAt
        })
      }

      return { notesLimited, code }
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

  deleteNotes = async ({ aboutNotes, roomNotes, staffNotes }: IDeleteNotes) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (let noteId of aboutNotes) {
        const deleteResult = await this.aboutNoteRepository
          .createQueryBuilder('aboutNote', queryRunner)
          .delete()
          .from(AboutNote)
          .where('id = :aboutNoteId', { aboutNoteId: noteId })
          .execute()

        if (deleteResult.affected !== 1) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.GONE }
        }
      }

      for (let noteId of roomNotes) {
        const deleteResult = await this.roomNoteRepository
          .createQueryBuilder('roomNote', queryRunner)
          .delete()
          .from(RoomNote)
          .where('id = :roomNoteId', { roomNoteId: noteId })
          .execute()

        if (deleteResult.affected !== 1) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.GONE }
        }
      }

      for (let noteId of staffNotes) {
        const deleteResult = await this.staffNoteRepository
          .createQueryBuilder('staffNote', queryRunner)
          .delete()
          .from(StaffNote)
          .where('id = :staffNoteId', { staffNoteId: noteId })
          .execute()

        if (deleteResult.affected !== 1) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.GONE }
        }
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

  editNote = async ({ noteId, type, note }: IEditNote) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let editResult : UpdateResult | undefined
      if (type == NoteType.ABOUT) {
        editResult = await this.aboutNoteRepository
          .createQueryBuilder('aboutNote')
          .update(AboutNote)
          .set({ note })
          .where('id = :noteId', { noteId })
          .execute()
      }

      if (type == NoteType.ROOM) {
        editResult = await this.roomNoteRepository
          .createQueryBuilder('roomNote')
          .update(RoomNote)
          .set({ note })
          .where('id = :noteId', { noteId })
          .execute()
      }

      if (type == NoteType.STAFF) {
        editResult = await this.staffNoteRepository
          .createQueryBuilder('staffNote')
          .update(StaffNote)
          .set({ note })
          .where('id = :noteId', { noteId })
          .execute()
      }

      if (!editResult || editResult.affected !== 1) {
        return { code: ResponseCode.FAILED_EDIT }
      }

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
}
