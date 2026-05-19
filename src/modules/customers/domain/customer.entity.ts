import { Entity } from "../../../shared/domain/entity";
import { DocumentType } from "./enums/document-type.enum";
import { randomUUID } from "crypto";

export interface CreateCustomerProps {
  documentType: DocumentType;
  documentNumber: string;
  name: string;
  email: string;
  phone: string;
}

export interface RestoreCustomerProps {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Customer extends Entity {
  private _id: string;
  private _documentType: DocumentType;
  private _documentNumber: string;
  private _name: string;
  private _email: string;
  private _phone: string;
  private _active: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor() {
    super();
  }

  static create(props: CreateCustomerProps): Customer {
    const customer = new Customer();
    customer._id = randomUUID();
    customer._documentType = props.documentType;
    customer._documentNumber = props.documentNumber;
    customer._name = props.name;
    customer._email = props.email;
    customer._phone = props.phone;
    customer._active = true;
    customer._createdAt = new Date();
    customer._updatedAt = new Date();
    return customer;
  }

  static restore(props: RestoreCustomerProps): Customer {
    const customer = new Customer();
    customer._id = props.id;
    customer._documentType = props.documentType;
    customer._documentNumber = props.documentNumber;
    customer._name = props.name;
    customer._email = props.email;
    customer._phone = props.phone;
    customer._active = props.active;
    customer._createdAt = props.createdAt;
    customer._updatedAt = props.updatedAt;
    return customer;
  }

  deactivate(): void {
    this._active = false;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._active = true;
    this._updatedAt = new Date();
  }

  updateContact(email: string, phone: string): void {
    this._email = email;
    this._phone = phone;
    this._updatedAt = new Date();
  }

  updateName(name: string): void {
    this._name = name;
    this._updatedAt = new Date();
  }

  isOwnedBy(documentNumber: string): boolean {
    return this._documentNumber === documentNumber.replace(/\D/g, "");
  }

  get id(): string {
    return this._id;
  }
  get documentType(): DocumentType {
    return this._documentType;
  }
  get documentNumber(): string {
    return this._documentNumber;
  }
  get name(): string {
    return this._name;
  }
  get email(): string {
    return this._email;
  }
  get phone(): string {
    return this._phone;
  }
  get active(): boolean {
    return this._active;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
