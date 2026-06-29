import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsIn(['attendee', 'organizer', 'admin'], {
    message: 'Role must be attendee, organizer, or admin',
  })
  role: 'attendee' | 'organizer' | 'admin';
}
