import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserDocument,
  UserStatus,
  UserRole,
} from '../users/schema/user.schema';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { InvitationCodesService } from '../invitation-codes/invitation-codes.service';
import { HistoryInvitationsService } from '../history-invitations/history-invitations.service';
import { CreateInvitationCodeDto } from '../invitation-codes/dto/create-invitation-code.dto';
import { HistoryInvitationStatus } from '../history-invitations/dto/create-history-invitation.dto';
import {
  InvitationCode,
  InvitationCodeDocument,
} from '../invitation-codes/schema/invitation-code.schema';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthsService {
  private readonly logger = new Logger(AuthsService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(InvitationCode.name)
    private readonly inviteCodeModel: Model<InvitationCodeDocument>,

    private readonly invitationCodesService: InvitationCodesService,
    private readonly historyInvitationsService: HistoryInvitationsService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto): Promise<Partial<User>> {
    try {
      const existingUser = await this.userModel.findOne({
        $or: [
          { email: registerAuthDto.email },
          { username: registerAuthDto.username },
        ],
      });
      if (existingUser) {
        throw new ConflictException('Email or username already exists.');
      }

      if (registerAuthDto.role === UserRole.STUDENT) {
        const missing: string[] = [];

        if (!registerAuthDto.inviteCode) {
          if (!registerAuthDto.school) missing.push('school');
          if (!registerAuthDto.className) missing.push('className');
          if (!registerAuthDto.teacher) missing.push('teacher');
          if (!registerAuthDto.parent) missing.push('parent');
        }

        if (missing.length > 0) {
          throw new BadRequestException(
            `Students must provide the following information: ${missing.join(', ')} or enter an invitation code.`,
          );
        }
      } else if (registerAuthDto.role === UserRole.TEACHER) {
        if (!registerAuthDto.school) {
          throw new BadRequestException(
            'Teachers must select the school where they teach.',
          );
        }
      }

      let invitedBy: string | null = null;

      if (registerAuthDto.inviteCode) {
        const inviter = await this.inviteCodeModel.findOne({
          code: registerAuthDto.inviteCode,
        });

        if (!inviter) {
          this.logger.warn(
            `Invalid invitation code: ${registerAuthDto.inviteCode}`,
          );
          throw new NotFoundException(
            'Invalid invitation code or inviter does not exist.',
          );
        }

        const inviterUser = await this.userModel.findById(inviter.createdBy);
        if (!inviterUser) {
          this.logger.warn(
            `Inviter does not exist for code: ${registerAuthDto.inviteCode}`,
          );
          throw new NotFoundException(
            'The inviter does not exist for the provided invitation code.',
          );
        }

        if (inviterUser.role === UserRole.STUDENT) {
          throw new BadRequestException(
            'Invalid invitation code (students cannot invite).',
          );
        }

        invitedBy = inviter._id.toString();

        const historyUsage =
          await this.historyInvitationsService.createHistoryInvitation({
            userId: inviterUser._id.toString(),
            code: inviter.code,
            invitedAt: new Date().toISOString(),
            status: HistoryInvitationStatus.ACCEPTED,
          });

        this.logger.log(
          `Invitation code ${inviter.code} used by ${registerAuthDto.email}. History record ID: ${historyUsage._id}`,
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(registerAuthDto.password, salt);

      const newUser = new this.userModel({
        ...registerAuthDto,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
        isVerify: false,
        tokenVerify: '',
        invitedBy: invitedBy ? invitedBy : undefined,
      });

      const invitationCodesData: CreateInvitationCodeDto = {
        createdBy: newUser._id.toString(),
        event: 'Invitation code for student registration',
        description: `Invitation code created by ${registerAuthDto.username} to invite other students.`,
        totalUses: 100,
        usesLeft: 100,
        startedAt: new Date().toISOString(),
      };

      const { data: invitationCode } =
        await this.invitationCodesService.createInvitationCode(
          invitationCodesData,
        );

      this.logger.log(
        `Invitation code created for user ${registerAuthDto.username}: ${invitationCode.code}`,
      );

      const saved = await newUser.save();
      const result = saved.toObject();

      return result;
    } catch (error) {
      this.logger.error(
        `Error registering user ${registerAuthDto.username}:`,
        error,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async login(
    loginAuthDto: LoginAuthDto,
  ): Promise<Partial<User> & { accessToken: string; refreshToken: string }> {
    try {
      const user = await this.userModel.findOne({
        $or: [{ email: loginAuthDto.email }, { username: loginAuthDto.email }],
      });

      if (!user) {
        throw new NotFoundException(
          'User not found with the provided identifier.',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        loginAuthDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password.');
      }

      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' },
      );

      const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
        { expiresIn: '7d' },
      );

      user.tokenVerify = accessToken;
      await user.save();

      return {
        ...user.toObject(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(`Error logging in user ${loginAuthDto.email}:`, error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException('Login failed. Please try again.');
    }
  }
}
