import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { DocumentType } from "../../domain/enums/document-type.enum";

@Entity("customers")
export class CustomerTypeormEntity {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Column({ name: "document_type", type: "varchar", length: 4 })
  documentType: DocumentType;

  @Index({ unique: true })
  @Column({ name: "document_number", type: "varchar", length: 14 })
  documentNumber: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ type: "varchar", length: 20 })
  phone: string;

  @Column({ type: "boolean", default: true })
  active: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
