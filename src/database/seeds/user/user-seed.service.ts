import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RoleEnum } from 'src/roles/roles.enum'
import { StatusEnum } from 'src/statuses/statuses.enum'
import { User } from 'src/users/entities/user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async run() {
    const countSuperAdmin = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.super_admin,
        },
      },
    })

    if (countSuperAdmin === 0) {
      await this.repository.save(
        this.repository.create({
          firstName: 'Bach',
          lastName: 'God',
          email: 'baveku@gmail.com',
          password: 'admin123#',
          role: {
            id: RoleEnum.super_admin,
            name: 'Super Admin',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      )
    }
  }
}
