import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('file_uploads')
@Index(['uploadedBy'])
@Index(['createdAt'])
export class FileUpload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({ nullable: true })
  url: string;

  @Column()
  uploadedBy: string;

  @Column({ nullable: true })
  relatedToRequestId: string;

  @CreateDateColumn()
  createdAt: Date;
}
