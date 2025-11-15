import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'User already exists! Please try with a different email',
      );
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //create new user
    const newlyCreatedUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    //remove password from the return object
    const { password: _, ...result } = newlyCreatedUser;
    void _;
    return result;
  }
}
